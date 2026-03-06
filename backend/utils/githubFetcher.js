// Fetches real GitHub data for skill verification
export const fetchGitHubData = async (username) => {
  if (!username) return null;
  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=20&sort=updated`),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=30`),
    ]);

    if (!userRes.ok) return null;

    const user   = await userRes.json();
    const repos  = reposRes.ok  ? await reposRes.json()  : [];
    const events = eventsRes.ok ? await eventsRes.json() : [];

    // Language frequency across repos
    const langCount = {};
    repos.forEach(r => {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    });
    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([lang, count]) => `${lang} (${count} repos)`);

    // Top repos by stars
    const topRepos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map(r => `${r.name} [${r.language || 'unknown'}] ⭐${r.stargazers_count} — ${r.description || 'no description'}`);

    // Recent commit activity (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentCommits = events.filter(
      e => e.type === 'PushEvent' && new Date(e.created_at).getTime() > thirtyDaysAgo
    ).length;

    const accountAgeYears = ((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);

    return {
      username:          user.login,
      public_repos:      user.public_repos,
      followers:         user.followers,
      account_age_years: accountAgeYears,
      bio:               user.bio || 'Not set',
      top_languages:     topLanguages,
      top_repos:         topRepos,
      recent_commits_30d: recentCommits,
      total_stars:       repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    };
  } catch (err) {
    console.error('GitHub fetch error:', err.message);
    return null;
  }
};
