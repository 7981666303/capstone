import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [role, setRole] = useState('faculty'); // 'faculty' or 'student'
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const apiBase = import.meta.env.VITE_API_URL || '';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(
                `${apiBase}/api/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                        role: role
                    }),
                });

            const contentType = response.headers.get('content-type');
            const data = contentType && contentType.includes('application/json')
                ? await response.json()
                : { error: `Server error (${response.status}): ${response.statusText || 'Unexpected response'}` };

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate(data.user.role === 'faculty' ? '/faculty' : '/student');
            } else {
                setError(data.error || 'Authentication failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex-1 flex flex-col p-6 font-sans overflow-hidden transition-all duration-700 relative ${role === 'student'
            ? 'bg-gradient-to-br from-[#EEF2FF] via-[#E0E7FF] to-[#C7D2FE] dark:from-slate-900 dark:via-brand-900/20 dark:to-slate-900'
            : 'bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DDD6FE] dark:from-slate-900 dark:via-violet-900/20 dark:to-slate-900'
            }`}>

            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10">
                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 mx-auto bg-brand-500 rounded-2xl flex items-center justify-center font-black italic text-4xl text-white shadow-xl shadow-brand-500/30 mb-4">
                        S
                    </div>
                    <h1 className="font-black tracking-tight text-3xl text-slate-800 dark:text-white">
                        Smart<span className="text-brand-500">Class</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Welcome Back</p>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full mb-8 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex-1 py-3 rounded-full text-sm font-black transition-all duration-500 ${role === 'student'
                            ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25'
                            : 'text-slate-500 dark:text-slate-400 hover:text-brand-500'
                            }`}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('faculty')}
                        className={`flex-1 py-3 rounded-full text-sm font-black transition-all duration-500 ${role === 'faculty'
                            ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25'
                            : 'text-slate-500 dark:text-slate-400 hover:text-violet-500'
                            }`}
                    >
                        Teacher
                    </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50">
                    {error && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-[11px] font-black text-center animate-shake uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-700 dark:text-white text-sm font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                placeholder="jondoe32@gmail.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-700 dark:text-white text-sm font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                placeholder="••••••••••••"
                            />
                        </div>
                        <div className="text-right pt-1">
                            <a href="#" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${role === 'student' ? 'text-brand-500 hover:text-brand-600' : 'text-violet-500 hover:text-violet-600'}`}>Forgot Password?</a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl mt-2 transition-all active:scale-[0.98] flex items-center justify-center group overflow-hidden relative ${role === 'student'
                            ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-brand-500/25'
                            : 'bg-gradient-to-r from-violet-500 to-violet-600 shadow-violet-500/25'
                            }`}
                    >
                        <span className="relative z-10 flex items-center">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Log in
                                    <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
