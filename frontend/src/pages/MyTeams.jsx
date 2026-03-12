import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Loader2, AlertCircle, CheckCircle2, XCircle,
  Clock, Trophy, ChevronRight, Bell, Inbox, Copy, UserMinus, LogOut,
  Edit2, X, UserPlus, MessageCircle
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

function TeamCard({ team, currentUser, onLeaveTeam, onRemoveMember, onEditTeam, onInviteMember, onMessageMember }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const isLeader = team.my_role === 'leader';
  
  const memberCount = team.members?.length || 0;
  const maxMembers = team.max_team_size || team.max_members || 4;
  const minMembers = team.min_team_size || 1;
  const isIncomplete = memberCount < minMembers;

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(team.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white border rounded-2xl p-5 space-y-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 group relative overflow-hidden ${isIncomplete ? 'border-orange-200' : 'border-[#E5E7EB] hover:border-[#DDD6FE]'}`}>
      
      {/* Warning stripe for incomplete */}
      {isIncomplete && (
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7856FF] to-[#9B7AFF] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-[600] text-[#201F24] group-hover:text-[#7856FF] transition-colors">
                {team.name}
              </h3>
              {isLeader && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditTeam(team); }}
                  className="p-1 text-[#9CA3AF] hover:text-[#7856FF] transition-colors"
                  title="Edit Team"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[12px] font-[500] text-[#7856FF] bg-[#F4F0FF] px-1.5 py-0.5 rounded-md">
                {memberCount} / {maxMembers} <span className="hidden sm:inline">Members</span>
              </p>
              {isIncomplete && (
                <span className="text-[11px] font-[600] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Min: {minMembers}
                </span>
              )}
            </div>
          </div>
        </div>
        {team.competition_title && (
          <span className="text-[11px] font-[500] text-[#9CA3AF] max-w-[120px] text-right line-clamp-2">{team.competition_title}</span>
        )}
      </div>

      {/* Members Dropdown / List */}
      {team.members?.length > 0 && (
        <div className="space-y-2 mt-2 pt-2 border-t border-[#F3F4F6]">
          {team.members.map(m => (
            <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors">
              <div 
                className={`flex items-center gap-2 ${m.role !== 'pending' ? 'cursor-pointer group/member' : ''}`}
                onClick={(e) => {
                  if (m.role !== 'pending') {
                    e.stopPropagation();
                    navigate(`/profile/${m.username}`);
                  }
                }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-[700] overflow-hidden ${m.role === 'pending' ? 'bg-orange-100 text-orange-600 grayscale opacity-70' : 'bg-[#E8DDFF] text-[#7856FF] ring-2 ring-transparent group-hover/member:ring-indigo-200 transition-all'}`}>
                  {m.avatar_url
                    ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (m.full_name || m.username || '?').charAt(0)
                  }
                </div>
                <div>
                  <p className={`text-[13px] font-[500] leading-none ${m.role === 'pending' ? 'text-gray-500' : 'text-[#201F24] group-hover/member:text-indigo-600 transition-colors'}`}>
                    {m.full_name || m.username} {m.id === currentUser.id && '(You)'}
                  </p>
                  {m.role === 'pending' ? (
                    <p className="text-[10px] text-orange-600 font-[600] mt-0.5 bg-orange-100 px-1.5 py-0.5 rounded-sm inline-block">Invite Pending</p>
                  ) : (
                    <p className="text-[11px] text-[#9CA3AF] capitalize">{m.role}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {m.id !== currentUser.id && m.role !== 'pending' && (
                  <button
                     onClick={(e) => { e.stopPropagation(); onMessageMember(m); }}
                     className="p-1.5 text-[#9CA3AF] hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                     title="Send Message"
                  >
                     <MessageCircle className="w-4 h-4" />
                  </button>
                )}
                
                {isLeader && m.id !== currentUser.id && m.role !== 'pending' && (
                   <button
                     onClick={(e) => { e.stopPropagation(); onRemoveMember(team.id, m.id); }}
                     className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                     title="Remove Member"
                   >
                     <UserMinus className="w-4 h-4" />
                   </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Status / Invite Action */}
      {isIncomplete && (
        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex flex-col gap-2">
          <p className="text-[12px] text-orange-800 leading-snug">
            Your team does not meet the minimum requirement of <b>{minMembers}</b> members for this competition.
          </p>
          <div className="flex items-center gap-2">
             <button
                onClick={(e) => { e.stopPropagation(); navigate(`/competitions/${team.competition_id}`); }}
                className="flex-1 py-1.5 bg-white border border-orange-200 text-orange-700 rounded-lg text-[11px] font-[600] hover:bg-orange-50 transition-colors"
             >
                Find Members
             </button>
             {isLeader && memberCount < maxMembers && (
                <button
                   onClick={(e) => { e.stopPropagation(); onInviteMember(team); }}
                   className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-[11px] font-[600] hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5"
                >
                   <UserPlus className="w-3.5 h-3.5" /> Invite directly
                </button>
             )}
          </div>
        </div>
      )}

      {!isIncomplete && isLeader && memberCount < maxMembers && (
        <button
           onClick={(e) => { e.stopPropagation(); onInviteMember(team); }}
           className="w-full py-2 bg-[#FAFAFA] border border-[#E5E7EB] border-dashed text-[#7856FF] rounded-xl text-[12px] font-[600] hover:bg-[#F4F0FF] hover:border-[#DDD6FE] transition-colors flex items-center justify-center gap-1.5"
        >
           <UserPlus className="w-3.5 h-3.5" /> Invite Teammate via Username
        </button>
      )}

      {/* Footer Controls */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#F3F4F6]">
        {isLeader && (
           <div className="flex items-center justify-between gap-2 p-2 bg-[#F4F0FF] rounded-xl border border-[#DDD6FE]">
             <div className="flex items-center gap-2">
                <span className="text-[12px] font-[600] text-[#7856FF]">Invite Code:</span>
                <span className="text-[13px] font-[700] text-[#201F24] tracking-wider">{team.invite_code}</span>
             </div>
             <button
               onClick={handleCopyCode}
               className="p-1.5 text-[#7856FF] hover:bg-[#E8DDFF] rounded-lg transition-colors flex items-center gap-1 text-[11px] font-[600]"
             >
               {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
               {copied ? 'Copied' : 'Copy'}
             </button>
           </div>
        )}
        
        <div className="flex items-center gap-2">
          {team.competition_id && (
            <button
              onClick={() => navigate(`/competitions/${team.competition_id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FAFAFA] border border-[#E5E7EB] text-[#374151] rounded-xl text-[12px] font-[600] hover:bg-white hover:border-[#DDD6FE] hover:text-[#7856FF] transition-all"
            >
              View Competition <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {!isLeader && (
            <button
              onClick={(e) => { e.stopPropagation(); onLeaveTeam(team.id); }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-[#E5E7EB] text-[#5C5C5C] rounded-xl text-[12px] font-[500] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
              title="Leave Team"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SoloCard({ comp, onCreateTeam }) {
  const navigate = useNavigate();
  const minMembers = comp.min_team_size || 1;
  const isIncomplete = minMembers > 1;

  return (
    <div className={`bg-white border text-center border-dashed rounded-2xl p-6 transition-all flex flex-col justify-between relative overflow-hidden ${isIncomplete ? 'border-orange-200 hover:border-orange-300 bg-orange-50/10' : 'border-[#E5E7EB] hover:border-[#7856FF] hover:bg-[#F4F0FF]/30'}`}>
      
      {isIncomplete && (
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400" />
      )}

      <div>
        <div className="w-12 h-12 mx-auto rounded-full bg-[#F4F0FF] flex items-center justify-center text-[#7856FF] mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-[15px] font-[600] text-[#201F24] mb-1">Solo Participant</h3>
        <p className="text-[13px] text-[#5C5C5C] line-clamp-2 px-2 mb-2">Registered for <span className="font-[600] text-[#7856FF]">{comp.title}</span></p>

        {isIncomplete && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-[11px] font-[500] border border-orange-100 mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Min {minMembers} members required
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <button
          onClick={() => onCreateTeam(comp)}
          className="w-full py-2 bg-[#7856FF] text-white rounded-xl text-[13px] font-[600] hover:bg-[#6846EB] transition-colors shadow-sm"
        >
          Form Team / Invite Teammate
        </button>
        <button
          onClick={() => navigate(`/competitions/${comp.id}`)}
          className="w-full py-2 bg-transparent text-[#7856FF] text-[13px] font-[600] border border-[#DDD6FE] rounded-xl hover:bg-[#F4F0FF] transition-colors"
        >
          Find Teammates via AI
        </button>
      </div>
    </div>
  );
}

function EditTeamModal({ team, onClose, onSuccess }) {
  const [name, setName] = useState(team?.name || '');
  const [desc, setDesc] = useState(team?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.patch(`/teams/${team.id}`, { name, description: desc });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to edit team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-[700] text-[#201F24]">Edit Team</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#201F24]"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-[600] text-[#374151] mb-1">Team Name</label>
            <input 
              required value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#7856FF] focus:ring-1 focus:ring-[#7856FF]"
              placeholder="E.g. The Innovators"
            />
          </div>
          <div>
            <label className="block text-[13px] font-[600] text-[#374151] mb-1">Bio / Description (optional)</label>
            <textarea 
              value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              className="w-full px-3 py-2 text-[14px] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#7856FF] focus:ring-1 focus:ring-[#7856FF] resize-none"
              placeholder="What is your team focused on?"
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full mt-2 py-2.5 bg-[#7856FF] text-white rounded-xl text-[14px] font-[600] hover:bg-[#6846EB] transition-colors disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateTeamModal({ comp, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/teams`, { competition_id: comp.id, name });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[18px] font-[700] text-[#201F24]">Form a Team</h2>
            <p className="text-[12px] text-[#5C5C5C] truncate max-w-[200px]">{comp.title}</p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#201F24]"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-[600] text-[#374151] mb-1">Team Name</label>
            <input 
              required value={name} onChange={e => setName(e.target.value)} autoFocus
              className="w-full px-3 py-2 text-[14px] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#7856FF] focus:ring-1 focus:ring-[#7856FF]"
              placeholder="Enter an awesome name!"
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#7856FF] text-white rounded-xl text-[14px] font-[600] hover:bg-[#6846EB] transition-colors disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Create Team'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InviteMemberModal({ team, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('Hey, would you like to join my team?');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post(`/invites`, { 
        competition_id: team.competition_id, 
        receiver_username: username,
        message: msg
      });
      alert(`Invite sent to ${username}!`);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F4F0FF] flex items-center justify-center text-[#7856FF]">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-[18px] font-[700] text-[#201F24]">Invite User</h2>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#201F24]"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-[600] text-[#374151] mb-1">Username to Invite</label>
            <input 
              required value={username} onChange={e => setUsername(e.target.value)} autoFocus
              className="w-full px-4 py-2.5 text-[14px] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#7856FF] focus:ring-1 focus:ring-[#7856FF] bg-[#FAFAFA] focus:bg-white"
              placeholder="e.g. lovish123"
            />
          </div>
          <div>
            <label className="block text-[13px] font-[600] text-[#374151] mb-1">Optional Message</label>
            <textarea 
              value={msg} onChange={e => setMsg(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 text-[14px] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#7856FF] focus:ring-1 focus:ring-[#7856FF] bg-[#FAFAFA] focus:bg-white resize-none"
              placeholder="Hey, join my team..."
            />
          </div>
          
          {error && <p className="text-[12px] text-red-500 font-[500]">{error}</p>}
          
          <button 
            type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#7856FF] text-white rounded-xl text-[14px] font-[600] hover:bg-[#6846EB] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin"/>} 
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  );
}

function JoinTeamByCodeModal({ onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post(`/teams/join`, { invite_code: code });
      alert('Successfully joined the team!');
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to join team. Invalid code or team is full.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-[18px] font-[700] text-[#201F24]">Join Team</h2>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#201F24]"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-[600] text-[#374151] mb-1">Invitation Code</label>
            <input 
              required value={code} onChange={e => setCode(e.target.value.toUpperCase())} autoFocus
              className="w-full px-4 py-2.5 text-[14px] text-center font-mono tracking-widest border border-[#E5E7EB] rounded-xl outline-none focus:border-[#7856FF] focus:ring-1 focus:ring-[#7856FF] bg-[#FAFAFA] focus:bg-white"
              placeholder="e.g. A3F9B2C1D4"
            />
          </div>
          
          {error && <p className="text-[12px] text-red-500 font-[500]">{error}</p>}
          
          <button 
            type="submit" disabled={loading || !code.trim()}
            className="w-full py-2.5 bg-[#7856FF] text-white rounded-xl text-[14px] font-[600] hover:bg-[#6846EB] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin"/>} 
            {loading ? 'Joining...' : 'Join Team'}
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageMemberModal({ member, onClose }) {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post(`/notifications/message`, { 
        receiver_id: member.id,
        message: msg
      });
      alert(`Message sent to ${member.full_name || member.username}!`);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              <MessageCircle className="w-4 h-4" />
            </div>
            <h2 className="text-[18px] font-[700] text-[#201F24]">Send Message</h2>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#201F24]"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-[600] text-[#374151] mb-1">To: {member.full_name || member.username}</label>
            <textarea 
              required value={msg} onChange={e => setMsg(e.target.value)} rows={3} autoFocus
              className="w-full px-4 py-2.5 text-[14px] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#7856FF] focus:ring-1 focus:ring-[#7856FF] bg-[#FAFAFA] focus:bg-white resize-none"
              placeholder="Hey, let's sync up about the backend logic..."
            />
          </div>
          
          {error && <p className="text-[12px] text-red-500 font-[500]">{error}</p>}
          
          <button 
            type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#7856FF] text-white rounded-xl text-[14px] font-[600] hover:bg-[#6846EB] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin"/>} 
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MyTeams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teams, setTeams]     = useState([]);
  const [solos, setSolos]     = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [accepting, setAccepting] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [tab, setTab]         = useState('teams'); // 'teams' | 'invites'
  const [editingTeam, setEditingTeam] = useState(null);
  const [invitingToTeam, setInvitingToTeam] = useState(null);
  const [creatingTeamForComp, setCreatingTeamForComp] = useState(null);
  const [messagingMember, setMessagingMember] = useState(null);
  const [joiningByCode, setJoiningByCode] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [teamsData, invitesData, compData] = await Promise.all([
        api.get('/teams/my'),
        api.get('/invites/my'),
        api.get('/competitions/my')
      ]);
      setTeams(teamsData.teams || []);
      setInvites((invitesData.invites || []).filter(i => i.status === 'pending'));
      
      const registeredComps = (compData.competitions || []).filter(c => c.registration_status === 'registered' && !c.team_id);
      setSolos(registeredComps);
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
      await api.patch(`/invites/${inviteId}/accept`);
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
      await api.patch(`/invites/${inviteId}/decline`);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeclining(null);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    try {
      await api.delete(`/teams/${teamId}/leave`);
      fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to leave team');
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to remove member');
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setJoiningByCode(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-full font-[500] text-[14px] hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Users className="w-4 h-4" /> Join via Code
          </button>
          <button
            onClick={() => navigate('/discover')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#7856FF] text-white rounded-full font-[500] text-[14px] hover:bg-[#6846EB] transition-colors shadow-sm shadow-[#7856FF]/20"
          >
            <Trophy className="w-4 h-4" /> Discover Events
          </button>
        </div>
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
          {(teams.length + solos.length) > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-[#F4F0FF] text-[#7856FF] text-[11px] font-[700] rounded-full">
              {teams.length + solos.length}
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
          {(teams.length === 0 && solos.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-5 bg-white border border-[#E5E7EB] rounded-2xl">
              <div className="w-16 h-16 bg-[#F4F0FF] rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-[#7856FF]" />
              </div>
              <div className="text-center">
                <h3 className="text-[18px] font-[600] text-[#201F24]">No active teams</h3>
                <p className="text-[#5C5C5C] text-[14px] mt-1">Register for an event and find teammates to form your first team.</p>
              </div>
              <button
                onClick={() => navigate('/discover')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#7856FF] text-white rounded-xl font-[500] text-[14px] hover:bg-[#6846EB] transition-colors"
              >
                Discover Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teams.map(team => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  currentUser={user}
                  onLeaveTeam={handleLeaveTeam}
                  onRemoveMember={handleRemoveMember}
                  onEditTeam={setEditingTeam}
                  onInviteMember={setInvitingToTeam}
                  onMessageMember={setMessagingMember}
                />
              ))}
              {solos.map(comp => (
                <SoloCard
                  key={comp.id}
                  comp={comp}
                  onCreateTeam={setCreatingTeamForComp}
                />
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
      
      {/* Modals */}
      {editingTeam && (
        <EditTeamModal 
          team={editingTeam} 
          onClose={() => setEditingTeam(null)} 
          onSuccess={() => { setEditingTeam(null); fetchAll(); }}
        />
      )}
      
      {creatingTeamForComp && (
        <CreateTeamModal
          comp={creatingTeamForComp}
          onClose={() => setCreatingTeamForComp(null)}
          onSuccess={() => { setCreatingTeamForComp(null); fetchAll(); }}
        />
      )}
      
      {invitingToTeam && (
        <InviteMemberModal
          team={invitingToTeam}
          onClose={() => setInvitingToTeam(null)}
          onSuccess={() => setInvitingToTeam(null)}
        />
      )}
      
      {messagingMember && (
        <MessageMemberModal
          member={messagingMember}
          onClose={() => setMessagingMember(null)}
        />
      )}

      {joiningByCode && (
        <JoinTeamByCodeModal
          onClose={() => setJoiningByCode(false)}
          onSuccess={() => { setJoiningByCode(false); fetchAll(); }}
        />
      )}
    </div>
  );
}
