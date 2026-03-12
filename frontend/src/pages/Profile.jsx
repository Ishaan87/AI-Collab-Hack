import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { MapPin, LinkIcon, Edit3, Grid, Trophy, CheckCircle2, Loader2, ExternalLink, Mail, Phone, Github, Linkedin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import AssessmentBanner from '../components/AssessmentBanner';

// Build radar chart data from skill categories
const buildRadarData = (skills) => {
  const cats = ['Frontend', 'Backend', 'AI/ML', 'Design', 'DevOps', 'Data'];
  const profMap = { beginner: 25, intermediate: 50, advanced: 75, expert: 100 };
  return cats.map(cat => {
    const catSkills = skills.filter(s => s.category === cat);
    const avg = catSkills.length
      ? catSkills.reduce((sum, s) => sum + (profMap[s.proficiency_level] || 50), 0) / catSkills.length
      : 0;
    return { domain: cat, weight: Math.round(avg) };
  }).filter(d => d.weight > 0);
};

const TIER_COLORS = {
  Elite: 'text-amber-500 bg-amber-50 border-amber-200',
  Expert: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  Hacker: 'text-orange-500 bg-orange-50 border-orange-200',
  Builder: 'text-green-600 bg-green-50 border-green-200',
  Explorer: 'text-gray-500 bg-gray-50 border-gray-200',
};

export default function Profile() {
  const { username } = useParams();       // /profile/:username — undefined = own profile
  const { user: me } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = !username || (me && me.username === username);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let data;
        if (isOwnProfile) {
          data = await api.get('/profile/me');
        } else {
          data = await api.get(`/profile/${username}`);
        }
        setProfile(data.profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, isOwnProfile]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  if (!profile) return null;

  const radarData = buildRadarData(profile.skills || []);
  const topSkills = (profile.skills || []).filter(s => s.proficiency_level === 'expert' || s.proficiency_level === 'advanced').slice(0, 6);
  const tierClass = TIER_COLORS[profile.tier] || TIER_COLORS.Explorer;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Profile Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end">
            <div className="-mt-12 relative flex items-center">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-indigo-100 flex items-center justify-center">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-indigo-600">
                    {(profile.full_name || profile.username || '?').charAt(0).toUpperCase()}
                  </span>
                }
              </div>
              <div className="ml-4 mt-12">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {profile.full_name || profile.username}
                </h1>
                {profile.full_name && profile.username && (
                  <p className="text-sm font-medium text-indigo-500 mb-1">@{profile.username}</p>
                )}
                {profile.headline && (
                  <p className="text-sm font-medium text-gray-500 mt-1">{profile.headline}</p>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/update-profile')}
                className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded shadow-sm text-sm font-semibold flex items-center transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center mt-6 gap-4 text-sm text-gray-600">
            {profile.city && (
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {profile.city}
              </span>
            )}
            {isOwnProfile && profile.email && (
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1 text-gray-400" /> {profile.email}
              </span>
            )}
            {isOwnProfile && profile.mobile_number && (
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1 text-gray-400" /> {profile.mobile_number}
              </span>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-indigo-600 transition-colors">
                <LinkIcon className="w-4 h-4 mr-1 text-gray-400" />
                {profile.website_url.replace(/^https?:\/\//, '')}
                <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-indigo-600 transition-colors">
                <Linkedin className="w-4 h-4 mr-1 text-gray-400" />
                LinkedIn
                <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
              </a>
            )}
            {profile.github_username && (
              <a href={`https://github.com/${profile.github_username.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-indigo-600 transition-colors">
                <Github className="w-4 h-4 mr-1 text-gray-400" />
                {profile.github_username.replace('@', '')}
                <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
              </a>
            )}
            {profile.elo_score > 0 && (
              <span className={`flex items-center font-semibold px-2.5 py-1 rounded border text-sm ${tierClass}`}>
                <Trophy className="w-4 h-4 mr-1" />
                Elo: {profile.elo_score?.toLocaleString()} ({profile.tier || 'Explorer'})
              </span>
            )}
          </div>

          {profile.bio && (
            <div className="mt-6 text-gray-700 text-sm leading-relaxed max-w-3xl">
              {profile.bio}
            </div>
          )}

          {/* Stats Row */}
          {(profile.total_competitions > 0 || profile.wins > 0) && (
            <div className="flex gap-6 mt-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{profile.total_competitions || 0}</div>
                <div className="text-xs text-gray-500">Competitions</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{profile.wins || 0}</div>
                <div className="text-xs text-gray-500">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{profile.podium_finishes || 0}</div>
                <div className="text-xs text-gray-500">Podiums</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!profile.is_assessment_done && isOwnProfile && <AssessmentBanner />}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Domain Expertise Radar */}
        <div className="md:col-span-1 border border-gray-200 bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Grid className="w-5 h-5 mr-2 text-indigo-500" />
            Domain Expertise
          </h3>

          {radarData.length > 0 ? (
            <>
              <div className="flex-1 min-h-[250px] flex items-center justify-center -ml-4">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="domain" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} />
                    <Radar name="Weight" dataKey="weight" stroke="#4f46e5" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {topSkills.map(s => (
                  <span key={s.skill_id} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold flex items-center space-x-1">
                    <span>{s.name}</span>
                    {s.is_verified && <CheckCircle2 className="w-3 h-3 text-indigo-500" />}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center py-8">
              No skills added yet.
              {isOwnProfile && (
                <button onClick={() => navigate('/update-profile')} className="mt-2 text-indigo-500 text-xs block underline">
                  Add skills
                </button>
              )}
            </div>
          )}
        </div>

        {/* Past Podiums & Checkpoints */}
        <div className="md:col-span-2 border border-gray-200 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-indigo-500" />
            Past Podiums & Checkpoints
          </h3>

          {(profile.past_competitions || []).length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No competition history yet.
            </div>
          ) : (
            <div className="space-y-6">
              {profile.past_competitions.map((item) => {
                const isPodium = ['winner', 'finalist', '1st', '2nd', '3rd'].some(
                  k => item.placement?.toLowerCase().includes(k)
                );
                return (
                  <div key={item.id} className="relative pl-6 border-l-2 border-gray-100 pb-2 last:pb-0">
                    <div className={`absolute -left-[9px] top-0 p-1 rounded-full bg-white border-2 ${isPodium ? 'border-indigo-500 text-indigo-500' : 'border-gray-300 text-gray-400'}`}>
                      {isPodium
                        ? <Trophy className="w-3 h-3" />
                        : <CheckCircle2 className="w-3 h-3" />
                      }
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {item.placement ? `${item.placement} – ` : ''}{item.name}
                      </h4>
                      <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">
                        {item.organizer && `${item.organizer} • `}{item.year}
                      </div>
                      {item.role && <div className="text-xs text-gray-400 mt-0.5">{item.role}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      {(profile.projects || []).length > 0 && (
        <div className="border border-gray-200 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Featured Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.projects.map(p => (
              <div key={p.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-sm">{p.title}</h4>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
                    </a>
                  )}
                </div>
                {p.outcome && <div className="text-xs text-indigo-600 font-medium mt-1">{p.outcome}</div>}
                {p.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
