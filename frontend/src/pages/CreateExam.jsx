import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Send, Clock, Calendar, FileText, Code, CheckSquare, Check, Edit2, AlertCircle, FileLock2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiCall } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CreateExam() {
    const [examDetails, setExamDetails] = useState({
        title: "",
        description: "",
        duration: "",
        examCode: "",
        startTime: "",
        endTime: ""
    });

    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [totalMarks, setTotalMarks] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleExamChange = (e) => {
        setExamDetails({ ...examDetails, [e.target.name]: e.target.value });
    };

    const addQuestion = (type = "code") => {
        const newQuestion = {
            type,
            questionText: "",
            marks: "",
            isCompleted: false,
        };

        if (type === "mcq") {
            newQuestion.options = ["", "", "", ""];
            newQuestion.correctAnswer = 0;
        }

        setQuestions([...questions, newQuestion]);
    };

    useEffect(() => {
        const data = localStorage.getItem("createExamDraft");
        if (data) {
            try {
                const examData = JSON.parse(data);
                if (examData) {
                    setExamDetails(examData.examDetails || {
                        title: "",
                        description: "",
                        duration: "",
                        examCode: "",
                        startTime: "",
                        endTime: ""
                    });
                    setQuestions(examData.questions || []);
                    setTotalMarks(examData.totalMarks || 0);
                }
            } catch (e) {
                toast.error("⚠️ Failed to load saved draft");
                localStorage.removeItem("createExamDraft");
            }
        }
    }, []);

    const confirmDelete = (index) => {
        setQuestionToDelete(index);
        setShowDeleteModal(true);
    };

    const removeQuestion = () => {
        if (questionToDelete !== null) {
            const removed = questions[questionToDelete];
            setQuestions(questions.filter((_, i) => i !== questionToDelete));
            setTotalMarks(totalMarks - (parseInt(removed.marks) || 0));
            setShowDeleteModal(false);
            setQuestionToDelete(null);
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        const oldMarks = parseInt(updated[index].marks) || 0;
        updated[index][field] = value;

        if (field === "marks") {
            const newMarks = parseInt(value) || 0;
            setTotalMarks(totalMarks - oldMarks + newMarks);
        }

        if (field === "type" && value === "mcq" && !updated[index].options) {
            updated[index].options = ["", "", "", ""];
            updated[index].correctAnswer = 0;
        }

        if (field === "type" && value !== "mcq" && updated[index].options) {
            delete updated[index].options;
            delete updated[index].correctAnswer;
        }

        setQuestions(updated);
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = value;
        setQuestions(updated);
    };

    const markQuestionComplete = (index) => {
        if (!questions[index].questionText.trim() || !questions[index].marks || parseInt(questions[index].marks) <= 0) {
            toast.error("⚠️ Please fill in the question text and valid marks before marking as done");
            return;
        }
        const updated = [...questions];
        updated[index].isCompleted = true;
        setQuestions(updated);
    };

    const editQuestion = (index) => {
        const updated = [...questions];
        updated[index].isCompleted = false;
        setQuestions(updated);
    };

    const handleSubmit = async (isDraft = false) => {
        if (!examDetails.title.trim()) {
            toast.error("⚠️ Please enter an exam title");
            return;
        }

        if (!examDetails.examCode.trim()) {
            toast.error("⚠️ Please set an exam code");
            return;
        }

        if (!examDetails.duration || parseInt(examDetails.duration) <= 0) {
            toast.error("⚠️ Please enter a valid duration");
            return;
        }

        if (!examDetails.startTime || !examDetails.endTime) {
            toast.error("⚠️ Please select start and end times");
            return;
        }

        if (new Date(examDetails.startTime) >= new Date(examDetails.endTime)) {
            toast.error("⚠️ End time must be after start time");
            return;
        }

        if (questions.length === 0) {
            toast.error("⚠️ Please add at least one question");
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].questionText.trim()) {
                toast.error(`⚠️ Question ${i + 1} text is required`);
                return;
            }
            if (!questions[i].marks || parseInt(questions[i].marks) <= 0) {
                toast.error(`⚠️ Question ${i + 1} must have valid marks`);
                return;
            }
            if (questions[i].type === "mcq") {
                const filledOptions = questions[i].options.filter(opt => opt.trim());
                if (filledOptions.length < 2) {
                    toast.error(`⚠️ Question ${i + 1} (MCQ) must have at least 2 options`);
                    return;
                }
            }
        }

        const sanitizedQuestions = questions.map(q => ({
            type: q.type,
            questionText: q.questionText,
            marks: parseInt(q.marks),
            ...(q.type === "mcq" ? { options: q.options } : {}),
        }));

        const examDataToSend = {
            examDetails: {
                ...examDetails,
                duration: parseInt(examDetails.duration)
            },
            questions: sanitizedQuestions,
            totalMarks
        };

        // If saving as draft, just save to localStorage
        if (isDraft) {
            try {
                localStorage.setItem("createExamDraft", JSON.stringify(examDataToSend));
                toast.success("✅ Exam saved as draft!");
            } catch (error) {
                console.error("Error saving draft:", error);
                toast.error("⚠️ Failed to save draft");
            }
            return;
        }

        // If publishing, submit to API
        setIsSubmitting(true);

        try {
            const res = await apiCall(`${import.meta.env.VITE_API_URL}/api/v1/exams/create`, "POST", { data: examDataToSend });
            if (res.status === 200) {
                toast.success("🎉 Exam published successfully!");

                // Clear localStorage and reset form
                localStorage.removeItem("createExamDraft");
                setExamDetails({
                    title: "",
                    description: "",
                    duration: "",
                    examCode: "",
                    startTime: "",
                    endTime: ""
                });
                setQuestions([]);
                setTotalMarks(0);
                navigate("/dashboard")
            }
        } catch (error) {
            console.error("Unexpected error during submission:", error);
            toast.error("⚠️ An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getQuestionIcon = (type) => {
        switch (type) {
            case "code": return <Code className="w-4 h-4" />;
            case "text": return <FileText className="w-4 h-4" />;
            case "mcq": return <CheckSquare className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const renderCompletedQuestion = (q, index) => {
        return (
            <div className="border-2 border-blue-200 rounded-xl p-6 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-lg">Question {index + 1}</h4>
                            <span className="text-sm text-gray-500">({q.type === "mcq" ? "Multiple Choice" : q.type === "code" ? "Code Question" : "Text Answer"})</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => editQuestion(index)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-all"
                            title="Edit Question"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => confirmDelete(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                            title="Delete Question"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <p className="text-gray-800 text-base leading-relaxed flex-1">{q.questionText}</p>
                        <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold whitespace-nowrap">
                            {q.marks} marks
                        </span>
                    </div>

                    {q.type === "mcq" && (
                        <div className="mt-4 space-y-2 pl-4">
                            {q.options.map((option, optIndex) => (
                                option.trim() && (
                                    <div key={optIndex} className="flex items-start gap-2">
                                        <span className={`font-semibold ${q.correctAnswer === optIndex ? 'text-green-600' : 'text-gray-600'}`}>
                                            {String.fromCharCode(65 + optIndex)}.
                                        </span>
                                        <span className={`${q.correctAnswer === optIndex ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                                            {option}
                                            {q.correctAnswer === optIndex && ' ✓'}
                                        </span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderEditableQuestion = (q, index) => {
        return (
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                            {index + 1}
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">
                            Question {index + 1}
                        </h4>
                    </div>
                    <button
                        onClick={() => confirmDelete(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Delete Question"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor={`type-${index}`} className="block text-sm font-semibold text-gray-700 mb-2">
                            Question Type
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                {getQuestionIcon(q.type)}
                            </div>
                            <select
                                id={`type-${index}`}
                                value={q.type}
                                onChange={(e) =>
                                    handleQuestionChange(index, "type", e.target.value)
                                }
                                className="border-2 border-gray-300 p-3 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                            >
                                <option value="code">Code Question</option>
                                <option value="text">Text Answer</option>
                                <option value="mcq">Multiple Choice</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor={`marks-${index}`} className="block text-sm font-semibold text-gray-700 mb-2">
                            Marks
                        </label>
                        <input
                            type="number"
                            id={`marks-${index}`}
                            placeholder="10"
                            value={q.marks}
                            onChange={(e) =>
                                handleQuestionChange(index, "marks", e.target.value)
                            }
                            required
                            className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            min="1"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor={`questionText-${index}`} className="block text-sm font-semibold text-gray-700 mb-2">
                        Question Text
                    </label>
                    <textarea
                        id={`questionText-${index}`}
                        placeholder="Enter your question here..."
                        value={q.questionText}
                        onChange={(e) =>
                            handleQuestionChange(index, "questionText", e.target.value)
                        }
                        required
                        className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        rows={3}
                    />
                </div>

                {q.type === "mcq" && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                        <span className="block text-sm font-semibold text-gray-700 mb-3">
                            Multiple Choice Options
                        </span>
                        <div className="space-y-2">
                            {q.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id={`q-${index}-opt-${optIndex}`}
                                        name={`correct-${index}`}
                                        checked={q.correctAnswer === optIndex}
                                        onChange={() =>
                                            handleQuestionChange(index, "correctAnswer", optIndex)
                                        }
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`q-${index}-opt-${optIndex}`} className="flex-1">
                                        <input
                                            type="text"
                                            placeholder={`Option ${optIndex + 1}`}
                                            value={option}
                                            onChange={(e) =>
                                                handleOptionChange(index, optIndex, e.target.value)
                                            }
                                            className="border-2 border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                            Select the radio button for the correct answer
                        </p>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={() => markQuestionComplete(index)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                        <Check className="w-5 h-5" />
                        Done
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 pb-8 pt-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border-t-4 border-blue-700">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-800">Create New Exam</h1>
                        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                            Total: {totalMarks} marks
                        </div>
                    </div>
                    <p className="text-gray-600">Design your exam with custom questions and settings</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                    <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Exam Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label htmlFor="exam-title" className="block text-sm font-semibold text-gray-700 mb-2">
                                Exam Title
                            </label>
                            <input
                                type="text"
                                id="exam-title"
                                name="title"
                                placeholder="e.g., Data Structures Final Exam"
                                value={examDetails.title}
                                onChange={handleExamChange}
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="exam-duration" className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                id="exam-duration"
                                name="duration"
                                placeholder="60"
                                value={examDetails.duration}
                                onChange={handleExamChange}
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                min="1"
                            />
                        </div>

                        <div>
                            <label htmlFor="exam-code" className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-1">
                                <FileLock2 className="w-4 h-4" />
                                Exam Code
                            </label>
                            <input
                                type="text"
                                id="exam-code"
                                name="examCode"
                                placeholder="Set an exam code"
                                value={examDetails.examCode}
                                onChange={handleExamChange}
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="exam-startTime" className="block text-sm font-semibold text-gray-700 mb-2">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                id="exam-startTime"
                                name="startTime"
                                value={examDetails.startTime}
                                onChange={handleExamChange}
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="exam-endTime" className="block text-sm font-semibold text-gray-700 mb-2">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                id="exam-endTime"
                                name="endTime"
                                value={examDetails.endTime}
                                onChange={handleExamChange}
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="exam-description" className="block text-sm font-semibold text-gray-700 mb-2">
                            Description / Instructions
                        </label>
                        <textarea
                            id="exam-description"
                            name="description"
                            placeholder="Enter exam instructions, guidelines, or any important notes for students..."
                            value={examDetails.description}
                            onChange={handleExamChange}
                            className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Questions ({questions.length})
                        </h2>
                        <button
                            onClick={() => addQuestion("code")}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Add Question
                        </button>
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center py-12 bg-blue-50 rounded-xl border-2 border-dashed border-blue-300">
                            <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg font-medium">No questions added yet</p>
                            <p className="text-gray-500 mt-2">Click "Add Question" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={index}>
                                    {q.isCompleted ? renderCompletedQuestion(q, index) : renderEditableQuestion(q, index)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        Save as Draft
                    </button>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-lg hover:from-blue-800 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                        {isSubmitting ? "Publishing..." : "Publish Exam"}
                    </button>
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-700/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Delete Question?</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete Question {questionToDelete !== null ? questionToDelete + 1 : ''}? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setQuestionToDelete(null);
                                }}
                                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={removeQuestion}
                                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}