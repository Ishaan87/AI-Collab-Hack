import React from 'react';
import { Hexagon, Github } from 'lucide-react';

export default function Onboard() {
    const handleOAuth = (provider) => {
        // Redirect browser to backend OAuth route — passport handles the rest
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${base}/auth/${provider}`;
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400 blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500 blur-[120px]"></div>
                </div>
                
                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl mb-8 border border-white/20">
                        <Hexagon className="w-12 h-12 text-white fill-white/20" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">NEXUS AI</h1>
                    <p className="text-indigo-200 text-xl font-light max-w-md mx-auto">
                        The intelligent engine for STEM team orchestration.
                    </p>
                </div>
            </div>

            {/* Right Side: Auth Buttons */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
                        <p className="text-gray-500 mt-2">Sign in to join the collaborative network.</p>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={() => handleOAuth('google')}
                            className="w-full flex items-center justify-center space-x-3 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm font-semibold text-gray-700"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        <button 
                            onClick={() => handleOAuth('github')}
                            className="w-full flex items-center justify-center space-x-3 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all duration-200 shadow-md font-semibold"
                        >
                            <Github className="w-5 h-5" />
                            <span>Continue with GitHub</span>
                        </button>
                    </div>

                    <p className="mt-10 text-center text-xs text-gray-400">
                        By continuing, you agree to Nexus AI's Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}