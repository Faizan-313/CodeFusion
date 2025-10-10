import React, { useEffect, useState } from "react";
import { Calendar, Clock, FileText, PlusCircle, Award, BookOpen, TrendingUp, X, Copy, Check } from "lucide-react";
import { apiCall } from "../../api/api";
import { Link } from "react-router-dom";

export default function TeacherDashboard() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExam, setSelectedExam] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const { data } = await apiCall(`${import.meta.env.VITE_API_URL}/api/v1/teacher/dashboard`, "GET");
                if (data.success) setExams(data.exams);
            } catch (err) {
                console.error("Error fetching dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);
    const getExamStatus = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
        if (now >= start && now <= end) return { label: "Live", color: "bg-green-100 text-green-700" };
        return { label: "Completed", color: "bg-gray-100 text-gray-700" };
    };

    const copyToClipboard = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const stats = {
        total: exams.length,
        live: exams.filter(e => {
            const now = new Date();
            return now >= new Date(e.startTime) && now <= new Date(e.endTime);
        }).length,
        upcoming: exams.filter(e => new Date() < new Date(e.startTime)).length,
        completed: exams.filter(e => new Date() > new Date(e.endTime)).length,
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24 lg:pt-28">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Teacher Dashboard</h1>
                        <p className="text-gray-600">Manage and monitor your exams</p>
                    </div>
                    <Link
                        to="/create-exam"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <PlusCircle size={20} /> Create Exam
                    </Link>
                </div>

                {/* Stats Cards */}
                {exams.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <BookOpen className="text-blue-600" size={24} />
                                </div>
                                <span className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.total}</span>
                            </div>
                            <p className="text-gray-600 text-sm font-medium">Total Exams</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <TrendingUp className="text-green-600" size={24} />
                                </div>
                                <span className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.live}</span>
                            </div>
                            <p className="text-gray-600 text-sm font-medium">Live Now</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <Clock className="text-purple-600" size={24} />
                                </div>
                                <span className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.upcoming}</span>
                            </div>
                            <p className="text-gray-600 text-sm font-medium">Upcoming</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <Award className="text-gray-600" size={24} />
                                </div>
                                <span className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.completed}</span>
                            </div>
                            <p className="text-gray-600 text-sm font-medium">Completed</p>
                        </div>
                    </div>
                )}

                {/* Exams Grid */}
                {exams.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText size={40} className="text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Exams Yet</h3>
                            <p className="text-gray-600 mb-6">Get started by creating your first exam. It only takes a few minutes!</p>
                            <Link
                                to="/create-exam"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all"
                            >
                                <PlusCircle size={20} /> Create Your First Exam
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {exams.map((exam) => {
                            const status = getExamStatus(exam.startTime, exam.endTime);
                            const questionCount = exam.questions?.length || 0;

                            return (
                                <div
                                    key={exam._id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                                >
                                    {/* Header with Gradient */}
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} bg-white`}>
                                                {status.label}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(exam.examCode)}
                                                className="flex items-center gap-1 text-xs font-mono bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-all"
                                            >
                                                {copiedCode === exam.examCode ? (
                                                    <><Check size={12} /> Copied!</>
                                                ) : (
                                                    <><Copy size={12} /> {exam.examCode}</>
                                                )}
                                            </button>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-bold mt-2 line-clamp-2">
                                            {exam.title}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                                    <Clock size={14} />
                                                    <span>Duration</span>
                                                </div>
                                                <p className="text-gray-800 font-semibold">{exam.duration} mins</p>
                                            </div>

                                        </div>

                                        {/* Dates */}
                                        <div className="border-t pt-4 space-y-2">
                                            <div className="flex items-start gap-2 text-xs text-gray-600">
                                                <Calendar size={14} className="mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-700">Start</p>
                                                    <p>{new Date(exam.startTime).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs text-gray-600">
                                                <Calendar size={14} className="mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-700">End</p>
                                                    <p>{new Date(exam.endTime).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => setSelectedExam(exam)}
                                            className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm group-hover:shadow-lg"
                                        >
                                            View Details
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedExam && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedExam(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white sticky top-0">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getExamStatus(selectedExam.startTime, selectedExam.endTime).color} bg-white`}>
                                            {getExamStatus(selectedExam.startTime, selectedExam.endTime).label}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(selectedExam.examCode)}
                                            className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-all text-sm"
                                        >
                                            {copiedCode === selectedExam.examCode ? (
                                                <><Check size={14} /> Copied!</>
                                            ) : (
                                                <><Copy size={14} /> {selectedExam.examCode}</>
                                            )}
                                        </button>
                                    </div>
                                    <h2 className="text-2xl font-bold">{selectedExam.title}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedExam(null)}
                                    className="ml-4 bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
                                <p className="text-gray-700">{selectedExam.description || "No description provided"}</p>
                            </div>

                            {/* Key Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                        <Clock size={18} />
                                        <span className="text-sm font-semibold">Duration</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">{selectedExam.duration} <span className="text-base font-normal text-gray-600">minutes</span></p>
                                </div>

                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-green-600 mb-2">
                                        <Award size={18} />
                                        <span className="text-sm font-semibold">Total Marks</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">{selectedExam.totalMarks} <span className="text-base font-normal text-gray-600">marks</span></p>
                                </div>

                                <div className="bg-purple-50 rounded-xl p-4 col-span-2">
                                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                                        <FileText size={18} />
                                        <span className="text-sm font-semibold">Total Questions - {selectedExam.questions?.length || 0}</span>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-4 col-span-2">
                                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                                            <FileText size={18} />
                                            <span className="text-sm font-semibold">Question Paper</span>
                                        </div>
                                        <div className="space-y-3">
                                            {selectedExam.questions?.map((q, idx) => (
                                                <div key={q._id || idx} className="bg-white p-3 rounded-lg border border-gray-200">
                                                    <p className="font-medium">Q({idx + 1}). <span className="text-blue-900">{q.questionText}</span></p>

                                                    {/* MCQ options */}
                                                    {q.type === "mcq" && (
                                                        <ul className="list-disc list-inside ml-4 mt-1 text-gray-700">
                                                            {q.options?.map((opt, i) => (
                                                                <li key={i}>{opt}</li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                    {/* Marks */}
                                                    <p className="mt-1 text-sm text-gray-500">Type: {q.type.toUpperCase()}</p>
                                                    <p className="mt-1 text-sm text-gray-500">Marks: {q.marks}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Schedule</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                                        <Calendar className="text-blue-600 mt-1" size={20} />
                                        <div>
                                            <p className="font-semibold text-gray-800 mb-1">Start Time</p>
                                            <p className="text-gray-600">{new Date(selectedExam.startTime).toLocaleString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                                        <Calendar className="text-indigo-600 mt-1" size={20} />
                                        <div>
                                            <p className="font-semibold text-gray-800 mb-1">End Time</p>
                                            <p className="text-gray-600">{new Date(selectedExam.endTime).toLocaleString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Additional Information</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created On</span>
                                        <span className="text-gray-800">{new Date(selectedExam.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}