import React, { useEffect, useState } from "react";
import {
    Calendar, Clock, FileText, PlusCircle, Award, BookOpen, TrendingUp, X, Copy, Check,
    Users, Loader2, AlertCircle, ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTeacher } from "../../context/TeacherContext";

//function of exam status
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

export default function TeacherDashboard() {

    const [selectedExam, setSelectedExam] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);
    const { exams, loading, error, fetchExams } = useTeacher();

    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);



    const copyToClipboard = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
            toast.success("Exam code copied!");
        } catch (err) {
            console.error("Failed to copy:", err);
            toast.error("Failed to copy code");
        }
    };

    const handleEvaluate = (id) => {
        navigate(`/teacher/evaluation/${id}`);
    };

    const stats = {
        total: exams.length,
        live: exams.filter((e) => {
            const now = new Date();
            return now >= new Date(e.startTime) && now <= new Date(e.endTime);
        }).length,
        upcoming: exams.filter((e) => new Date() < new Date(e.startTime)).length,
        completed: exams.filter((e) => new Date() > new Date(e.endTime)).length,
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24 lg:pt-28">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Teacher Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span>Manage and monitor your exams</span>
                            {stats.live > 0 && (
                                <span className="ml-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                                    {stats.live} Live
                                </span>
                            )}
                        </p>
                    </div>
                    <Link
                        to="/create-exam"
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold whitespace-nowrap"
                    >
                        <PlusCircle size={20} />
                        Create Exam
                    </Link>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                {exams.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        <StatsCard
                            icon={<BookOpen className="text-indigo-600" size={24} />}
                            label="Total Exams"
                            value={stats.total}
                            bgColor="bg-indigo-50 dark:bg-indigo-900/20"
                        />
                        <StatsCard
                            icon={<TrendingUp className="text-green-600" size={24} />}
                            label="Live Now"
                            value={stats.live}
                            bgColor="bg-green-50 dark:bg-green-900/20"
                        />
                        <StatsCard
                            icon={<Clock className="text-blue-600" size={24} />}
                            label="Upcoming"
                            value={stats.upcoming}
                            bgColor="bg-blue-50 dark:bg-blue-900/20"
                        />
                        <StatsCard
                            icon={<Award className="text-purple-600" size={24} />}
                            label="Completed"
                            value={stats.completed}
                            bgColor="bg-purple-50 dark:bg-purple-900/20"
                        />
                    </div>
                )}

                {/* Empty State */}
                {exams.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText size={40} className="text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                No Exams Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Get started by creating your first exam. It only takes a few minutes!
                            </p>
                            <Link
                                to="/create-exam"
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl transition-all font-semibold"
                            >
                                <PlusCircle size={20} />
                                Create Your First Exam
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.map((exam) => (
                            <ExamCard
                                key={exam._id}
                                exam={exam}
                                onViewDetails={() => setSelectedExam(exam)}
                                onEvaluate={() => handleEvaluate(exam._id)}
                                onCopyCode={() => copyToClipboard(exam.examCode)}
                                copiedCode={copiedCode}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Exam Details Modal */}
            {selectedExam && (
                <ExamDetailsModal
                    exam={selectedExam}
                    onClose={() => setSelectedExam(null)}
                    copiedCode={copiedCode}
                    onCopyCode={() => copyToClipboard(selectedExam.examCode)}
                />
            )}
        </div>
    );
}

function StatsCard({ icon, label, value, bgColor }) {
    return (
        <div className={`${bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    {icon}
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {value}
                </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{label}</p>
        </div>
    );
}

function ExamCard({ exam, onViewDetails, onEvaluate, onCopyCode, copiedCode }) {
    const status = getExamStatusHelper(exam.startTime, exam.endTime);
    const questionCount = exam.questions?.length || 0;
    const isCompleted = status.label === "Completed";
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 p-6 text-white">
                <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                        {status.label}
                    </span>
                    <button
                        onClick={onCopyCode}
                        className="flex items-center gap-1.5 text-xs font-mono bg-white/20 hover:bg-white/30 px-2.5 py-1.5 rounded-lg transition-all"
                        title="Copy exam code"
                    >
                        {copiedCode === exam.examCode ? (
                            <>
                                <Check size={12} />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy size={12} />
                                {exam.examCode}
                            </>
                        )}
                    </button>
                </div>
                <h2 className="text-xl font-bold line-clamp-2">
                    {exam.title}
                </h2>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Duration</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {exam.duration}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">mins</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Marks</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {exam.totalMarks}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Questions</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {questionCount}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">qs</p>
                    </div>
                </div>

                {/* Dates */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-5 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>
                            {new Date(exam.startTime).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock size={14} className="flex-shrink-0" />
                        <span>
                            {new Date(exam.endTime).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    <button
                        onClick={onViewDetails}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-2.5 rounded-lg transition-all font-semibold text-sm group-hover:shadow-lg"
                    >
                        View Details
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition" />
                    </button>
                    {status.label === "Live" && (
                        <button
                            onClick={() => navigate(`/teacher/monitor/${exam._id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white py-2.5 rounded-lg transition-all font-semibold text-sm group-hover:shadow-lg"
                        >
                            <Users size={16} />
                            Monitor Exam
                        </button>
                    )}


                    {isCompleted && (
                        <button
                            onClick={onEvaluate}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-2.5 rounded-lg transition-all font-semibold text-sm group-hover:shadow-lg"
                        >
                            <Award size={16} />
                            Evaluate Papers
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ExamDetailsModal({ exam, onClose, copiedCode, onCopyCode }) {
    const status = getExamStatusHelper(exam.startTime, exam.endTime);

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 p-6 text-white sticky top-0">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                    {status.label}
                                </span>
                                <button
                                    onClick={onCopyCode}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all text-sm"
                                >
                                    {copiedCode === exam.examCode ? (
                                        <>
                                            <Check size={14} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} />
                                            {exam.examCode}
                                        </>
                                    )}
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold">{exam.title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all flex-shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wide">
                            Description
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {exam.description || "No description provided"}
                        </p>
                    </div>

                    {/* Key Details */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4 tracking-wide">
                            Exam Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
                                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 mb-3">
                                    <Clock size={18} />
                                    <span className="text-sm font-semibold">Duration</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {exam.duration}
                                    <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                                        minutes
                                    </span>
                                </p>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-3">
                                    <Award size={18} />
                                    <span className="text-sm font-semibold">Total Marks</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {exam.totalMarks}
                                    <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                                        marks
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4 tracking-wide">
                            Questions ({exam.questions?.length || 0})
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {exam.questions && exam.questions.length > 0 ? (
                                exam.questions.map((q, idx) => (
                                    <div
                                        key={q._id || idx}
                                        className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                Q{idx + 1}. <span className="text-blue-900 dark:text-blue-300">{q.questionText}</span>
                                            </p>
                                            <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0">
                                                {q.marks} marks
                                            </span>
                                        </div>

                                        {q.type === "mcq" && q.options && (
                                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700 dark:text-gray-400 text-sm">
                                                {q.options.map((opt, i) => (
                                                    <li key={i}>{opt}</li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">
                                                {q.type.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No questions added yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Schedule */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4 tracking-wide">
                            Schedule
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
                                <Calendar className="text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Start Time</p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {new Date(exam.startTime).toLocaleString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
                                <Calendar className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">End Time</p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {new Date(exam.endTime).toLocaleString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wide">
                            Additional Information
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 border border-gray-200 dark:border-gray-600 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Created On</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {new Date(exam.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Exam Code</span>
                                <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                                    {exam.examCode}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}