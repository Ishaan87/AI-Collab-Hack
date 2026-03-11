import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginShader from '../components/LoginShader';

export default function Login() {
    const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            if (profile !== null) {
                if (profile.profile_completed) {
                    navigate('/discover');
                } else {
                    navigate('/profile/build');
                }
            }
        }

        const hash = window.location.hash;
        if (hash && hash.includes('error=')) {
            const params = new URLSearchParams(hash.substring(1));
            const errorDesc = params.get('error_description');
            if (errorDesc) {
                if (errorDesc.toLowerCase().includes('database error saving new user') || errorDesc.toLowerCase().includes('already registered')) {
                    setErrorMsg("An account with this email already exists using a different sign-in method (e.g., Google). Please log in with that method.");
                } else {
                    setErrorMsg(errorDesc.replace(/\+/g, ' '));
                }
                window.history.replaceState(null, '', window.location.pathname);
            }
        }
    }, [user, navigate, profile, authLoading]);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (isSignUp) {
                if (!username || !email || !password || !fullName) {
                    throw new Error("All fields are required.");
                }
                const { error } = await signUpWithEmail(email, password, username, fullName);
                if (error) throw error;
                navigate('/profile/build');
            } else {
                if (!email || !password) {
                    throw new Error("Email/Username and Password are required.");
                }
                const { error } = await signInWithEmail(email, password);
                if (error) throw error;
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFBFB] flex font-sans relative overflow-x-hidden selection:bg-[#7856FF] selection:text-white ">
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

                {/* Form Column - animates right on mobile/tablet it stays vertical, on large screens it swaps */}
                <div className={`w-full lg:w-1/2 flex flex-col items-center justify-center py-12 lg:py-0 transition-transform duration-700 ease-in-out relative z-20 ${isSignUp ? 'lg:translate-x-full' : 'translate-x-0'}`}>
                    <div className="w-full max-w-[380px] flex flex-col items-center">


                        {/* Heading */}
                        <h1 className="text-[32px] font-medium text-[#1D1D21] tracking-[-0.02em] mb-8 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {isSignUp ? 'Create your account' : 'Log in to your account'}
                        </h1>

                        {errorMsg && (
                            <div className="w-full mb-6 p-4 bg-red-50 text-red-600 text-[14px] rounded-2xl border border-red-100">
                                {errorMsg}
                            </div>
                        )}

                        {/* SSO Buttons */}
                        <div className="w-full flex flex-col sm:flex-row gap-3 mb-8">
                            {/* Google Button */}
                            <button
                                onClick={signInWithGoogle}
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
                                <span className="font-medium text-[15px] tracking-wide" style={{ fontFamily: "'Roboto', sans-serif" }}>Google</span>
                            </button>

                            {/* GitHub Button */}
                            <button
                                onClick={signInWithGithub}
                                type="button"
                                className="flex-1 relative flex items-center justify-center py-[14px] px-4 rounded-[6px] text-white bg-[#24292E] hover:bg-[#1B1F23] transition-colors text-[14px] font-[500]"
                            >
                                <div className="absolute left-2 top-1 bottom-1 text-white flex items-center justify-center px-[8px]">
                                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                                <span className="font-medium text-[15px] tracking-wide" style={{ fontFamily: "'Roboto', sans-serif" }}>GitHub</span>
                            </button>
                        </div>

                        <div className="w-full flex items-center mb-8">
                            <div className="flex-1 border-t border-[#E5E5E5]"></div>
                            <span className="px-5 text-[12px] text-[#A3A3A3]">or</span>
                            <div className="flex-1 border-t border-[#E5E5E5]"></div>
                        </div>

                        <form className="w-full flex flex-col gap-6" onSubmit={handleEmailAuth}>
                            {isSignUp && (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-[500] text-[#1D1D21] ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full h-[52px] px-5 bg-white border border-[#E5E5E5] rounded-[30px] text-[15px] focus:outline-none focus:border-[#7856FF] focus:ring-1 focus:ring-[#7856FF] transition-all placeholder-[#A3A3A3] shadow-sm"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-[500] text-[#1D1D21] ml-1">Username</label>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                                            className="w-full h-[52px] px-5 bg-white border border-[#E5E5E5] rounded-[30px] text-[15px] focus:outline-none focus:border-[#7856FF] focus:ring-1 focus:ring-[#7856FF] transition-all placeholder-[#A3A3A3] shadow-sm"
                                            placeholder="janedoe123"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-[500] text-[#1D1D21] ml-1">
                                    {isSignUp ? 'Email Address' : 'Email'}
                                </label>
                                <input
                                    type={isSignUp ? "email" : "text"}
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[52px] px-5 bg-white border border-[#E5E5E5] rounded-[30px] text-[15px] focus:outline-none focus:border-[#8E6DF8] focus:ring-[3px] focus:ring-[#E8E1FF] transition-all placeholder-[#A3A3A3] shadow-sm"
                                    placeholder="e.g. eleanor@meridian.com"
                                />
                            </div>

                            <div className="flex flex-col gap-2 relative">
                                <label className="text-[14px] font-[500] text-[#1D1D21] ml-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-[52px] px-5 bg-white border border-[#E5E5E5] rounded-[30px] text-[15px] focus:outline-none focus:border-[#8E6DF8] focus:ring-[3px] focus:ring-[#E8E1FF] transition-all placeholder-[#A3A3A3] shadow-sm font-mono tracking-widest text-[#1D1D21]"
                                    placeholder="••••••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 h-[52px] rounded-[30px] text-[15px] font-[600] text-white bg-[#8E6DF8] hover:bg-[#7d5de8] focus:outline-none focus:ring-[3px] focus:ring-[#E8E1FF] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(142,109,248,0.25)]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {loading ? 'Processing...' : 'Continue'}
                            </button>
                        </form>

                        <div className="mt-8 text-[13px] text-white font-medium text-center">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                            {' '}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="font-semibold text-black hover:text-gray-700 transition-all"
                            >
                                {isSignUp ? 'Log In' : 'Sign Up'}
                            </button>
                        </div>

                        {!isSignUp && (
                            <div className="mt-8 w-full max-w-[280px] space-y-2 text-center">
                                <p className="text-[12px] text-white">
                                    Having trouble logging in? <a href="#" className="font-semibold text-[#000000] hover:text-gray-700">Click here</a> to set up a new password.
                                </p>
                                <p className="text-[12px] text-white">
                                    If you need help <a href="mailto:support@meridian.com" className="font-semibold text-[#000000] hover:text-gray-700">contact support</a>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Featured Banner Content - animates left on large screens to swap positions */}
                <div className={`hidden lg:flex lg:w-1/2 items-center justify-center p-8 lg:p-12 h-screen max-h-[900px] transition-transform duration-700 ease-in-out relative z-10 ${isSignUp ? 'lg:-translate-x-full' : 'translate-x-0'}`}>
                    <div className="w-full h-full max-w-[580px] bg-white border border-[#EBEBEB] shadow-[0_24px_64px_rgba(0,0,0,0.06)] rounded-[32px] flex flex-col items-center relative overflow-hidden group">

                        {/* Display for Log In Mode */}
                        <div className={`absolute inset-0 flex flex-col items-center pt-16 px-12 pb-12 transition-opacity duration-300 ${isSignUp ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            {/* MXP Pill */}
                            <div className="bg-[#E4D9FF] text-[#5A3EB2] text-[13px] font-[600] tracking-wide px-5 py-[6px] rounded-full mb-8">
                                MERIDIAN 2026
                            </div>

                            <h2 className="text-[36px] leading-[1.1] font-medium text-center text-[#111111] mb-6 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Where product innovation<br />meets progress
                            </h2>

                            <p className="text-[15px] leading-relaxed text-[#5C5C5C] text-center max-w-[400px] mb-16">
                                Join us for a conference focused on growing your product and broadening digital analytics knowledge.
                            </p>

                            {/* Floating image arrangement */}
                            <div className="relative w-full h-[240px] mt-auto flex justify-center items-center">
                                <img src="/computer.png" alt="Featured mockup" className="w-[85%] h-auto object-contain hover:scale-105 transition-all duration-500 mb-10" />
                            </div>
                        </div>

                        {/* Full Cover Image Display for Sign Up Mode */}
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
