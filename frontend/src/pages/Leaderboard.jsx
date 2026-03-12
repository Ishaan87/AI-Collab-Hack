import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Medal, Loader2, AlertCircle, Github, Crown } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const TIER_COLORS = {
  Elite:    'bg-amber-50   text-amber-700   border-amber-200',
  Expert:   'bg-indigo-50  text-indigo-700  border-indigo-200',
  Hacker:   'bg-orange-50  text-orange-700  border-orange-200',
  Builder:  'bg-green-50   text-green-600   border-green-200',
  Explorer: 'bg-gray-50    text-gray-500    border-gray-200',
};

const RANK_ICONS = {
  1: <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />,
  2: <Medal className="w-5 h-5 text-slate-400" />,
  3: <Medal className="w-5 h-5 text-orange-400" />,
};

const DOMAINS = ['Overall', 'Frontend', 'Backend', 'ML/AI', 'Design', 'Blockchain', 'Mobile'];

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [domain, setDomain]   = useState('Overall');
  const [myRank, setMyRank]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ domain: domain === 'Overall' ? '' : domain, limit: 50 });
    api.get(`/leaderboard?${params}`)
      .then(data => {
        setEntries(data.leaderboard || data.users || []);
        setMyRank(data.my_rank || null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [domain]);

  return (
    <div className="p-6 md:p-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-[32px] font-[600] tracking-tight text-[#201F24] mb-1">Leaderboard</h1>
        <p className="text-[#5C5C5C] text-[16px]">Top-rated participants ranked by ELO score and verified skills.</p>
      </div>

      {/* My rank banner */}
      {myRank && (
        <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-[#7856FF] to-[#9B7AFF] rounded-2xl text-white shadow-md shadow-[#7856FF]/20">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-[500] text-white/80">Your ranking</p>
            <p className="text-[20px] font-[700]">#{myRank.rank} <span className="text-[15px] font-[400] text-white/80">with {myRank.elo_score} ELO</span></p>
          </div>
        </div>
      )}

      {/* Domain filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {DOMAINS.map(d => (
          <button
            key={d}
            onClick={() => setDomain(d)}
            className={`px-4 py-2 rounded-full text-[13px] font-[500] whitespace-nowrap transition-all ${
              domain === d
                ? 'bg-[#7856FF] text-white shadow-sm shadow-[#7856FF]/20'
                : 'bg-white border border-[#E5E7EB] text-[#5C5C5C] hover:border-[#DDD6FE] hover:text-[#7856FF]'
            }`}
          >
            {d}
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

      {/* Top 3 podium */}
      {!loading && entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2 pt-6">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-[#E8DDFF] flex items-center justify-center border-2 border-slate-300">
              {entries[1]?.avatar_url
                ? <img src={entries[1].avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-[18px] font-[700] text-[#7856FF]">{(entries[1]?.full_name || entries[1]?.username || '?').charAt(0)}</span>
              }
            </div>
            <div className="text-center">
              <p className="text-[13px] font-[600] text-[#201F24] truncate max-w-[80px]">{entries[1]?.full_name || entries[1]?.username}</p>
              <p className="text-[12px] text-[#9CA3AF]">{entries[1]?.elo_score} ELO</p>
            </div>
            <div className="w-full h-16 bg-slate-100 border-t-2 border-slate-300 rounded-t-lg flex items-center justify-center">
              <span className="text-[22px] font-[800] text-slate-400">2</span>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400 fill-amber-300" />
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#E8DDFF] flex items-center justify-center border-2 border-amber-400 shadow-md shadow-amber-200">
              {entries[0]?.avatar_url
                ? <img src={entries[0].avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-[20px] font-[700] text-[#7856FF]">{(entries[0]?.full_name || entries[0]?.username || '?').charAt(0)}</span>
              }
            </div>
            <div className="text-center">
              <p className="text-[13px] font-[600] text-[#201F24] truncate max-w-[80px]">{entries[0]?.full_name || entries[0]?.username}</p>
              <p className="text-[12px] text-[#9CA3AF]">{entries[0]?.elo_score} ELO</p>
            </div>
            <div className="w-full h-24 bg-amber-50 border-t-2 border-amber-400 rounded-t-lg flex items-center justify-center">
              <span className="text-[24px] font-[800] text-amber-400">1</span>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2 pt-8">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E8DDFF] flex items-center justify-center border-2 border-orange-300">
              {entries[2]?.avatar_url
                ? <img src={entries[2].avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-[16px] font-[700] text-[#7856FF]">{(entries[2]?.full_name || entries[2]?.username || '?').charAt(0)}</span>
              }
            </div>
            <div className="text-center">
              <p className="text-[13px] font-[600] text-[#201F24] truncate max-w-[80px]">{entries[2]?.full_name || entries[2]?.username}</p>
              <p className="text-[12px] text-[#9CA3AF]">{entries[2]?.elo_score} ELO</p>
            </div>
            <div className="w-full h-12 bg-orange-50 border-t-2 border-orange-300 rounded-t-lg flex items-center justify-center">
              <span className="text-[20px] font-[800] text-orange-400">3</span>
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      {!loading && entries.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#F3F4F6] grid grid-cols-12 gap-3 text-[11px] font-[700] uppercase tracking-widest text-[#9CA3AF]">
            <span className="col-span-1">#</span>
            <span className="col-span-5">Participant</span>
            <span className="col-span-2 text-right">ELO</span>
            <span className="col-span-2 text-center">Tier</span>
            <span className="col-span-2 text-center hidden md:block">Skills</span>
          </div>

          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = user && entry.id === user.id;
            const tier = entry.tier || 'Explorer';
            return (
              <div
                key={entry.id}
                onClick={() => navigate(`/profile/${entry.username}`)}
                className={`px-5 py-4 grid grid-cols-12 gap-3 items-center cursor-pointer transition-colors border-b border-[#F9FAFB] last:border-0 ${
                  isMe ? 'bg-[#F4F0FF]' : 'hover:bg-[#FAFAFA]'
                }`}
              >
                <span className="col-span-1 flex items-center">
                  {RANK_ICONS[rank] || <span className="text-[14px] font-[600] text-[#9CA3AF]">{rank}</span>}
                </span>

                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#E8DDFF] to-[#DDD6FE] flex items-center justify-center shrink-0">
                    {entry.avatar_url
                      ? <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[13px] font-[700] text-[#7856FF]">{(entry.full_name || entry.username || '?').charAt(0)}</span>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[14px] font-[600] truncate ${isMe ? 'text-[#7856FF]' : 'text-[#201F24]'}`}>
                      {entry.full_name || entry.username} {isMe && <span className="text-[11px] font-[500] text-[#9CA3AF]">(you)</span>}
                    </p>
                    {entry.github_username && (
                      <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                        <Github className="w-3 h-3" />@{entry.github_username}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <span className="text-[15px] font-[700] text-[#201F24]">{entry.elo_score ?? '—'}</span>
                </div>

                <div className="col-span-2 flex justify-center">
                  <span className={`text-[11px] font-[600] px-2 py-0.5 rounded-full border ${TIER_COLORS[tier] || TIER_COLORS.Explorer}`}>
                    {tier}
                  </span>
                </div>

                <div className="col-span-2 hidden md:flex flex-wrap gap-1 justify-center">
                  {(entry.skills || []).slice(0, 2).map(s => (
                    <span key={s.name || s} className="text-[10px] px-1.5 py-0.5 bg-[#F3F4F6] text-[#5C5C5C] rounded">{s.name || s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white border border-[#E5E7EB] rounded-2xl">
          <div className="w-16 h-16 bg-[#F4F0FF] rounded-2xl flex items-center justify-center">
            <Trophy className="w-8 h-8 text-[#7856FF]" />
          </div>
          <div className="text-center">
            <h3 className="text-[18px] font-[600] text-[#201F24]">No rankings yet</h3>
            <p className="text-[#5C5C5C] text-[14px] mt-1">Complete the skill assessment to get your ELO score and appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
