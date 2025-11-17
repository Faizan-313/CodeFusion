const getExamStatusHelper = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
        return { label: "Upcoming", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" };
    }
    if (now >= start && now <= end) {
        return { label: "Live", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" };
    }
    return { label: "Completed", color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" };
};

export default getExamStatusHelper;