import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

////////

const inputCls = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7856FF] bg-white";
const Field = ({ label, required, hint, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700">
      {label}{required && <span className="text-[#7856FF] ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

export default function RegistrationModal({ competition, onClose, onSuccess }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    full_name:     user?.full_name || '',
    email:         user?.email     || '',
    mobile:        user?.mobile_number || '',
    college:       '',
    year_of_study: '',
    skills_summary: (user?.skills || []).map(s => s.name).join(', '),
    why_join:      '',
    experience:    '',
    github_url:    user?.github_username ? `https://github.com/${user.github_username}` : '',
    linkedin_url:  user?.linkedin_url || '',
    portfolio_url: user?.website_url  || '',
    custom_answers: {},
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const setCustom = (id, v) => setForm(p => ({ ...p, custom_answers: { ...p.custom_answers, [id]: v } }));

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.email.trim())     return 'Email is required.';
    if (!form.why_join.trim())  return 'Please tell us why you want to join.';
    // Check required custom questions
    for (const q of (competition.custom_questions || [])) {
      if (q.required && !form.custom_answers[q.id]?.trim())
        return `"${q.label}" is required.`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    try {
      setSubmitting(true);
      setError('');
      await api.post(`/competitions/${competition.id}/register`, form);
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-gray-900">Register for Competition</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-md">{competition.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Success state */}
        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900">You're Registered! 🎉</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              You've successfully registered for <strong>{competition.title}</strong>.
              The organizer will be in touch with next steps.
            </p>
            {competition.website_url && (
              <a href={competition.website_url} target="_blank" rel="noreferrer"
                className="flex items-center space-x-2 text-sm text-[#7856FF] font-medium hover:underline">
                <span>Visit competition page</span><ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-[#7856FF] text-white rounded-xl font-bold hover:bg-[#6846EB] transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Form */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">

              {/* Section: Personal Info */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Personal Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Field label="Full Name" required>
                      <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full name" className={inputCls} />
                    </Field>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Field label="Email" required>
                      <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className={inputCls} />
                    </Field>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Field label="Mobile Number">
                      <input value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="+91 9876543210" className={inputCls} />
                    </Field>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Field label="College / Organization">
                      <input value={form.college} onChange={e => set('college', e.target.value)} placeholder="IIT Delhi" className={inputCls} />
                    </Field>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Field label="Year of Study / Role">
                      <select value={form.year_of_study} onChange={e => set('year_of_study', e.target.value)} className={`${inputCls} text-gray-700`}>
                        <option value="">Select...</option>
                        {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'PhD', 'Working Professional', 'Other'].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </div>

              {/* Section: Background */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Background & Experience</p>
                <div className="space-y-4">
                  <Field label="Key Skills" hint="List your most relevant skills for this competition">
                    <input value={form.skills_summary} onChange={e => set('skills_summary', e.target.value)}
                      placeholder="e.g. React, Node.js, Machine Learning, UI/UX Design" className={inputCls} />
                  </Field>
                  <Field label="Why do you want to join?" required hint="What excites you about this competition?">
                    <textarea value={form.why_join} onChange={e => set('why_join', e.target.value)}
                      rows={3} placeholder="I'm excited about this competition because..."
                      className={`${inputCls} resize-none`} />
                  </Field>
                  <Field label="Relevant Experience" hint="Past projects, competitions, internships">
                    <textarea value={form.experience} onChange={e => set('experience', e.target.value)}
                      rows={3} placeholder="I previously built... / I participated in... / I interned at..."
                      className={`${inputCls} resize-none`} />
                  </Field>
                </div>
              </div>

              {/* Section: Links */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Profile Links</p>
                <div className="space-y-3">
                  {[
                    { field: 'github_url',    label: 'GitHub',    placeholder: 'https://github.com/...' },
                    { field: 'linkedin_url',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/...' },
                    { field: 'portfolio_url', label: 'Portfolio / Website', placeholder: 'https://...' },
                  ].map(({ field, label, placeholder }) => (
                    <Field key={field} label={label}>
                      <input type="url" value={form[field]} onChange={e => set(field, e.target.value)}
                        placeholder={placeholder} className={inputCls} />
                    </Field>
                  ))}
                </div>
              </div>

              {/* Section: Custom Questions (if organizer added any) */}
              {competition.custom_questions?.length > 0 && (
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Additional Questions</p>
                  <div className="space-y-4">
                    {competition.custom_questions.map(q => (
                      <Field key={q.id} label={q.label} required={q.required}>
                        {q.type === 'textarea' ? (
                          <textarea value={form.custom_answers[q.id] || ''} onChange={e => setCustom(q.id, e.target.value)}
                            rows={3} className={`${inputCls} resize-none`} />
                        ) : q.type === 'select' ? (
                          <select value={form.custom_answers[q.id] || ''} onChange={e => setCustom(q.id, e.target.value)} className={inputCls}>
                            <option value="">Select...</option>
                            {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input value={form.custom_answers[q.id] || ''} onChange={e => setCustom(q.id, e.target.value)} className={inputCls} />
                        )}
                      </Field>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50 rounded-b-3xl">
              <p className="text-xs text-gray-400">Your info will only be visible to the organizer.</p>
              <div className="flex gap-3">
                <button onClick={onClose}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-[#7856FF] text-white rounded-xl text-sm font-bold hover:bg-[#6846EB] disabled:opacity-60 transition-colors">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Submitting...</span></>
                    : <span>Submit Registration</span>
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
