import dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';

// ─── Tier from ELO ────────────────────────────────────────────────────────────
export const getTier = (elo) => {
  if (elo >= 4000) return 'Elite';
  if (elo >= 3000) return 'Expert';
  if (elo >= 2000) return 'Hacker';
  if (elo >= 1000) return 'Builder';
  if (elo > 0)     return 'Explorer';
  return 'Unrated';
};

// ─── Build prompt sections per track ─────────────────────────────────────────
const buildVerifiedDataSection = (data) => {
  const sections = [];

  if (data.github) {
    const g = data.github;
    sections.push(`GITHUB (verified):
- Username: ${g.username} | Account age: ${g.account_age_years} years
- Public repos: ${g.public_repos} | Total stars: ${g.total_stars} | Followers: ${g.followers}
- Top languages: ${g.top_languages?.join(', ') || 'none'}
- Top repos: ${g.top_repos?.join(' | ') || 'none'}
- Recent commits (30d): ${g.recent_commits_30d}`);
  }

  if (data.leetcode) {
    const l = data.leetcode;
    sections.push(`LEETCODE (verified):
- Problems solved: ${l.problems_solved.total} (Easy: ${l.problems_solved.easy}, Medium: ${l.problems_solved.medium}, Hard: ${l.problems_solved.hard})
- Contest rating: ${l.contest_rating || 'no contests'} ${l.top_percentage ? `(top ${l.top_percentage})` : ''}
- Contests attended: ${l.contests_attended} | Streak: ${l.streak} days`);
  }

  if (data.codeforces) {
    const c = data.codeforces;
    sections.push(`CODEFORCES (verified):
- Handle: ${c.handle} | Current rating: ${c.current_rating} (${c.rank})
- Max rating: ${c.max_rating} (${c.max_rank}) | Contests: ${c.contests_attended}
- Recent contests: ${c.recent_contests?.map(r => `${r.contest.slice(0,30)} rank:${r.rank} (${r.change > 0 ? '+' : ''}${r.change})`).join(', ') || 'none'}`);
  }

  if (data.kaggle_username) {
    sections.push(`KAGGLE (self-reported, not fetched):
- Username: ${data.kaggle_username} (treat as low-confidence signal)`);
  }

  return sections.join('\n\n');
};

const buildTrackWeights = (tracks, depth) => {
  const isQuick = depth === 'quick';
  const weights = {};

  if (tracks.includes('hackathon')) {
    weights.github      = isQuick ? 35 : 30;
    weights.leetcode    = isQuick ? 25 : 20;
    weights.codeforces  = isQuick ? 20 : 15;
    weights.written_tech = isQuick ? 20 : 15;
  }
  if (tracks.includes('data')) {
    weights.github      = (weights.github || 0)     + (isQuick ? 20 : 15);
    weights.leetcode    = (weights.leetcode || 0)   + (isQuick ? 15 : 10);
    weights.kaggle      = isQuick ? 25 : 20;
    weights.written_data = isQuick ? 20 : 15;
  }
  if (tracks.includes('design')) {
    weights.portfolio    = isQuick ? 30 : 20;
    weights.written_design = isQuick ? 40 : 30;
    weights.skills_design  = isQuick ? 30 : 20;
  }
  if (tracks.includes('case_comp')) {
    weights.written_business  = isQuick ? 40 : 30;
    weights.frameworks        = isQuick ? 30 : 25;
    weights.business_history  = isQuick ? 30 : 20;
  }

  // Normalize weights to sum to 100
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalized = {};
  Object.entries(weights).forEach(([k, v]) => {
    normalized[k] = Math.round((v / total) * 100);
  });
  return normalized;
};

// ─── Main assessment function ─────────────────────────────────────────────────
export const runSkillAssessment = async (assessmentData, externalData) => {
  const { tracks, depth, formData } = assessmentData;

  const weights        = buildTrackWeights(tracks, depth);
  const verifiedSection = buildVerifiedDataSection(externalData);

  // Build self-reported section
  const selfReported = [];

  if (formData.claimed_skills?.length) {
    selfReported.push(`CLAIMED SKILLS:\n${formData.claimed_skills.map(s => `- ${s.skill} (${s.proficiency_level})`).join('\n')}`);
  }

  // Track-specific written responses
  if (formData.written_tech) {
    selfReported.push(`TECHNICAL WRITTEN RESPONSE:\n${formData.written_tech}`);
  }
  if (formData.written_data) {
    selfReported.push(`DATA SCIENCE WRITTEN RESPONSE:\n${formData.written_data}`);
  }
  if (formData.written_design) {
    selfReported.push(`DESIGN WRITTEN RESPONSE:\n${formData.written_design}`);
  }
  if (formData.written_business) {
    selfReported.push(`BUSINESS WRITTEN RESPONSE:\n${formData.written_business}`);
  }

  // Case comp specific
  if (formData.business_frameworks?.length) {
    selfReported.push(`BUSINESS FRAMEWORKS KNOWN:\n${formData.business_frameworks.join(', ')}`);
  }
  if (formData.business_industry) {
    selfReported.push(`INDUSTRY FOCUS: ${formData.business_industry}`);
  }
  if (formData.business_internships) {
    selfReported.push(`INTERNSHIPS/LIVE PROJECTS:\n${formData.business_internships}`);
  }
  if (formData.market_sizing_approach) {
    selfReported.push(`MARKET SIZING APPROACH:\n${formData.market_sizing_approach}`);
  }
  if (formData.data_driven_decision) {
    selfReported.push(`DATA-DRIVEN DECISION EXAMPLE:\n${formData.data_driven_decision}`);
  }

  // Design profiles
  if (formData.behance_url || formData.dribbble_url || formData.figma_url) {
    selfReported.push(`DESIGN PORTFOLIO LINKS:\n- Behance: ${formData.behance_url || 'not provided'}\n- Dribbble: ${formData.dribbble_url || 'not provided'}\n- Figma: ${formData.figma_url || 'not provided'}`);
  }

  if (formData.past_competitions?.length) {
    selfReported.push(`PAST COMPETITIONS:\n${formData.past_competitions.map(c =>
      `- ${c.name} (${c.year}) — ${c.placement || 'participated'} as ${c.role || 'team member'}`
    ).join('\n')}`);
  }

  const prompt = `You are an expert skill assessor for a hackathon and competition platform. Evaluate this user profile and assign a fair initial ELO rating (0-5000 scale).

SELECTED TRACKS: ${tracks.join(', ')}
ASSESSMENT DEPTH: ${depth} (${depth === 'quick' ? 'basic signals only' : 'full detailed assessment'})

SCORING WEIGHTS FOR THIS USER:
${Object.entries(weights).map(([k, v]) => `- ${k}: ${v}%`).join('\n')}

═══ VERIFIED EXTERNAL DATA ═══
${verifiedSection || 'No external profiles provided'}

═══ SELF-REPORTED DATA (lower weight) ═══
${selfReported.join('\n\n')}

═══ PREFERENCES ═══
Hours/week: ${formData.hours_per_week || 'not specified'}
Preferred role: ${formData.preferred_role || 'not specified'}
Location: ${formData.location_preference || 'not specified'}

---

SCORING GUIDE (be realistic and fair):
- 0-999 (Explorer): Beginner, little verifiable experience
- 1000-1999 (Builder): Some projects, basic competition experience  
- 2000-2999 (Hacker): Strong GitHub/competitive profile, hackathon wins
- 3000-3999 (Expert): Exceptional profile, multiple wins, strong external signals
- 4000-5000 (Elite): Top 1%, extraordinary verified track record

IMPORTANT RULES:
- Weight verified external data HEAVILY over self-reported claims
- If GitHub shows only HTML/CSS repos but user claims "ML Expert" → flag and downgrade ML
- Codeforces Expert (1600+) → strong problem solving signal
- LeetCode 200+ problems with contest rating → solid DSA foundation
- Be skeptical of empty external profiles with high skill claims
- For design/business tracks with no verifiable data, weight written responses more but stay conservative
- ${depth === 'quick' ? 'Quick assessment: be slightly more conservative since less data was collected' : 'Full assessment: you have comprehensive data, be precise'}

Return ONLY this JSON (no markdown, no explanation):
{
  "skill_scores": {
    "Frontend": 0,
    "Backend": 0,
    "AI_ML": 0,
    "Design": 0,
    "Data": 0,
    "DevOps": 0,
    "Business": 0,
    "Web3": 0
  },
  "track_scores": {
    ${tracks.map(t => `"${t}": 0`).join(',\n    ')}
  },
  "experience_bonus": 0,
  "consistency_bonus": 0,
  "verified_skills": [
    {"skill": "example", "claimed_level": "advanced", "verified_level": "intermediate", "confidence": 70, "verified": true, "reason": "brief reason"}
  ],
  "flags": ["any discrepancies found, e.g. claimed ML expert but no Python repos"],
  "confidence": "low",
  "reasoning": "2-3 sentence honest assessment summary"
}

Rules for scores:
- skill_scores: 0-100 per domain, only score domains with evidence
- track_scores: 0-100 per selected track
- experience_bonus: 0-500 (competition history, account age, consistency)
- consistency_bonus: 0-200 (regular activity, streak, multi-platform presence)
- confidence: "low" | "medium" | "high"`;

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model:       MODEL,
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.15,
      max_tokens:  2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mistral API error: ${err}`);
  }

  const data    = await response.json();
  const rawText = data.choices[0].message.content.trim();
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  const result  = JSON.parse(cleaned);

  // Calculate ELO from scores
  const trackScoreValues = Object.values(result.track_scores || {});
  const avgTrackScore    = trackScoreValues.length
    ? trackScoreValues.reduce((a, b) => a + b, 0) / trackScoreValues.length
    : 0;

  const elo = Math.min(5000, Math.max(0, Math.round(
    avgTrackScore * 35 +
    (result.experience_bonus  || 0) +
    (result.consistency_bonus || 0)
  )));

  return {
    skill_scores:     result.skill_scores     || {},
    track_scores:     result.track_scores     || {},
    verified_skills:  result.verified_skills  || [],
    flags:            result.flags            || [],
    ai_confidence:    result.confidence       || 'low',
    ai_reasoning:     result.reasoning        || '',
    ai_raw_response:  rawText,
    initial_elo:      elo,
    tier:             getTier(elo),
  };
};
