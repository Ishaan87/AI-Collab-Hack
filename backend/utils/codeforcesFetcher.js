// Fetches Codeforces stats via their free public API
export const fetchCodeforcesData = async (handle) => {
  if (!handle) return null;
  try {
    const [userRes, ratingRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
      fetch(`https://codeforces.com/api/user.rating?handle=${handle}`),
    ]);

    if (!userRes.ok) return null;
    const userData   = await userRes.json();
    const ratingData = ratingRes.ok ? await ratingRes.json() : null;

    if (userData.status !== 'OK' || !userData.result?.length) return null;

    const user    = userData.result[0];
    const history = ratingData?.status === 'OK' ? ratingData.result : [];

    // Rating trend: last 5 contests
    const recentContests = history.slice(-5).map(c => ({
      contest: c.contestName,
      rank:    c.rank,
      change:  c.newRating - c.oldRating,
    }));

    return {
      handle:            user.handle,
      current_rating:    user.rating    || 0,
      max_rating:        user.maxRating || 0,
      rank:              user.rank      || 'unrated',
      max_rank:          user.maxRank   || 'unrated',
      contests_attended: history.length,
      recent_contests:   recentContests,
      // Codeforces rank tiers for context in prompt
      tier_context: getRankTier(user.rating),
    };
  } catch (err) {
    console.error('Codeforces fetch error:', err.message);
    return null;
  }
};

const getRankTier = (rating) => {
  if (!rating)       return 'Unrated';
  if (rating < 1200) return 'Newbie';
  if (rating < 1400) return 'Pupil';
  if (rating < 1600) return 'Specialist';
  if (rating < 1900) return 'Expert';
  if (rating < 2100) return 'Candidate Master';
  if (rating < 2300) return 'Master';
  if (rating < 2400) return 'International Master';
  if (rating < 2600) return 'Grandmaster';
  return 'Legendary Grandmaster';
};
