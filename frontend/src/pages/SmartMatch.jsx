import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Sparkles, Loader2, AlertCircle, Star,
  Github, ExternalLink, Filter, RefreshCw, UserPlus
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import AssessmentBanner from '../components/AssessmentBanner';

const TIER_COLORS = {
  Elite:    'bg-amber-50   text-amber-700   border-amber-200',
  Expert:   'bg-indigo-50  text-indigo-700  border-indigo-200',
  Hacker:   'bg-orange-50  text-orange-700  border-orange-200',
  Builder:  'bg-green-50   text-green-600   border-green-200',
  Explorer: 'bg-gray-50    text-gray-500    border-gray-200',
};

const SKILLS_FILTER = [
  'All', 'Frontend', 'Backend', 'ML/AI', 'Design', 'Mobile', 'DevOps', 'Blockchain', 'Data Science',
];

function UserCard({ user, onInvite }) {
  const skills = user.skills?.slice(0, 4) || [];
  const tier   = user.tier || 'Explorer';

  return (
    <div className="group bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#DDD6FE] transition-all duration-300 flex flex-col gap-4">

      {/* Avatar + info */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#E8DDFF] to-[#DDD6FE] shrink-0 flex items-center justify-center">
          {user.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            : <span className="text-[#7856FF] font-[700] text-[16px]">
                {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
              </span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-[600] text-[#201F24] truncate">
              {user.full_name || user.username}
            </span>
            <span className={`text-[11px] font-[600] px-2 py-0.5 rounded-full border ${TIER_COLORS[tier] || TIER_COLORS.Explorer}`}>
              {tier}
            </span>
          </div>
          {user.username && user.full_name && (
            <p className="text-[12px] text-[#9CA3AF]">@{user.username}</p>
          )}
          {user.headline && (
            <p className="text-[13px] text-[#5C5C5C] mt-0.5 line-clamp-1">{user.headline}</p>
          )}
        </div>
      </div>

      {/* ELO */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F0FF] rounded-lg">
          <Star className="w-3.5 h-3.5 text-[#7856FF] fill-[#7856FF]" />
          <span className="text-[13px] font-[700] text-[#7856FF]">{user.elo_score ?? '—'}</span>
          <span className="text-[11px] text-[#9CA3AF]">ELO</span>
        </div>
        {user.github_username && (
          <a
            href={`https://github.com/${user.github_username}`}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[12px] text-[#5C5C5C] hover:text-[#201F24] transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            {user.github_username}
          </a>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map(s => (
            <span key={s.name || s} className="px-2.5 py-1 bg-[#FAFAFA] border border-[#E5E7EB] text-[#5C5C5C] rounded-md text-[11px] font-[500]">
              {s.name || s}
            </span>
          ))}
          {user.skills?.length > 4 && (
            <span className="px-2 py-1 text-[#9CA3AF] text-[11px]">+{user.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Bio */}
      {user.bio && (
        <p className="text-[13px] text-[#5C5C5C] leading-relaxed line-clamp-2">{user.bio}</p>
      )}

      {/* Actions */}
      <div className="mt-auto flex gap-2 pt-3 border-t border-[#F3F4F6]">
        <button
          onClick={() => onInvite(user)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#7856FF] text-white rounded-xl text-[13px] font-[600] hover:bg-[#6846EB] transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" /> Connect
        </button>
        <button
          onClick={() => window.open(`/profile/${user.username}`, '_blank')}
          className="px-3 py-2 border border-[#E5E7EB] text-[#5C5C5C] rounded-xl hover:bg-[#F4F0FF] hover:text-[#7856FF] hover:border-[#DDD6FE] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function SmartMatch() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [isAssessed, setIsAssessed] = useState(true);
  const [activeSkill, setActiveSkill] = useState('All');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page, limit: 12 });
      if (activeSkill !== 'All') params.append('skill', activeSkill);
      const data = await api.get(`/users/smart-match?${params}`);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
      setIsAssessed(data.is_assessed !== false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, [page, activeSkill]);

  const handleInvite = (matchedUser) => {
    // Navigate to their profile or open an invite modal
    navigate(`/profile/${matchedUser.username}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-[600] tracking-tight text-[#201F24] mb-1">Smart Match</h1>
          <p className="text-[#5C5C5C] text-[16px]">Discover verified teammates matched to your skills and rating.</p>
        </div>
        <button
          onClick={fetchMatches}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-full font-[500] text-[14px] hover:bg-[#FAFAFA] transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Assessment banner */}
      {!isAssessed && <AssessmentBanner />}

      {/* Skill filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SKILLS_FILTER.map(skill => (
          <button
            key={skill}
            onClick={() => { setActiveSkill(skill); setPage(1); }}
            className={`px-4 py-2 rounded-full text-[13px] font-[500] whitespace-nowrap transition-all ${
              activeSkill === skill
                ? 'bg-[#7856FF] text-white shadow-sm shadow-[#7856FF]/20'
                : 'bg-white border border-[#E5E7EB] text-[#5C5C5C] hover:border-[#DDD6FE] hover:text-[#7856FF]'
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[14px]">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-[#7856FF]" />
        </div>
      )}

      {/* Empty */}
      {!loading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-5 bg-white border border-[#E5E7EB] rounded-2xl">
          <div className="w-16 h-16 bg-[#F4F0FF] rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-[#7856FF]" />
          </div>
          <div className="text-center">
            <h3 className="text-[18px] font-[600] text-[#201F24]">No matches yet</h3>
            <p className="text-[#5C5C5C] text-[14px] mt-1">
              {!isAssessed
                ? 'Complete your skill assessment to unlock Smart Match.'
                : 'Try a different skill filter or check back as more users join.'}
            </p>
          </div>
          {!isAssessed && (
            <button
              onClick={() => navigate('/assessment')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#7856FF] text-white rounded-xl font-[500] text-[14px] hover:bg-[#6846EB] transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Start Assessment
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && users.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {users.map(u => (
              <UserCard key={u.id} user={u} onInvite={handleInvite} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-[13px] font-[500] text-[#374151] hover:bg-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-[13px] text-[#5C5C5C]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-[13px] font-[500] text-[#374151] hover:bg-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
