import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusSquare, Loader2, ChevronRight, Calendar, Users,
  Eye, Settings, Trash2, AlertCircle, Trophy, Clock
} from 'lucide-react';
import { api } from '../api';

const formatDate = (d) => {
  if (!d) return 'TBD';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_STYLES = {
  upcoming:  'bg-blue-50   text-blue-600   border-blue-100',
  ongoing:   'bg-green-50  text-green-600  border-green-100',
  completed: 'bg-gray-50   text-gray-500   border-gray-200',
  cancelled: 'bg-red-50    text-red-500    border-red-100',
};

const TYPE_LABEL = {
  hackathon:        'Hackathon',
  case_comp:        'Case Comp',
  design_challenge: 'Design Challenge',
  coding_contest:   'Coding Contest',
  other:            'Other',
};

export default function MyEvents() {
  const navigate = useNavigate();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    api.get('/competitions/hosted')
      .then(data => setEvents(data.competitions || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await api.delete(`/competitions/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-[600] tracking-tight text-[#201F24] mb-1">My Events</h1>
          <p className="text-[#5C5C5C] text-[16px]">Competitions and challenges you've created.</p>
        </div>
        <button
          onClick={() => navigate('/competitions/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7856FF] text-white rounded-full font-[500] text-[14px] hover:bg-[#6846EB] transition-colors shadow-sm shadow-[#7856FF]/20"
        >
          <PlusSquare className="w-4 h-4" />
          Host New Event
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[14px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-[#7856FF]" />
        </div>
      )}

      {/* Empty */}
      {!loading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-5 bg-white border border-[#E5E7EB] rounded-2xl">
          <div className="w-16 h-16 bg-[#F4F0FF] rounded-2xl flex items-center justify-center">
            <Trophy className="w-8 h-8 text-[#7856FF]" />
          </div>
          <div className="text-center">
            <h3 className="text-[18px] font-[600] text-[#201F24]">No events yet</h3>
            <p className="text-[#5C5C5C] text-[14px] mt-1">Create your first competition and attract participants.</p>
          </div>
          <button
            onClick={() => navigate('/competitions/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#7856FF] text-white rounded-xl font-[500] text-[14px] hover:bg-[#6846EB] transition-colors"
          >
            <PlusSquare className="w-4 h-4" />
            Host an Event
          </button>
        </div>
      )}

      {/* Events grid */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map(evt => (
            <div
              key={evt.id}
              className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              {/* Banner */}
              <div
                className="h-28 w-full relative bg-gradient-to-br from-[#E8DDFF] to-[#DDD6FE]"
                style={evt.banner_url ? { backgroundImage: `url(${evt.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                <div className={`absolute top-3 right-3 text-[11px] font-[600] px-2.5 py-1 rounded-full border ${STATUS_STYLES[evt.status] || STATUS_STYLES.upcoming}`}>
                  {evt.status ? evt.status.charAt(0).toUpperCase() + evt.status.slice(1) : 'Upcoming'}
                </div>
                {evt.type && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-[500] px-2 py-1 rounded-full text-[#5C5C5C]">
                    {TYPE_LABEL[evt.type] || evt.type}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-[17px] font-[600] text-[#201F24] leading-tight group-hover:text-[#7856FF] transition-colors line-clamp-2">
                    {evt.title}
                  </h3>
                  {evt.description && (
                    <p className="text-[13px] text-[#5C5C5C] mt-1.5 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px] text-[#5C5C5C]">
                    <Calendar className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    {formatDate(evt.start_date)} – {formatDate(evt.end_date)}
                  </div>
                  {evt.registration_count !== undefined && (
                    <div className="flex items-center gap-2 text-[12px] text-[#5C5C5C]">
                      <Users className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      {evt.registration_count} registered
                    </div>
                  )}
                  {evt.registration_deadline && (
                    <div className="flex items-center gap-2 text-[12px] text-[#5C5C5C]">
                      <Clock className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      Deadline: {formatDate(evt.registration_deadline)}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {evt.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {evt.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-[#FAFAFA] border border-[#E5E7EB] text-[#5C5C5C] rounded-md text-[11px] font-[500]">
                        {tag}
                      </span>
                    ))}
                    {evt.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-[#9CA3AF] text-[11px]">+{evt.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#F3F4F6]">
                  <button
                    onClick={() => navigate(`/competitions/${evt.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-[500] text-[#374151] rounded-lg hover:bg-[#F4F0FF] hover:text-[#7856FF] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    onClick={() => navigate(`/competitions/${evt.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-[500] text-[#374151] rounded-lg hover:bg-[#F4F0FF] hover:text-[#7856FF] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(evt.id)}
                    className="flex items-center justify-center p-2 text-[#9CA3AF] rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4 z-10">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-[17px] font-[600] text-[#201F24]">Delete this event?</h3>
              <p className="text-[13px] text-[#5C5C5C] mt-1">This will permanently remove the competition and all its registrations. This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 border border-[#E5E7EB] text-[#374151] rounded-xl text-[14px] font-[500] hover:bg-[#FAFAFA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={!!deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-[14px] font-[600] hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {deleting === confirmDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
