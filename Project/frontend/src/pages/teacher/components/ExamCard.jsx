import {
    Calendar, Clock, Award, Copy, Check,
    Users, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import getExamStatusHelper from "../helpers/examStatusHelper.js";

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

export default ExamCard;
