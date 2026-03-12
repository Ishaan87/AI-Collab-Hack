import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AtSign, Phone, MapPin, Camera, ChevronDown, CheckCircle2, Loader2, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function UpdateProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [showMore, setShowMore]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [form, setForm] = useState({
    full_name:     '',
    username:      '',
    mobile_number: '',
    city:          '',
    bio:           '',
    headline:      '',
    avatar_url:    '',
    website_url:   '',
    linkedin_url:  '',
    github_username: '',
  });

  // Pre-fill form with existing data if editing
  useEffect(() => {
    if (user) {
      setForm({
        full_name:     user.full_name     || '',
        username:      user.username      || '',
        mobile_number: user.mobile_number || '',
        city:          user.city          || '',
        bio:           user.bio           || '',
        headline:      user.headline      || '',
        avatar_url:    user.avatar_url    || '',
        website_url:   user.website_url   || '',
        linkedin_url:  user.linkedin_url  || '',
        github_username: user.github_username || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.full_name.trim() || !form.username.trim() || !form.city.trim()) {
      setError('Full name, username, and city are required.');
      return;
    }

    try {
      setSaving(true);
      await api.put('/profile/me', form);
      await refreshUser();
      setSuccess('Profile saved!');
      setTimeout(() => navigate('/discover'), 1000);
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-gray-100 p-8 md:p-12">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            {user?.is_profile_complete ? 'Edit Profile' : 'Finalize Your Profile'}
          </h2>
          <p className="text-gray-500">
            {user?.is_profile_complete
              ? 'Update your details below.'
              : 'We just need a few more details to set up your account.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* REQUIRED FIELDS */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600 mb-4">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">Required Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required type="text" placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required type="text" placeholder="johndoe_01"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="mobile_number"
                    value={form.mobile_number}
                    onChange={handleChange}
                    type="tel" placeholder="+91 00000 00000"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required type="text" placeholder="e.g. Dehradun"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OPTIONAL SECTION */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="flex items-center space-x-2 text-gray-400 hover:text-indigo-600 transition-colors font-medium text-sm"
            >
              <span>{showMore ? 'Hide' : 'Add'} Bio, Headline & Photo (Optional)</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
            </button>

            {showMore && (
              <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Headline</label>
                  <input
                    name="headline"
                    value={form.headline}
                    onChange={handleChange}
                    type="text" placeholder="e.g. Fullstack Developer & AI Enthusiast"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Profile Picture URL</label>
                  <div className="flex items-center space-x-3">
                    {form.avatar_url && (
                      <img src={form.avatar_url} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                    )}
                    {!form.avatar_url && (
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Camera className="w-5 h-5 text-indigo-400" />
                      </div>
                    )}
                    <input
                      name="avatar_url"
                      value={form.avatar_url}
                      onChange={handleChange}
                      type="url" placeholder="https://..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tell us about your technical expertise..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Website URL</label>
                    <input
                      name="website_url"
                      value={form.website_url}
                      onChange={handleChange}
                      type="url" placeholder="https://yoursite.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">GitHub Username</label>
                    <div className="relative">
                      <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="github_username"
                        value={form.github_username}
                        onChange={handleChange}
                        type="text" placeholder="e.g. lovish123"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">LinkedIn URL</label>
                    <input
                      name="linkedin_url"
                      value={form.linkedin_url}
                      onChange={handleChange}
                      type="url" placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-indigo-600 text-white rounded-[1.2rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            {saving ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Saving...</span></> : <span>Save & Continue</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
