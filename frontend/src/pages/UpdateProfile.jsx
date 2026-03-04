import React, { useState } from 'react';
import { User, AtSign, Phone, MapPin, Camera, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function UpdateProfile() {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-gray-100 p-8 md:p-12">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Finalize Your Profile</h2>
                    <p className="text-gray-500">We just need a few more details to set up your account.</p>
                </div>

                <form className="space-y-8">
                    {/* REQUIRED FIELDS SECTION */}
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
                                    <input required type="text" placeholder="John Doe" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
                                <div className="relative">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input required type="text" placeholder="johndoe_01" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input required type="tel" placeholder="+91 00000 00000" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input required type="text" placeholder="e.g. Dehradun" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all focus:bg-white" />
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
                            <span>{showMore ? 'Hide' : 'Add'} Bio & Profile Photo (Optional)</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
                        </button>

                        {showMore && (
                            <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Camera className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-indigo-700">Upload a profile picture</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Bio</label>
                                    <textarea rows="3" placeholder="Tell us about your technical expertise..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none focus:bg-white" />
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-4 bg-indigo-600 text-white rounded-[1.2rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                        Save & Continue
                    </button>
                </form>
            </div>
        </div>
    );
}