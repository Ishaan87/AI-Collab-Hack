import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Award, Briefcase, User, Star, MapPin, AlignLeft, Camera, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import LoginShader from '../components/LoginShader';

// ─── Step Components ──────────────────────────────────────────────────────────

const BasicInfoStep = ({ data, updateData }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="text-left mb-8">
            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Basic Profile Info</h3>
            <p className="text-white/60">Let's start with the essentials.</p>
        </div>

        <div className="flex flex-col items-center mb-6 gap-3">
            <div className="w-24 h-24 rounded-full bg-white/5 border-[3px] border-white/20 shadow-lg flex items-center justify-center overflow-hidden">
                {data.basicInfo?.avatar_url
                    ? <img src={data.basicInfo.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    : <User className="w-10 h-10 text-white/40" />
                }
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#c8a2ff] mt-2">
                <Camera className="h-4 w-4" />
                <input
                    type="url"
                    placeholder="Paste avatar image URL..."
                    value={data.basicInfo?.avatar_url || ''}
                    onChange={e => updateData('basicInfo', { ...data.basicInfo, avatar_url: e.target.value })}
                    className="glass-input px-3 py-1.5 rounded-lg text-sm w-64"
                />
            </div>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        value={data.basicInfo?.full_name ?? ''}
                        onChange={e => updateData('basicInfo', { ...data.basicInfo, full_name: e.target.value })}
                        className="glass-input block w-full pl-11 pr-4 py-3 border rounded-xl text-[15px]"
                        placeholder="Jane Doe"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Username <span className="text-red-400">*</span></label>
                    <div className="relative">
                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            required
                            value={data.basicInfo?.username ?? ''}
                            onChange={e => updateData('basicInfo', { ...data.basicInfo, username: e.target.value.toLowerCase().trim() })}
                            className="glass-input block w-full pl-11 pr-4 py-3 border rounded-xl text-[15px]"
                            placeholder="janedoe"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">City</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            value={data.basicInfo?.city ?? ''}
                            onChange={e => updateData('basicInfo', { ...data.basicInfo, city: e.target.value })}
                            className="glass-input block w-full pl-11 pr-4 py-3 border rounded-xl text-[15px]"
                            placeholder="San Francisco"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Short Bio</label>
                <div className="relative">
                    <AlignLeft className="absolute top-4 left-4 w-4 h-4 text-white/40" />
                    <textarea
                        rows={3}
                        value={data.basicInfo?.bio ?? ''}
                        onChange={e => updateData('basicInfo', { ...data.basicInfo, bio: e.target.value })}
                        className="glass-input block w-full pl-11 pr-4 py-3 border rounded-xl text-[15px] resize-none"
                        placeholder="I am a software engineer..."
                    />
                </div>
            </div>
        </div>
    </div>
);

const SkillsStep = ({ data, updateData }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="text-left mb-8">
            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Technical Skills</h3>
            <p className="text-white/60">Select your core competencies and rate your proficiency.</p>
        </div>
        <div className="space-y-4">
            {['Frontend', 'Backend', 'UI/UX', 'Data Science', 'DevOps'].map(domain => (
                <div key={domain} className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-white/90 text-[15px]">{domain}</span>
                        <span className="text-[#a993ff] font-bold text-sm bg-white/10 px-2.5 py-1 rounded-md border border-white/5">
                            {data.skills[domain] || 0}/100
                        </span>
                    </div>
                    <input
                        type="range" min="0" max="100"
                        value={data.skills[domain] || 0}
                        onChange={e => updateData('skills', { ...data.skills, [domain]: parseInt(e.target.value) })}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#a993ff]"
                    />
                </div>
            ))}
        </div>
    </div>
);

const LinkedProfilesStep = ({ data, updateData }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="text-left mb-8">
            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Linked Profiles</h3>
            <p className="text-white/60">Link at least one external profile to verify your experience.</p>
        </div>
        <div className="space-y-5">
            {[
                { id: 'github', label: 'GitHub', placeholder: 'github.com/username' },
                { id: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
                { id: 'behance', label: 'Behance / Dribbble', placeholder: 'behance.net/username' },
                { id: 'kaggle', label: 'Kaggle', placeholder: 'kaggle.com/username' },
            ].map(profile => (
                <div key={profile.id}>
                    <label className="block text-sm font-medium text-white/80 mb-2">{profile.label}</label>
                    <input
                        type="url"
                        value={data.links[profile.id] || ''}
                        onChange={e => updateData('links', { ...data.links, [profile.id]: e.target.value })}
                        className="glass-input block w-full px-5 py-3 border rounded-xl text-[15px]"
                        placeholder={`https://${profile.placeholder}`}
                    />
                </div>
            ))}
        </div>
    </div>
);

const CompetitionsStep = ({ data, updateData }) => {
    const addComp = () => updateData('competitions', [...(data.competitions || []), { name: '', year: new Date().getFullYear(), role: '', placement: '' }]);
    const updateComp = (index, field, value) => {
        const newComps = [...data.competitions];
        newComps[index][field] = value;
        updateData('competitions', newComps);
    };
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-left mb-8">
                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Past Competitions</h3>
                <p className="text-white/60">Showcase your hackathon and case comp experience.</p>
            </div>
            <div className="space-y-4">
                {(data.competitions || []).map((comp, idx) => (
                    <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg backdrop-blur-sm space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Competition Name</label>
                                <input type="text" value={comp.name} onChange={e => updateComp(idx, 'name', e.target.value)} placeholder="e.g. TreeHacks" className="glass-input w-full px-4 py-3 rounded-xl text-[15px]" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Your Role</label>
                                <input type="text" value={comp.role} onChange={e => updateComp(idx, 'role', e.target.value)} placeholder="e.g. Frontend Lead" className="glass-input w-full px-4 py-3 rounded-xl text-[15px]" />
                            </div>
                            <div className="col-span-2 sm:col-span-1 flex space-x-3">
                                <div className="w-1/3">
                                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Year</label>
                                    <input type="number" value={comp.year} onChange={e => updateComp(idx, 'year', e.target.value)} className="glass-input w-full px-4 py-3 rounded-xl text-[15px]" />
                                </div>
                                <div className="w-2/3">
                                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Placement</label>
                                    <input type="text" value={comp.placement} onChange={e => updateComp(idx, 'placement', e.target.value)} placeholder="e.g. 1st Place" className="glass-input w-full px-4 py-3 rounded-xl text-[15px]" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={addComp} className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-white/60 font-semibold hover:border-white/50 hover:bg-white/5 hover:text-white transition-all">
                + Add Competition Record
            </button>
        </div>
    );
};

const FeaturedProjectStep = ({ data, updateData }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="text-left mb-8">
            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Featured Project</h3>
            <p className="text-white/60">Describe your proudest achievement.</p>
        </div>
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Project Title</label>
                <input type="text" placeholder="E.g. Autonomous Marketing Agent" value={data.featuredProject?.title || ''} onChange={e => updateData('featuredProject', { ...data.featuredProject, title: e.target.value })} className="glass-input w-full px-5 py-3 rounded-xl text-[15px]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description & Impact</label>
                <textarea rows={4} placeholder="Describe the project, your role, and the outcome..." value={data.featuredProject?.description || ''} onChange={e => updateData('featuredProject', { ...data.featuredProject, description: e.target.value })} className="glass-input w-full px-5 py-3 rounded-xl text-[15px] resize-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Project Link <span className="text-white/40 font-normal">(Optional)</span></label>
                <input type="url" placeholder="https://github.com/..." value={data.featuredProject?.link || ''} onChange={e => updateData('featuredProject', { ...data.featuredProject, link: e.target.value })} className="glass-input w-full px-5 py-3 rounded-xl text-[15px]" />
            </div>
            {data.featuredProject?.description?.length > 50 && (
                <div className="bg-[#7856FF]/20 border border-[#7856FF]/40 p-5 rounded-2xl flex items-start mt-6 backdrop-blur-md">
                    <Star className="w-5 h-5 text-[#c8a2ff] mt-0.5 mr-4 shrink-0 fill-[#c8a2ff]/20" />
                    <div>
                        <p className="text-[15px] font-bold text-white mb-1">AI Analysis Active</p>
                        <p className="text-[13px] text-white/70 leading-relaxed">Cross-referencing stated skills with project description...</p>
                    </div>
                </div>
            )}
        </div>
    </div>
);

const PreferencesStep = ({ data, updateData }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="text-left mb-8">
            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Availability & Preferences</h3>
            <p className="text-white/60">Help us match you with the right teams.</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg mb-6">
            <label className="block text-[15px] font-bold text-white mb-4">Hours per week</label>
            <input type="range" min="0" max="40" step="5" value={data.preferences?.hours || 10} onChange={e => updateData('preferences', { ...data.preferences, hours: parseInt(e.target.value) })} className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#a993ff]" />
            <div className="text-center mt-4 text-[15px] font-bold text-white tracking-widest uppercase">{data.preferences?.hours || 10} hrs/week</div>
        </div>
        <div className="space-y-6">
            <div>
                <label className="block text-[15px] font-bold text-white mb-3">Preferred Team Role</label>
                <div className="flex space-x-3">
                    {['Leader', 'Contributor', 'Flexible'].map(role => (
                        <button key={role} onClick={() => updateData('preferences', { ...data.preferences, role })}
                            className={`flex-1 py-3.5 rounded-xl text-[14px] font-bold transition-all border ${data.preferences?.role === role ? 'bg-white text-[#100033] border-white' : 'bg-transparent text-white/50 border-white/20 hover:border-white/50 hover:text-white'}`}>
                            {role}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-[15px] font-bold text-white mb-3">Participation Type</label>
                <div className="flex space-x-3">
                    {['In-Person', 'Online', 'Both'].map(type => (
                        <button key={type} onClick={() => updateData('preferences', { ...data.preferences, type })}
                            className={`flex-1 py-3.5 rounded-xl text-[14px] font-bold transition-all border ${data.preferences?.type === type ? 'bg-white text-[#100033] border-white' : 'bg-transparent text-white/50 border-white/20 hover:border-white/50 hover:text-white'}`}>
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileBuilder() {
    const { user, refreshUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        basicInfo: { full_name: '', username: '', city: '', bio: '', avatar_url: '' },
        skills: {},
        links: {},
        competitions: [],
        featuredProject: {},
        preferences: { hours: 10, role: 'Flexible', type: 'Both' }
    });

    // Pre-fill from auth user once loaded
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                basicInfo: {
                    full_name: user.full_name || '',
                    username: user.username || '',
                    city: user.city || '',
                    bio: user.bio || '',
                    avatar_url: user.avatar_url || '',
                }
            }));
        }
    }, [user]);

    const updateData = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    const handleNext = () => {
        if (step === 1 && !formData.basicInfo?.username) { alert('Username is required.'); return; }
        setStep(s => Math.min(s + 1, 6));
    };
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const buildPayload = () => ({
        full_name:     formData.basicInfo.full_name,
        username:      formData.basicInfo.username?.toLowerCase(),
        city:          formData.basicInfo.city,
        bio:           formData.basicInfo.bio,
        avatar_url:    formData.basicInfo.avatar_url,
        headline:      '',
        website_url:   formData.links.github || '',
        linkedin_url:  formData.links.linkedin || '',
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.put('/profile/me', buildPayload());

            // Save past competitions if any
            for (const comp of formData.competitions) {
                if (comp.name) {
                    await api.post('/profile/past-competitions', comp).catch(() => {});
                }
            }

            // Save featured project if filled
            if (formData.featuredProject?.title) {
                await api.post('/profile/projects', {
                    title: formData.featuredProject.title,
                    description: formData.featuredProject.description,
                    link: formData.featuredProject.link,
                }).catch(() => {});
            }

            await refreshUser();
            navigate('/discover');
        } catch (error) {
            alert('Error saving profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setLoading(true);
        try {
            if (formData.basicInfo.username) {
                await api.put('/profile/me', buildPayload()).catch(() => {});
            }
            await refreshUser();
            navigate('/discover');
        } catch {
            navigate('/discover');
        } finally {
            setLoading(false);
        }
    };

    const STEP_TITLES = ['Basic Info', 'Skills', 'Links', 'Competitions', 'Project', 'Preferences'];

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!user) { navigate('/login'); return null; }

    return (
        <div className="min-h-screen flex items-center justify-center font-sans relative overflow-x-hidden selection:bg-[#7856FF] selection:text-white pb-8 pt-8">
            <style>{`
                .glass-card { backdrop-filter: blur(10px); background: linear-gradient(rgba(17, 0, 51, 0.2) 0%, rgb(16, 0, 51) 100%); box-shadow: rgba(46, 22, 112, 0.3) 0px 10px 40px 0px; }
                .glass-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: white; }
                .glass-input::placeholder { color: rgba(255,255,255,0.4); }
                .glass-input:focus { outline: none; border-color: rgba(255,255,255,0.8); box-shadow: 0 0 0 2px rgba(255,255,255,0.2); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <LoginShader />

            <div className="w-full max-w-[1280px] h-[92vh] min-h-[740px] mx-auto relative z-10 px-4 sm:px-8">
                <div className="glass-card w-full h-full rounded-[30px] sm:rounded-[40px] border border-white/20 flex flex-col lg:flex-row overflow-hidden relative">

                    {/* Scroll indicator */}
                    <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-30 hidden lg:flex flex-col items-center py-20">
                        <div className="relative w-[2px] h-full bg-white/10 rounded-full">
                            <div className="absolute top-0 left-0 w-full bg-white/40 rounded-full transition-all duration-[600ms] ease-out" style={{ height: `${((step - 1) / 5) * 100}%` }}></div>
                            <div className="absolute left-1/2 w-[3px] h-[60px] bg-white rounded-full transition-all duration-[600ms] ease-out shadow-[0_0_15px_3px_rgba(255,255,255,0.8)]" style={{ top: `${((step - 1) / 5) * 100}%`, transform: `translate(-50%, -${((step - 1) / 5) * 100}%)` }}></div>
                        </div>
                    </div>

                    {/* Left visual */}
                    <div className="hidden lg:flex w-[45%] h-full relative p-6">
                        <div className="w-full h-full rounded-[24px] relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #fafafa 0%, #fff0ed 14%, #ffbfb1 36%, #9074ff 67%, #5f41cf 100%)' }}>
                            <div className="absolute inset-0 m-4 rounded-[16px] backdrop-blur-[3px] border-[1.2px] border-white/80">
                                <div className="absolute inset-0 m-4 rounded-[12px] flex items-center justify-center">
                                    <img src="/computer2.png" alt="Mockup" className="w-[120%] max-w-[150%] h-auto object-contain z-10 mt-10" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right form */}
                    <div className="flex-1 flex flex-col h-full relative z-20 overflow-y-auto no-scrollbar">
                        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-10 max-w-[700px] mx-auto w-full">

                            {/* Mobile step indicator */}
                            <div className="lg:hidden mb-8">
                                <div className="flex justify-between text-[11px] font-bold text-white/50 mb-2 uppercase tracking-wider">
                                    <span>Step {step} of 6</span>
                                    <span>{STEP_TITLES[step - 1]}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${(step / 6) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="min-h-[400px]">
                                {step === 1 && <BasicInfoStep data={formData} updateData={updateData} />}
                                {step === 2 && <SkillsStep data={formData} updateData={updateData} />}
                                {step === 3 && <LinkedProfilesStep data={formData} updateData={updateData} />}
                                {step === 4 && <CompetitionsStep data={formData} updateData={updateData} />}
                                {step === 5 && <FeaturedProjectStep data={formData} updateData={updateData} />}
                                {step === 6 && <PreferencesStep data={formData} updateData={updateData} />}
                            </div>

                            <div className="mt-12 flex items-center justify-between pt-6 border-t border-white/10">
                                <button onClick={handlePrev} disabled={step === 1} className="flex items-center text-sm font-semibold text-white/50 hover:text-white disabled:opacity-0 transition-colors">
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                                </button>
                                <div className="flex items-center gap-4">
                                    <button onClick={handleSkip} disabled={loading} type="button" className="text-sm font-medium text-white/60 hover:text-white transition-colors underline-offset-4 hover:underline mr-2">
                                        Skip for now
                                    </button>
                                    {step < 6 ? (
                                        <button onClick={handleNext} className="flex items-center bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-md transition-all">
                                            Continue <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    ) : (
                                        <button onClick={handleSubmit} disabled={loading} className="flex items-center bg-white text-[#100033] hover:bg-gray-100 px-8 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70">
                                            {loading ? 'Saving...' : 'Complete Profile'} <Check className="w-4 h-4 ml-2 border border-[#100033] rounded-full p-0.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}