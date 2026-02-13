import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Repeat, Edit, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { calculateNextTrigger, formatDateTime } from '../utils';

export default function ReminderItem({ reminder, onEdit, onDelete, onToggleDone }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatRecurrence = (recurrence) => {
        if (recurrence.startsWith('monthly-')) {
            return `Monthly (${recurrence.replace('monthly-', '').replace('-', ' ')})`;
        }
        return recurrence;
    }

    const nextTrigger = useMemo(() => calculateNextTrigger(reminder), [reminder]);
    const todayStr = new Date().toISOString().split('T')[0];
    const isTodayDone = reminder.lastFired === todayStr;
    const isPermanentlyDone = reminder.lastFired === 'done';
    const isDone = isPermanentlyDone || isTodayDone;

    const displayDate = useMemo(() => {
        if (isPermanentlyDone) return 'Completed';
        if (reminder.recurrence === 'once') {
            const date = new Date(reminder.date);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }

        // For recurring reminders, show next trigger if we have one
        if (nextTrigger) {
            return formatDateTime(nextTrigger);
        }

        return reminder.date; // Fallback
    }, [reminder, nextTrigger, isPermanentlyDone]);

    const itemClasses = `bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700 transition-all duration-300 flex flex-col gap-4 ${isDone ? 'opacity-50' : 'hover:border-cyan-500/50 hover:shadow-cyan-500/10'
        }`;

    return (
        <div className={itemClasses}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
                <div className="flex-grow">
                    <h3 className="flex items-center gap-3 text-xl font-semibold text-white mb-2">
                        {isDone ? (
                            <button onClick={() => onToggleDone(reminder.id)} className="text-green-500 hover:text-green-400">
                                <CheckCircle2 className="flex-shrink-0" size={24} />
                            </button>
                        ) : (
                            <div style={{ width: 24, height: 24 }} className="flex-shrink-0"></div>
                        )}
                        <span>{reminder.name}</span>
                    </h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-400 text-sm sm:ml-10">
                        {reminder.recurrence === 'once' ? (
                            <>
                                <span className="flex items-center gap-2"><Calendar size={16} /> {displayDate}</span>
                                <span className="flex items-center gap-2"><Clock size={16} /> {reminder.hour}:{reminder.minute}</span>
                            </>
                        ) : (
                            <span className="flex items-center gap-2"><Calendar size={16} /> {isPermanentlyDone ? 'Completed' : `Next: ${displayDate}`}</span>
                        )}
                        <span className="flex items-center gap-2"><Repeat size={16} /> <span className="capitalize">{formatRecurrence(reminder.recurrence)}</span></span>
                    </div>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0 flex-shrink-0 self-start sm:self-center">
                    {reminder.description && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    )}
                    <button onClick={() => onEdit(reminder)} className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"><Edit size={20} /></button>
                    <button onClick={() => onDelete(reminder.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                </div>
            </div>

            {isExpanded && reminder.description && (
                <div className="w-full pt-4 border-t border-gray-700/50 mt-2">
                    <p className="text-gray-300 whitespace-pre-wrap">{reminder.description}</p>
                </div>
            )}
        </div>
    );
}
