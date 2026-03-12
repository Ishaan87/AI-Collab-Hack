import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusSquare, X, Loader2, CheckCircle2, ChevronRight,
  Calendar, Trophy, Globe, FileText, Plus, Trash2, Sparkles
} from 'lucide-react';
import { api } from '../api';

/* ── shared input style matching Discover page ── */
const inputCls = "w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[14px] text-[#201F24] outline-none focus:ring-2 focus:ring-[#7856FF] placeholder:text-[#9CA3AF] transition-all";
const labelCls = "block text-[13px] font-[600] text-[#374151] mb-1.5";

const COMPETITION_TYPES = [
  { value: 'hackathon',          label: 'Hackathon' },
  { value: 'case_comp',          label: 'Case Competition' },
  { value: 'design_challenge',   label: 'Design Challenge' },
  { value: 'coding_contest',     label: 'Coding Contest' },
  { value: 'other',              label: 'Other' },
];

const STEPS = [
  { id: 'basics',    label: 'Basics',    icon: FileText },
  { id: 'details',   label: 'Details',   icon: Trophy },
  { id: 'dates',     label: 'Dates',     icon: Calendar },
  { id: 'advanced',  label: 'Advanced',  icon: Sparkles },
];

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className={labelCls}>
        {label}{required && <span className="text-[#7856FF] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[12px] text-[#9CA3AF]">{hint}</p>}
    </div>
  );
}

export default function HostEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'hackathon',
    status: 'upcoming',
    tags: [],
    tagInput: '',
    prize_description: '',
    registration_url: '',
    banner_url: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    duration_days: '',
    team_size_min: 1,
    team_size_max: 4,
    max_participants: '',
    custom_questions: [],
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const addTag = () => {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      set('tags', [...form.tags, t]);
      set('tagInput', '');
    }
  };

  const removeTag = (t) => set('tags', form.tags.filter(x => x !== t));

  const addQuestion = () => {
    set('custom_questions', [
      ...form.custom_questions,
      { id: Date.now().toString(), label: '', type: 'text', required: false, options: [] },
    ]);
  };

  const updateQuestion = (id, field, value) => {
    set('custom_questions', form.custom_questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id) => {
    set('custom_questions', form.custom_questions.filter(q => q.id !== id));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim()) return 'Competition title is required.';
      if (!form.description.trim()) return 'Description is required.';
    }
    if (step === 2) {
      if (!form.start_date) return 'Start date is required.';
      if (!form.end_date) return 'End date is required.';
      if (new Date(form.end_date) < new Date(form.start_date)) return 'End date must be after start date.';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        status: form.status,
        tags: form.tags,
        prize_description: form.prize_description,
        registration_url: form.registration_url,
        banner_url: form.banner_url,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        registration_deadline: form.registration_deadline || null,
        duration_days: form.duration_days ? parseInt(form.duration_days) : null,
        team_size_min: form.team_size_min,
        team_size_max: form.team_size_max,
        custom_questions: form.custom_questions.filter(q => q.label.trim()),
      };
      const data = await api.post('/competitions', payload);
      setCreatedId(data.competition?.id);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Failed to create competition. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ── */
  if (done) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-[28px] font-[600] text-[#201F24] tracking-tight">Competition Created! 🎉</h2>
            <p className="text-[#5C5C5C] mt-2 text-[15px]">
              <strong>{form.title}</strong> is now live and discoverable by participants.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {createdId && (
              <button
                onClick={() => navigate(`/competitions/${createdId}`)}
                className="px-6 py-3 bg-[#7856FF] text-white rounded-xl font-[600] text-[14px] hover:bg-[#6846EB] transition-colors flex items-center justify-center gap-2"
              >
                View Competition <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => navigate('/my-events')}
              className="px-6 py-3 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl font-[500] text-[14px] hover:bg-[#FAFAFA] transition-colors"
            >
              My Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-[32px] font-[600] tracking-tight text-[#201F24] mb-1">Host an Event</h1>
        <p className="text-[#5C5C5C] text-[16px]">Create a competition, hackathon, or challenge for participants to discover.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <React.Fragment key={s.id}>
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-[500] whitespace-nowrap transition-all ${
                  active ? 'bg-[#7856FF] text-white shadow-sm shadow-[#7856FF]/30'
                  : done  ? 'bg-[#EDE9FE] text-[#7856FF] cursor-pointer hover:bg-[#DDD6FE]'
                  : 'bg-white border border-[#E5E7EB] text-[#9CA3AF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px shrink-0 ${i < step ? 'bg-[#7856FF]' : 'bg-[#E5E7EB]'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 space-y-6">

        {/* ── Step 0: Basics ── */}
        {step === 0 && (
          <>
            <div>
              <p className="text-[11px] font-[700] uppercase tracking-widest text-[#9CA3AF] mb-6">Basic Information</p>
              <div className="space-y-5">
                <Field label="Competition Title" required>
                  <input
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. HackIndia 2026"
                    className={inputCls}
                  />
                </Field>
                <Field label="Description" required hint="Tell participants what this competition is about, what to build, and who should apply.">
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={5}
                    placeholder="Describe the competition, goals, and eligibility..."
                    className={`${inputCls} resize-none`}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Type" required>
                    <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                      {COMPETITION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </Field>
                </div>

                {/* Tags */}
                <Field label="Tags" hint="Add up to 8 tags to help participants find your event">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={form.tagInput}
                        onChange={e => set('tagInput', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="e.g. AI, Web3, FinTech"
                        className={`${inputCls} flex-1`}
                      />
                      <button
                        onClick={addTag}
                        className="px-4 py-3 bg-[#F4F0FF] text-[#7856FF] rounded-xl text-[13px] font-[600] hover:bg-[#EDE9FE] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-[#F4F0FF] border border-[#DDD6FE] text-[#7856FF] rounded-lg text-[12px] font-[500]">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
              </div>
            </div>
          </>
        )}

        {/* ── Step 1: Details ── */}
        {step === 1 && (
          <>
            <p className="text-[11px] font-[700] uppercase tracking-widest text-[#9CA3AF] mb-6">Competition Details</p>
            <div className="space-y-5">
              <Field label="Prize Description" hint="e.g. ₹5,00,000 cash prize + internship offer + mentorship">
                <textarea
                  value={form.prize_description}
                  onChange={e => set('prize_description', e.target.value)}
                  rows={3}
                  placeholder="Describe prizes, perks, or rewards..."
                  className={`${inputCls} resize-none`}
                />
              </Field>
              <Field label="Registration / External URL" hint="Link to the official registration page or competition website">
                <input
                  type="url"
                  value={form.registration_url}
                  onChange={e => set('registration_url', e.target.value)}
                  placeholder="https://devfolio.co/competitions/..."
                  className={inputCls}
                />
              </Field>
              <Field label="Banner Image URL" hint="A wide image (16:9) to display at the top of your competition page">
                <input
                  type="url"
                  value={form.banner_url}
                  onChange={e => set('banner_url', e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
                {form.banner_url && (
                  <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-[#E5E7EB]">
                    <img src={form.banner_url} alt="Banner preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  </div>
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Min Team Size">
                  <input
                    type="number" min={1} max={10}
                    value={form.team_size_min}
                    onChange={e => set('team_size_min', parseInt(e.target.value) || 1)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Max Team Size">
                  <input
                    type="number" min={1} max={10}
                    value={form.team_size_max}
                    onChange={e => set('team_size_max', parseInt(e.target.value) || 4)}
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Dates ── */}
        {step === 2 && (
          <>
            <p className="text-[11px] font-[700] uppercase tracking-widest text-[#9CA3AF] mb-6">Dates & Schedule</p>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Start Date" required>
                  <input type="datetime-local" value={form.start_date} onChange={e => set('start_date', e.target.value)} className={inputCls} />
                </Field>
                <Field label="End Date" required>
                  <input type="datetime-local" value={form.end_date} onChange={e => set('end_date', e.target.value)} className={inputCls} />
                </Field>
              </div>
              <Field label="Registration Deadline" hint="Leave blank if registration stays open until the event starts">
                <input type="datetime-local" value={form.registration_deadline} onChange={e => set('registration_deadline', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Duration (days)" hint="Optional — how many days does the competition run?">
                <input
                  type="number" min={1}
                  value={form.duration_days}
                  onChange={e => set('duration_days', e.target.value)}
                  placeholder="e.g. 2"
                  className={inputCls}
                />
              </Field>
            </div>
          </>
        )}

        {/* ── Step 3: Advanced ── */}
        {step === 3 && (
          <>
            <p className="text-[11px] font-[700] uppercase tracking-widest text-[#9CA3AF] mb-2">Custom Registration Questions</p>
            <p className="text-[13px] text-[#5C5C5C] mb-6">Add questions that participants must answer when registering. These appear in the registration form alongside the defaults.</p>

            <div className="space-y-4">
              {form.custom_questions.map((q, idx) => (
                <div key={q.id} className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-[600] text-[#9CA3AF] uppercase tracking-wider">Question {idx + 1}</span>
                    <button onClick={() => removeQuestion(q.id)} className="p-1 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={q.label}
                    onChange={e => updateQuestion(q.id, 'label', e.target.value)}
                    placeholder="Question text..."
                    className={inputCls}
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={q.type}
                      onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-[13px] text-[#5C5C5C] outline-none focus:ring-2 focus:ring-[#7856FF] bg-white"
                    >
                      <option value="text">Short text</option>
                      <option value="textarea">Long text</option>
                      <option value="select">Dropdown</option>
                    </select>
                    <label className="flex items-center gap-2 text-[13px] text-[#5C5C5C] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={e => updateQuestion(q.id, 'required', e.target.checked)}
                        className="w-4 h-4 rounded accent-[#7856FF]"
                      />
                      Required
                    </label>
                  </div>
                  {q.type === 'select' && (
                    <input
                      value={(q.options || []).join(', ')}
                      onChange={e => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="Options: Option A, Option B, Option C"
                      className={inputCls}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-[#DDD6FE] text-[#7856FF] rounded-xl text-[13px] font-[500] hover:bg-[#F4F0FF] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[13px]">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
          <button
            onClick={() => step === 0 ? navigate('/discover') : setStep(s => s - 1)}
            className="px-5 py-2.5 border border-[#E5E7EB] text-[#374151] rounded-xl text-[14px] font-[500] hover:bg-[#FAFAFA] transition-colors"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#7856FF] text-white rounded-xl text-[14px] font-[600] hover:bg-[#6846EB] transition-colors"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#7856FF] text-white rounded-xl text-[14px] font-[600] hover:bg-[#6846EB] disabled:opacity-60 transition-colors"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                : <><PlusSquare className="w-4 h-4" /> Create Competition</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
