-- ============================================================
-- PLATFORM DATABASE SCHEMA v2
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- Core user record. Created on first OAuth login.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- OAuth identity
  oauth_provider      VARCHAR(20) NOT NULL,               -- 'google' | 'github'
  oauth_id            VARCHAR(100) NOT NULL,              -- provider's user id
  
  -- Basic profile (filled on first login / edit profile)
  email               VARCHAR(255) UNIQUE,
  username            VARCHAR(50)  UNIQUE,
  full_name           VARCHAR(100),
  mobile_number       VARCHAR(20),
  city                VARCHAR(100),
  avatar_url          TEXT,
  bio                 TEXT,
  headline            VARCHAR(150),                       -- e.g. "Fullstack Developer & AI Enthusiast"
  website_url         TEXT,
  github_username     VARCHAR(100),
  linkedin_url        TEXT,

  -- Onboarding state
  is_profile_complete BOOLEAN DEFAULT FALSE,              -- false until basic details filled
  is_assessment_done  BOOLEAN DEFAULT FALSE,              -- false until skill assessment done

  -- Account state
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(oauth_provider, oauth_id)
);

-- ============================================================
-- USER RATINGS
-- One row per user. Rating goes 0–5000 (like ELO).
-- ============================================================
CREATE TABLE IF NOT EXISTS user_ratings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Overall ELO-style score (0–5000, shown on leaderboard)
  elo_score           INTEGER DEFAULT 800,

  -- Sub-scores (each 0–1000, averaged for display)
  technical_score     INTEGER DEFAULT 0,
  experience_score    INTEGER DEFAULT 0,
  teamwork_score      INTEGER DEFAULT 0,
  reliability_score   INTEGER DEFAULT 0,

  -- Tier derived from elo_score
  -- 0–999: Explorer | 1000–1999: Builder | 2000–2999: Hacker
  -- 3000–3999: Expert | 4000–5000: Elite
  tier                VARCHAR(20) DEFAULT 'Explorer',

  -- Competition record
  total_competitions  INTEGER DEFAULT 0,
  wins                INTEGER DEFAULT 0,
  podium_finishes     INTEGER DEFAULT 0,               -- top 3 placements

  -- Confidence in rating
  rating_confidence   VARCHAR(10) DEFAULT 'low'
                      CHECK (rating_confidence IN ('low', 'medium', 'high')),

  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SKILLS (master list)
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) UNIQUE NOT NULL,
  category  VARCHAR(50)  NOT NULL        -- Frontend | Backend | AI/ML | Design | Data | Business | DevOps | Web3
);

-- ============================================================
-- USER SKILLS
-- Skills user claims + verification metadata (AI fills later)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_skills (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id            INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level   VARCHAR(20) CHECK (proficiency_level IN ('beginner','intermediate','advanced','expert')),
  years_experience    DECIMAL(3,1),
  is_verified         BOOLEAN DEFAULT FALSE,
  verification_source VARCHAR(50),                     -- 'github' | 'certificate' | 'manual'
  verification_score  DECIMAL(5,2),                    -- AI confidence 0–100
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- ============================================================
-- USER LINKED PROFILES
-- External profiles linked for skill verification
-- ============================================================
CREATE TABLE IF NOT EXISTS user_linked_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform    VARCHAR(30) NOT NULL                     -- 'github' | 'linkedin' | 'kaggle' | 'behance' | 'dribbble'
              CHECK (platform IN ('github','linkedin','kaggle','behance','dribbble')),
  url         TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- ============================================================
-- USER CERTIFICATES
-- Uploaded certificates (AI extracts skill + issuer later)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_certificates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url          TEXT NOT NULL,
  title             VARCHAR(200),
  issuer            VARCHAR(150),
  issued_date       DATE,
  skill_extracted   VARCHAR(100),                      -- AI filled later
  is_verified       BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER PAST COMPETITIONS
-- Self-reported competition history (pre-platform)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_past_competitions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  organizer   VARCHAR(150),
  year        INTEGER,
  role        VARCHAR(100),                            -- "Team Lead", "Designer", etc.
  placement   VARCHAR(50),                             -- "Winner", "Finalist", "Top 10", etc.
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER FEATURED PROJECTS
-- Showcased on profile (like the "Past Podiums" section)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  role        VARCHAR(100),
  outcome     VARCHAR(200),                            -- "Won 1st place", "Shipped to 10k users"
  link        TEXT,
  skills_used INTEGER[],                               -- array of skill ids
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER PREFERENCES
-- For matchmaking algorithm
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hours_per_week        INTEGER,                       -- availability
  preferred_role        VARCHAR(20)                    -- 'leader' | 'member' | 'flexible'
                        CHECK (preferred_role IN ('leader','member','flexible')),
  preferred_comp_types  TEXT[],                        -- ['hackathon','case_comp','design_challenge']
  location_preference   VARCHAR(20)                    -- 'online' | 'in_person' | 'both'
                        CHECK (location_preference IN ('online','in_person','both')),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPETITIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS competitions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 VARCHAR(255) NOT NULL,
  description           TEXT,
  type                  VARCHAR(30)
                        CHECK (type IN ('hackathon','case_comp','design_challenge','coding_contest','other')),
  organizer             VARCHAR(150),
  organizer_logo_url    TEXT,
  banner_url            TEXT,
  prize_pool            VARCHAR(100),
  max_team_size         INTEGER DEFAULT 4,
  min_team_size         INTEGER DEFAULT 1,
  registration_deadline TIMESTAMPTZ,
  start_date            TIMESTAMPTZ,
  end_date              TIMESTAMPTZ,
  location              VARCHAR(100),
  is_online             BOOLEAN DEFAULT TRUE,
  registration_url      TEXT,
  status                VARCHAR(20) DEFAULT 'upcoming'
                        CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  tags                  TEXT[],
  required_skills       INTEGER[],                     -- skill ids
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPETITION REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS competition_registrations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id      UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id             UUID,
  registration_status VARCHAR(20) DEFAULT 'registered'
                      CHECK (registration_status IN ('registered','in_team','withdrawn')),
  registered_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id  UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  created_by      UUID NOT NULL REFERENCES users(id),
  max_members     INTEGER DEFAULT 4,
  is_open         BOOLEAN DEFAULT TRUE,
  invite_code     VARCHAR(20) UNIQUE,
  last_active_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_oauth       ON users(oauth_provider, oauth_id);
CREATE INDEX IF NOT EXISTS idx_users_username    ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_skills_user  ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_elo       ON user_ratings(elo_score DESC);
CREATE INDEX IF NOT EXISTS idx_comp_status       ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_comp_type         ON competitions(type);
CREATE INDEX IF NOT EXISTS idx_reg_competition   ON competition_registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_reg_user          ON competition_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_comp         ON teams(competition_id);

-- ============================================================
-- AUTO updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_users_updated_at        ON users;
DROP TRIGGER IF EXISTS trg_competitions_updated_at ON competitions;
DROP TRIGGER IF EXISTS trg_teams_updated_at        ON teams;

CREATE TRIGGER trg_users_updated_at        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_competitions_updated_at BEFORE UPDATE ON competitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_teams_updated_at        BEFORE UPDATE ON teams        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED: Skills
-- ============================================================
INSERT INTO skills (name, category) VALUES
  ('JavaScript','Frontend'),('TypeScript','Frontend'),('React','Frontend'),
  ('Vue.js','Frontend'),('Next.js','Frontend'),('HTML/CSS','Frontend'),
  ('Node.js','Backend'),('Python','Backend'),('Java','Backend'),
  ('Go','Backend'),('Express.js','Backend'),('FastAPI','Backend'),
  ('PostgreSQL','Data'),('MongoDB','Data'),('Redis','Data'),
  ('MySQL','Data'),('Pandas','Data'),('SQL','Data'),
  ('Machine Learning','AI/ML'),('Deep Learning','AI/ML'),('NLP','AI/ML'),
  ('Computer Vision','AI/ML'),('LLMs','AI/ML'),('TensorFlow','AI/ML'),
  ('UI/UX Design','Design'),('Figma','Design'),('Graphic Design','Design'),
  ('Illustration','Design'),('Motion Design','Design'),
  ('DevOps','DevOps'),('Docker','DevOps'),('AWS','DevOps'),
  ('CI/CD','DevOps'),('Kubernetes','DevOps'),
  ('Blockchain','Web3'),('Smart Contracts','Web3'),('Solidity','Web3'),
  ('Financial Modeling','Business'),('Market Research','Business'),
  ('Product Management','Business'),('Strategy','Business'),
  ('Public Speaking','Business'),('Data Analysis','Data'),
  ('Power BI','Data'),('Tableau','Data')
ON CONFLICT (name) DO NOTHING;
