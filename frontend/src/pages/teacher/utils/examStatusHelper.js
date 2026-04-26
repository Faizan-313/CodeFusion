const getExamStatusHelper = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
        return {
            label: "Upcoming",
            color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        };
    }
    if (now >= start && now <= end) {
        return {
            label: "Live",
            color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        };
    }
    return {
        label: "Completed",
        color: "bg-white/5 text-gray-300 border-white/15",
    };
};

export default getExamStatusHelper;
