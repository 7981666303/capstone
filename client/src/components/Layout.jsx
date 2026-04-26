import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    User,
    Users,
    ShieldCheck,
    LogOut,
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Menu,
    Calendar,
    Settings,
    HelpCircle,
    Sun,
    Moon,
    Palette
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LiveStatusRibbon from './LiveStatusRibbon';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    // isCollapsed state removed for app layout
    const { theme, accent, toggleTheme, setAccent } = useTheme();

    // Safely parse user data
    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        console.error('Failed to parse user data', e);
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { path: user.role === 'faculty' ? '/faculty' : '/student', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/profile', name: 'Profile', icon: User },
    ];

    if (user.role === 'faculty' || user.role === 'admin') {
        navItems.push(
            { path: '/analytics', name: 'Analytics', icon: TrendingUp },
            { path: '/generate', name: 'Generate', icon: Palette, section: 'Management' },
            { path: '/student-view', name: 'Student View', icon: Users, section: 'Management' }
        );
    }

    if (user.role === 'admin') {
        navItems.push(
            { path: '/admin-view', name: 'Admin View', icon: ShieldCheck, section: 'Management' }
        );
    }

    const getBreadcrumbs = () => {
        const path = location.pathname.split('/').filter(p => p);
        return path.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
    };

    return (
        <>
                {/* Header / Top Bar */}
                <header className="h-16 bg-bg-card/70 backdrop-blur-xl border-b border-border-main sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 shadow-sm overflow-hidden">
                    <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                        <div className="flex items-center space-x-1 text-slate-400 text-[9px] font-black uppercase tracking-widest truncate">
                            <Link to="/" className="hover:text-brand-500 transition-colors flex-shrink-0">Home</Link>
                            <span className="flex-shrink-0">/</span>
                            <span className="text-[var(--text-main)] opacity-100 truncate max-w-[80px]">{getBreadcrumbs()}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-6 flex-shrink-0">
                        {/* Search hidden on small screens to save space */}
                        <div className="relative hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[11px] font-bold outline-none ring-2 ring-transparent focus:ring-brand-500/10 focus:bg-[var(--bg-card)] text-[var(--text-main)] transition-all w-48"
                            />
                        </div>
                        <div className="flex items-center space-x-0.5">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all dark:hover:bg-slate-800"
                            >
                                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                            </button>

                            <button className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative dark:hover:bg-slate-800">
                                <Bell size={16} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 border-2 border-[var(--bg-card)] rounded-full"></span>
                            </button>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-[var(--border-main)]"></div>
                        <div className="flex items-center space-x-2 cursor-pointer group flex-shrink-0">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-[var(--text-main)] uppercase leading-none mb-0.5 max-w-[70px] truncate">{user.username}</p>
                                <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Faculty</p>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-pink flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform shrink-0">
                                {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Live Status Ribbon Expansion (Phase 2) */}
                <LiveStatusRibbon />

                <main className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="max-w-[1600px] mx-auto"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>


            {/* Universal Bottom Tab Navigation */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-[var(--bg-card)]/90 backdrop-blur-xl border-t border-x border-[var(--border-main)] z-50 flex items-center justify-around px-2 py-3 safe-area-pb md:pb-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)] rounded-t-3xl md:rounded-t-3xl">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                                isActive 
                                    ? 'text-brand-500 bg-brand-500/10' 
                                    : 'text-slate-400 hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                            }`}
                        >
                            <item.icon className={`w-6 h-6 mb-1.5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                            <span className="text-[10px] font-bold">{item.name}</span>
                        </Link>
                    );
                })}
                <button 
                    onClick={handleLogout}
                    className="flex flex-col items-center px-3 py-2 rounded-xl transition-all text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                >
                    <LogOut className="w-6 h-6 mb-1.5 transition-transform" />
                    <span className="text-[10px] font-bold">Logout</span>
                </button>
            </nav>
        </>
    );
};

export default Layout;
