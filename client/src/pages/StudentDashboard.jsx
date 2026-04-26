import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Clock,
    Calendar,
    BookOpen,
    User,
    MapPin,
    Filter,
    Search,
    ArrowRight,
    FileSpreadsheet,
    FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StudentDashboard = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [batchId, setBatchId] = useState(''); // Would come from user profile in a real app
    const [batches, setBatches] = useState([]);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchError, setSearchError] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const SLOTS = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'];

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearchError('');
        setStudentInfo(null);
        setLoading(true);

        try {
            // First try to look up real user Student ID -> Batch Name ID Mapping
            const res = await api.get(`/users/profile/${searchQuery}`);
            const user = res.data;

            const bId = user.batch;
            const targetBatch = batches.find(b => b._id === bId || b.name === bId);
            
            if (targetBatch) {
                setBatchId(targetBatch._id);
                setStudentInfo(user);
            } else {
                setSearchError('Student found, but missing valid Section mapping in DB.');
            }
        } catch (err) {
            // Fallback: If no db hit, filter dynamically assuming typed value is batch name (e.g. CSE-A)
            const matchedBatch = batches.find(b => b.name.toLowerCase() === searchQuery.toLowerCase());
            if (matchedBatch) {
                setBatchId(matchedBatch._id);
                setStudentInfo({ name: 'Filtered by Batch', rollNumber: matchedBatch.name });
            } else {
                setSearchError('Student ID / Batch not found.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bRes = await api.get('/batches');
                setBatches(bRes.data);
                if (bRes.data.length > 0) {
                    setBatchId(bRes.data[0]._id);
                }
            } catch (err) {
                console.error('Failed to fetch batches', err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (batchId) {
            const fetchTimetable = async () => {
                setLoading(true);
                try {
                    const res = await api.get(`/timetable?batchId=${batchId}`);
                    setTimetable(res.data);
                } catch (err) {
                    console.error('Failed to fetch timetable', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchTimetable();
        }
    }, [batchId]);

    const getStatusColor = (day, slot) => {
        const now = new Date();
        const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

        // Simple day priority for demo (comparing current day to schedule day)
        const dayIndex = DAYS.indexOf(day);
        const currentDayIndex = DAYS.indexOf(currentDay);

        if (dayIndex < currentDayIndex) return 'bg-rose-500'; // Past
        if (dayIndex > currentDayIndex) return 'bg-amber-500'; // Upcoming

        // Same day - check slot time
        const [startStr] = slot.split('-');
        let [hours, minutes] = startStr.split(':').map(Number);

        // Standardize 09:00-04:00 to 24hr for calculation
        if (hours < 9) hours += 12; // Handle 01:00, 02:00, etc.

        const slotStartTime = new Date();
        slotStartTime.setHours(hours, minutes, 0);

        const slotEndTime = new Date(slotStartTime);
        slotEndTime.setHours(slotStartTime.getHours() + 1);

        if (now > slotEndTime) return 'bg-rose-500'; // Past
        if (now < slotStartTime) return 'bg-amber-500'; // Upcoming
        return 'bg-emerald-500'; // Ongoing
    };

    const getEntryForSlot = (day, slot) => {
        return timetable.find(t => t.day === day && t.slot === slot);
    };

    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    // Default to current day
    const getCurrentDay = () => {
        const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return DAYS.includes(day) ? day : 'Monday';
    };
    
    const [selectedDay, setSelectedDay] = useState(getCurrentDay());

    const getExportName = () => {
        const batchName = batches.find(b => b._id === batchId)?.name || 'Batch';
        return `Student_Timetable_${batchName}`;
    };

    const exportToExcel = () => {
        try {
            const data = timetable.map(entry => ({
                Day: entry.day,
                Slot: entry.slot,
                Subject: entry.subject?.name || 'N/A',
                Code: entry.subject?.code || 'N/A',
                Faculty: entry.faculty?.name || 'N/A',
                Room: entry.classroom?.roomNumber || 'N/A'
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Timetable");

            const rawName = getExportName();
            const safeName = rawName.replace(/[^a-zA-Z0-9\s-]/g, '_').trim();
            const fileName = `${safeName}.xlsx`;

            XLSX.writeFile(workbook, fileName);
            setIsExportMenuOpen(false);
        } catch (err) {
            console.error('Excel Export Error:', err);
            alert('Failed to export Excel. Please check console.');
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const tableColumn = ["Day", "Slot", "Subject", "Faculty", "Room"];
            const tableRows = timetable.map(entry => [
                entry.day,
                entry.slot,
                entry.subject?.name || 'N/A',
                entry.faculty?.name || 'N/A',
                entry.classroom?.roomNumber || 'N/A'
            ]);

            const rawName = getExportName();
            const safeName = rawName.replace(/[^a-zA-Z0-9\s-]/g, '_').trim();

            doc.text(`Timetable: ${rawName}`, 14, 15);
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 20,
                theme: 'grid',
                headStyles: { fillStyle: 'F1F5F9', textColor: '0F172A', fontStyle: 'bold' }
            });

            const finalFileName = `${safeName}.pdf`;
            doc.save(finalFileName);
            setIsExportMenuOpen(false);
        } catch (err) {
            console.error('PDF Export Error:', err);
            alert('Failed to generate PDF. Please check console.');
        }
    };

    const displayedDays = [selectedDay]; // Force single day view

    return (
        <div className="space-y-6 px-2">
            {/* Header Area */}
            <div className="flex flex-col gap-4 mt-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight mb-2">My <span className="text-brand-500 ml-1">Timetable</span></h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.1em]">Real-time schedule tracking</p>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Search Bar */}
                    <div className="relative w-full">
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <Search className="absolute left-4 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Student ID or Batch..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-24 py-3.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-bold text-sm shadow-sm transition-all text-[var(--text-main)]"
                            />
                            <button type="submit" className="absolute right-2 px-3 py-1.5 bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                Search
                            </button>
                        </form>
                        {searchError && (
                            <span className="absolute -bottom-5 left-2 text-[9px] font-black uppercase tracking-widest text-rose-500">
                                {searchError}
                            </span>
                        )}
                        {studentInfo && (
                            <span className="absolute -bottom-5 left-2 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                Showing: {studentInfo?.name || studentInfo?.username || 'Student'} ({studentInfo?.rollNumber || studentInfo?.name || 'N/A'})
                            </span>
                        )}
                    </div>

                    {/* Day Selection & Export Row */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="relative flex-1">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none" />
                            <select 
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                className="w-full pl-11 pr-10 py-3.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl appearance-none font-black text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
                            >
                                {DAYS.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </div>
                        </div>

                        {/* Export Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-sm text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                            
                            {isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border-main)] py-2 z-50">
                                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Export Options</div>
                                    <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-500/10 text-left text-xs font-bold text-[var(--text-main)] transition-colors">
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export to Excel
                                    </button>
                                    <button onClick={exportToPDF} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-500/10 text-left text-xs font-bold text-[var(--text-main)] transition-colors">
                                        <FileText className="w-4 h-4 text-rose-500" /> Download PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="pb-8">
                <div className="grid grid-cols-[80px_1fr] gap-4">
                    {/* Time Column Header */}
                    <div className="bg-slate-900 rounded-[20px] text-white flex flex-col items-center justify-center py-4">
                        <Clock className="w-5 h-5 text-brand-400 mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Time</span>
                    </div>

                    {/* Selected Day Header */}
                    <div className="bg-brand-500 rounded-[20px] shadow-lg shadow-brand-500/20 text-white flex flex-col items-center justify-center py-4 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-0.5">{selectedDay.substring(0, 3)}</span>
                        <span className="text-xl font-black tracking-tight">{selectedDay}</span>
                    </div>

                    {/* Matrix Rows */}
                    {SLOTS.map(slot => (
                        <React.Fragment key={slot}>
                            {/* Time Slot Label */}
                            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] flex items-center justify-center p-2 text-center shadow-sm">
                                <span className="text-[10px] font-bold text-[var(--text-muted)]">{slot}</span>
                            </div>

                            {/* Data Cells */}
                            {displayedDays.map(day => {
                                const entry = getEntryForSlot(day, slot);
                                const statusColor = getStatusColor(day, slot);

                                return (
                                    <div key={`${day}-${slot}`} className={`relative min-h-[160px] rounded-[24px] overflow-hidden group transition-all duration-300 ${entry ? 'pro-card p-6 border-none shadow-xl hover:scale-[1.03] hover:z-10' : 'bg-slate-100/50 border-2 border-dashed border-slate-200'}`}>
                                        {entry ? (
                                            <>
                                                {/* Status Bar */}
                                                <div className={`absolute top-0 left-0 right-0 h-1.5 ${statusColor} opacity-80`}></div>

                                                <div className="space-y-4">
                                                    <div className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-tighter">
                                                        {entry.subject?.code}
                                                    </div>

                                                    <div>
                                                        <h4 className="font-black text-slate-900 leading-tight mb-1">{entry.subject?.name}</h4>
                                                        <div className="flex items-center text-slate-400 text-xs font-bold">
                                                            <User size={12} className="mr-1.5" />
                                                            {entry.faculty?.name}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center text-brand-600 text-xs font-black">
                                                            <MapPin size={12} className="mr-1.5" />
                                                            {entry.classroom?.roomNumber}
                                                        </div>
                                                        <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse shadow-lg`}></div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Free slot</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col items-center gap-4 p-5 bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-main)] shadow-sm">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Status Guide</span>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20"></div>
                        <span className="text-[11px] font-bold text-[var(--text-main)]">Ongoing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/20"></div>
                        <span className="text-[11px] font-bold text-[var(--text-main)]">Upcoming</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/20"></div>
                        <span className="text-[11px] font-bold text-[var(--text-main)]">Past</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
