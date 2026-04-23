const getExamStatusHelper = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
        return { label: "Upcoming", color: "bg-[#9ec8b9] dark:bg-[#092635]/30 text-[#092635] dark:text-[#9ec8b9]" };
    }
    if (now >= start && now <= end) {
        return { label: "Live", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" };
    }
    return { label: "Completed", color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" };
};

export default getExamStatusHelper;