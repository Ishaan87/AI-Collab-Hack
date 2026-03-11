import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 10);

            // Check if navbar is over any dark section
            const darkSections = document.querySelectorAll('.bg-black');
            let overDark = false;
            const navHeight = 88;

            darkSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                // Check if the bottom of the navbar overlaps with the section
                if (rect.top <= navHeight && rect.bottom >= navHeight / 2) {
                    overDark = true;
                }
            });
            setIsDark(overDark);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinkClass = `flex items-center gap-1.5 text-base font-medium px-3.5 py-2.5 rounded-xl transition-colors ${isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100/60'
        }`;

    return (
        <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isDark
            ? 'bg-black/80 backdrop-blur-[10px] border-b border-white/10'
            : (scrolled ? 'bg-[#fbfaf9e6] backdrop-blur-[10px] border-b border-[#0000000a]' : 'bg-transparent')
            }`}>
            <div className="max-w-[1440px] mx-auto px-6 h-[88px] flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#111]'}`}>
                        MERIDIAN
                    </span>
                </Link>

                <div className="hidden lg:flex items-center gap-2">
                    <button className={navLinkClass}>
                        Product
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M7.39485 11.7437C7.72955 12.0854 8.27312 12.0854 8.60783 11.7437L13.749 6.49473C14.0837 6.153 14.0837 5.59803 13.749 5.2563C13.4143 4.91457 12.8707 4.91457 12.536 5.2563L8 9.88742L3.46402 5.25903C3.12931 4.9173 2.58574 4.9173 2.25103 5.25903C1.91632 5.60076 1.91632 6.15573 2.25103 6.49746L7.39217 11.7464L7.39485 11.7437Z" fill="currentColor"></path></svg>
                    </button>
                    <button className={navLinkClass}>
                        Why us
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M7.39485 11.7437C7.72955 12.0854 8.27312 12.0854 8.60783 11.7437L13.749 6.49473C14.0837 6.153 14.0837 5.59803 13.749 5.2563C13.4143 4.91457 12.8707 4.91457 12.536 5.2563L8 9.88742L3.46402 5.25903C3.12931 4.9173 2.58574 4.9173 2.25103 5.25903C1.91632 5.60076 1.91632 6.15573 2.25103 6.49746L7.39217 11.7464L7.39485 11.7437Z" fill="currentColor"></path></svg>
                    </button>
                    <Link to="#" className={navLinkClass}>Customers</Link>
                    <Link to="#" className={navLinkClass}>Pricing</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/login" className={`hidden lg:flex px-5 py-2.5 text-[15px] font-medium border rounded-[14px] transition-colors shadow-sm ${isDark
                        ? 'text-white border-white/20 hover:bg-white/10'
                        : 'text-gray-900 border-gray-300/80 hover:bg-gray-50'
                        }`}>Login</Link>
                    <Link to="/login" state={{ signup: true }} className={`px-6 py-3 text-[15px] font-medium rounded-[14px] transition-colors shadow-sm flex items-center gap-2 tracking-wide border ${isDark
                        ? 'bg-white text-black border-white hover:bg-gray-200'
                        : 'bg-[#111] text-white border-[#111] hover:bg-gray-800'
                        }`}>
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
