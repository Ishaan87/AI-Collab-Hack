import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Loader2, AlertCircle, CheckCircle2, XCircle,
  Clock, Trophy, ChevronRight, Bell, Inbox
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function InviteCard({ invite, onAccept, onDecline, accepting, declining }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8DDFF] to-[#DDD6FE] flex items-center justify-center shrink-0">
            <span className="text-[#7856FF] font-[700] text-[14px]">
              {(invite.sender_name || invite.sender_username || '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-[14px] font-[600] text-[#201F24]">
              {invite.sender_name || invite.sender_username}
            </p>
            <p className="text-[12px] text-[#9CA3AF]">invited you to team up</p>
          </div>
        </div>
        <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap shrink-0">{formatDate(invite.created_at)}</span>
      </div>

      {invite.competition_title && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F4F0FF] border border-[#DDD6FE] rounded-xl">
          <Trophy className="w-3.5 h-3.5 text-[#7856FF] shrink-0" />
          <span className="text-[13px] font-[500] text-[#7856FF] line-clamp-1">{invite.competition_title}</span>
        </div>
      )}

      {invite.message && (
        <p className="text-[13px] text-[#5C5C5C] leading-relaxed italic bg-[#FAFAFA] border border-[#F3F4F6] rounded-xl px-4 py-3">
          "{invite.message}"
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onAccept(invite.id)}
          disabled={accepting === invite.id || declining === invite.id}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#7856FF] text-white rounded-xl text-[13px] font-[600] hover:bg-[#6846EB] disabled:opacity-60 transition-colors"
        >
          {accepting === invite.id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <CheckCircle2 className="w-3.5 h-3.5" />
          }
          Accept
        </button>
        <button
          onClick={() => onDecline(invite.id)}
          disabled={accepting === invite.id || declining === invite.id}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#E5E7EB] text-[#5C5C5C] rounded-xl text-[13px] font-[500] hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-60 transition-colors"
        >
          {declining === invite.id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <XCircle className="w-3.5 h-3.5" />
          }
          Decline
        </button>
      </div>
    </div>
  );
}

function TeamCard({ team }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#DDD6FE] transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7856FF] to-[#9B7AFF] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-[600] text-[#201F24] group-hover:text-[#7856FF] transition-colors">
              {team.name}
            </h3>
            <p className="text-[12px] text-[#9CA3AF]">{team.member_count || team.members?.length || 0} members</p>
          </div>
        </div>
        {team.competition_title && (
          <span className="text-[11px] font-[500] text-[#9CA3AF] max-w-[120px] text-right line-clamp-2">{team.competition_title}</span>
        )}
      </div>

      {/* Members avatars */}
      {team.members?.length > 0 && (
        <div className="flex items-center gap-1.5">
          {team.members.slice(0, 5).map((m, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full bg-[#E8DDFF] flex items-center justify-center text-[11px] font-[700] text-[#7856FF] border-2 border-white -ml-1 first:ml-0 overflow-hidden"
              title={m.full_name || m.username}
            >
              {m.avatar_url
                ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                : (m.full_name || m.username || '?').charAt(0)
              }
            </div>
          ))}
          {team.members.length > 5 && (
            <span className="text-[12px] text-[#9CA3AF] ml-1">+{team.members.length - 5}</span>
          )}
        </div>
      )}

      {team.competition_id && (
        <button
          onClick={() => navigate(`/competitions/${team.competition_id}`)}
          className="flex items-center gap-1.5 text-[12px] font-[500] text-[#7856FF] hover:underline"
        >
          View competition <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function MyTeams() {
  const navigate = useNavigate();
  const [teams, setTeams]     = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [accepting, setAccepting] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [tab, setTab]         = useState('teams'); // 'teams' | 'invites'

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [teamsData, invitesData] = await Promise.all([
        api.get('/teams/my'),
        api.get('/invites/my'),
      ]);
      setTeams(teamsData.teams || []);
      setInvites((invitesData.invites || []).filter(i => i.status === 'pending'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAccept = async (inviteId) => {
    try {
      setAccepting(inviteId);
      await api.post(`/invites/${inviteId}/accept`);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
      fetchAll(); // refresh teams
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(null);
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      setDeclining(inviteId);
      await api.post(`/invites/${inviteId}/decline`);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeclining(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-[600] tracking-tight text-[#201F24] mb-1">My Teams</h1>
          <p className="text-[#5C5C5C] text-[16px]">Your active teams and pending collaboration invites.</p>
        </div>
        <button
          onClick={() => navigate('/smart-match')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7856FF] text-white rounded-full font-[500] text-[14px] hover:bg-[#6846EB] transition-colors shadow-sm shadow-[#7856FF]/20"
        >
          <Users className="w-4 h-4" /> Find Teammates
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[14px]">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Tab toggle */}
      <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-xl w-fit">
        <button
          onClick={() => setTab('teams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-[500] transition-all ${
            tab === 'teams'
              ? 'bg-white text-[#201F24] shadow-sm'
              : 'text-[#5C5C5C] hover:text-[#201F24]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Teams
          {teams.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-[#F4F0FF] text-[#7856FF] text-[11px] font-[700] rounded-full">
              {teams.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('invites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-[500] transition-all ${
            tab === 'invites'
              ? 'bg-white text-[#201F24] shadow-sm'
              : 'text-[#5C5C5C] hover:text-[#201F24]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Invites
          {invites.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-[#7856FF] text-white text-[11px] font-[700] rounded-full">
              {invites.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-[#7856FF]" />
        </div>
      )}

      {/* Teams tab */}
      {!loading && tab === 'teams' && (
        <>
          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-5 bg-white border border-[#E5E7EB] rounded-2xl">
              <div className="w-16 h-16 bg-[#F4F0FF] rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-[#7856FF]" />
              </div>
              <div className="text-center">
                <h3 className="text-[18px] font-[600] text-[#201F24]">No teams yet</h3>
                <p className="text-[#5C5C5C] text-[14px] mt-1">Join a competition and connect with teammates to form your first team.</p>
              </div>
              <button
                onClick={() => navigate('/smart-match')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#7856FF] text-white rounded-xl font-[500] text-[14px] hover:bg-[#6846EB] transition-colors"
              >
                Find Teammates
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {teams.map(team => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Invites tab */}
      {!loading && tab === 'invites' && (
        <>
          {invites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-5 bg-white border border-[#E5E7EB] rounded-2xl">
              <div className="w-16 h-16 bg-[#F4F0FF] rounded-2xl flex items-center justify-center">
                <Inbox className="w-8 h-8 text-[#7856FF]" />
              </div>
              <div className="text-center">
                <h3 className="text-[18px] font-[600] text-[#201F24]">No pending invites</h3>
                <p className="text-[#5C5C5C] text-[14px] mt-1">When someone invites you to collaborate, it'll appear here.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invites.map(invite => (
                <InviteCard
                  key={invite.id}
                  invite={invite}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  accepting={accepting}
                  declining={declining}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
