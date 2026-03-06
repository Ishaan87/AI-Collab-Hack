import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  ChevronRight, ChevronLeft, Loader2, Sparkles, CheckCircle2,
  Code2, Briefcase, Palette, BarChart2, Zap, Target, Lock,
  Github, Globe, Trophy, Brain
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const TRACKS = [
  {
    id: 'hackathon',
    label: 'Hackathon',
    sublabel: 'Technical competitions',
    icon: Code2,
    color: 'bg-violet-50 border-violet-200 text-violet-700',
    activeColor: 'bg-violet-600 border-violet-600 text-white',
    iconBg: 'bg-violet-100',
  },
  {
    id: 'case_comp',
    label: 'Case Competition',
    sublabel: 'Business & strategy',
    icon: Briefcase,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    activeColor: 'bg-blue-600 border-blue-600 text-white',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'design',
    label: 'Design Challenge',
    sublabel: 'UI/UX & creative',
    icon: Palette,
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    activeColor: 'bg-pink-600 border-pink-600 text-white',
    iconBg: 'bg-pink-100',
  },
  {
    id: 'data',
    label: 'Data Science',
    sublabel: 'ML & analytics competitions',
    icon: BarChart2,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    activeColor: 'bg-emerald-600 border-emerald-600 text-white',
    iconBg: 'bg-emerald-100',
  },
];

const SKILLS_BY_CATEGORY = {
  Frontend:  ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Next.js', 'HTML/CSS'],
  Backend:   ['Node.js', 'Python', 'Java', 'Go', 'Express.js', 'FastAPI', 'Django'],
  'AI/ML':   ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'LLMs', 'TensorFlow', 'PyTorch'],
  Design:    ['UI/UX Design', 'Figma', 'Graphic Design', 'Illustration', 'Motion Design', 'Prototyping'],
  Data:      ['PostgreSQL', 'MongoDB', 'SQL', 'Pandas', 'NumPy', 'Data Analysis', 'Power BI', 'Tableau'],
  DevOps:    ['DevOps', 'Docker', 'AWS', 'CI/CD', 'Kubernetes', 'Linux'],
  Web3:      ['Blockchain', 'Smart Contracts', 'Solidity', 'Web3.js'],
  Business:  ['Financial Modeling', 'Market Research', 'Product Management', 'Strategy', 'Consulting Frameworks', 'Public Speaking'],
};

const TRACK_SKILL_CATEGORIES = {
  hackathon: ['Frontend', 'Backend', 'DevOps', 'Web3'],
  data:      ['Data', 'AI/ML', 'Backend'],
  design:    ['Design', 'Frontend'],
  case_comp: ['Business'],
};

const BUSINESS_FRAMEWORKS = [
  'SWOT Analysis', "Porter's Five Forces", 'McKinsey 7S', 'BCG Matrix',
  'PESTLE', 'Value Chain Analysis', 'Blue Ocean Strategy', 'Design Thinking',
  'Lean Canvas', 'OKRs',
];

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'FMCG / Retail',
  'Consulting', 'Manufacturing', 'Education', 'Real Estate', 'Media & Entertainment', 'Other',
];

const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

// ─── Step computation based on tracks + depth ─────────────────────────────────
const computeSteps = (tracks, depth) => {
  const steps = [];
  const hasTech    = tracks.includes('hackathon');
  const hasData    = tracks.includes('data');
  const hasDesign  = tracks.includes('design');
  const hasBiz     = tracks.includes('case_comp');
  const isQuick    = depth === 'quick';

  // External profiles
  if (hasTech || hasData) {
    steps.push({ id: 'competitive_profiles', label: 'Coding Profiles',     icon: Code2 });
  }
  if (hasData && !isQuick) {
    steps.push({ id: 'data_profiles',        label: 'Data Profiles',       icon: BarChart2 });
  }
  if (hasDesign) {
    steps.push({ id: 'design_profiles',      label: 'Design Portfolio',    icon: Palette });
  }
  if (hasBiz) {
    steps.push({ id: 'business_background',  label: 'Business Background', icon: Briefcase });
  }

  // Skills
  steps.push({ id: 'skills', label: 'Your Skills', icon: Brain });

  // Business deep-dive (full only)
  if (hasBiz && !isQuick) {
    steps.push({ id: 'business_deepdive', label: 'Business Deep-Dive', icon: Target });
  }

  // Written responses — one per track
  if (hasTech) steps.push({ id: 'written_tech',    label: 'Technical Response',  icon: Code2 });
  if (hasData)  steps.push({ id: 'written_data',   label: 'Data Response',       icon: BarChart2 });
  if (hasDesign) steps.push({ id: 'written_design', label: 'Design Response',    icon: Palette });
  if (hasBiz)   steps.push({ id: 'written_biz',    label: 'Business Response',   icon: Briefcase });

  // Preferences always last
  steps.push({ id: 'preferences', label: 'Preferences', icon: Zap });

  return steps;
};

// ─── Individual Step Components ───────────────────────────────────────────────

function StepCompetitiveProfiles({ data, setData, tracks }) {
  const hasData = tracks.includes('data');
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">These will be fetched automatically to verify your technical skills. Leave blank if you don't have them.</p>

      {[
        { field: 'github_username',    label: 'GitHub Username',      placeholder: 'e.g. johndoe',    prefix: 'github.com/', required: true },
        { field: 'leetcode_username',  label: 'LeetCode Username',    placeholder: 'e.g. johndoe',    prefix: 'leetcode.com/u/' },
        { field: 'codeforces_handle',  label: 'Codeforces Handle',    placeholder: 'e.g. tourist',    prefix: 'codeforces.com/profile/' },
        { field: 'codechef_username',  label: 'CodeChef Username',    placeholder: 'e.g. johndoe',    prefix: 'codechef.com/users/' },
      ].map(({ field, label, placeholder, prefix, required }) => (
        <div key={field} className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-[#7856FF]">*</span>}
          </label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#7856FF]">
            <span className="px-3 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 py-3 shrink-0">{prefix}</span>
            <input
              type="text"
              value={data[field] || ''}
              onChange={e => setData(prev => ({ ...prev, [field]: e.target.value }))}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 text-sm outline-none bg-white"
            />
          </div>
        </div>
      ))}

      {hasData && (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Kaggle Username</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#7856FF]">
            <span className="px-3 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 py-3 shrink-0">kaggle.com/</span>
            <input
              type="text"
              value={data.kaggle_username || ''}
              onChange={e => setData(prev => ({ ...prev, kaggle_username: e.target.value }))}
              placeholder="e.g. johndoe"
              className="flex-1 px-4 py-3 text-sm outline-none bg-white"
            />
          </div>
        </div>
      )}

      <div className="bg-[#F4F0FF] border border-[#7856FF]/20 rounded-xl p-3 flex items-start space-x-2">
        <Sparkles className="w-4 h-4 text-[#7856FF] shrink-0 mt-0.5" />
        <p className="text-xs text-[#5C5C5C]">GitHub, LeetCode, and Codeforces data will be fetched automatically on submission. Your stats directly affect your rating — the more active, the higher.</p>
      </div>
    </div>
  );
}

function StepDataProfiles({ data, setData }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Additional data science profiles to strengthen your assessment.</p>
      {[
        { field: 'kaggle_username',   label: 'Kaggle Username',    prefix: 'kaggle.com/' },
        { field: 'tableau_public',    label: 'Tableau Public URL', prefix: 'public.tableau.com/app/profile/' },
        { field: 'huggingface_username', label: 'HuggingFace Username', prefix: 'huggingface.co/' },
      ].map(({ field, label, prefix }) => (
        <div key={field} className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">{label}</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#7856FF]">
            <span className="px-3 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 py-3 shrink-0">{prefix}</span>
            <input
              type="text"
              value={data[field] || ''}
              onChange={e => setData(prev => ({ ...prev, [field]: e.target.value }))}
              className="flex-1 px-4 py-3 text-sm outline-none bg-white"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StepDesignProfiles({ data, setData }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Share your design portfolio links. These can't be auto-fetched but will be reviewed as part of your assessment.</p>
      {[
        { field: 'behance_url',  label: 'Behance',          placeholder: 'https://behance.net/...' },
        { field: 'dribbble_url', label: 'Dribbble',         placeholder: 'https://dribbble.com/...' },
        { field: 'figma_url',    label: 'Figma Community',  placeholder: 'https://figma.com/@...' },
        { field: 'portfolio_url', label: 'Personal Portfolio', placeholder: 'https://yourportfolio.com' },
      ].map(({ field, label, placeholder }) => (
        <div key={field} className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">{label}</label>
          <input
            type="url"
            value={data[field] || ''}
            onChange={e => setData(prev => ({ ...prev, [field]: e.target.value }))}
            placeholder={placeholder}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF]"
          />
        </div>
      ))}
    </div>
  );
}

function StepBusinessBackground({ data, setData }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Tell us about your business background to calibrate your case competition rating.</p>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">LinkedIn URL</label>
        <input
          type="url"
          value={data.linkedin_url || ''}
          onChange={e => setData(prev => ({ ...prev, linkedin_url: e.target.value }))}
          placeholder="https://linkedin.com/in/..."
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Education Level</label>
        <select
          value={data.education_level || ''}
          onChange={e => setData(prev => ({ ...prev, education_level: e.target.value }))}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF] bg-white"
        >
          <option value="">Select...</option>
          {['High School', 'Undergraduate (1st/2nd year)', 'Undergraduate (3rd/4th year)', 'Postgraduate / MBA', 'PhD', 'Working Professional'].map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Primary Industry Focus</label>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              type="button"
              onClick={() => setData(prev => ({ ...prev, business_industry: ind }))}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                data.business_industry === ind
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Past Case Competitions</label>
        <PastCompetitions data={data} setData={setData} />
      </div>
    </div>
  );
}

function PastCompetitions({ data, setData }) {
  const comps = data.past_competitions || [];

  const add = () => setData(prev => ({
    ...prev,
    past_competitions: [...(prev.past_competitions || []), { name: '', organizer: '', year: '', role: '', placement: '' }],
  }));

  const update = (i, field, val) => setData(prev => ({
    ...prev,
    past_competitions: prev.past_competitions.map((c, idx) => idx === i ? { ...c, [field]: val } : c),
  }));

  const remove = (i) => setData(prev => ({
    ...prev,
    past_competitions: prev.past_competitions.filter((_, idx) => idx !== i),
  }));

  return (
    <div className="space-y-3">
      {comps.map((comp, i) => (
        <div key={i} className="p-4 border border-gray-200 rounded-xl space-y-3 relative bg-gray-50">
          <button type="button" onClick={() => remove(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-lg">×</button>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input value={comp.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Competition name" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#7856FF] bg-white" />
            </div>
            <input value={comp.organizer} onChange={e => update(i, 'organizer', e.target.value)} placeholder="Organizer" className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#7856FF] bg-white" />
            <input type="number" value={comp.year} onChange={e => update(i, 'year', e.target.value)} placeholder="Year" className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#7856FF] bg-white" />
            <input value={comp.role} onChange={e => update(i, 'role', e.target.value)} placeholder="Your role" className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#7856FF] bg-white" />
            <input value={comp.placement} onChange={e => update(i, 'placement', e.target.value)} placeholder="Placement (e.g. Winner)" className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#7856FF] bg-white" />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[#7856FF] hover:text-[#7856FF] transition-colors">
        + Add Competition
      </button>
    </div>
  );
}

function StepSkills({ data, setData, tracks }) {
  // Show only relevant skill categories for selected tracks
  const relevantCats = new Set();
  tracks.forEach(t => {
    (TRACK_SKILL_CATEGORIES[t] || []).forEach(c => relevantCats.add(c));
  });
  // Always show at least all if somehow nothing mapped
  const categoriesToShow = relevantCats.size > 0
    ? Object.keys(SKILLS_BY_CATEGORY).filter(c => relevantCats.has(c))
    : Object.keys(SKILLS_BY_CATEGORY);

  const toggle = (skill) => {
    setData(prev => {
      const exists = (prev.claimed_skills || []).find(s => s.skill === skill);
      if (exists) return { ...prev, claimed_skills: prev.claimed_skills.filter(s => s.skill !== skill) };
      return { ...prev, claimed_skills: [...(prev.claimed_skills || []), { skill, proficiency_level: 'intermediate' }] };
    });
  };

  const setLevel = (skill, level) => {
    setData(prev => ({
      ...prev,
      claimed_skills: prev.claimed_skills.map(s => s.skill === skill ? { ...s, proficiency_level: level } : s),
    }));
  };

  const isSelected = (skill) => (data.claimed_skills || []).some(s => s.skill === skill);
  const getLevel   = (skill) => (data.claimed_skills || []).find(s => s.skill === skill)?.proficiency_level || 'intermediate';

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Select skills relevant to your selected tracks and set your honest proficiency level.</p>
      {categoriesToShow.map(cat => (
        <div key={cat}>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{cat}</h4>
          <div className="flex flex-wrap gap-2">
            {SKILLS_BY_CATEGORY[cat].map(skill => (
              <div key={skill} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => toggle(skill)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    isSelected(skill)
                      ? 'bg-[#7856FF] text-white border-[#7856FF]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#7856FF]'
                  }`}
                >
                  {skill}
                </button>
                {isSelected(skill) && (
                  <select
                    value={getLevel(skill)}
                    onChange={e => setLevel(skill, e.target.value)}
                    className="mt-1 text-xs border border-gray-200 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-[#7856FF]"
                  >
                    {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {(data.claimed_skills || []).length > 0 && (
        <p className="text-xs text-[#7856FF] font-medium">{data.claimed_skills.length} skill{data.claimed_skills.length !== 1 ? 's' : ''} selected</p>
      )}
    </div>
  );
}

function StepBusinessDeepDive({ data, setData }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">These questions help us accurately assess your business and analytical capabilities.</p>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Frameworks you're comfortable with</label>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_FRAMEWORKS.map(fw => (
            <button
              key={fw}
              type="button"
              onClick={() => {
                const current = data.business_frameworks || [];
                setData(prev => ({
                  ...prev,
                  business_frameworks: current.includes(fw)
                    ? current.filter(f => f !== fw)
                    : [...current, fw],
                }));
              }}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                (data.business_frameworks || []).includes(fw)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {fw}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">How would you approach a market sizing problem?</label>
        <p className="text-xs text-gray-400">Walk us through your thought process briefly.</p>
        <textarea
          value={data.market_sizing_approach || ''}
          onChange={e => setData(prev => ({ ...prev, market_sizing_approach: e.target.value }))}
          rows={3}
          placeholder="e.g. I'd start by defining the scope, then segment the market using a top-down or bottom-up approach..."
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF] resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Describe a time you made a data-driven decision</label>
        <textarea
          value={data.data_driven_decision || ''}
          onChange={e => setData(prev => ({ ...prev, data_driven_decision: e.target.value }))}
          rows={3}
          placeholder="What was the situation, what data did you use, and what was the outcome?"
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF] resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Any internships, consulting projects, or live business experience?</label>
        <textarea
          value={data.business_internships || ''}
          onChange={e => setData(prev => ({ ...prev, business_internships: e.target.value }))}
          rows={2}
          placeholder="e.g. 3-month finance internship at XYZ Corp, led market research for a startup..."
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF] resize-none"
        />
      </div>
    </div>
  );
}

function StepWritten({ track, data, setData }) {
  const configs = {
    hackathon: {
      label:       'Technical',
      color:       'text-violet-600',
      bg:          'bg-violet-50 border-violet-200',
      question:    'Describe your most technically challenging project.',
      subtext:     'What stack did you use, what problem did it solve, and what was the hardest part?',
      field:       'written_tech',
      placeholder: 'e.g. Built a real-time collaborative code editor using WebSockets and React. The hardest part was handling conflict resolution when multiple users edited the same line...',
    },
    data: {
      label:       'Data Science',
      color:       'text-emerald-600',
      bg:          'bg-emerald-50 border-emerald-200',
      question:    'Describe a data project you have worked on.',
      subtext:     'What was the problem, what techniques/models did you use, and what was the outcome?',
      field:       'written_data',
      placeholder: 'e.g. Built a churn prediction model for a telecom dataset. Used XGBoost with SMOTE for class imbalance, achieved 91% AUC...',
    },
    design: {
      label:       'Design',
      color:       'text-pink-600',
      bg:          'bg-pink-50 border-pink-200',
      question:    'Describe your design process for a recent project.',
      subtext:     'What problem were you solving, how did you approach research and iteration, and what was the final outcome?',
      field:       'written_design',
      placeholder: 'e.g. Redesigned the onboarding flow for a fintech app. Started with user interviews, created 3 prototypes in Figma, ran usability tests, reduced drop-off by 40%...',
    },
    case_comp: {
      label:       'Business',
      color:       'text-blue-600',
      bg:          'bg-blue-50 border-blue-200',
      question:    'Describe a real-world business problem you analyzed or a case you cracked.',
      subtext:     'What was your recommendation and how did you arrive at it? What frameworks did you apply?',
      field:       'written_business',
      placeholder: 'e.g. Analyzed market entry strategy for a D2C brand entering Tier 2 cities. Used TAM/SAM/SOM sizing, Porter\'s Five Forces for competitive analysis, recommended...',
    },
  };

  const config = configs[track];
  if (!config) return null;

  return (
    <div className="space-y-5">
      <div className={`px-4 py-3 rounded-xl border ${config.bg}`}>
        <p className={`text-sm font-bold ${config.color}`}>{config.label} Question</p>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-800">{config.question}</label>
        <p className="text-xs text-gray-400">{config.subtext}</p>
        <textarea
          value={data[config.field] || ''}
          onChange={e => setData(prev => ({ ...prev, [config.field]: e.target.value }))}
          rows={6}
          placeholder={config.placeholder}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF] resize-none leading-relaxed"
        />
        <p className="text-xs text-gray-400 text-right">{(data[config.field] || '').length} chars (aim for 100+)</p>
      </div>
    </div>
  );
}

function StepPreferences({ data, setData, tracks }) {
  const COMP_TYPES = tracks; // only show types they've selected
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Final details to set up your matchmaking preferences.</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Hours available per week</label>
          <input
            type="number" min={1} max={80}
            value={data.hours_per_week || ''}
            onChange={e => setData(prev => ({ ...prev, hours_per_week: parseInt(e.target.value) || null }))}
            placeholder="e.g. 15"
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Preferred team role</label>
          <select
            value={data.preferred_role || ''}
            onChange={e => setData(prev => ({ ...prev, preferred_role: e.target.value }))}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF] bg-white"
          >
            <option value="">Select...</option>
            <option value="leader">Team Leader</option>
            <option value="member">Team Member</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Location preference</label>
        <div className="flex gap-3">
          {[
            { value: 'online',    label: 'Online Only' },
            { value: 'in_person', label: 'In-Person' },
            { value: 'both',      label: 'Both' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setData(prev => ({ ...prev, location_preference: opt.value }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                data.location_preference === opt.value
                  ? 'bg-[#7856FF] text-white border-[#7856FF]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#7856FF]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Preferred competition types</label>
        <div className="flex flex-wrap gap-2">
          {TRACKS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                const current = data.preferred_comp_types || [];
                setData(prev => ({
                  ...prev,
                  preferred_comp_types: current.includes(t.id)
                    ? current.filter(c => c !== t.id)
                    : [...current, t.id],
                }));
              }}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                (data.preferred_comp_types || []).includes(t.id)
                  ? 'bg-[#7856FF] text-white border-[#7856FF]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#7856FF]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function AssessmentResult({ result, onDone }) {
  const TIER_COLORS = {
    Elite: 'text-amber-500', Expert: 'text-indigo-600',
    Hacker: 'text-orange-500', Builder: 'text-green-600', Explorer: 'text-gray-500',
  };

  return (
    <div className="text-center space-y-6 py-2">
      <div className="w-20 h-20 bg-[#E8DDFF] rounded-full flex items-center justify-center mx-auto">
        <Sparkles className="w-10 h-10 text-[#7856FF]" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-gray-900">Assessment Complete!</h3>
        <p className="text-gray-500 text-sm mt-1">Here's your initial skill rating.</p>
      </div>

      <div className="bg-[#F4F0FF] border border-[#7856FF]/20 rounded-2xl p-6">
        <div className={`text-5xl font-black ${TIER_COLORS[result.tier] || 'text-gray-700'}`}>
          {result.elo_score.toLocaleString()}
        </div>
        <div className={`text-xl font-bold mt-1 ${TIER_COLORS[result.tier] || 'text-gray-700'}`}>
          {result.tier}
        </div>
        <div className="text-xs text-gray-400 mt-1 capitalize">Confidence: {result.confidence}</div>
      </div>

      {/* Track scores */}
      {result.track_scores && Object.keys(result.track_scores).length > 0 && (
        <div className="text-left space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Track Scores</p>
          {Object.entries(result.track_scores).map(([track, score]) => (
            <div key={track} className="flex items-center space-x-3">
              <span className="text-xs text-gray-500 w-28 shrink-0 capitalize">{track.replace('_', ' ')}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-[#7856FF] h-2 rounded-full" style={{ width: `${score}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-600 w-8 text-right">{score}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skill domain scores */}
      {result.skill_scores && (
        <div className="text-left space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Domain Scores</p>
          {Object.entries(result.skill_scores)
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([domain, score]) => (
              <div key={domain} className="flex items-center space-x-3">
                <span className="text-xs text-gray-500 w-28 shrink-0">{domain.replace('_', '/')}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-400 h-2 rounded-full" style={{ width: `${score}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-8 text-right">{score}</span>
              </div>
            ))}
        </div>
      )}

      {/* External data fetched */}
      {result.external_data_fetched && (
        <div className="text-left bg-gray-50 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data Sources Used</p>
          {Object.entries(result.external_data_fetched).map(([source, fetched]) => (
            <div key={source} className="flex items-center space-x-2 text-xs">
              <span className={fetched ? 'text-green-500' : 'text-gray-300'}>{fetched ? '✓' : '○'}</span>
              <span className={fetched ? 'text-gray-700 font-medium' : 'text-gray-400 capitalize'}>
                {source.charAt(0).toUpperCase() + source.slice(1)} {fetched ? '(verified)' : '(not provided)'}
              </span>
            </div>
          ))}
        </div>
      )}

      {result.flags?.length > 0 && (
        <div className="text-left bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-700 mb-2">⚠ Notes from AI Assessor</p>
          {result.flags.map((flag, i) => (
            <p key={i} className="text-xs text-amber-700">• {flag}</p>
          ))}
        </div>
      )}

      {result.reasoning && (
        <div className="text-left bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-1">AI Reasoning</p>
          <p className="text-sm text-gray-600 italic">"{result.reasoning}"</p>
        </div>
      )}

      <button
        onClick={onDone}
        className="w-full py-3.5 bg-[#7856FF] text-white rounded-xl font-bold hover:bg-[#6846EB] transition-colors"
      >
        View My Profile →
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Assessment() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Phase: 'tracks' | 'depth' | 'form' | 'result'
  const [phase, setPhase]           = useState('tracks');
  const [selectedTracks, setTracks] = useState([]);
  const [depth, setDepth]           = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData]     = useState({
    claimed_skills: [], past_competitions: [], preferred_comp_types: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [result, setResult]         = useState(null);

  useEffect(() => {
    if (user?.is_assessment_done) navigate('/profile', { replace: true });
  }, [user]);

  // Compute dynamic steps whenever tracks/depth change
  const steps = useMemo(() => {
    if (!selectedTracks.length || !depth) return [];
    return computeSteps(selectedTracks, depth);
  }, [selectedTracks, depth]);

  const toggleTrack = (id) => {
    setTracks(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!formData.claimed_skills?.length) {
      setError('Please select at least one skill.');
      const skillStepIdx = steps.findIndex(s => s.id === 'skills');
      if (skillStepIdx !== -1) setCurrentStep(skillStepIdx);
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const data = await api.post('/assessment/submit', {
        tracks: selectedTracks,
        depth,
        formData,
      });
      await refreshUser();
      setResult(data.result);
      setPhase('result');
    } catch (err) {
      setError(err.message || 'Assessment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = (stepId) => {
    switch (stepId) {
      case 'competitive_profiles':
        return <StepCompetitiveProfiles data={formData} setData={setFormData} tracks={selectedTracks} />;
      case 'data_profiles':
        return <StepDataProfiles data={formData} setData={setFormData} />;
      case 'design_profiles':
        return <StepDesignProfiles data={formData} setData={setFormData} />;
      case 'business_background':
        return <StepBusinessBackground data={formData} setData={setFormData} />;
      case 'skills':
        return <StepSkills data={formData} setData={setFormData} tracks={selectedTracks} />;
      case 'business_deepdive':
        return <StepBusinessDeepDive data={formData} setData={setFormData} />;
      case 'written_tech':
        return <StepWritten track="hackathon" data={formData} setData={setFormData} />;
      case 'written_data':
        return <StepWritten track="data" data={formData} setData={setFormData} />;
      case 'written_design':
        return <StepWritten track="design" data={formData} setData={setFormData} />;
      case 'written_biz':
        return <StepWritten track="case_comp" data={formData} setData={setFormData} />;
      case 'preferences':
        return <StepPreferences data={formData} setData={setFormData} tracks={selectedTracks} />;
      default:
        return null;
    }
  };

  // ── Phase: Result ──────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-h-[90vh] overflow-y-auto">
          <AssessmentResult result={result} onDone={() => navigate('/profile')} />
        </div>
      </div>
    );
  }

  // ── Phase: Track Selection ─────────────────────────────────────────────────
  if (phase === 'tracks') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Skill Assessment</h2>
            <p className="text-gray-500 text-sm">Complete this once to unlock matchmaking and get your initial rating.</p>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              What competitions are you interested in? <span className="text-[#7856FF]">(select all that apply)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRACKS.map(track => {
                const Icon = track.icon;
                const isActive = selectedTracks.includes(track.id);
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => toggleTrack(track.id)}
                    className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isActive ? track.activeColor : `${track.color} hover:opacity-80`
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : track.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{track.label}</p>
                      <p className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>{track.sublabel}</p>
                    </div>
                    {isActive && <CheckCircle2 className="w-5 h-5 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTracks.length > 0 && (
            <div className="text-xs text-gray-400 mb-6">
              {selectedTracks.length} track{selectedTracks.length > 1 ? 's' : ''} selected —
              form will have <span className="font-semibold text-gray-600">{computeSteps(selectedTracks, 'full').length} steps (full)</span> or <span className="font-semibold text-gray-600">{computeSteps(selectedTracks, 'quick').length} steps (quick)</span>
            </div>
          )}

          <button
            onClick={() => setPhase('depth')}
            disabled={!selectedTracks.length}
            className="w-full py-3.5 bg-[#7856FF] text-white rounded-xl font-bold disabled:opacity-40 hover:bg-[#6846EB] transition-colors flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Depth Selection ─────────────────────────────────────────────────
  if (phase === 'depth') {
    const quickSteps = computeSteps(selectedTracks, 'quick').length;
    const fullSteps  = computeSteps(selectedTracks, 'full').length;

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <button onClick={() => setPhase('tracks')} className="flex items-center space-x-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
            <ChevronLeft className="w-4 h-4" /><span>Back</span>
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-1">How thorough do you want to be?</h2>
            <p className="text-gray-500 text-sm">You can only do this assessment once. A fuller assessment gives you a more accurate and higher-confidence rating.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Quick */}
            <button
              type="button"
              onClick={() => setDepth('quick')}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                depth === 'quick'
                  ? 'border-[#7856FF] bg-[#F4F0FF]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-3">⚡</div>
              <p className="font-bold text-gray-900 text-lg">Quick</p>
              <p className="text-[#7856FF] font-semibold text-sm mt-0.5">~5 minutes</p>
              <p className="text-xs text-gray-500 mt-1">{quickSteps} steps</p>
              <ul className="mt-4 space-y-1.5 text-xs text-gray-500">
                <li>✓ Basic skill rating</li>
                <li>✓ Core profiles only</li>
                <li>✓ One combined question</li>
                <li className="text-gray-300">✗ Lower confidence score</li>
                <li className="text-gray-300">✗ Less accurate matching</li>
              </ul>
            </button>

            {/* Full */}
            <button
              type="button"
              onClick={() => setDepth('full')}
              className={`p-6 rounded-2xl border-2 text-left transition-all relative ${
                depth === 'full'
                  ? 'border-[#7856FF] bg-[#F4F0FF]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="absolute top-3 right-3 bg-[#7856FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                RECOMMENDED
              </div>
              <div className="text-2xl mb-3">🎯</div>
              <p className="font-bold text-gray-900 text-lg">Full</p>
              <p className="text-[#7856FF] font-semibold text-sm mt-0.5">~10 minutes</p>
              <p className="text-xs text-gray-500 mt-1">{fullSteps} steps</p>
              <ul className="mt-4 space-y-1.5 text-xs text-gray-500">
                <li>✓ Detailed skill profile</li>
                <li>✓ All external profiles</li>
                <li>✓ Per-track questions</li>
                <li>✓ Higher confidence score</li>
                <li>✓ Better team matches</li>
              </ul>
            </button>
          </div>

          <button
            onClick={() => { setCurrentStep(0); setPhase('form'); }}
            disabled={!depth}
            className="w-full py-3.5 bg-[#7856FF] text-white rounded-xl font-bold disabled:opacity-40 hover:bg-[#6846EB] transition-colors flex items-center justify-center space-x-2"
          >
            <span>Start Assessment</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Form ────────────────────────────────────────────────────────────
  const currentStepConfig = steps[currentStep];
  const isLastStep        = currentStep === steps.length - 1;
  const progressPct       = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
              {selectedTracks.map(t => {
                const track = TRACKS.find(tr => tr.id === t);
                return <span key={t} className="capitalize font-medium">{track?.label}</span>;
              })}
              <span>·</span>
              <span className="capitalize">{depth}</span>
            </div>
            <h2 className="text-xl font-black text-gray-900">{currentStepConfig?.label}</h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">{currentStep + 1} / {steps.length}</div>
            <div className="text-xs font-semibold text-[#7856FF]">{progressPct}%</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
          <div
            className="bg-[#7856FF] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step icons row */}
        <div className="flex items-center space-x-1 mb-8 overflow-x-auto pb-1">
          {steps.map((step, idx) => {
            const Icon    = step.icon;
            const isActive = idx === currentStep;
            const isDone   = idx < currentStep;
            return (
              <div key={step.id} className="flex items-center shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isDone   ? 'bg-[#7856FF] text-white' :
                    isActive ? 'bg-[#E8DDFF] text-[#7856FF] ring-2 ring-[#7856FF]' :
                               'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-5 h-0.5 mx-0.5 ${idx < currentStep ? 'bg-[#7856FF]' : 'bg-gray-100'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[280px] mb-6">
          {renderStepContent(currentStepConfig?.id)}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              if (currentStep === 0) { setPhase('depth'); }
              else setCurrentStep(s => s - 1);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /><span>Back</span>
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2.5 bg-[#7856FF] text-white rounded-xl text-sm font-bold hover:bg-[#6846EB] disabled:opacity-60 transition-colors"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Analyzing your profile...</span></>
                : <><Sparkles className="w-4 h-4" /><span>Get My Rating</span></>
              }
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep(s => s + 1)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#7856FF] text-white rounded-xl text-sm font-semibold hover:bg-[#6846EB] transition-colors"
            >
              <span>Next</span><ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
