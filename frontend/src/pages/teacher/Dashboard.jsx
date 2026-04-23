import { useEffect, useState } from "react";
import {
    Clock, FileText, PlusCircle, Award, BookOpen, TrendingUp,
    Loader2, AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTeacher } from "../../context/TeacherContext";
import ExamCard from "./components/ExamCard";
import ExamDetailsModal from "./components/ExamDetailsModal";
import { apiCall } from "../../api/api";


export default function TeacherDashboard() {

    const [selectedExam, setSelectedExam] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);
    const [deletingId, setDeletingId] = useState(null); 
    const { exams, loading, error, fetchExams, removeExam } = useTeacher();

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

    const handleDeleteAction = async (id, toastId) => {
        toast.dismiss(toastId);
        setDeletingId(id);
        try {
            const res = await apiCall(`${import.meta.env.VITE_API_URL}/api/v1/exams/${id}`, "DELETE");
            // console.log("Delete response:", res);
            if (res?.status === 200)  {
                removeExam(id);           
                toast.success("Exam deleted successfully.");
            } else {
                toast.error(res.message || "Failed to delete exam");
            }
        } catch (err) {
            console.error("Failed to delete exam:", err);
            toast.error("Failed to delete exam");
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteExam = (id) => {
        toast.custom((t) => (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border text-sm flex flex-col gap-3 w-72">
                <p className="text-gray-800 dark:text-gray-200">
                    Are you sure you want to{" "}
                    <span className="font-semibold text-red-600">delete</span> this exam?
                    This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 cursor-pointer py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-xs font-medium hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleDeleteAction(id, t.id)} // ✅ pass t.id, not exam id
                        className="px-3 cursor-pointer py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        ));
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
                    <Loader2 className="animate-spin h-12 w-12 text-[#5c8374] mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24 lg:pt-28">
            <div className="max-w-7xl mx-auto">
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
                        className="flex items-center gap-2 bg-gradient-to-r from-[#5c8374] to-[#092635] hover:from-[#5c8374] hover:to-[#092635] text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold whitespace-nowrap"
                    >
                        <PlusCircle size={20} />
                        Create Exam
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                {exams.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        <StatsCard
                            icon={<BookOpen className="text-green-600" size={24} />}
                            label="Total Exams"
                            value={stats.total}
                            bgColor="bg-[#9ec8b9] dark:bg-[#092635]/20"
                        />
                        <StatsCard
                            icon={<TrendingUp className="text-green-600" size={24} />}
                            label="Live Now"
                            value={stats.live}
                            bgColor="bg-green-50 dark:bg-green-900/20"
                        />
                        <StatsCard
                            icon={<Clock className="text-green-600" size={24} />}
                            label="Upcoming"
                            value={stats.upcoming}
                            bgColor="bg-[#9ec8b9] dark:bg-[#092635]/20"
                        />
                        <StatsCard
                            icon={<Award className="text-green-600" size={24} />}
                            label="Completed"
                            value={stats.completed}
                            bgColor="bg-[#f0f8f7] dark:bg-[#5c8374]/20"
                        />
                    </div>
                )}

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
                                onDeleteExam={() => handleDeleteExam(exam._id)}
                                copiedCode={copiedCode}
                                isDeleting={deletingId === exam._id}
                            />
                        ))}
                    </div>
                )}
            </div>
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