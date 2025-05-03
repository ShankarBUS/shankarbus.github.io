import { enableStickyHeader, enableHamburgerMenu, setupMessagePopup, showMessagePopup } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';

enableStickyHeader();
enableHamburgerMenu();

function createBadge(content, className, iconSrc = null) {
    const badgeContainer = document.createElement('div');
    badgeContainer.className = `badge ${className}`;
    if (iconSrc) {
        const icon = document.createElement('img');
        icon.src = `./assets/icons/${iconSrc}`;
        badgeContainer.appendChild(icon);
    }
    const badge = document.createElement('span');
    badge.textContent = content;
    badgeContainer.appendChild(badge);
    return badgeContainer;
}

// #region GitHub Profile
const projectCardsContainer = document.getElementById('projectsContainer');
const orgCardsContainer = document.getElementById('orgsContainer');

const ghRepos = [];

function createGHRepoCard(project) {
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h4');
    title.textContent = project.name;
    card.appendChild(title);

    if (project.description) {
        const description = document.createElement('p');
        description.textContent = project.description;
        card.appendChild(description);
    }

    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'badge-area';

    if (project.stargazers_count > 0) {
        const starsBadge = createBadge(`${project.stargazers_count}`, 'badge-stars', 'star_16.svg');
        badgesContainer.appendChild(starsBadge);
    }

    if (project.forks_count > 0) {
        const forksBadge = createBadge(`${project.forks_count}`, 'badge-forks', 'fork_16.svg');
        badgesContainer.appendChild(forksBadge);
    }

    if (project.language) {
        const languageBadge = createBadge(project.language, 'badge-language', 'braces_16.svg');
        badgesContainer.appendChild(languageBadge);
    }

    card.appendChild(badgesContainer);

    card.title = project.html_url;
    card.addEventListener('click', () => {
        window.open(project.html_url, '_blank');
    });

    projectCardsContainer.appendChild(card);
}

function createGHOrgCard(org) {
    const card = document.createElement('div');
    card.className = 'card';

    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'org-details';
    card.appendChild(detailsContainer);

    const image = document.createElement('img');
    image.className = 'avatar';
    image.src = `https://avatars.githubusercontent.com/${org.login}`;
    image.alt = `${org.login} Logo`;
    detailsContainer.appendChild(image);

    const title = document.createElement('h4');
    title.textContent = org.login;
    detailsContainer.appendChild(title);

    if (org.description) {
        const description = document.createElement('p');
        description.textContent = org.description;
        card.appendChild(description);
    }

    const url = `https://github.com/${org.login}`;
    card.title = url;
    card.addEventListener('click', () => {
        window.open(url, '_blank');
    });
    orgCardsContainer.appendChild(card);
}

async function fetchGitHubProjects() {
    const response = await fetch('https://api.github.com/users/ShankarBUS/repos');
    const projects = await response.json();

    const filteredProjects = projects
        .filter(project => !project.fork);

    ghRepos.push(...filteredProjects);
}

async function fetchGitHubOrgs() {
    const response = await fetch('https://api.github.com/users/ShankarBUS/orgs');
    const orgs = await response.json();
    for (const org of orgs) {
        createGHOrgCard(org);
        await fetchOrgTopRepo(org.repos_url, org.login);
    }
}

async function fetchOrgTopRepo(reposUrl, orgName) {
    const response = await fetch(reposUrl);
    const repos = await response.json();

    const filteredRepos = repos.filter(repo => !repo.fork && repo.stargazers_count > 0);
    const topRepo = filteredRepos.reduce((topRepo, currentRepo) => {
        return currentRepo.stargazers_count > (topRepo?.stargazers_count || 0) ? currentRepo : topRepo;
    }, null);

    if (topRepo) {
        ghRepos.push(topRepo);
    }
}

const ghLoadingProgressBar = document.getElementById('ghLoadingProgressBar');
async function loadGithubProfile() {
    document.body.classList.remove('github-load-error');
    ghLoadingProgressBar.style.display = 'block';

    try {
        await fetchGitHubProjects();
        await fetchGitHubOrgs();
        let sorted = ghRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
        sorted.forEach(repo => {
            createGHRepoCard(repo);
        });
        ghLoadingProgressBar.style.display = 'none';
    }
    catch (error) {
        console.error('Error loading GitHub profile:', error);
        document.body.classList.add('github-load-error');
    }
    ghLoadingProgressBar.style.display = 'none';
}

// #endregion

// #region Personal Details
// from details.config.json

function addKeyValueRowToTable(table, label, value) {
    const row = document.createElement('tr');

    const labelCell = document.createElement('td');
    labelCell.textContent = label;
    labelCell.className = 'label-cell';

    const valueCell = document.createElement('td');
    valueCell.appendChild(value);
    valueCell.className = 'value-cell';

    row.appendChild(labelCell);
    row.appendChild(valueCell);
    table.appendChild(row);
};

// Create a table with key-value pairs from a JSON Array
// and apply a function to the value to get a html element.
function createKeyValueTable(jsonArray, valuefun) {
    const infoTable = document.createElement('table');
    infoTable.className = 'info-table';

    for (const [key, val] of Object.entries(jsonArray)) {
        const label = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize the first letter of the key
        const value = valuefun(val);
        addKeyValueRowToTable(infoTable, label, value);
    }

    return infoTable;
}

function displayBiodata(biodata) {
    if (!biodata) return;

    const biodataContainer = document.getElementById('biodataContainer');

    const infoTable = createKeyValueTable(biodata, value => {
        const valueElement = document.createElement('span');
        valueElement.textContent = value;
        return valueElement;
    });

    biodataContainer.appendChild(infoTable);
}

function displayEducation(education) {
    if (!education) return;

    const educationContainer = document.getElementById('educationContainer');
    const educationList = document.createElement('ul');
    educationList.className = 'timeline-list';

    education.forEach(edu => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<p>${edu.duration}</p><strong>${edu.institution}</strong><p>${edu.course}</p>`;
        educationList.appendChild(listItem);
    });

    educationContainer.appendChild(educationList);
}

function displayAchievements(achievements) {
    if (!achievements) return;

    const achievementsContainer = document.getElementById('achievementsContainer');
    const achievementsList = document.createElement('ul');
    achievementsList.className = 'timeline-list';

    achievements.forEach(achievement => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<p>${achievement.year}</p><strong>${achievement.title}</strong><p>${achievement.description}</p>`;
        if (achievement.link)
            listItem.innerHTML += `<a href="${achievement.link}" target="_blank">Link</a>`;
        achievementsList.appendChild(listItem);
    });

    achievementsContainer.appendChild(achievementsList);
}

function getSocialMediaUserName(name, url) {
    if (name == 'email') return url;
    if (name == 'instagram') return url.split('/')[3];
    else return '@ShankarBUS';
}

function displaySocialMediaLinks(socialMediaLinks) {
    if (!socialMediaLinks) return;

    const socialsContainer = document.getElementById('socialsContainer');
    const list = document.createElement('ul');
    list.className = 'socials-list';

    for (const [name, url] of Object.entries(socialMediaLinks)) {
        const listItem = document.createElement('li');

        // name.charAt(0).toUpperCase() + name.slice(1);

        const img = document.createElement('img');
        img.src = `./assets/icons/${name}_16.svg`;
        img.alt = `${name} logo`;
        listItem.appendChild(img);

        const link = document.createElement('a');
        link.href = name == 'email' ? 'mailto:' : '' + url;
        link.target = '_blank';
        link.textContent = getSocialMediaUserName(name, url);
        link.className = 'social-link';
        listItem.appendChild(link);
        list.appendChild(listItem);
    }

    socialsContainer.appendChild(list);
}

function displaySkills(detailsConfig) {
    if (!detailsConfig || !detailsConfig.programmingSkills
        || !detailsConfig.techSkills) return;

    const tsBadgeArea = document.getElementById('tsBadgeArea');
    for (const skill of detailsConfig.techSkills) {
        const badge = createBadge(skill, 'badge-tskill');
        tsBadgeArea.appendChild(badge);
    }
    const psBadgeArea = document.getElementById('psBadgeArea');
    for (const skill of detailsConfig.programmingSkills) {
        const badge = createBadge(skill, 'badge-pskill');
        psBadgeArea.appendChild(badge);
    }
}

function displayRenders(renders) {
    if (!renders) return;

    const rendersContainer = document.getElementById('rendersContainer');

    renders.forEach((render, index) => {
        const card = document.createElement('div');
        card.className = 'card';

        const thumbnail = document.createElement('img');
        thumbnail.src = render.url;
        thumbnail.alt = render.title;
        thumbnail.className = 'thumbnail';
        card.appendChild(thumbnail);

        const title = document.createElement('h4');
        title.textContent = render.title;
        card.appendChild(title);

        card.addEventListener('click', () => {
            showImageViewer(index, renders);
        });

        rendersContainer.appendChild(card);
    });
}

function loadDetails(detailsConfig) {
    if (!detailsConfig) return;

    displayBiodata(detailsConfig.biodata);
    displayEducation(detailsConfig.education);
    displayAchievements(detailsConfig.achievements);
    displaySocialMediaLinks(detailsConfig.socialMediaLinks);
    displaySkills(detailsConfig);
    displayRenders(detailsConfig.renders);
}

//#endregion

async function loadProfile() {
    try {
        const response = await fetch('./details.config.json');
        const detailsConfig = await response.json();
        loadDetails(detailsConfig);
        await loadGithubProfile();
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

loadProfile();

const header = document.getElementById("header");
window.addEventListener("scroll", () => {
    document.body.classList.remove('nav-open');
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
});

function showImageViewer(index, renders) {
    document.body.classList.add('popup-open');
    const imageViewerPopup = document.getElementById('imageViewerPopup');
    const imageContainer = document.getElementById('imageContainer');
    const imageViewerImage = document.getElementById('imageViewerImage');
    const imageTitle = document.getElementById('imageTitle');
    const imageDescription = document.getElementById('imageDescription');

    let currentIndex = index;

    function updateViewer() {
        const render = renders[currentIndex];
        imageViewerImage.src = render.url;
        imageViewerImage.alt = render.title;
        imageTitle.textContent = render.title;
        imageDescription.textContent = render.description;
    }

    document.getElementById('prevImage').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + renders.length) % renders.length;
        updateViewer();
    });

    document.getElementById('nextImage').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % renders.length;
        updateViewer();
    });

    imageContainer.addEventListener('click', (event) => {
        if (event.target == imageContainer) closeImageViewer();
    });

    document.getElementById('closeImageViewer').addEventListener('click', () => {
        closeImageViewer();
    });

    function closeImageViewer() {
        imageViewerPopup.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('popup-open');
    }

    imageViewerPopup.setAttribute('aria-hidden', 'false');
    updateViewer();
}
