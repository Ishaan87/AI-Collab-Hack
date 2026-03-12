import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginShader from '../components/LoginShader';

export default function Onboard() {
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();

    const handleOAuth = (provider) => {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${base}/auth/${provider}`;
    };

    return (
        <div className="min-h-screen bg-[#FBFBFB] flex font-sans relative overflow-x-hidden selection:bg-[#7856FF] selection:text-white">
            <style>{`
                @keyframes popImage {
                    0% { transform: scale(0.85); opacity: 0; }
                    60% { transform: scale(1.02); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop-delayed {
                    animation: popImage 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.7s both;
                }
            `}</style>

            {/* Background Shader */}
            <LoginShader />

            <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-screen relative z-10 px-6 sm:px-12 lg:px-24 mt-20 mb-20">

                {/* ── Form Column ── animates right when switching to sign-up */}
                <div className={`w-full lg:w-1/2 flex flex-col items-center justify-center py-12 lg:py-0 transition-transform duration-700 ease-in-out relative z-20 ${isSignUp ? 'lg:translate-x-full' : 'translate-x-0'}`}>
                    <div className="w-full max-w-[380px] flex flex-col items-center">

                        {/* Heading */}
                        <h1
                            className="text-[32px] font-medium text-[#1D1D21] tracking-[-0.02em] mb-8 text-center"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            {isSignUp ? 'Create your account' : 'Log in to your account'}
                        </h1>

                        {/* SSO Buttons */}
                        <div className="w-full flex flex-col sm:flex-row gap-3 mb-8">
                            {/* Google */}
                            <button
                                onClick={() => handleOAuth('google')}
                                type="button"
                                className="flex-1 relative flex items-center justify-center py-[14px] px-4 rounded-[6px] text-white bg-[#1a73e8] hover:bg-[#1557b0] transition-colors text-[14px] font-[500]"
                            >
                                <div className="absolute left-1 top-1 bottom-1 bg-white rounded-[4px] flex items-center justify-center px-[8px]">
                                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <span className="font-medium text-[15px] tracking-wide" style={{ fontFamily: "'Roboto', sans-serif" }}>
                                    Google
                                </span>
                            </button>

                            {/* GitHub */}
                            <button
                                onClick={() => handleOAuth('github')}
                                type="button"
                                className="flex-1 relative flex items-center justify-center py-[14px] px-4 rounded-[6px] text-white bg-[#24292E] hover:bg-[#1B1F23] transition-colors text-[14px] font-[500]"
                            >
                                <div className="absolute left-2 top-1 bottom-1 text-white flex items-center justify-center px-[8px]">
                                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                                <span className="font-medium text-[15px] tracking-wide" style={{ fontFamily: "'Roboto', sans-serif" }}>
                                    GitHub
                                </span>
                            </button>
                        </div>

                        {/* Toggle sign-in / sign-up */}
                        <div className="mt-2 text-[13px] text-[#666] font-medium text-center">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            {' '}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="font-semibold text-[#8E6DF8] hover:text-[#7d5de8] transition-all"
                            >
                                {isSignUp ? 'Log In' : 'Sign Up'}
                            </button>
                        </div>

                        {!isSignUp && (
                            <div className="mt-8 w-full max-w-[280px] space-y-2 text-center">
                                <p className="text-[12px] text-[#999]">
                                    Having trouble logging in?{' '}
                                    <a href="#" className="font-semibold text-[#8E6DF8] hover:text-[#7d5de8]">
                                        Click here
                                    </a>{' '}
                                    to get help.
                                </p>
                                <p className="text-[12px] text-[#999]">
                                    Need support?{' '}
                                    <a href="mailto:support@meridian.com" className="font-semibold text-[#8E6DF8] hover:text-[#7d5de8]">
                                        Contact us
                                    </a>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Featured Banner Column ── animates left on sign-up */}
                <div className={`hidden lg:flex lg:w-1/2 items-center justify-center p-8 lg:p-12 h-screen max-h-[900px] transition-transform duration-700 ease-in-out relative z-10 ${isSignUp ? 'lg:-translate-x-full' : 'translate-x-0'}`}>
                    <div className="w-full h-full max-w-[580px] bg-white border border-[#EBEBEB] shadow-[0_24px_64px_rgba(0,0,0,0.06)] rounded-[32px] flex flex-col items-center relative overflow-hidden">

                        {/* Login Mode Content */}
                        <div className={`absolute inset-0 flex flex-col items-center pt-16 px-12 pb-12 transition-opacity duration-300 ${isSignUp ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            {/* Pill badge */}
                            <div className="bg-[#E4D9FF] text-[#5A3EB2] text-[13px] font-[600] tracking-wide px-5 py-[6px] rounded-full mb-8">
                                COLLABHACK 2026
                            </div>

                            <h2
                                className="text-[36px] leading-[1.1] font-medium text-center text-[#111111] mb-6 tracking-tight"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                Where product innovation<br />meets progress
                            </h2>

                            <p className="text-[15px] leading-relaxed text-[#5C5C5C] text-center max-w-[400px] mb-16">
                                Join us for a conference focused on growing your product and broadening digital analytics knowledge.
                            </p>

                            {/* Decorative image */}
                            <div className="relative w-full h-[240px] mt-auto flex justify-center items-center">
                                <img
                                    src="/computer.png"
                                    alt="Featured mockup"
                                    className="w-[85%] h-auto object-contain hover:scale-105 transition-all duration-500 mb-10"
                                />
                            </div>
                        </div>

                        {/* Sign Up Mode — full cover image */}
                        <div className={`absolute inset-0 w-full h-full bg-black/5 flex items-center justify-center transition-opacity duration-300 ${isSignUp ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none'}`}>
                            {isSignUp && (
                                <img
                                    src="/great.webp"
                                    alt="Sign up artwork"
                                    className="w-full h-full object-cover animate-pop-delayed"
                                />
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}