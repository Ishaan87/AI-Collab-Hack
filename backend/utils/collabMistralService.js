const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';

const callMistral = async (prompt, maxTokens = 1500) => {
  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: maxTokens,
    }),
  });
  if (!response.ok) throw new Error(`Mistral error: ${await response.text()}`);
  const data = await response.json();
  const raw  = data.choices[0].message.content.trim();
  return raw.replace(/```json|```/g, '').trim();
};

// ─── Generate competition workflow + roles needed ─────────────────────────────
export const generateCompetitionAI = async (competition) => {
  const { title, description, type, duration_days, prize_pool, tags } = competition;

  const prompt = `You are an expert hackathon and competition coach. Given this competition, generate two things:

COMPETITION:
Title: ${title}
Type: ${type}
Description: ${description}
Duration: ${duration_days || 'not specified'} days
Prize: ${prize_pool || 'not specified'}
Tags/Themes: ${Array.isArray(tags) ? tags.join(', ') : tags || 'not specified'}

Generate a JSON response with this EXACT structure (no markdown, raw JSON only):

{
  "workflow": [
    {
      "phase": "Phase name (e.g. Registration & Team Formation)",
      "timeline": "When to do this (e.g. Day 1-2)",
      "steps": ["specific actionable step", "another step"],
      "tip": "One insider tip for this phase",
      "icon": "one emoji that represents this phase"
    }
  ],
  "roles_needed": [
    {
      "domain": "Domain name (Frontend / Backend / AI/ML / Design / Data / Business / DevOps / Web3)",
      "count": 1,
      "skills": ["skill1", "skill2"],
      "reason": "Why this role is critical for THIS competition specifically",
      "priority": "high | medium | low"
    }
  ],
  "ideal_team_size": 4,
  "key_insight": "One unique strategic insight about winning this specific competition",
  "common_mistakes": ["mistake teams commonly make in this type of comp"]
}

Rules:
- workflow should have 5-7 phases covering the full competition lifecycle
- roles_needed should reflect what THIS competition actually needs (a design challenge needs different roles than a ML hackathon)
- Be specific to the competition theme, not generic
- ideal_team_size should be realistic (2-6)
- Return ONLY the JSON object`;

  const raw    = await callMistral(prompt, 2000);
  return JSON.parse(raw);
};

// ─── Generate team suggestions ────────────────────────────────────────────────
export const generateTeamSuggestions = async (competition, currentUser, candidates, rolesNeeded) => {
  const prompt = `You are an expert team formation advisor for hackathons and competitions.

COMPETITION: ${competition.title}
Type: ${competition.type}
Description: ${competition.description?.slice(0, 300)}

CURRENT USER (the one looking for teammates):
Name: ${currentUser.full_name || currentUser.username}
ELO: ${currentUser.elo_score} (${currentUser.tier})
Skills: ${currentUser.skills?.map(s => `${s.name}(${s.proficiency_level})`).join(', ') || 'not specified'}
Preferred role: ${currentUser.preferred_role || 'flexible'}

ROLES NEEDED FOR THIS COMPETITION:
${JSON.stringify(rolesNeeded, null, 2)}

CANDIDATE USERS (potential teammates, pick the best combinations):
${JSON.stringify(candidates.map(c => ({
  id: c.id,
  username: c.username,
  name: c.full_name,
  elo: c.elo_score,
  tier: c.tier,
  skills: c.skills?.slice(0, 8).map(s => `${s.name}(${s.proficiency_level})`).join(', '),
  preferred_role: c.preferred_role,
  hours_per_week: c.hours_per_week,
})), null, 2)}

Form exactly 3 different team suggestions. Each team should complement the current user's skills and fill the roles needed for this competition. Vary the suggestions — don't just reorder the same people.

Return ONLY this JSON (no markdown):
{
  "suggestions": [
    {
      "team_name": "Creative team name related to the competition",
      "members": [
        {
          "user_id": "uuid here",
          "username": "username",
          "name": "full name",
          "role": "their role in this team",
          "why": "1 sentence — why this person specifically for this comp"
        }
      ],
      "team_reasoning": "2 sentence explanation of why this team composition works well together for this competition",
      "strength": "The team's biggest strength",
      "elo_range": "e.g. 1200-1450"
    }
  ]
}

Rules:
- Each team should have ${rolesNeeded?.ideal_team_size || 4} members MAX (including the current user if you include them — but you should NOT include the current user in members list, they are the one inviting)
- Pick members that complement each other AND the current user
- Vary ELO ranges slightly across the 3 suggestions
- Only use user_ids that exist in the candidates list above
- If fewer than 3 full teams can be formed, form as many as possible with available candidates`;

  const raw = await callMistral(prompt, 2000);
  return JSON.parse(raw);
};
