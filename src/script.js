const projectCardsContainer = document.getElementById('projectsContainer');
const orgCardsContainer = document.getElementById('orgsContainer');

const ghRepos = [];

const mockRepos = [
    {
        id: 123456789,
        name: "awesome-project",
        full_name: "ShankarBUS/awesome-project",
        html_url: "https://github.com/ShankarBUS/awesome-project",
        description: "An awesome project by ShankarBUS.",
        fork: false,
        stargazers_count: 42,
        forks_count: 10,
        language: "JavaScript"
    },
    {
        id: 987654321,
        name: "another-cool-project",
        full_name: "ShankarBUS/another-cool-project",
        html_url: "https://github.com/ShankarBUS/another-cool-project",
        description: "Another cool project by ShankarBUS.",
        fork: false,
        stargazers_count: 25,
        forks_count: 5,
        language: "Python"
    },
    {
        id: 192837465,
        name: "forked-repo",
        full_name: "ShankarBUS/forked-repo",
        html_url: "https://github.com/ShankarBUS/forked-repo",
        description: "A forked repository.",
        fork: true,
        stargazers_count: 0,
        forks_count: 0,
        language: "Java"
    }
];

const mockOrgs = [
    {
        login: "MockOrg1",
        description: "A mock organization for testing purposes.",
        url: "https://github.com/MockOrg1",
        repos_url: "https://api.github.com/orgs/MockOrg1/repos"
    },
    {
        login: "MockOrg2",
        description: "Another mock organization.",
        url: "https://github.com/MockOrg2",
        repos_url: "https://api.github.com/orgs/MockOrg2/repos"
    }
];

function createBadge(content, className, iconSrc = null) {
    const badgeContainer = document.createElement('div');
    badgeContainer.className = `badge ${className}`;
    if (iconSrc) {
        const icon = document.createElement('img');
        icon.src = `./assests/${iconSrc}`;
        badgeContainer.appendChild(icon);
    }
    const badge = document.createElement('span');
    badge.textContent = content;
    badgeContainer.appendChild(badge);
    return badgeContainer;
}

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

    const description = document.createElement('p');
    description.textContent = org.description;
    card.appendChild(description);

    card.addEventListener('click', () => {
        window.open(`https://github.com/${org.login}`, '_blank');
    });
    orgCardsContainer.appendChild(card);
}

async function fetchGitHubProjects() {
    try {
        const response = await fetch('https://api.github.com/users/ShankarBUS/repos');
        const projects = await response.json();

        const filteredProjects = projects
            .filter(project => !project.fork);

        ghRepos.push(...filteredProjects);
    } catch (error) {
        console.error('Error fetching GitHub projects, using mock data:', error);
        ghRepos.push(...mockRepos.filter(project => !project.fork));
    }
}

async function fetchGitHubOrgs() {
    try {
        const response = await fetch('https://api.github.com/users/ShankarBUS/orgs');
        const orgs = await response.json();
        for (const org of orgs) {
            createGHOrgCard(org);
            await fetchOrgTopRepo(org.repos_url, org.login);
        }
    } catch (error) {
        console.error('Error fetching GitHub organizations, using mock data:', error);
        for (const org of mockOrgs) {
            createGHOrgCard(org);
        }
    }
}

async function fetchOrgTopRepo(reposUrl, orgName) {
    try {
        const response = await fetch(reposUrl);
        const repos = await response.json();

        const filteredRepos = repos.filter(repo => !repo.fork && repo.stargazers_count > 0);
        const topRepo = filteredRepos.reduce((topRepo, currentRepo) => {
            return currentRepo.stargazers_count > (topRepo?.stargazers_count || 0) ? currentRepo : topRepo;
        }, null);

        if (topRepo) {
            ghRepos.push(topRepo);
        }
    } catch (error) {
        console.error(`Error fetching repositories for organization ${orgName}:`, error);
    }
}

const ghLoadingProgressBar = document.getElementById('ghLoadingProgressBar');

async function loadGithubProfile() {
    ghLoadingProgressBar.style.display = 'block';
    await fetchGitHubProjects();
    await fetchGitHubOrgs();
    let sorted = ghRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    sorted.forEach(repo => {
        createGHRepoCard(repo);
    });
    ghLoadingProgressBar.style.display = 'none';
}

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

// Create a table with key-value pairs from the JSON object
// and apply a function to the value before displaying it
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

function displaySocialMediaLinks(socialMediaLinks) {
    if (!socialMediaLinks) return;

    const socialsContainer = document.getElementById('socialsContainer');

    const infoTable = createKeyValueTable(socialMediaLinks, url => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.textContent = url;
        return link;
    });

    socialsContainer.appendChild(infoTable);
}

function displaySkills(detailsConfig) {
    if (!detailsConfig || !detailsConfig.programmingSkills
        || !detailsConfig.techSkills) return;

    const psBadgeArea = document.getElementById('psBadgeArea');
    for (const skill of detailsConfig.programmingSkills) {
        const badge = createBadge(skill, 'badge-skill');
        psBadgeArea.appendChild(badge);
    }
    const tsBadgeArea = document.getElementById('tsBadgeArea');
    for (const skill of detailsConfig.techSkills) {
        const badge = createBadge(skill, 'badge-skill');
        tsBadgeArea.appendChild(badge);
    }
}

function loadDetails(detailsConfig) {
    if (!detailsConfig) return;

    console.log('Details Config:', detailsConfig);

    displayBiodata(detailsConfig.biodata);
    displayEducation(detailsConfig.education);
    displayAchievements(detailsConfig.achievements);
    displaySocialMediaLinks(detailsConfig.socialMediaLinks);
    displaySkills(detailsConfig);
}

async function loadProfile() {

    try {
        const response = await fetch('./details.config.json');
        const detailsConfig = await response.json();
        await loadDetails(detailsConfig);

        await loadGithubProfile();
        console.log('Profile Loaded Successfully.');
    }
    catch (error) {
        console.error('Error loading profile data:', error);
        showMessagePopup('Error loading profile data. Please try again later.');
    }
}

loadProfile();

const header = document.getElementById("header");
window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
});

const messagePopup = document.getElementById('messagePopup');
const closePopup = document.getElementById('closePopup');

function showMessagePopup(message) {
    const messageText = document.getElementById('popupText');
    messageText.textContent = message;
    messagePopup.setAttribute('aria-hidden', 'false');
}

function hideMessagePopup() {
    messagePopup.setAttribute('aria-hidden', 'true');
}

closePopup.addEventListener('click', () => hideMessagePopup());

messagePopup.addEventListener('click', (event) => {
    if (event.target === messagePopup) hideMessagePopup();
});

const hamburgerMenu = document.getElementById('hamburgerMenu');
const navList = document.getElementById('navList');

hamburgerMenu.addEventListener('click', () => {
    navList.classList.toggle('navlist-visible');
});
