import { useEffect, useState } from "react";
import { useExam } from "../../context/ExamContext";
import toast from "react-hot-toast";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { Clock, FileText, Code, User } from "lucide-react";
import DiagramCanvas from "../../components/DiagramCanvas";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ExamSection() {
    const { exam, studentDetails, token, questionPaper } = useExam();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [selectedLanguages, setSelectedLanguages] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const navigate = useNavigate();

    const languageExtensions = {
        javascript: {
            ext: javascript(),
            label: "JavaScript"
        },
        python: {
            ext: python(),
            label: "Python"
        },
        java: {
            ext: java(),
            label: "Java"
        },
        cpp: {
            ext: cpp(),
            label: "C++"
        }
    };

    useEffect(() => {
        if (exam?.duration) {
            setTimeLeft(exam.duration * 60);
        }

        const paperQuestions = questionPaper?.questions || [];
        setQuestions(paperQuestions);

        const defaultLangs = {};
        const initialAnswers = {};

        paperQuestions.forEach(q => {
            if (q.type === "code") {
                defaultLangs[q.id] = "javascript";
            }
            // Initialize empty answers for each question
            initialAnswers[q._id] = "";
        });

        setSelectedLanguages(defaultLangs);
        setAnswers(initialAnswers);
    }, [exam, questionPaper]);

    useEffect(() => {
        if (!timeLeft || isSubmitted) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isSubmitted]);

    useEffect(() => {
        const handleBlur = () => {
            if (!isSubmitted) {
                toast.error("⚠️ Tab switching detected! This may be reported.");
            }
        };

        const handleBeforeUnload = (e) => {
            if (!isSubmitted) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("blur", handleBlur);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isSubmitted]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleLanguageChange = (questionId, language) => {
        setSelectedLanguages(prev => ({ ...prev, [questionId]: language }));
    };

    const name = studentDetails?.name?.split(" ").map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");

    const handleSubmit = async () => {
        setIsSubmitted(true);
        try {
            // Prepare final answers with question details
            const finalAnswers = questions.map(question => {
                const answer = answers[question._id];
                return {
                    questionId: question._id,
                    questionText: question.questionText,
                    type: question.type,
                    answer: answer || "",
                    language: selectedLanguages[question._id] || null,
                    marks: question.marks
                };
            });

            // Send to backend API
            const response = await axios.post(`
                ${import.meta.env.VITE_API_URL}/api/v1/exams/submit`, 
                { answers: finalAnswers, examId: exam._id, token, studentDetail: {
                        id: studentDetails._id,
                        rollNumber: studentDetails.rollNumber,
                        collegeId: studentDetails.collegeId
                    } 
                }, 
                { withCredentials: true });

            if (response.status === 200) {
                toast.success("Exam submitted successfully!");
                navigate(`/thank-you/${name}`);
            } else {
                throw new Error('Failed to submit exam');
            }

        } catch (error) {
            console.error('Error submitting exam:', error);
            toast.error("Failed to submit exam. Please try again.");
            //allow resubmission in case of any problem
            setIsSubmitted(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const getTimeColor = () => {
        if (timeLeft > 300) return "text-green-600 dark:text-green-400";
        if (timeLeft > 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400 animate-pulse";
    };

    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <p className="text-xl text-red-600 dark:text-red-400">No exam found!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Student Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{name || "N/A"}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Roll Number</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{studentDetails?.rollNumber || "N/A"}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">College ID</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{studentDetails?.collegeId || "N/A"}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Session</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{studentDetails?.session || "N/A"}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Batch</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{studentDetails?.batch || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Exam Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            {exam.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">{exam.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{exam.duration} min</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Marks</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{exam.totalMarks}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</p>
                                    <p className={`text-lg font-bold ${getTimeColor()}`}>{formatTime(timeLeft)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {isSubmitted ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Exam Submitted Successfully!</h2>
                        <p className="text-gray-600 dark:text-gray-300">Your answers have been recorded. You may now close this window.</p>

                        {/* Debug: Show submitted answers */}
                        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
                            <h3 className="text-lg font-semibold mb-2">Submitted Answers (Debug):</h3>
                            <pre className="text-sm whitespace-pre-wrap">
                                {JSON.stringify(answers, null, 2)}
                            </pre>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((q, index) => (
                            <div key={q._id || `question-${index}`} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex-1">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg mr-3 font-bold">
                                            {index + 1}
                                        </span>
                                        {q.questionText}
                                    </h3>
                                    <span className="ml-4 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium whitespace-nowrap">
                                        {q.marks} marks
                                    </span>
                                </div>

                                {q.type === "mcq" && (
                                    <div className="space-y-3 mt-4">
                                        {q.options?.map((opt, i) => (
                                            <label key={`${q._id}-option-${i}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                                                <input
                                                    type="radio"
                                                    name={`q-${q._id}`}
                                                    value={opt}
                                                    checked={answers[q._id] === opt}
                                                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                                                />
                                                <span className="text-gray-700 dark:text-gray-200 font-medium">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === "text" && (
                                    <textarea
                                        rows={5}
                                        value={answers[q._id] || ""}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-4 mt-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none"
                                        placeholder="Type your answer here..."
                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                    />
                                )}

                                {q.type === "code" && (
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Code className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                            <select
                                                value={selectedLanguages[q._id] || "javascript"}
                                                onChange={(e) => handleLanguageChange(q._id, e.target.value)}
                                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            >
                                                {Object.entries(languageExtensions).map(([key, { label }]) => (
                                                    <option key={`${q._id}-lang-${key}`} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                                            <CodeMirror
                                                value={answers[q._id] || ""}
                                                height="300px"
                                                theme={oneDark}
                                                extensions={[languageExtensions[selectedLanguages[q._id] || "javascript"].ext]}
                                                onChange={(value) => handleAnswerChange(q._id, value)}
                                                className="text-sm"
                                                basicSetup={{
                                                    autocompletion: true,
                                                    highlightActiveLine: true,
                                                    highlightSelectionMatches: true,
                                                    closeBrackets: true,
                                                    defaultKeymap: true,
                                                    history: true,
                                                    foldGutter: true,
                                                    drawSelection: true,
                                                    dropCursor: true,
                                                    lintKeymap: true,
                                                    searchKeymap: true,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {q.type === "diagram" && (
                                    <div className="mt-4">
                                        <DiagramCanvas
                                            questionId={q._id}
                                            onAnswerChange={handleAnswerChange}
                                        />
                                        {/* Show preview of diagram answer if exists */}
                                        {answers[q._id] && (
                                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                                                    ✓ Diagram saved ({answers[q._id].substring(0, 50)}...)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex justify-center pt-6">
                            <button
                                onClick={handleSubmit}
                                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Submit Exam
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExamSection;