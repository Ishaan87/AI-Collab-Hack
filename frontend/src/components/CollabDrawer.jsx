import React, { useState } from 'react';
import { X, Loader2, Users, Sparkles, ChevronRight, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { api } from '../api';

const TIER_COLORS = {
  Elite: 'bg-amber-100 text-amber-700',
  Expert: 'bg-indigo-100 text-indigo-700',
  Hacker: 'bg-orange-100 text-orange-700',
  Builder: 'bg-green-100 text-green-700',
  Explorer: 'bg-gray-100 text-gray-600',
};

export default function CollabDrawer({ competitionId, competitionTitle, onClose }) {
  const [phase, setPhase]           = useState('idle'); // idle | loading | results | inviting | done
  const [suggestions, setSuggestions] = useState([]);
  const [rolesNeeded, setRolesNeeded] = useState(null);
  const [error, setError]           = useState('');
  const [selectedTeam, setSelected] = useState(null);
  const [inviteMsg, setInviteMsg]   = useState('');
  const [inviting, setInviting]     = useState(false);
  const [inviteResults, setInviteResults] = useState([]);

  const fetchSuggestions = async () => {
    try {
      setPhase('loading');
      setError('');
      const data = await api.post(`/competitions/${competitionId}/collab`);
      setSuggestions(data.suggestions || []);
      setRolesNeeded(data.roles_needed);
      setPhase('results');
    } catch (err) {
      setError(err.message || 'Failed to get suggestions.');
      setPhase('idle');
    }
  };

  const handleInviteTeam = async (team) => {
    setSelected(team);
    setPhase('inviting');
  };

  const sendInvites = async () => {
    try {
      setInviting(true);
      setError('');
      const results = [];
      for (const member of selectedTeam.members) {
        try {
          await api.post('/invites', {
            competition_id: competitionId,
            receiver_id:    member.id,
            message:        inviteMsg || `Hey! I'd love to team up for ${competitionTitle}. You've been AI-matched as a great fit for our team!`,
          });
          results.push({ member, success: true });
        } catch (err) {
          results.push({ member, success: false, error: err.message });
        }
      }
      setInviteResults(results);
      setPhase('done');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#E8DDFF] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#7856FF]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Find Collaborators</h2>
              <p className="text-xs text-gray-500">AI-matched teammates for this competition</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 px-6 py-6">

          {/* ── Idle ── */}
          {phase === 'idle' && (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-[#F4F0FF] rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-[#7856FF]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">AI Team Matching</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  Our AI will analyze this competition, figure out what roles are needed, and suggest 3 teams of users with complementary skills and similar ratings to yours.
                </p>
              </div>
              {rolesNeeded?.roles_needed?.length > 0 && (
                <div className="text-left bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Roles identified for this comp</p>
                  {rolesNeeded.roles_needed.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{r.domain}</span>
                      <span className="text-gray-400 text-xs">{r.count} needed</span>
                    </div>
                  ))}
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <button onClick={fetchSuggestions}
                className="w-full py-3.5 bg-[#7856FF] text-white rounded-xl font-bold hover:bg-[#6846EB] transition-colors flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Find My Teammates</span>
              </button>
            </div>
          )}

          {/* ── Loading ── */}
          {phase === 'loading' && (
            <div className="text-center py-20 space-y-4">
              <Loader2 className="w-10 h-10 text-[#7856FF] animate-spin mx-auto" />
              <p className="font-semibold text-gray-700">AI is analyzing the competition...</p>
              <p className="text-sm text-gray-400">Finding users with compatible skills and ratings</p>
            </div>
          )}

          {/* ── Results ── */}
          {phase === 'results' && (
            <div className="space-y-5">
              {rolesNeeded?.roles_needed?.length > 0 && (
                <div className="bg-[#F4F0FF] border border-[#7856FF]/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-[#7856FF] uppercase tracking-wider mb-3">What this competition needs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {rolesNeeded.roles_needed.map((r, i) => (
                      <div key={i} className="bg-white rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">{r.domain}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            r.priority === 'high' ? 'bg-red-100 text-red-600' :
                            r.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>{r.priority}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{r.skills?.slice(0,2).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {suggestions.length} Team Suggestions
              </p>

              {suggestions.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Not enough rated users available yet. Check back as more users join!
                </div>
              )}

              {suggestions.map((team, idx) => (
                <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-[#7856FF]/40 transition-colors">
                  {/* Team header */}
                  <div className="bg-gradient-to-r from-[#F4F0FF] to-white px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#7856FF]">TEAM {idx + 1}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">ELO {team.elo_range}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mt-0.5">{team.team_name}</h4>
                    </div>
                    <div className="flex -space-x-2">
                      {team.members?.slice(0, 4).map((m, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-[#7856FF] text-white text-xs flex items-center justify-center font-bold border-2 border-white">
                          {m.name?.charAt(0) || m.username?.charAt(0) || '?'}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Members */}
                  <div className="px-5 py-3 space-y-3">
                    {team.members?.map((member, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0 overflow-hidden">
                          {member.avatar_url
                            ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                            : (member.full_name || member.username || '?').charAt(0)
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900 truncate">{member.full_name || member.username}</span>
                            {member.tier && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${TIER_COLORS[member.tier] || 'bg-gray-100 text-gray-600'}`}>
                                {member.tier}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#7856FF] font-medium">{member.role}</p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{member.why}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Team reasoning */}
                  <div className="px-5 pb-3">
                    <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                      "{team.team_reasoning}"
                    </p>
                    {team.strength && (
                      <p className="text-xs text-green-600 font-medium mt-2">✓ {team.strength}</p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="px-5 pb-4">
                    <button
                      onClick={() => handleInviteTeam(team)}
                      className="w-full py-2.5 bg-[#7856FF] text-white rounded-xl text-sm font-bold hover:bg-[#6846EB] transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Invite This Team</span>
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={() => setPhase('idle')} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                Regenerate Suggestions
              </button>
            </div>
          )}

          {/* ── Inviting ── */}
          {phase === 'inviting' && selectedTeam && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900">Invite {selectedTeam.team_name}</h3>
                <p className="text-sm text-gray-500 mt-1">You're about to send invites to {selectedTeam.members?.length} people.</p>
              </div>

              {/* Members list */}
              <div className="space-y-2">
                {selectedTeam.members?.map((m, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#7856FF] text-white text-xs flex items-center justify-center font-bold">
                      {(m.full_name || m.username || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.full_name || m.username}</p>
                      <p className="text-xs text-[#7856FF]">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional message */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Personal message (optional)</label>
                <textarea
                  value={inviteMsg}
                  onChange={e => setInviteMsg(e.target.value)}
                  rows={3}
                  placeholder={`Hey! I'd love to team up for ${competitionTitle}...`}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF] resize-none"
                />
              </div>

              {error && (
                <div className="text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setPhase('results')}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Back
                </button>
                <button onClick={sendInvites} disabled={inviting}
                  className="flex-1 py-3 bg-[#7856FF] text-white rounded-xl text-sm font-bold hover:bg-[#6846EB] disabled:opacity-60 flex items-center justify-center space-x-2">
                  {inviting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending...</span></>
                    : <><Send className="w-4 h-4" /><span>Send All Invites</span></>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── Done ── */}
          {phase === 'done' && (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Invites Sent!</h3>
                <p className="text-sm text-gray-500 mt-1">They'll receive notifications and can accept or decline.</p>
              </div>
              <div className="space-y-2 text-left">
                {inviteResults.map((r, i) => (
                  <div key={i} className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${r.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span className={r.success ? 'text-green-500' : 'text-red-500'}>{r.success ? '✓' : '✗'}</span>
                    <span className="text-sm font-medium">{r.member.full_name || r.member.username}</span>
                    {!r.success && <span className="text-xs text-red-400">{r.error}</span>}
                  </div>
                ))}
              </div>
              <button onClick={onClose}
                className="w-full py-3 bg-[#7856FF] text-white rounded-xl font-bold hover:bg-[#6846EB] transition-colors">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
