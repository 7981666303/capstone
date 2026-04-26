import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import {
    Calendar,
    Play,
    CheckCircle2,
    Clock,
    Layers,
    Cpu,
    Check,
    Download,
    Building2,
    GraduationCap,
    Sparkles,
    ArrowRight,
    Search,
    Shield
} from 'lucide-react';

const Generate = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const fetchBatches = async () => {
            console.log('Generate Component: Fetching batches...');
            try {
                const res = await axios.get('/batches');
                console.log('Generate Component: Batches received:', res.data.length);
                setBatches(res.data);
            } catch (err) {
                console.error('Generate Component: Fetch error:', err);
            }
        };
        fetchBatches();
    }, []);

    const handleBatchToggle = (batchId) => {
        setSelectedBatches(prev =>
            prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]
        );
    };

    const handleGenerate = async () => {
        setLoading(true);
        setStep(2);
        try {
            const selectedBatchObjects = batches.filter(b => selectedBatches.includes(b._id));
            const res = await axios.post('/generate', { batches: selectedBatchObjects });
            setResult(res.data);
            setStep(3);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto space-y-8 pb-32 px-4 overflow-x-hidden">
            {/* V2 Algorithmic Header */}
            <div className="text-center space-y-4 pt-8 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-500/10 rounded-full blur-[80px] -z-10 animate-pulse"></div>

                <div className="inline-flex items-center px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black tracking-[0.2em] mb-2 uppercase ring-4 ring-slate-900/5">
                    <Cpu className="w-3 h-3 mr-2 text-brand-400" />
                    Neural Engine Core
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-display italic leading-tight">
                    Algorithm <span className="text-gradient">Synthesis</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">
                    Optimize university resources with our multi-constraint SAT solver.
                </p>
            </div>

            {/* V2 Stepper - Clean & Professional */}
            <div className="flex items-center justify-center space-x-4 mb-8 overflow-x-auto scrollbar-hide py-2">
                {[1, 2, 3].map(s => (
                    <React.Fragment key={s}>
                        <div className="flex flex-col items-center shrink-0">
                            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-lg transition-all duration-700 relative ${step >= s
                                    ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/30 scale-105'
                                    : 'bg-white text-slate-300 border-2 border-slate-100'
                                }`}>
                                {step > s ? <Check className="w-6 h-6" /> : s}
                                {step === s && (
                                    <div className="absolute -inset-1.5 bg-brand-500/10 rounded-[24px] animate-ping opacity-30"></div>
                                )}
                            </div>
                            <span className={`mt-3 text-[8px] font-black uppercase tracking-[0.15em] transition-colors ${step >= s ? 'text-brand-600' : 'text-slate-300'}`}>
                                {s === 1 && 'Config'}
                                {s === 2 && 'Optimize'}
                                {s === 3 && 'Verify'}
                            </span>
                        </div>
                        {s < 3 && <div className={`w-8 h-0.5 rounded-full ${step > s ? 'bg-brand-500' : 'bg-slate-100'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            {/* Step 1: Selection - Professional Grid */}
            {step === 1 && (
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden animate-in zoom-in-95 duration-700">
                    <div className="p-8 bg-slate-50/30 border-b border-slate-100/50 flex flex-col items-center text-center gap-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Configuration Profile</h3>
                            <p className="text-slate-400 font-medium text-sm">Select target cohorts for compute.</p>
                        </div>
                        <div className="flex flex-col w-full gap-4">
                            <div className="px-5 py-3 bg-white border border-slate-200 rounded-xl flex items-center w-full">
                                <Search className="w-4 h-4 text-slate-300 mr-3 shrink-0" />
                                <input type="text" placeholder="Filter..." className="bg-transparent text-sm font-bold focus:outline-none w-full" />
                            </div>
                            <div className="px-5 py-3 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-brand-500/20">
                                {selectedBatches.length} Selected
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 mb-8">
                            {batches.map((batch) => (
                                <button
                                    key={batch._id}
                                    onClick={() => handleBatchToggle(batch._id)}
                                    className={`p-6 rounded-[32px] border-2 text-left transition-all duration-500 group relative overflow-hidden ${selectedBatches.includes(batch._id)
                                            ? 'bg-brand-50 border-brand-500 shadow-xl shadow-brand-500/5'
                                            : 'bg-white border-slate-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-700 shrink-0 ${selectedBatches.includes(batch._id)
                                                ? 'bg-brand-500 text-white'
                                                : 'bg-slate-50 text-slate-400'
                                            }`}>
                                            <Layers size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-lg text-slate-900 truncate uppercase italic leading-none mb-1">{batch.name}</h4>
                                            <div className="flex items-center text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                                                {batch.department}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={selectedBatches.length === 0}
                            onClick={handleGenerate}
                            className={`w-full py-6 rounded-2xl font-black text-lg flex items-center justify-center transition-all shadow-xl active:scale-[0.98] group ${selectedBatches.length > 0
                                    ? 'bg-slate-900 text-white hover:bg-brand-500 shadow-slate-900/20'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                }`}
                        >
                            <Play className="w-5 h-5 mr-3 fill-current" />
                            DEPLOY ENGINE
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Processing - Professional Spinner */}
            {step === 2 && (
                <div className="bg-white rounded-[60px] border border-slate-100 shadow-2xl text-center py-32 animate-in zoom-in-95 duration-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="flex items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            <Clock size={12} className="mr-2" />
                            Est. Time: 4.2s
                        </div>
                    </div>

                    <div className="relative mb-16 inline-block">
                        <div className="w-56 h-56 border-2 border-slate-50 rounded-full mx-auto"></div>
                        <div className="absolute inset-0 w-56 h-56 border-t-8 border-brand-500 rounded-full animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-slate-900 text-brand-400 rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
                            <Cpu className="w-14 h-14 animate-[pulse_1.5s_infinite]" />
                        </div>
                    </div>

                    <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Calibrating Constraints...</h2>
                    <p className="text-slate-400 max-w-lg mx-auto font-bold text-lg leading-relaxed">
                        Solving multi-agent game theory equations to find the most balanced allocation for faculty and students.
                    </p>

                    <div className="mt-20 space-y-6 max-w-md mx-auto px-8">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-brand-600 font-black text-xs uppercase tracking-widest italic">Computing Layer 4</span>
                            <span className="text-slate-900 font-black text-2xl tracking-tighter">72%</span>
                        </div>
                        <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-brand-500 to-accent-pink rounded-full w-[72%] transition-all duration-1000"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Result - High-Impact V2 View */}
            {step === 3 && result && (
                <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white border-none shadow-2xl overflow-hidden relative">
                        <div className="relative z-10 flex flex-col items-center text-center gap-8">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-accent-pink shadow-2xl rounded-[32px] flex items-center justify-center animate-floating">
                                    <CheckCircle2 className="text-white w-14 h-14" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter leading-tight mb-4">Optimization <br /> <span className="text-brand-400 italic">Successful.</span></h2>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Speed</p>
                                            <p className="text-lg font-black text-brand-400">{result.performance?.executionTimeMs}ms</p>
                                        </div>
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Accuracy</p>
                                            <p className="text-lg font-black text-accent-pink">{result.performance?.accuracyRate}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col w-full gap-3">
                                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center">
                                    <Download className="w-5 h-5 mr-3" />
                                    EXPORT ASSETS
                                </button>
                                <button onClick={() => setStep(1)} className="w-full py-4 bg-white/5 border-2 border-white/10 text-white rounded-2xl font-black text-sm hover:bg-white/10">
                                    NEW RECALCULATION
                                </button>
                            </div>
                        </div>
                        {/* Mesh gradient background blur */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {result.schedule?.map((s, idx) => (
                            <div key={idx} className="pro-card group bg-white border-slate-100 hover:border-brand-500 duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="px-5 py-2 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em]">{s.day}</div>
                                    <div className="text-brand-600 font-black text-xs uppercase tracking-widest bg-brand-50 px-4 py-2 rounded-xl group-hover:bg-brand-500 group-hover:text-white transition-colors">{s.slot}</div>
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 mb-6 line-clamp-2 leading-[1.1] tracking-tighter uppercase italic group-hover:text-brand-500 transition-colors">{s.subject.name}</h4>
                                <div className="space-y-5 pt-8 border-t border-slate-50">
                                    <div className="flex items-center text-slate-600 font-black text-xs uppercase tracking-widest">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                                            <Building2 size={20} />
                                        </div>
                                        ROOM {s.classroom.roomNumber || s.classroom.name}
                                    </div>
                                    <div className="flex items-center text-slate-600 font-black text-xs uppercase tracking-widest">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-accent-pink/5 group-hover:text-accent-pink transition-colors">
                                            <GraduationCap size={20} />
                                        </div>
                                        {s.faculty.name}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Generate;
