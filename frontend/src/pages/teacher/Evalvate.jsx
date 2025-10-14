import React, { useEffect, useState, useCallback } from "react";
import {
    User, School, GraduationCap, FileText, Search, ClipboardCheck,
    ChevronRight, AlertCircle, Loader2
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTeacher } from "../../context/TeacherContext";

function Evalvate() {
    const [search, setSearch] = useState("");
    const { examId } = useParams();
    const navigate = useNavigate();
    const { fetchStudents, students, studentsLoading, studentsError } = useTeacher();

    useEffect(() => {
        if (examId) {
            fetchStudents(examId);
        }
    }, [examId]);

    const handleEvaluate = (studentId) => {
        navigate(`/teacher/evalvate/${examId}/${studentId}`);
    };
    const filteredStudents = Array.isArray(students)
        ? students.filter(
            (s) =>
                s.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.rollNumber?.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    if (studentsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                            <ClipboardCheck className="w-8 h-8 text-indigo-600" />
                            Evaluation Panel
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Manage and evaluate student exam papers
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or roll..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl 
                                bg-white/70 dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                                placeholder-gray-500 dark:placeholder-gray-400
                                focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                </div>

                {/* Error State */}
                {studentsError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
                            <button
                                onClick={fetchStudents}
                                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredStudents.length === 0 && !studentsError && (
                    <div className="text-center py-12">
                        <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {students.length === 0 ? "No students enrolled for this exam" : "No matching students found"}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                {/* Students Grid */}
                {filteredStudents.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => (
                            <StudentCard
                                key={student._id}
                                student={student}
                                onEvaluate={handleEvaluate}
                            />
                        ))}
                    </div>
                )}

                {/* Results Counter */}
                {filteredStudents.length > 0 && (
                    <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredStudents.length} of {students.length} students
                    </div>
                )}
            </div>
        </div>
    );
}

function StudentCard({ student, onEvaluate }) {
    const evaluationStatus = student.examsAttempted[0].evaluateStatus;

    const statusColor = evaluationStatus === "Evaluated"
        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800"
        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800";

    return (
        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 
                    rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">

            {/* Status Badge */}
            <div className="flex justify-between items-start mb-4">
                <div />
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                    {evaluationStatus}
                </span>
            </div>

            {/* Student Info */}
            <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Student Name</p>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {student.name}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pl-8">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> Roll No
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {student.rollNumber}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                            <School className="w-3.5 h-3.5" /> College ID
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {student.collegeId}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pl-8">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" /> Batch
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {student.batch}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Session</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {student.session}
                        </p>
                    </div>
                </div>

                {/* Marks Display */}
                {evaluationStatus === "Evaluated" && (
                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Total Marks</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {student.examsAttempted[0].totalScore} / {student.examsAttempted[0].examId.totalMarks}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={() => onEvaluate(student._id, student)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium 
                    transition duration-200 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 
                    dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2 group"
            >
                {evaluationStatus === "Evaluated" ? "Review Paper" : "Evaluate Paper"}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>
        </div>
    );
}

export default Evalvate;