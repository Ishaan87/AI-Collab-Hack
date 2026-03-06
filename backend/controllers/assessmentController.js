import pool from '../config/db.js';
import { runSkillAssessment } from '../utils/mistralService.js';
import { fetchGitHubData }    from '../utils/githubFetcher.js';
import { fetchLeetCodeData }  from '../utils/leetcodeFetcher.js';
import { fetchCodeforcesData } from '../utils/codeforcesFetcher.js';

// ─── Infer skill category from name (no master table needed) ─────────────────
const inferCategory = (skillName) => {
  const s = skillName.toLowerCase();
  if (/react|vue|angular|next|svelte|html|css|tailwind|javascript|typescript|frontend|figma|ui|ux/.test(s)) return 'Frontend';
  if (/node|express|django|fastapi|flask|spring|rails|backend|api|rest|graphql|java|go|ruby|php|rust|c\+\+/.test(s)) return 'Backend';
  if (/python|ml|machine learning|deep learning|nlp|neural|tensorflow|pytorch|keras|sklearn|ai|llm|computer vision/.test(s)) return 'AI/ML';
  if (/sql|postgres|mysql|mongo|redis|database|firebase|supabase|dynamo/.test(s)) return 'Data';
  if (/pandas|numpy|matplotlib|tableau|power bi|data analysis|analytics|statistics|r programming/.test(s)) return 'Data';
  if (/docker|kubernetes|aws|gcp|azure|ci\/cd|devops|linux|terraform|nginx|cloud/.test(s)) return 'DevOps';
  if (/figma|adobe|illustrator|photoshop|sketch|design|ui\/ux|prototype|canva|blender/.test(s)) return 'Design';
  if (/solidity|blockchain|web3|ethereum|smart contract|crypto|nft/.test(s)) return 'Web3';
  if (/finance|consulting|strategy|marketing|management|business|excel|powerpoint|case|mba/.test(s)) return 'Business';
  return 'Other';
};

// ─── GET STATUS ───────────────────────────────────────────────────────────────
export const getAssessmentStatus = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, status, tracks, depth, submitted_at, completed_at,
              ai_tier, ai_initial_elo, ai_reasoning, ai_confidence, flags
       FROM user_assessments WHERE user_id = $1`,
      [req.user.id]
    );
    if (!result.rows.length)
      return res.json({ success: true, status: 'not_started' });

    res.json({ success: true, assessment: result.rows[0] });
  } catch (err) {
    console.error('getAssessmentStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── SUBMIT ASSESSMENT ────────────────────────────────────────────────────────
export const submitAssessment = async (req, res) => {
  try {
    // Block re-assessment
    const existing = await pool.query(
      "SELECT id, status FROM user_assessments WHERE user_id = $1",
      [req.user.id]
    );
    if (existing.rows.length > 0 && existing.rows[0].status === 'completed') {
      return res.status(409).json({
        success: false,
        message: 'Assessment already completed.',
      });
    }

    const { tracks, depth, formData } = req.body;

    if (!tracks?.length)
      return res.status(400).json({ success: false, message: 'No tracks selected.' });

    // ── Fetch external data in parallel ──────────────────────────────────────
    const needsTech = tracks.includes('hackathon') || tracks.includes('data');
    const [github, leetcode, codeforces] = await Promise.all([
      needsTech ? fetchGitHubData(formData.github_username)        : Promise.resolve(null),
      needsTech ? fetchLeetCodeData(formData.leetcode_username)     : Promise.resolve(null),
      needsTech ? fetchCodeforcesData(formData.codeforces_handle)  : Promise.resolve(null),
    ]);

    const externalData = {
      github,
      leetcode,
      codeforces,
      kaggle_username: formData.kaggle_username || null,
    };

    // ── Save as processing ────────────────────────────────────────────────────
    await pool.query(
      `INSERT INTO user_assessments
        (user_id, tracks, depth, form_data, external_data_snapshot, status)
       VALUES ($1, $2, $3, $4, $5, 'processing')
       ON CONFLICT (user_id) DO UPDATE SET
         tracks = $2, depth = $3, form_data = $4,
         external_data_snapshot = $5, status = 'processing', submitted_at = NOW()`,
      [req.user.id, tracks, depth, JSON.stringify(formData), JSON.stringify(externalData)]
    );

    // Update user profile fields if provided
    if (formData.github_username) {
      await pool.query('UPDATE users SET github_username = $1 WHERE id = $2', [formData.github_username, req.user.id]);
    }
    if (formData.linkedin_url) {
      await pool.query('UPDATE users SET linkedin_url = $1 WHERE id = $2', [formData.linkedin_url, req.user.id]);
    }

    // ── Run AI assessment ─────────────────────────────────────────────────────
    let aiResult;
    try {
      aiResult = await runSkillAssessment({ tracks, depth, formData }, externalData);
    } catch (aiErr) {
      console.error('AI assessment failed:', aiErr);
      await pool.query("UPDATE user_assessments SET status = 'failed' WHERE user_id = $1", [req.user.id]);
      return res.status(500).json({ success: false, message: 'AI assessment failed. Please try again.' });
    }

    // ── Save AI results ───────────────────────────────────────────────────────
    await pool.query(
      `UPDATE user_assessments SET
        ai_verified_skills = $1, ai_skill_scores = $2, ai_track_scores = $3,
        ai_initial_elo = $4, ai_tier = $5, ai_confidence = $6,
        ai_reasoning = $7, ai_raw_response = $8, flags = $9,
        status = 'completed', completed_at = NOW()
       WHERE user_id = $10`,
      [
        JSON.stringify(aiResult.verified_skills),
        JSON.stringify(aiResult.skill_scores),
        JSON.stringify(aiResult.track_scores),
        aiResult.initial_elo,
        aiResult.tier,
        aiResult.ai_confidence,
        aiResult.ai_reasoning,
        aiResult.ai_raw_response,
        aiResult.flags,
        req.user.id,
      ]
    );

    // ── Update user_ratings ───────────────────────────────────────────────────
    await pool.query(
      `UPDATE user_ratings SET
        elo_score = $1, tier = $2, rating_confidence = $3, updated_at = NOW()
       WHERE user_id = $4`,
      [aiResult.initial_elo, aiResult.tier, aiResult.ai_confidence, req.user.id]
    );

    // ── Mark assessment done ──────────────────────────────────────────────────
    await pool.query('UPDATE users SET is_assessment_done = TRUE WHERE id = $1', [req.user.id]);

    // ── Sync skills to user_skills (free text — no master table needed) ───────
    // Merge AI verified skills + self-reported skills into one list
    const verifiedNames = new Set(
      (aiResult.verified_skills || []).map(vs => vs.skill.toLowerCase())
    );

    const allSkills = [
      // AI verified/assessed skills
      ...(aiResult.verified_skills || []).map(vs => ({
        name:               vs.skill,
        category:           inferCategory(vs.skill),
        proficiency_level:  vs.verified_level || vs.claimed_level || 'intermediate',
        is_verified:        vs.verified === true,
        verification_score: vs.confidence || null,
      })),
      // Self-reported skills not already in AI list
      ...(formData.claimed_skills || [])
        .filter(cs => !verifiedNames.has(cs.skill.toLowerCase()))
        .map(cs => ({
          name:               cs.skill,
          category:           inferCategory(cs.skill),
          proficiency_level:  cs.proficiency_level || 'intermediate',
          is_verified:        false,
          verification_score: null,
        })),
    ];

    for (const skill of allSkills) {
      try {
        await pool.query(
          `INSERT INTO user_skills
            (user_id, name, category, proficiency_level, is_verified, verification_source, verification_score)
           VALUES ($1, $2, $3, $4, $5, 'ai_assessment', $6)
           ON CONFLICT (user_id, name) DO UPDATE SET
             category           = $3,
             proficiency_level  = $4,
             is_verified        = $5,
             verification_source = 'ai_assessment',
             verification_score = $6`,
          [req.user.id, skill.name, skill.category, skill.proficiency_level, skill.is_verified, skill.verification_score]
        );
      } catch (err) {
        console.error(`Failed to insert skill "${skill.name}":`, err.message);
      }
    }

    console.log(`Synced ${allSkills.length} skills for user ${req.user.id}`);

    // ── Save preferences ──────────────────────────────────────────────────────
    if (formData.hours_per_week || formData.preferred_role) {
      await pool.query(
        `INSERT INTO user_preferences
          (user_id, hours_per_week, preferred_role, preferred_comp_types, location_preference)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE SET
           hours_per_week = $2, preferred_role = $3,
           preferred_comp_types = $4, location_preference = $5`,
        [
          req.user.id,
          formData.hours_per_week || null,
          formData.preferred_role || null,
          formData.preferred_comp_types || [],
          formData.location_preference || null,
        ]
      );
    }

    res.json({
      success: true,
      message: 'Assessment completed!',
      result: {
        elo_score:    aiResult.initial_elo,
        tier:         aiResult.tier,
        confidence:   aiResult.ai_confidence,
        reasoning:    aiResult.ai_reasoning,
        skill_scores: aiResult.skill_scores,
        track_scores: aiResult.track_scores,
        flags:        aiResult.flags,
        external_data_fetched: {
          github:     !!github,
          leetcode:   !!leetcode,
          codeforces: !!codeforces,
        },
      },
    });
  } catch (err) {
    console.error('submitAssessment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};