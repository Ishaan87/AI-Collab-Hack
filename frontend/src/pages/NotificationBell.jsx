import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Users, Trophy, UserCheck, UserX, MessageCircle } from 'lucide-react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  team_invite:     { icon: Users,     color: 'text-[#7856FF]', bg: 'bg-[#E8DDFF]' },
  invite_accepted: { icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100' },
  invite_declined: { icon: UserX,     color: 'text-red-500',   bg: 'bg-red-100' },
  team_formed:     { icon: Trophy,    color: 'text-amber-600', bg: 'bg-amber-100' },
  direct_message:  { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-100' }
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationBell() {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifs]    = useState([]);
  const [invites, setInvites]         = useState([]);
  const [unread, setUnread]           = useState(0);
  const [activeTab, setTab]           = useState('notifications'); // notifications | invites
  const [actioning, setActioning]     = useState(null);
  const ref                           = useRef();
  const navigate                      = useNavigate();

  const fetchAll = async () => {
    try {
      const [notifData, inviteData] = await Promise.all([
        api.get('/notifications'),
        api.get('/invites/my'),
      ]);
      setNotifs(notifData.notifications || []);
      setUnread(notifData.unread_count || 0);
      setInvites(inviteData.invites || []);
    } catch {}
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read');
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {}
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleAccept = async (inviteId) => {
    try {
      setActioning(inviteId);
      await api.patch(`/invites/${inviteId}/accept`);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
      await fetchAll();
      navigate('/my-teams');
    } catch (err) {
      alert(err.message || 'Failed to accept invite.');
    } finally {
      setActioning(null);
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      setActioning(inviteId);
      await api.patch(`/invites/${inviteId}/decline`);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err) {
      alert(err.message || 'Failed to decline.');
    } finally {
      setActioning(null);
    }
  };

  const totalBadge = unread + invites.length;

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchAll(); }}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {totalBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#7856FF] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {totalBadge > 9 ? '9+' : totalBadge}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex space-x-1">
              {[
                { id: 'notifications', label: `Notifications${unread > 0 ? ` (${unread})` : ''}` },
                { id: 'invites',       label: `Invites${invites.length > 0 ? ` (${invites.length})` : ''}` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === tab.id ? 'bg-[#E8DDFF] text-[#7856FF]' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTab === 'notifications' && unread > 0 && (
              <button onClick={markAllRead} className="flex items-center space-x-1 text-xs text-gray-400 hover:text-[#7856FF] transition-colors">
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications tab */}
          {activeTab === 'notifications' && (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">No notifications yet</div>
              ) : (
                notifications.map(notif => {
                  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.team_invite;
                  const Icon   = config.icon;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => !notif.is_read && markOneRead(notif.id)}
                      className={`flex items-start space-x-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-[#FAFAFF]' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        {notif.body && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.body}</p>}
                        <p className="text-[10px] text-gray-300 mt-1">{timeAgo(notif.created_at)}</p>
                      </div>
                      {!notif.is_read && <div className="w-2 h-2 bg-[#7856FF] rounded-full mt-1.5 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Invites tab */}
          {activeTab === 'invites' && (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {invites.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">No pending invites</div>
              ) : (
                invites.map(invite => (
                  <div key={invite.id} className="px-4 py-4 space-y-3">
                    {/* Sender */}
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#E8DDFF] flex items-center justify-center text-sm font-bold text-[#7856FF] overflow-hidden shrink-0">
                        {invite.sender_avatar
                          ? <img src={invite.sender_avatar} alt="" className="w-full h-full object-cover" />
                          : (invite.sender_name || invite.sender_username || '?').charAt(0)
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {invite.sender_name || invite.sender_username}
                          <span className="font-normal text-gray-500"> wants to team up</span>
                        </p>
                        <p className="text-xs text-gray-400 truncate">for "{invite.competition_title}"</p>
                      </div>
                      {invite.sender_tier && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E8DDFF] text-[#7856FF] rounded-full shrink-0">
                          {invite.sender_tier}
                        </span>
                      )}
                    </div>

                    {/* Competition info */}
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{invite.competition_title}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{invite.competition_type?.replace('_', ' ')}</p>
                      </div>
                      {invite.start_date && (
                        <p className="text-[10px] text-gray-400">{new Date(invite.start_date).toLocaleDateString()}</p>
                      )}
                    </div>

                    {/* Message */}
                    {invite.message && (
                      <p className="text-xs text-gray-500 italic px-1">"{invite.message}"</p>
                    )}

                    {/* Expires */}
                    <p className="text-[10px] text-gray-300">
                      Expires {timeAgo(invite.expires_at)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecline(invite.id)}
                        disabled={actioning === invite.id}
                        className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(invite.id)}
                        disabled={actioning === invite.id}
                        className="flex-1 py-2 bg-[#7856FF] text-white rounded-xl text-xs font-bold hover:bg-[#6846EB] disabled:opacity-50 transition-colors flex items-center justify-center space-x-1"
                      >
                        {actioning === invite.id
                          ? <span>...</span>
                          : <><Check className="w-3.5 h-3.5" /><span>Accept</span></>
                        }
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
