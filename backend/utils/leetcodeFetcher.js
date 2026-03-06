// Fetches LeetCode stats via their public GraphQL API
export const fetchLeetCodeData = async (username) => {
  if (!username) return null;
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          profile {
            ranking
            reputation
          }
          userCalendar { streak totalActiveDays }
        }
        userContestRanking(username: $username) {
          rating
          globalRanking
          totalParticipants
          topPercentage
          attendedContestsCount
        }
      }
    `;

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!res.ok) return null;
    const { data } = await res.json();

    if (!data?.matchedUser) return null;

    const stats    = data.matchedUser.submitStats?.acSubmissionNum || [];
    const calendar = data.matchedUser.userCalendar || {};
    const contest  = data.userContestRanking;

    const easy   = stats.find(s => s.difficulty === 'Easy')?.count   || 0;
    const medium = stats.find(s => s.difficulty === 'Medium')?.count || 0;
    const hard   = stats.find(s => s.difficulty === 'Hard')?.count   || 0;

    return {
      username,
      problems_solved: { easy, medium, hard, total: easy + medium + hard },
      contest_rating:       contest?.rating            ? Math.round(contest.rating) : null,
      global_ranking:       contest?.globalRanking     || null,
      top_percentage:       contest?.topPercentage     ? `${contest.topPercentage.toFixed(1)}%` : null,
      contests_attended:    contest?.attendedContestsCount || 0,
      streak:               calendar.streak            || 0,
      total_active_days:    calendar.totalActiveDays   || 0,
    };
  } catch (err) {
    console.error('LeetCode fetch error:', err.message);
    return null;
  }
};
