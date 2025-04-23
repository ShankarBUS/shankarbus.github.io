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

function createBadge(content, className, iconSrc) {
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

async function loadGithubProfile() {
    await fetchGitHubProjects();
    await fetchGitHubOrgs();
    let sorted = ghRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    sorted.forEach(repo => {
        createGHRepoCard(repo);
    });
}

loadGithubProfile().then(() => {
    console.log('GitHub profile loaded successfully.');
}).catch(error => {
    console.error('Error loading GitHub profile:', error);
});

const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 50) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
});