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
