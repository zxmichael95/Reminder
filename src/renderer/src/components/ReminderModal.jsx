import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function ReminderModal({ isOpen, onClose, onSave, reminder }) {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [hour, setHour] = useState('10');
    const [minute, setMinute] = useState('00');
    const [recurrence, setRecurrence] = useState('once');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (reminder) {
            setName(reminder.name);
            setDate(reminder.date);
            setHour(reminder.hour);
            setMinute(reminder.minute);
            setRecurrence(reminder.recurrence);
            setDescription(reminder.description || '');
        } else {
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
            setName('');
            setHour('10');
            setMinute('00');
            setRecurrence('once');
            setDescription('');
        }
    }, [reminder, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !date) {
            setError('Please fill in the reminder name and date.');
            return;
        }
        setError('');
        onSave({ name, date, hour, minute, recurrence, description });
    };

    if (!isOpen) return null;

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-800 animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-cyan-400">{reminder ? 'Edit Reminder' : 'Add New Reminder'}</h2>

                {error && <p className="text-red-400 bg-red-950/30 border border-red-500/20 p-3 rounded-xl mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Reminder Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Take medication" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white transition-all shadow-inner" />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Description (Optional)</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            placeholder="Add more details here..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white transition-all shadow-inner resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Date</label>
                            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white transition-all shadow-inner" />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="hour" className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Hour</label>
                                <select id="hour" value={hour} onChange={e => setHour(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white transition-all shadow-inner">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
                            </div>
                            <div>
                                <label htmlFor="minute" className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Minute</label>
                                <select id="minute" value={minute} onChange={e => setMinute(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white transition-all shadow-inner">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="recurrence" className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Recurrence</label>
                        <select
                            id="recurrence"
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white transition-all shadow-inner"
                        >
                            <option value="once">Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <optgroup label="Monthly">
                                <option value="monthly-day">On this day (e.g., the 13th)</option>
                                <option value="monthly-first-workday">First Workday</option>
                                <option value="monthly-last-workday">Last Workday</option>
                                <option value="monthly-first-weekend">First Weekend Day</option>
                                <option value="monthly-last-weekend">Last Weekend Day</option>
                            </optgroup>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] active:scale-95"><Save size={18} /><span>{reminder ? 'Save Changes' : 'Create Reminder'}</span></button>
                    </div>
                </form>
            </div>
        </div>
    );
}
