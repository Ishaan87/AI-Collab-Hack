import pkg from 'pg';
const { Pool } = pkg;
import crypto from 'crypto';

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'kinetic',
  user: 'postgres',
  password: 'root',
});

const SKILLS_BY_CATEGORY = {
  Frontend:  ['JavaScript', 'React', 'Next.js', 'HTML/CSS'],
  Backend:   ['Node.js', 'Python', 'Java', 'Go'],
  'AI/ML':   ['Machine Learning', 'NLP', 'Computer Vision', 'PyTorch'],
  Design:    ['UI/UX Design', 'Figma', 'Prototyping'],
  Data:      ['SQL', 'Pandas', 'Data Analysis', 'Tableau'],
  DevOps:    ['Docker', 'AWS', 'Kubernetes', 'Linux'],
  Web3:      ['Blockchain', 'Smart Contracts', 'Solidity'],
  Business:  ['Product Management', 'Strategy', 'Market Research'],
};

const CATEGORIES = Object.keys(SKILLS_BY_CATEGORY);
const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Kevin', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Rachel', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zack'];
const ROLES = ['flexible', 'leader', 'member'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  try {
    console.log('Starting seeder...');
    for (const name of NAMES) {
      const id = crypto.randomUUID();
      const username = name.toLowerCase() + randomInt(100, 999);
      const elo = randomInt(900, 1600);
      let tier = 'Explorer';
      if (elo > 1500) tier = 'Elite';
      else if (elo > 1300) tier = 'Expert';
      else if (elo > 1100) tier = 'Hacker';
      else if (elo > 950) tier = 'Builder';

      // Insert User
      await pool.query(
        `INSERT INTO users (id, oauth_provider, oauth_id, email, username, full_name, is_assessment_done, is_active)
         VALUES ($1, 'google', $2, $3, $4, $5, true, true)`,
        [id, crypto.randomUUID(), `${username}@example.com`, username, `${name} Doe`]
      );

      // Insert Rating
      await pool.query(
        `INSERT INTO user_ratings (user_id, elo_score, tier, rating_confidence)
         VALUES ($1, $2, $3, 'high')`,
        [id, elo, tier]
      );

      // Insert Preferences
      await pool.query(
        `INSERT INTO user_preferences (user_id, preferred_role, hours_per_week)
         VALUES ($1, $2, $3)`,
        [id, randomItem(ROLES), randomInt(10, 40)]
      );

      // Insert Skills (2-4 random categories)
      const numCategories = randomInt(2, 4);
      const shuffledCat = [...CATEGORIES].sort(() => 0.5 - Math.random());
      const selectedCat = shuffledCat.slice(0, numCategories);

      for (const cat of selectedCat) {
        const skillsInCat = SKILLS_BY_CATEGORY[cat];
        const numSkills = randomInt(1, Math.min(2, skillsInCat.length));
        const shuffledSkills = [...skillsInCat].sort(() => 0.5 - Math.random()).slice(0, numSkills);
        
        for (const skill of shuffledSkills) {
          await pool.query(
            `INSERT INTO user_skills (user_id, name, category, proficiency_level)
             VALUES ($1, $2, $3, $4)`,
            [id, skill, cat, randomItem(['intermediate', 'advanced', 'expert'])]
          );
        }
      }
      
      console.log(`Created user ${username} with ELO ${elo} (${tier}) and ${selectedCat.join(', ')} skills.`);
    }

    console.log(`Successfully seeded ${NAMES.length} users!`);
    await pool.end();
  } catch (e) {
    console.error('Seeding failed:', e);
    await pool.end();
  }
}

seed();
