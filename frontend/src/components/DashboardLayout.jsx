import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Compass, Users, Target, LayoutDashboard, User, LogIn,
    Briefcase, Activity, PlusSquare, ChevronLeft, ChevronRight,
    ChevronDown, Sun, Moon, Search, Settings, Bell, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../pages/NotificationBell';

/* ─────────────────────────────────────────────
   Route / Section config
───────────────────────────────────────────── */
const navSections = [
    {
        title: 'Navigation',
        key: 'nav',
        items: [
            { name: 'Discover', path: '/discover', icon: Compass },
            // { name: 'Smart Match', path: '/smart-match', icon: Users },
        ],
    },
    {
        title: 'Team',
        key: 'team',
        items: [
            { name: 'My Teams', path: '/my-teams', icon: Target },
            { name: 'Sponsored Challenges', path: '/sponsored', icon: Briefcase },
            { name: 'Host', path: '/competitions/new', icon: PlusSquare },
        ],
    },
    {
        title: 'Personal',
        key: 'personal',
        items: [
            { name: 'My Recommendations', path: '/recommendations', icon: LayoutDashboard },
            { name: 'My Activity', path: '/activity', icon: Activity },
            { name: 'Profile', path: '/profile', icon: User },
        ],
    },
];

/* ─────────────────────────────────────────────
   Tooltip (used in collapsed state)
───────────────────────────────────────────── */
function Tooltip({ label, children }) {
    const [show, setShow] = useState(false);
    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="
                    absolute left-full ml-3 px-3 py-1.5 rounded-lg text-[13px] font-semibold
                    whitespace-nowrap z-50 pointer-events-none
                    shadow-lg border
                    bg-white text-[#111] border-[#e5e5e3]
                    dark:bg-[#1e1e1e] dark:text-[#f5f5f4] dark:border-[#2e2e2e]
                ">
                    {label}
                    <div className="
                        absolute right-full top-1/2 -translate-y-1/2
                        border-4 border-transparent border-r-white
                        dark:border-r-[#1e1e1e]
                    " />
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Nav Item
───────────────────────────────────────────── */
function NavItem({ item, collapsed }) {
    const Icon = item.icon;
    const linkContent = (active) => (
        <span className={`
            group relative flex items-center gap-3 px-3 py-[9px] rounded-lg
            transition-all duration-150 cursor-pointer text-[14px] font-medium
            ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'w-full'}
            ${active
                ? 'text-[#7856FF] dark:text-[#c4b5fd]'
                : 'text-[#444] hover:text-[#111] dark:text-[#9ca3af] dark:hover:text-[#f5f5f4]'
            }
        `}>
            {/* Left active accent bar */}
            <span className={`
                absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200
                ${active ? 'h-5 bg-[#7856FF] dark:bg-[#c4b5fd]' : 'h-0 bg-transparent'}
            `} />

            {/* Hover / active background */}
            <span className={`
                absolute inset-0 rounded-lg transition-all duration-150
                ${active
                    ? 'bg-[#ede9fe] dark:bg-[#2d2560]'
                    : 'bg-transparent group-hover:bg-[#f5f3f0] dark:group-hover:bg-[#27272a]'
                }
            `} />

            <Icon className={`relative z-10 shrink-0 w-[18px] h-[18px] ${active ? 'text-[#7856FF] dark:text-[#c4b5fd]' : ''}`} />

            {!collapsed && (
                <span className="relative z-10 truncate">{item.name}</span>
            )}
        </span>
    );

    return (
        <NavLink to={item.path} className="block w-full">
            {({ isActive }) =>
                collapsed
                    ? <Tooltip label={item.name}>{linkContent(isActive)}</Tooltip>
                    : linkContent(isActive)
            }
        </NavLink>
    );
}

/* ─────────────────────────────────────────────
   Section
───────────────────────────────────────────── */
function NavSection({ section, collapsed }) {
    const [open, setOpen] = useState(true);
    const location = useLocation();
    const hasActive = section.items.some(i => location.pathname === i.path);

    return (
        <div className="mb-1">
            {/* Section header — hidden when sidebar is collapsed */}
            {!collapsed && (
                <button
                    onClick={() => setOpen(o => !o)}
                    className="
                        flex items-center justify-between w-full px-3 py-1.5 mb-0.5
                        text-[11px] font-semibold uppercase tracking-widest
                        text-[#999] dark:text-[#666]
                        hover:text-[#444] dark:hover:text-[#aaa]
                        transition-colors group
                    "
                >
                    <span className="flex items-center gap-1.5">
                        {hasActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7856FF] dark:bg-[#c4b5fd]" />
                        )}
                        {section.title}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
                </button>
            )}

            {/* Items — always shown in collapsed mode; toggle-able when expanded */}
            <div className={`
                overflow-hidden transition-all duration-200
                ${collapsed ? 'flex flex-col items-center gap-0.5' : ''}
                ${!collapsed && !open ? 'max-h-0' : 'max-h-[500px]'}
            `}>
                {section.items.map(item => (
                    <NavItem key={item.path} item={item} collapsed={collapsed} />
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   User Footer (avatar row + settings popover)
───────────────────────────────────────────── */
function UserFooter({ user, profile, collapsed }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        navigate('/login');
    };

    const avatar = profile?.avatar_url
        ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-[#ede9fe] dark:bg-[#312e81] text-[#7856FF] dark:text-[#c4b5fd] flex items-center justify-center text-sm font-bold uppercase">
            {(profile?.full_name || profile?.username || user?.email || 'U').charAt(0)}
        </div>;

    return (
        <div
            ref={ref}
            className={`
                relative shrink-0 border-t border-[#e5e5e3] dark:border-[#2a2a2a]
                ${collapsed ? 'p-2 flex flex-col items-center gap-1.5' : 'px-3 py-3'}
            `}
        >
            {/* Popover menu */}
            {open && user && (
                <div className={`
                    absolute bottom-full mb-2 z-50
                    ${collapsed ? 'left-full ml-2' : 'left-3 right-3'}
                    bg-white dark:bg-[#1a1a1a] border border-[#e5e5e3] dark:border-[#2e2e2e]
                    rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden
                `}>
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-[#f0ede9] dark:border-[#2a2a2a]">
                        <div className="text-[13px] font-semibold text-[#111] dark:text-[#f5f5f4] truncate">
                            {profile?.full_name || profile?.username || user.email}
                        </div>
                        <div className="text-[11px] text-[#888] dark:text-[#555] truncate mt-0.5">
                            {user.email}
                        </div>
                    </div>
                    {/* Menu items */}
                    <div className="py-1.5">
                        <Link
                            to="/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-[13px] text-[#333] dark:text-[#ccc] hover:bg-[#f7f5f3] dark:hover:bg-[#252525] transition-colors"
                        >
                            <User className="w-4 h-4 text-[#888]" />
                            Profile
                        </Link>
                        <Link
                            to="/settings"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-[13px] text-[#333] dark:text-[#ccc] hover:bg-[#f7f5f3] dark:hover:bg-[#252525] transition-colors"
                        >
                            <Settings className="w-4 h-4 text-[#888]" />
                            Settings
                        </Link>
                        <div className="mx-3 my-1 border-t border-[#f0ede9] dark:border-[#2a2a2a]" />
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Log out
                        </button>
                    </div>
                </div>
            )}

            {user ? (
                collapsed ? (
                    <div className="flex flex-col items-center gap-1.5">
                        <Tooltip label={profile?.full_name || profile?.username || user.email}>
                            <button
                                onClick={() => setOpen(v => !v)}
                                className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#7856FF]/30 hover:ring-[#7856FF]/60 transition-all"
                            >
                                {avatar}
                            </button>
                        </Tooltip>
                        <Tooltip label="Log out">
                            <button
                                onClick={handleLogout}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-all"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </Tooltip>
                    </div>
                ) : (
                    <button
                        onClick={() => setOpen(v => !v)}
                        className="w-full flex items-center gap-3 px-1 py-1.5 rounded-xl hover:bg-[#f0ede9] dark:hover:bg-[#1e1e1e] transition-colors cursor-pointer group"
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#7856FF]/20 group-hover:ring-[#7856FF]/40 transition-all shrink-0">
                            {avatar}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-[13px] font-semibold text-[#111] dark:text-[#f5f5f4] truncate leading-tight">
                                {profile?.full_name || profile?.username || user.email}
                            </div>
                            <div className="text-[11px] text-[#888] dark:text-[#666] truncate">
                                {profile?.username ? `@${profile.username}` : 'Member'}
                            </div>
                        </div>
                        <Settings className="w-4 h-4 text-[#aaa] dark:text-[#555] group-hover:text-[#666] dark:group-hover:text-[#999] shrink-0 transition-colors" />
                    </button>
                )
            ) : (
                collapsed ? (
                    <Tooltip label="Log In / Sign Up">
                        <Link to="/login" className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7856FF] to-[#E8400D] text-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                            <LogIn className="w-4 h-4" />
                        </Link>
                    </Tooltip>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#7856FF] to-[#E8400D] text-white rounded-xl font-semibold text-[13px] hover:opacity-90 active:opacity-80 transition-opacity shadow-sm"
                    >
                        <LogIn className="w-4 h-4" />
                        Log In / Sign Up
                    </Link>
                )
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Sidebar
───────────────────────────────────────────── */
function Sidebar({ collapsed, setCollapsed }) {
    const { user, profile } = useAuth();

    return (
        <aside className={`
            fixed top-0 left-0 h-screen z-30 flex flex-col
            transition-all duration-300 ease-in-out
            border-r
            bg-[#fcfaf9] border-[#e5e5e3]
            dark:bg-[#141414] dark:border-[#2a2a2a]
            ${collapsed ? 'w-[64px]' : 'w-[260px]'}
        `}>

            {/* ── Logo + Collapse toggle ── */}
            <div className={`
                flex items-center h-[60px] shrink-0 px-3
                border-b border-[#e5e5e3] dark:border-[#2a2a2a]
                ${collapsed ? 'justify-center' : 'justify-between'}
            `}>
                {!collapsed && (
                    <Link to="/" className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[16px] font-bold tracking-tight text-[#111] dark:text-[#f5f5f4] truncate">
                            MERIDIAN
                        </span>
                    </Link>
                )}

                {collapsed && (
                    <Link to="/" className="text-[15px] font-bold tracking-tight text-[#111] dark:text-[#f5f5f4]">
                        M
                    </Link>
                )}

                <button
                    onClick={() => setCollapsed(c => !c)}
                    className={`
                        shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                        text-[#888] dark:text-[#666]
                        hover:bg-[#f0ede9] dark:hover:bg-[#222]
                        hover:text-[#333] dark:hover:text-[#ccc]
                        transition-all duration-150
                        ${collapsed ? 'mx-auto' : ''}
                    `}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed
                        ? <ChevronRight className="w-4 h-4" />
                        : <ChevronLeft className="w-4 h-4" />
                    }
                </button>
            </div>

            {/* ── Search bar (expanded only) ── */}
            {!collapsed && (
                <div className="px-3 py-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f0ede9] dark:bg-[#1e1e1e] border border-[#e5e5e3] dark:border-[#2a2a2a] text-[#888] dark:text-[#555] cursor-text hover:border-[#ccc] dark:hover:border-[#444] transition-colors">
                        <Search className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[13px]">Search…</span>
                        <span className="ml-auto text-[11px] bg-white dark:bg-[#2a2a2a] border border-[#e5e5e3] dark:border-[#333] rounded px-1.5 py-0.5 font-mono">⌘K</span>
                    </div>
                </div>
            )}

            {/* ── Nav sections ── */}
            <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-2 ${collapsed ? 'px-[7px]' : 'px-3'}`}>
                {navSections.map(section => (
                    <NavSection key={section.key} section={section} collapsed={collapsed} />
                ))}
            </nav>

            {/* ── User profile section ── */}
            <UserFooter user={user} profile={profile} collapsed={collapsed} />
        </aside>
    );
}

/* ─────────────────────────────────────────────
   Top bar
───────────────────────────────────────────── */
function TopBar({ collapsed }) {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    // Build breadcrumb from current path
    const allItems = navSections.flatMap(s => s.items);
    const currentPage = allItems.find(i => i.path === location.pathname);

    return (
        <header className={`
            sticky top-0 z-20 h-[60px] flex items-center px-6 gap-4
            border-b transition-all duration-300
            bg-[#fcfaf9]/90 border-[#e5e5e3]
            dark:bg-[#0f0f0f]/90 dark:border-[#2a2a2a]
            backdrop-blur-[10px]
        `}>
            {/* Breadcrumb */}
            <div className="flex-1 flex items-center gap-2 text-[14px] min-w-0">
                <span className="text-[#888] dark:text-[#555] font-medium hidden sm:block">MERIDIAN</span>
                {currentPage && (
                    <>
                        <span className="text-[#ccc] dark:text-[#333] hidden sm:block">/</span>
                        <span className="font-semibold text-[#111] dark:text-[#f5f5f4] truncate">
                            {currentPage.name}
                        </span>
                    </>
                )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <NotificationBell />

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="
                        w-8 h-8 rounded-lg flex items-center justify-center
                        text-[#888] dark:text-[#666]
                        hover:bg-[#f0ede9] dark:hover:bg-[#1e1e1e]
                        hover:text-[#333] dark:hover:text-[#ccc]
                        transition-all
                    "
                    title={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
                >
                    {theme === 'light'
                        ? <Moon className="w-4 h-4" />
                        : <Sun className="w-4 h-4" />
                    }
                </button>
            </div>
        </header>
    );
}

/* ─────────────────────────────────────────────
   Dashboard Layout (default export)
───────────────────────────────────────────── */
export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex bg-[#f7f5f3] dark:bg-[#0f0f0f] text-[#111] dark:text-[#f5f5f4] font-sans transition-colors duration-300">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Main content — offset by sidebar width */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-[64px]' : 'ml-[260px]'}`}>
                <TopBar collapsed={collapsed} />
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
