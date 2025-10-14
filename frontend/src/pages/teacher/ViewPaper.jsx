import { useState, useEffect } from "react";
import {
    ArrowLeft, Save, Loader2,
    MessageSquare, RotateCcw, FileText, CheckCircle, Image as ImageIcon
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiCall } from "../../api/api";
import { useTeacher } from "../../context/TeacherContext";

const sanitizeAndFormatAnswer = (answer) => {
    if (!answer) return "";

    let text = String(answer);

    text = text
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r")
        .replace(/\\\//g, "/")
        .replace(/\\\\/g, "\\")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");

    text = text.replace(/\\u([0-9A-Fa-f]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
    });

    return text;
};

function ViewPaper() {
    const { studentId, examId } = useParams();
    const navigate = useNavigate();
    const { students, exams, fetchExams, fetchStudents } = useTeacher();

    useEffect(() => {
        if (examId) {
            fetchStudents(examId);
        }
        fetchExams();
    }, [examId]);

    const [marks, setMarks] = useState("");
    const [comments, setComments] = useState("");
    const [validated, setValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [localExamAttempt, setLocalExamAttempt] = useState(null);

    const exam = exams.find(e => e._id === examId);
    const student = students.find(s => s._id === studentId);

    const examAttempt = student?.examsAttempted?.find(attempt =>
        typeof attempt.examId === 'object'
            ? attempt.examId._id === examId
            : attempt.examId === examId
    );

    useEffect(() => {
        if (examAttempt) {
            setLocalExamAttempt(JSON.parse(JSON.stringify(examAttempt)));
            setMarks(examAttempt.totalScore?.toString() || "");
            setComments(examAttempt.evaluatorComments || "");
        }
    }, [examAttempt]);

    const handleValidation = () => {
        const marksNum = parseFloat(marks);

        if (marks === "") {
            toast.error("Please enter marks");
            return false;
        }

        if (isNaN(marksNum)) {
            toast.error("Marks must be a valid number");
            return false;
        }

        const maxMarks = exam?.totalMarks || 100;
        if (marksNum < 0 || marksNum > maxMarks) {
            toast.error(`Marks must be between 0 and ${maxMarks}`);
            return false;
        }

        setValidated(true);
        return true;
    };

    const handleSubmit = async () => {
        if (!handleValidation()) {
            return;
        }

        try {
            setSubmitting(true);

            const totalScore = localExamAttempt.answers.reduce(
                (sum, ans) => sum + parseFloat(ans.marksObtained || 0),
                0
            );

            const response = await apiCall(
                `${import.meta.env.VITE_API_URL}/api/v1/teacher/evaluate-paper`,
                "POST",
                {
                    data: {
                        examAttemptId: localExamAttempt._id,
                        examId,
                        studentId,
                        totalScore,
                        evaluatorComments: comments,
                        evaluatedAt: new Date(),
                        answers: localExamAttempt.answers,
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Paper evaluated successfully!");
                setTimeout(() => {
                    navigate(`/teacher/evaluation/${examId}`, { replace: true });
                }, 1500);
            }
        } catch (error) {
            console.error("Error submitting evaluation:", error);
            toast.error(error.response?.data?.message || "Failed to submit evaluation");
            setSubmitting(false);
        }
    };

    if (!exam || !student || !localExamAttempt) {
        return (
            <div className="pt-20 min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-300">Loading exam paper...</p>
                </div>
            </div>
        );
    }

    const maxMarks = exam.totalMarks || 100;
    const studentAnswers = localExamAttempt.answers || [];
    const totalObtainedMarks = studentAnswers.reduce(
        (sum, ans) => sum + parseFloat(ans.marksObtained || 0),
        0
    );

    const renderStudentAnswer = (question, studentAnswer) => {
        if (!studentAnswer) {
            return (
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        No answer provided
                    </p>
                </div>
            );
        }

        if (question.type === "diagram") {
            return (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                        STUDENT'S DIAGRAM
                    </p>
                    {studentAnswer.answerText && studentAnswer.answerText.startsWith("data:image") ? (
                        <div className="flex flex-col gap-2">
                            <img
                                src={studentAnswer.answerText}
                                alt="Student's diagram"
                                className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 ml-2">Diagram image</p>
                        </div>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                        <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            Marks:
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={question.marks || 0}
                            step="0.5"
                            value={studentAnswer.marksObtained ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    setLocalExamAttempt((prev) => {
                                        const updatedAnswers = prev.answers.map((ans) =>
                                            ans.questionId === question._id
                                                ? { ...ans, marksObtained: "" }
                                                : ans
                                        );
                                        return { ...prev, answers: updatedAnswers };
                                    });
                                    return;
                                }

                                const numValue = Number(value);
                                const maxMarks = question.marks || 0;

                                if (numValue < 0 || numValue > maxMarks) {
                                    toast.error(`Marks must be between 0 and ${maxMarks}`);
                                    setValidated(false);
                                    return;
                                }

                                setLocalExamAttempt((prev) => {
                                    const updatedAnswers = prev.answers.map((ans) =>
                                        ans.questionId === question._id
                                            ? { ...ans, marksObtained: numValue }
                                            : ans
                                    );
                                    return { ...prev, answers: updatedAnswers };
                                });
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white/70 dark:bg-gray-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <span className="text-gray-500 text-xs">/ {question.marks || 0}</span>
                    </div>
                </div>
            );
        }

        if (question.type === "mcq") {
            const selectedOption = studentAnswer.answerText;
            const optionDetails = question.options?.find(opt => opt._id === selectedOption || opt.text === selectedOption);

            return (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                        STUDENT'S ANSWER
                    </p>
                    <div className="bg-white dark:bg-gray-800 border-2 border-indigo-400 dark:border-indigo-600 rounded-lg p-3">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {optionDetails?.text || selectedOption}
                        </p>
                    </div>
                    {question.options && question.options.length > 0 && (
                        <div className="space-y-2 mt-3">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">All Options:</p>
                            <div className="space-y-1">
                                {question.options.map((option, idx) => (
                                    <div
                                        key={option._id || idx}
                                        className={`p-2 rounded text-sm ${
                                            selectedOption === option._id || selectedOption === option
                                                ? "bg-green-300 dark:bg-green-300/40 border border-indigo-400 dark:border-indigo-600"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        }`}
                                    >
                                        <span className="font-medium">({String.fromCharCode(65 + idx)})</span> {option}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mt-4 flex items-center gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                        <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            Marks:
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={question.marks || 0}
                            step="0.5"
                            value={studentAnswer.marksObtained ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    setLocalExamAttempt((prev) => {
                                        const updatedAnswers = prev.answers.map((ans) =>
                                            ans.questionId === question._id
                                                ? { ...ans, marksObtained: "" }
                                                : ans
                                        );
                                        return { ...prev, answers: updatedAnswers };
                                    });
                                    return;
                                }

                                const numValue = Number(value);
                                const maxMarks = question.marks || 0;

                                if (numValue < 0 || numValue > maxMarks) {
                                    toast.error(`Marks must be between 0 and ${maxMarks}`);
                                    setValidated(false);
                                    return;
                                }

                                setLocalExamAttempt((prev) => {
                                    const updatedAnswers = prev.answers.map((ans) =>
                                        ans.questionId === question._id
                                            ? { ...ans, marksObtained: numValue }
                                            : ans
                                    );
                                    return { ...prev, answers: updatedAnswers };
                                });
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white/70 dark:bg-gray-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <span className="text-gray-500 text-xs">/ {question.marks || 0}</span>
                    </div>
                </div>
            );
        }

        // Default text/code answer display
        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                    STUDENT'S ANSWER
                </p>
                <pre className="text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-sm dark:bg-gray-950 bg-white leading-relaxed whitespace-pre-wrap break-words font-mono overflow-auto max-h-96">
                    {sanitizeAndFormatAnswer(studentAnswer.answerText)}
                </pre>
                <div className="mt-3 flex items-center gap-2 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Marks:
                    </label>
                    <input
                        type="number"
                        min={0}
                        max={question.marks || 0}
                        step="0.5"
                        value={studentAnswer.marksObtained ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                                setLocalExamAttempt((prev) => {
                                    const updatedAnswers = prev.answers.map((ans) =>
                                        ans.questionId === question._id
                                            ? { ...ans, marksObtained: "" }
                                            : ans
                                    );
                                    return { ...prev, answers: updatedAnswers };
                                });
                                return;
                            }

                            const numValue = Number(value);
                            const maxMarks = question.marks || 0;

                            if (numValue < 0 || numValue > maxMarks) {
                                toast.error(`Marks must be between 0 and ${maxMarks}`);
                                setValidated(false);
                                return;
                            }

                            setLocalExamAttempt((prev) => {
                                const updatedAnswers = prev.answers.map((ans) =>
                                    ans.questionId === question._id
                                        ? { ...ans, marksObtained: numValue }
                                        : ans
                                );
                                return { ...prev, answers: updatedAnswers };
                            });
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white/70 dark:bg-gray-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <span className="text-gray-500 text-xs">/ {question.marks || 0}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="pt-20 min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(`/teacher/evaluation/${examId}`)}
                        className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition"
                        title="Go back"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Evaluate Paper
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {exam.title}
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Exam Details
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Exam Title</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {exam.title}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Exam Code</p>
                                    <p className="font-mono text-gray-900 dark:text-gray-100 text-sm">
                                        {exam.examCode}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Duration</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {exam.duration} minutes
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Marks</p>
                                    <p className="font-bold text-indigo-600 dark:text-indigo-400">
                                        {maxMarks}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Questions & Answers
                            </h2>

                            {exam.questions && exam.questions.length > 0 ? (
                                <div className="space-y-6">
                                    {exam.questions.map((question, idx) => {
                                        const studentAnswer = studentAnswers.find(
                                            (ans) => ans.questionId === question._id
                                        );

                                        return (
                                            <div
                                                key={question._id || idx}
                                                className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0"
                                            >
                                                <div className="mb-4">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                                            Q{idx + 1}. {question.questionText}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full whitespace-nowrap">
                                                                {question.type}
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full whitespace-nowrap">
                                                                {question.marks || 0} marks
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {question.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-0">
                                                            {question.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {renderStudentAnswer(question, studentAnswer)}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        No questions available for this exam
                                    </p>
                                </div>
                            )}
                        </div>

                        {localExamAttempt && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
                                <p>
                                    <strong>Submitted:</strong> {new Date(localExamAttempt.submittedAt).toLocaleString()}
                                </p>
                                {localExamAttempt.evaluatedAt && (
                                    <p>
                                        <strong>Evaluated:</strong> {new Date(localExamAttempt.evaluatedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5 shadow-md">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Student Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Full Name</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{student.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Roll Number</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{student.rollNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">College ID</p>
                                    <p className="font-mono text-gray-900 dark:text-gray-100 text-xs">{student.collegeId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Batch</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{student.batch}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Session</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{student.session}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">
                                Mark Paper
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Marks Obtained <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={totalObtainedMarks}
                                            onChange={(e) => {
                                                setMarks(e.target.value);
                                                setValidated(false);
                                            }}
                                            placeholder="0"
                                            min="0"
                                            max={maxMarks}
                                            step="0.5"
                                            disabled={submitting}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                                            bg-white/70 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                            placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 
                                            focus:border-transparent outline-none transition disabled:opacity-50"
                                        />
                                        <span className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 font-medium text-sm">
                                            / {maxMarks}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                        <MessageSquare className="w-4 h-4" />
                                        Feedback Comments
                                    </label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => {
                                            setComments(e.target.value);
                                            setValidated(false);
                                        }}
                                        placeholder="Add constructive feedback for the student..."
                                        disabled={submitting}
                                        rows={5}
                                        maxLength={500}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                                        bg-white/70 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                        placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 
                                        focus:border-transparent outline-none transition resize-none disabled:opacity-50"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                        {comments.length} / 500 characters
                                    </p>
                                </div>
                            </div>

                            {validated && (
                                <div className="mt-5 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                        All validations passed. Ready to submit.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3 mt-6">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !marks}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                                    text-white py-2.5 rounded-lg font-semibold transition duration-200
                                    focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
                                    dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2 text-sm cursor-pointer"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Submit Evaluation
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewPaper;