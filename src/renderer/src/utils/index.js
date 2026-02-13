export const getFirstWeekday = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1);
    }
    return d.getDate();
};

export const getLastWeekday = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() - 1);
    }
    return d.getDate();
};

export const getFirstWeekendDay = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    while (d.getDay() !== 0 && d.getDay() !== 6) {
        d.setDate(d.getDate() + 1);
    }
    return d.getDate();
};

export const getLastWeekendDay = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    while (d.getDay() !== 0 && d.getDay() !== 6) {
        d.setDate(d.getDate() - 1);
    }
    return d.getDate();
};
export const calculateNextTrigger = (reminder) => {
    const { date, hour, minute, recurrence } = reminder;
    let next = new Date(`${date}T${hour}:${minute}`);
    const now = new Date();

    if (recurrence === 'once') return null;

    const increment = (d) => {
        const result = new Date(d);
        switch (recurrence) {
            case 'daily':
                result.setDate(result.getDate() + 1);
                break;
            case 'weekly':
                result.setDate(result.getDate() + 7);
                break;
            case 'monthly-day':
                result.setMonth(result.getMonth() + 1);
                break;
            case 'monthly-first-workday':
                result.setMonth(result.getMonth() + 1);
                result.setDate(getFirstWeekday(result));
                break;
            case 'monthly-last-workday':
                result.setMonth(result.getMonth() + 1);
                result.setDate(getLastWeekday(result));
                break;
            case 'monthly-first-weekend':
                result.setMonth(result.getMonth() + 1);
                result.setDate(getFirstWeekendDay(result));
                break;
            case 'monthly-last-weekend':
                result.setMonth(result.getMonth() + 1);
                result.setDate(getLastWeekendDay(result));
                break;
            case 'yearly':
                result.setFullYear(result.getFullYear() + 1);
                break;
            default:
                break;
        }
        return result;
    };

    // If the reminder is set for a time that hasn't happened yet today/ever, 
    // but the current loop in App.jsx triggered it (because now matches), 
    // we want the NEXT occurrence. 
    // However, the while(next <= now) loop will find the first one in the future.

    // Safety: ensure we don't loop forever if recurrence is invalid
    let iterations = 0;
    while (next <= now && iterations < 100) {
        next = increment(next);
        iterations++;
    }

    return next;
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return date.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
