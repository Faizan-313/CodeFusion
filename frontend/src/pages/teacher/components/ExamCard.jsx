import {
    Calendar, Clock, Award, Copy, Check,
    Users, ChevronRight, Trash2,
    Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import getExamStatusHelper from "../utils/examStatusHelper.js";

function ExamCard({ exam, onViewDetails, onEvaluate, onCopyCode, copiedCode, onDeleteExam, isDeleting }) {
    const status = getExamStatusHelper(exam.startTime, exam.endTime);
    const questionCount = exam.questions?.length || 0;
    const isCompleted = status.label === "Completed";
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group">
            <div className="bg-gradient-to-r from-[#5c8374] to-[#092635] dark:from-[#5c8374] dark:to-[#092635] p-6 text-white">
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

            <div className="p-6">
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#9ec8b9] dark:bg-[#092635]/20 rounded-lg p-3 text-center">
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

                    <div className="bg-[#f0f8f7] dark:bg-[#5c8374]/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Questions</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {questionCount}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">qs</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-5 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>
                            {new Date(exam.startTime).toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
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
                            {new Date(exam.endTime).toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={onViewDetails}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#5c8374] to-[#092635] hover:from-[#5c8374] hover:to-[#092635] text-white py-2.5 rounded-lg transition-all font-semibold text-sm group-hover:shadow-lg"
                    >
                        View Details
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition" />
                    </button>
                    {status.label === "Live" && (
                        <button
                            onClick={() => navigate(`/teacher/monitor/${exam._id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-lg transition-all font-semibold text-sm shadow-sm"
                        >
                            <Users size={16} />
                            Monitor Exam
                        </button>
                    )}
                    {status.label !== "Live" && !isCompleted &&(
                        <button
                            onClick={onDeleteExam}
                            disabled={isDeleting}
                            className="w-full flex items-center cursor-pointer justify-center gap-2 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-700 hover:to-red-800 text-white py-2.5 rounded-lg transition-all font-semibold text-sm group-hover:shadow-lg"
                        >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}

                            Delete Exam
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

export default ExamCard;
