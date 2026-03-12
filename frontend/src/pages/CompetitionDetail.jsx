import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Users, Globe, Trophy, Clock, ArrowLeft,
  Loader2, AlertCircle, Sparkles, ExternalLink, Tag, CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import RegistrationModal from '../components/RegistrationModal';
import CollabDrawer from '../components/CollabDrawer';

const formatDate = (d) => {
  if (!d) return 'TBD';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const STATUS_STYLES = {
  upcoming:  'bg-blue-50   text-blue-600   border-blue-100',
  ongoing:   'bg-green-50  text-green-600  border-green-100',
  completed: 'bg-gray-50   text-gray-500   border-gray-100',
  cancelled: 'bg-red-50    text-red-500    border-red-100',
};

const TYPE_LABEL = {
  hackathon:        'Hackathon',
  case_comp:        'Case Competition',
  design_challenge: 'Design Challenge',
  coding_contest:   'Coding Contest',
  other:            'Other',
};

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-[#FAFAFA] border border-[#F3F4F6] rounded-xl">
      <div className="w-8 h-8 bg-[#F4F0FF] rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#7856FF]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-[600] uppercase tracking-wider text-[#9CA3AF]">{label}</p>
        <p className="text-[14px] font-[500] text-[#201F24] mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}

export default function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [comp, setComp]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showCollab, setShowCollab]     = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [generatingWorkflow, setGeneratingWorkflow] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/competitions/${id}`),
      user ? api.get('/competitions/my').catch(() => ({ competitions: [] })) : Promise.resolve({ competitions: [] }),
    ])
      .then(([compData, myData]) => {
        setComp(compData.competition || compData);
        const myIds = new Set((myData.competitions || []).map(c => c.id));
        setIsRegistered(myIds.has(parseInt(id)));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[#7856FF]" />
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[14px]">
        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
      </div>
    </div>
  );

  if (!comp) return null;

  const isOrganizer = user && comp.organizer_id === user.id;
  const canRegister = !isRegistered && comp.status !== 'completed' && comp.status !== 'cancelled';

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">

        {/* Back */}
        <button
          onClick={() => navigate('/discover')}
          className="flex items-center gap-2 text-[13px] font-[500] text-[#5C5C5C] hover:text-[#7856FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </button>

        {/* Hero banner */}
        <div className="rounded-2xl overflow-hidden border border-[#E5E7EB]">
          <div
            className="h-52 md:h-64 w-full bg-gradient-to-br from-[#E8DDFF] to-[#DDD6FE] relative"
            style={comp.banner_url ? { backgroundImage: `url(${comp.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Status + type badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {comp.type && (
                <span className="bg-white/90 backdrop-blur-sm text-[12px] font-[500] px-3 py-1 rounded-full text-[#5C5C5C]">
                  {TYPE_LABEL[comp.type] || comp.type}
                </span>
              )}
              <span className={`text-[12px] font-[600] px-3 py-1 rounded-full border ${STATUS_STYLES[comp.status] || STATUS_STYLES.upcoming}`}>
                {comp.status ? comp.status.charAt(0).toUpperCase() + comp.status.slice(1) : 'Upcoming'}
              </span>
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-white/80 text-[13px] font-[500] mb-1">{comp.organizer_name || comp.organizer}</p>
              <h1 className="text-white text-[28px] md:text-[34px] font-[700] leading-tight tracking-tight line-clamp-2">
                {comp.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h2 className="text-[16px] font-[600] text-[#201F24] mb-3">About this competition</h2>
              <p className="text-[14px] text-[#5C5C5C] leading-relaxed whitespace-pre-wrap">
                {comp.description || 'No description provided.'}
              </p>
            </div>

            {/* Prize */}
            {comp.prize_description && (
              <div className="bg-gradient-to-br from-[#F4F0FF] to-[#EDE9FE] border border-[#DDD6FE] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-[#7856FF]" />
                  <h2 className="text-[16px] font-[600] text-[#201F24]">Prizes & Rewards</h2>
                </div>
                <p className="text-[14px] text-[#374151] leading-relaxed whitespace-pre-wrap">
                  {comp.prize_description}
                </p>
              </div>
            )}

            {/* Tags */}
            {comp.tags?.length > 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-[#9CA3AF]" />
                  <h2 className="text-[15px] font-[600] text-[#374151]">Topics</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {comp.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-[#FAFAFA] border border-[#E5E7EB] text-[#5C5C5C] rounded-lg text-[13px] font-[500]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Workflow */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#7856FF]" />
                  <h2 className="text-[16px] font-[600] text-[#374151]">AI-Generated Strategy & Workflow</h2>
                </div>
                {!showWorkflow && (
                  <button
                    onClick={async () => {
                      if (comp.ai_workflow && Array.isArray(comp.ai_workflow) && comp.ai_workflow.length > 0) {
                        setShowWorkflow(true);
                      } else {
                        try {
                          setGeneratingWorkflow(true);
                          const res = await api.get(`/competitions/${id}/workflow`);
                          setComp(prev => ({ ...prev, ai_workflow: res.workflow }));
                          setShowWorkflow(true);
                        } catch (err) {
                          alert(err.message || 'Failed to generate workflow');
                        } finally {
                          setGeneratingWorkflow(false);
                        }
                      }
                    }}
                    disabled={generatingWorkflow}
                    className="flex shrink-0 w-fit items-center gap-2 px-4 py-2 bg-[#F4F0FF] text-[#7856FF] rounded-xl text-[13px] font-[600] hover:bg-[#E8DDFF] transition-colors disabled:opacity-60"
                  >
                    {generatingWorkflow ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generatingWorkflow ? 'Generating...' : (comp.ai_workflow && comp.ai_workflow.length > 0 ? 'View Strategy' : 'Generate Strategy')}
                  </button>
                )}
              </div>

              {showWorkflow && comp.ai_workflow && Array.isArray(comp.ai_workflow) && comp.ai_workflow.length > 0 && (
                <div className="space-y-4 mt-5 pt-5 border-t border-[#F3F4F6]">
                  {comp.ai_workflow.map((phase, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#F3F4F6]">
                      <div className="text-2xl mt-0.5 shrink-0">{phase.icon || '🚀'}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-[600] text-[14px] text-[#201F24]">{phase.phase}</h3>
                          <span className="text-[11px] font-[600] px-2 py-0.5 bg-[#F4F0FF] text-[#7856FF] border border-[#DDD6FE] rounded-full whitespace-nowrap">
                            {phase.timeline}
                          </span>
                        </div>
                        <ul className="list-disc list-inside text-[13px] text-[#5C5C5C] leading-relaxed mb-2.5 space-y-0.5">
                          {phase.steps?.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                        {phase.tip && (
                          <div className="inline-block text-[12px] bg-[#FEF3C7] text-[#92400E] px-3 py-1.5 rounded-lg font-[500] border border-[#FDE68A]">
                            💡 Tip: {phase.tip}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-4">

            {/* CTA card */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">
              {isRegistered ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-[13px] font-[600] text-green-700">You're registered!</p>
                    <p className="text-[12px] text-green-600">Look out for updates from the organizer.</p>
                  </div>
                </div>
              ) : canRegister ? (
                <button
                  onClick={() => setShowRegModal(true)}
                  className="w-full py-3 bg-[#7856FF] text-white rounded-xl text-[14px] font-[600] hover:bg-[#6846EB] transition-colors shadow-sm shadow-[#7856FF]/20"
                >
                  Register Now
                </button>
              ) : (
                <div className="px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] text-[#9CA3AF] rounded-xl text-[13px] text-center">
                  Registration closed
                </div>
              )}

              {user && !isOrganizer && (
                <button
                  onClick={() => setShowCollab(true)}
                  className="w-full py-3 border border-[#DDD6FE] text-[#7856FF] rounded-xl text-[14px] font-[600] hover:bg-[#F4F0FF] transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Find Teammates (AI)
                </button>
              )}

              {comp.registration_url && (
                <a
                  href={comp.registration_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E5E7EB] text-[#374151] rounded-xl text-[13px] font-[500] hover:bg-[#FAFAFA] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Official Page
                </a>
              )}
            </div>

            {/* Info chips */}
            <div className="space-y-2.5">
              <InfoChip icon={Calendar} label="Starts" value={formatDate(comp.start_date)} />
              <InfoChip icon={Calendar} label="Ends"   value={formatDate(comp.end_date)} />
              {comp.registration_deadline && (
                <InfoChip icon={Clock} label="Registration Deadline" value={formatDate(comp.registration_deadline)} />
              )}
              {comp.team_size_min && comp.team_size_max && (
                <InfoChip icon={Users} label="Team Size" value={`${comp.team_size_min} – ${comp.team_size_max} members`} />
              )}
              {comp.duration_days && (
                <InfoChip icon={Clock} label="Duration" value={`${comp.duration_days} days`} />
              )}
              {(comp.organizer_name || comp.organizer) && (
                <InfoChip icon={Globe} label="Organizer" value={comp.organizer_name || comp.organizer} />
              )}
            </div>

            {/* Organizer controls */}
            {isOrganizer && (
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-4 space-y-2">
                <p className="text-[11px] font-[700] uppercase tracking-widest text-[#9CA3AF] mb-3">Organizer Controls</p>
                <button
                  onClick={() => navigate(`/competitions/${id}/edit`)}
                  className="w-full py-2.5 border border-[#E5E7EB] bg-white text-[#374151] rounded-xl text-[13px] font-[500] hover:bg-white hover:border-[#7856FF] hover:text-[#7856FF] transition-colors"
                >
                  Edit Competition
                </button>
                <button
                  onClick={() => navigate('/my-events')}
                  className="w-full py-2.5 border border-[#E5E7EB] bg-white text-[#374151] rounded-xl text-[13px] font-[500] hover:bg-[#FAFAFA] transition-colors"
                >
                  My Events
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRegModal && (
        <RegistrationModal
          competition={comp}
          onClose={() => setShowRegModal(false)}
          onSuccess={() => { setIsRegistered(true); setShowRegModal(false); }}
        />
      )}

      {showCollab && (
        <CollabDrawer
          competitionId={id}
          competitionTitle={comp.title}
          onClose={() => setShowCollab(false)}
        />
      )}
    </>
  );
}
