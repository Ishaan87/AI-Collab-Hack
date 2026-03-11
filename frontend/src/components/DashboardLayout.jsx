import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Compass, Users, Target, LayoutDashboard, User, LogIn, Briefcase, Activity, PlusSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, profile } = useAuth();

    const routes = [
        { name: 'Discover', path: '/discover', icon: Compass },
        { name: 'Smart Match', path: '/smart-match', icon: Users },
        { name: 'My Teams', path: '/my-teams', icon: Target },
        { name: 'Sponsored Challenges', path: '/sponsored', icon: Briefcase },
        { name: 'My recommendations', path: '/recommendations', icon: LayoutDashboard },
        { name: 'Host', path: '/host', icon: PlusSquare },
        { name: 'My activity', path: '/activity', icon: Activity },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="w-[280px] bg-white border-r border-[#E5E7EB] h-screen fixed top-0 left-0 flex flex-col p-6 shadow-[1px_0_0_0_rgba(0,0,0,0.02)] z-10 transition-all font-sans">
            <div className="flex items-center space-x-3 mb-10 mt-2 pl-1">
                <div className="bg-gradient-to-br from-[#7856FF] to-[#00C2FF] text-white w-9 h-9 rounded-xl shadow-md shrink-0 flex items-center justify-center font-bold text-xl leading-none">
                    M
                </div>
                <span className="text-2xl font-bold tracking-tight text-[#201F24] leading-none">MERIDIAN</span>
            </div>

            <nav className="flex-1 space-y-[2px]">
                {routes.map((route) => (
                    <NavLink
                        key={route.path}
                        to={route.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3.5 px-3 py-2.5 rounded-xl transition-all font-medium text-[15px] ${isActive
                                ? 'bg-[#E8DDFF] text-[#7856FF]'
                                : 'text-[#5C5C5C] hover:bg-[#FAFAFA]'
                            }`
                        }
                    >
                        <route.icon className={`w-[22px] h-[22px] ${({ isActive }) => isActive ? 'text-[#7856FF]' : 'text-[#8C8C8C]'}`} />
                        <span>{route.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="pt-6 mt-4 border-t border-[#E5E7EB] flex items-center px-2 pb-2">
                {user ? (
                    <div className="flex items-center space-x-4 w-full">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-[#7856FF]/20" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#E8DDFF] text-[#7856FF] flex justify-center items-center text-sm font-bold border border-[#7856FF]/20 shrink-0 uppercase">
                                {profile?.full_name ? profile.full_name.charAt(0) : user.email?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-semibold text-[#201F24] truncate px-1">
                                {profile?.full_name || profile?.username || user.email}
                            </div>
                            <div className="text-[12px] font-medium text-[#5C5C5C] px-1 truncate">
                                {profile?.username ? `@${profile.username}` : 'Member'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" className="flex items-center justify-center w-full space-x-2 py-2.5 bg-[#7856FF] text-white rounded-xl font-semibold text-sm hover:bg-[#6042DD] transition-colors shadow-sm">
                        <LogIn className="w-4 h-4" />
                        <span>Log In / Sign Up</span>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#201F24] flex">
            {/* Sidebar fixed */}
            <Sidebar />

            {/* Main Content Box offset for Sidebar */}
            <div className="ml-[280px] flex-1 flex flex-col min-h-screen">
                <main className="flex-1 p-10 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
