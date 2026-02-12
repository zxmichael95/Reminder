import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, Clock, CheckCircle2, ListFilter, Trash2 } from 'lucide-react';
import logo from './icon.ico';
import { getFirstWeekday, getLastWeekday, getFirstWeekendDay, getLastWeekendDay } from './utils';
import ReminderItem from './components/ReminderItem';
import ReminderModal from './components/ReminderModal';

export default function App() {
    const [reminders, setReminders] = useState(() => {
        const savedReminders = localStorage.getItem('reminders');
        if (savedReminders) {
            try { return JSON.parse(savedReminders); } catch (e) { return []; }
        }
        return [];
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReminder, setCurrentReminder] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [reminderIdToDelete, setReminderIdToDelete] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Check for Reminders every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            let remindersToUpdate = [...reminders];
            let changed = false;

            reminders.forEach(reminder => {
                const reminderTime = new Date(`${reminder.date}T${reminder.hour}:${reminder.minute}`);
                const todayStr = now.toISOString().split('T')[0];
                const hasFiredToday = reminder.lastFired === todayStr;

                if (hasFiredToday && reminder.recurrence !== 'once') return;
                if (reminder.lastFired === 'done') return;

                let shouldNotify = false;
                switch (reminder.recurrence) {
                    case 'once':
                        if (now >= reminderTime) {
                            shouldNotify = true;
                            remindersToUpdate = remindersToUpdate.map(r => r.id === reminder.id ? { ...r, lastFired: 'done' } : r);
                        }
                        break;
                    case 'daily':
                        if (now.getHours() === parseInt(reminder.hour) && now.getMinutes() === parseInt(reminder.minute)) {
                            shouldNotify = true;
                        }
                        break;
                    case 'weekly':
                        if (now.getDay() === reminderTime.getDay() && now.getHours() === parseInt(reminder.hour) && now.getMinutes() === parseInt(reminder.minute)) {
                            shouldNotify = true;
                        }
                        break;
                    case 'monthly-day':
                        if (now.getDate() === reminderTime.getDate() && now.getHours() === parseInt(reminder.hour) && now.getMinutes() === parseInt(reminder.minute)) {
                            shouldNotify = true;
                        }
                        break;
                    case 'monthly-first-workday':
                        if (now.getDate() === getFirstWeekday(now) && now.getHours() === parseInt(reminder.hour) && now.getMinutes() === parseInt(reminder.minute)) {
                            shouldNotify = true;
                        }
                        break;
                    case 'monthly-last-workday':
                        if (now.getDate() === getLastWeekday(now) && now.getHours() === parseInt(reminder.hour) && now.getMinutes() === parseInt(reminder.minute)) {
                            shouldNotify = true;
                        }
                        break;
                    case 'monthly-first-weekend':
                        if (now.getDate() === getFirstWeekendDay(now) && now.getHours() === parseInt(reminder.hour) && now.getMinutes() === parseInt(reminder.minute)) {
                            shouldNotify = true;
                        }
                        break;
                    case 'monthly-last-weekend':
                        if (now.getDate() === getLastWeekendDay(now) && now.getHours() === parseInt(reminder.hour) && now.getMinutes() === parseInt(reminder.minute)) {
                            shouldNotify = true;
                        }
                        break;
                    case 'yearly':
                        if (now.getMonth() === reminderTime.getMonth() && now.getDate() === reminderTime.getDate() && now.getHours() === parseInt(reminder.hour) && now.getMinutes() === parseInt(reminder.minute)) {
                            shouldNotify = true;
                        }
                        break;
                    default:
                        break;
                }

                if (shouldNotify) {
                    if (window.electron && window.electron.ipcRenderer) {
                        window.electron.ipcRenderer.send('show-notification', reminder.name);
                    } else {
                        new Notification('Reminder Pro', {
                            body: reminder.name,
                            icon: logo
                        });
                    }

                    if (reminder.recurrence !== 'once') {
                        remindersToUpdate = remindersToUpdate.map(r =>
                            r.id === reminder.id ? { ...r, lastFired: todayStr } : r
                        );
                    }
                    changed = true;
                }
            });

            const todayStr = now.toISOString().split('T')[0];
            const lastCheckDate = localStorage.getItem('lastCheckDate');
            if (lastCheckDate !== todayStr) {
                remindersToUpdate = remindersToUpdate.map(r => {
                    if (r.lastFired !== 'done') {
                        return { ...r, lastFired: null };
                    }
                    return r;
                });
                localStorage.setItem('lastCheckDate', todayStr);
                changed = true;
            }

            if (changed) {
                setReminders(remindersToUpdate);
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [reminders]);


    useEffect(() => {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }, [reminders]);

    const handleOpenModal = (reminder = null) => {
        setCurrentReminder(reminder);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentReminder(null);
    };

    const handleSaveReminder = (reminderData) => {
        let updatedReminders;
        if (currentReminder) {
            updatedReminders = reminders.map(r =>
                r.id === currentReminder.id ? { ...r, ...reminderData, lastFired: null } : r
            );
        } else {
            updatedReminders = [...reminders, { id: crypto.randomUUID(), ...reminderData, lastFired: null }];
        }

        setReminders(updatedReminders.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.hour}:${a.minute}`);
            const dateB = new Date(`${b.date}T${b.hour}:${b.minute}`);
            return dateA - dateB;
        }));

        handleCloseModal();
    };

    const handleToggleDone = (reminderId) => {
        setReminders(reminders.map(r => {
            if (r.id === reminderId) {
                const todayStr = new Date().toISOString().split('T')[0];
                const isDone = r.lastFired === 'done' || r.lastFired === todayStr;
                return { ...r, lastFired: isDone ? null : 'done' };
            }
            return r;
        }));
    };

    const openConfirmModal = (id) => {
        setReminderIdToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setReminderIdToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (!reminderIdToDelete) return;
        setReminders(reminders.filter(r => r.id !== reminderIdToDelete));
        closeConfirmModal();
    };

    const filteredReminders = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        let result = reminders;

        if (filter === 'pending') {
            result = result.filter(r => r.lastFired !== 'done' && r.lastFired !== todayStr);
        } else if (filter === 'done') {
            result = result.filter(r => r.lastFired === 'done' || r.lastFired === todayStr);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.name.toLowerCase().includes(query) ||
                (r.description && r.description.toLowerCase().includes(query))
            );
        }

        return result;
    }, [reminders, filter, searchQuery]);

    return (
        <div className="min-h-screen flex flex-col items-center bg-background text-zinc-200 p-4 sm:p-8">
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-top-4 duration-500">
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5">
                            <img src={logo} className="w-10 h-10 object-contain" alt="Reminder Pro Logo" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                                Reminder <span className="text-primary">Pro</span>
                            </h1>
                            <p className="text-zinc-400 text-sm font-medium">Your modern task assistant</p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-sky-400 hover:from-sky-400 hover:to-primary text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <PlusCircle size={20} />
                        <span>Add New Reminder</span>
                    </button>
                </header>

                <section className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-zinc-800 p-6 shadow-2xl mb-8 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search reminders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 w-full md:w-auto h-fit">
                            {['all', 'pending', 'done'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${filter === f ? 'bg-zinc-800 text-primary shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <ListFilter size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total</p>
                                <p className="text-xl font-black text-white">{reminders.length}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pending</p>
                                <p className="text-xl font-black text-white">{reminders.filter(r => {
                                    const todayStr = new Date().toISOString().split('T')[0];
                                    return r.lastFired !== 'done' && r.lastFired !== todayStr;
                                }).length}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Completed</p>
                                <p className="text-xl font-black text-white">{reminders.filter(r => {
                                    const todayStr = new Date().toISOString().split('T')[0];
                                    return r.lastFired === 'done' || r.lastFired === todayStr;
                                }).length}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="space-y-4 pb-20">
                    {filteredReminders.length > 0 ? (
                        filteredReminders.map(reminder => (
                            <ReminderItem key={reminder.id} reminder={reminder} onEdit={handleOpenModal} onDelete={openConfirmModal} onToggleDone={handleToggleDone} />
                        ))
                    ) : (
                        <div className="text-center py-20 px-10 bg-zinc-900/30 backdrop-blur-sm rounded-3xl border-2 border-dashed border-zinc-800">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="text-zinc-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No reminders found</h3>
                            <p className="text-zinc-500 max-w-sm mx-auto">Try adjusting your filters or search query, or add a new reminder to get started.</p>
                        </div>
                    )}
                </main>
            </div>

            {isModalOpen && <ReminderModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveReminder} reminder={currentReminder} />}
            {isConfirmModalOpen && <ConfirmDeleteModal onConfirm={handleConfirmDelete} onCancel={closeConfirmModal} />}

            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none">
                <p className="text-center text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] pointer-events-auto">
                    Reminder Pro &copy; 2026
                </p>
            </footer>
        </div>
    );
}

function ConfirmDeleteModal({ onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center border border-gray-800 animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/20">
                    <Trash2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Are you sure?</h3>
                <p className="text-slate-500 mb-8 font-medium">This reminder will be permanently removed. This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all active:scale-95">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95">Delete</button>
                </div>
            </div>
        </div>
    );
}
