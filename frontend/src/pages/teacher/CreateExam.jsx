import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Send, Clock, Calendar, FileText, Code, CheckSquare, Check, Edit2, AlertCircle, FileLock2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiCall } from "../../api/api";
import { useNavigate } from "react-router-dom";
import ImageUploadComponent from "./components/ImageUploadComponent";
import validateExamDetails from "./utils/validateExamDetails";


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
            image: null,
            imagePreview: null,
            isCompleted: false,
        };

        if (type === "mcq") {
            newQuestion.options = ["", "", "", ""];
            newQuestion.correctAnswer = 0;
        }

        setQuestions([...questions, newQuestion]);
    };

    // get already entered data stored in localstorage on load
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

                    // Ensure any draft loaded does NOT restore image fields (clear them)
                    const sanitizedQuestions = (examData.questions || []).map(q => ({
                        ...q,
                        image: null,
                        imagePreview: null
                    }));

                    setQuestions(sanitizedQuestions);
                    setTotalMarks(examData.totalMarks || 0);
                }
            } catch {
                toast.error("Failed to load saved draft");
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
            toast.error("Please fill in the question text and valid marks before marking as done");
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
        // If saving as draft, save exam data without actual File objects 
        if (isDraft) {
            try {
                // Do NOT persist any image-related data in drafts. Clear image and preview so user must re-upload when publishing.
                const questionsForDraft = questions.map((q) => ({
                    ...q,
                    image: null,
                    imagePreview: null
                }));

                const draftExamData = {
                    examDetails,
                    questions: questionsForDraft,
                    totalMarks
                };

                localStorage.setItem("createExamDraft", JSON.stringify(draftExamData));
                toast.success("Exam saved as draft! Images are not stored in drafts.");
            } catch (error) {
                console.error("Error saving draft:", error);
                toast.error("Failed to save draft");
            }
            return;
        }

        const isValid = validateExamDetails(examDetails, questions);
        if (!isValid) return;

        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].questionText.trim()) {
                toast.error(`Question ${i + 1} text is required`);
                return;
            }
            if (!questions[i].marks || parseInt(questions[i].marks) <= 0) {
                toast.error(`Question ${i + 1} must have valid marks`);
                return;
            }
            if (questions[i].type === "mcq") {
                const filledOptions = questions[i].options.filter(opt => opt.trim());
                if (filledOptions.length < 2) {
                    toast.error(`Question ${i + 1} (MCQ) must have at least 2 options`);
                    return;
                }
            }
        }

        // Prepare FormData to send as multipart/form-data so we are able to include File objects directly
        const formData = new FormData();
        formData.append('examDetails', JSON.stringify({ ...examDetails, 
                            duration: parseInt(examDetails.duration), 
                            startTime: new Date(examDetails.startTime).toISOString(), 
                            endTime: new Date(examDetails.endTime).toISOString() 
                        }));

        // Questions payload (without files) include a hasImage flag for each question
        const questionsPayload = questions.map((q) => ({
            type: q.type,
            questionText: q.questionText,
            marks: parseInt(q.marks),
            ...(q.type === 'mcq' ? { options: q.options } : {}),
            hasImage: !!q.image
        }));
        
        formData.append('questions', JSON.stringify(questionsPayload));
        formData.append('totalMarks', String(totalMarks));

        // Append images with keys that indicate their question index
        questions.forEach((q, i) => {
            if (q.image && !(typeof q.image === 'string')) {
                formData.append(`image_${i}`, q.image);
            }
        });

        setIsSubmitting(true);

        try {
            // we're sending multipart/form-data so the backend should accept files under keys like `image_0`, `image_1`, ...
            const res = await apiCall(`${import.meta.env.VITE_API_URL}/api/v1/exams/create`, "POST", { data: formData });
            if (res.status === 200) {
                toast.success("Exam published successfully!");

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
            if(error.status === 413)
                toast.error("Image size must be less than 2mb")
            else
                toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getQuestionIcon = (type) => {
        switch (type) {
            case "code": return <Code className="w-4 h-4" />;
            case "text": return <FileText className="w-4 h-4" />;
            case "mcq": return <CheckSquare className="w-4 h-4" />;
            case "diagram": return <Calendar className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const renderCompletedQuestion = (q, index) => {
        return (
            <div className="border-2 border-[#9ec8b9] rounded-xl p-6 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-lg">Question {index + 1}</h4>
                            <span className="text-sm text-gray-500">({q.type === "mcq" ? "Multiple Choice" : q.type === "code" ? "Code Question" : q.type === "diagram" ? "Diagram based" : "Text Answer"})</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => editQuestion(index)}
                            className="text-[#1b4242] hover:text-[#092635] hover:bg-[#9ec8b9] p-2 rounded-lg transition-all"
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
                        <span className="ml-4 px-3 py-1 bg-[#9ec8b9] text-[#092635] rounded-full text-sm font-semibold whitespace-nowrap">
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
            <div className="border-2 border-[#9ec8b9] rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#9ec8b9] text-[#092635] flex items-center justify-center font-bold text-lg">
                            {index + 1}
                        </div>
                        <h4 className="font-bold text-[#1b4242] text-lg">
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
                        <label htmlFor={`type-${index}`} className="block text-sm font-semibold text-[#1b4242] mb-2">
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
                                className="border-2 border-[#9ec8b9] p-3 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition appearance-none bg-white text-gray-800"
                            >
                                <option value="code">Code Question</option>
                                <option value="text">Text Answer</option>
                                <option value="diagram">Diagram based</option>
                                <option value="mcq">Multiple Choice</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor={`marks-${index}`} className="block text-sm font-semibold text-[#1b4242] mb-2">
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
                            className="border-2 border-[#9ec8b9] p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition text-gray-800"
                            min="1"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor={`questionText-${index}`} className="block text-sm font-semibold text-[#1b4242] mb-2">
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
                        className="border-2 border-[#9ec8b9] p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition resize-none text-gray-800"
                        rows={3}
                    />
                </div>

                <ImageUploadComponent key={index} index={index} questions={questions} setQuestions={setQuestions} />

                {q.type === "mcq" && (
                    <div className="bg-[#f0f7f6] p-4 rounded-lg border border-[#5c8374] mb-4">
                        <span className="block text-sm font-semibold text-[#1b4242] mb-3">
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
                                        className="w-4 h-4 text-[#1b4242] focus:ring-[#5c8374]"
                                    />
                                    <label htmlFor={`q-${index}-opt-${optIndex}`} className="flex-1">
                                        <input
                                            type="text"
                                            placeholder={`Option ${optIndex + 1}`}
                                            value={option}
                                            onChange={(e) =>
                                                handleOptionChange(index, optIndex, e.target.value)
                                            }
                                            className="border-2 border-[#9ec8b9] p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition bg-white text-gray-800"
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-[#5c8374] mt-2">
                            Select the correct answer
                        </p>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={() => markQuestionComplete(index)}
                        className="flex items-center gap-2 px-5 py-3 mt-2 bg-gradient-to-r from-[#5c8374] to-[#1b4242] text-white rounded-lg hover:from-[#1b4242] hover:to-[#092635] transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                        <Check className="w-5 h-5" />
                        Done
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#9ec8b9] via-[#5c8374] to-[#092635] pb-8 pt-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-[#f5f5f5] rounded-2xl shadow-2xl p-8 mb-6 border-t-4 border-[#092635]">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-[#092635]">Create New Exam</h1>
                        <div className="bg-[#9ec8b9] text-[#092635] px-4 py-2 rounded-full font-semibold">
                            Total: {totalMarks} marks
                        </div>
                    </div>
                    <p className="text-gray-600">Design your exam with custom questions and settings</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border border-[#9ec8b9]">
                    <h2 className="text-xl font-bold text-[#1b4242] mb-6 flex items-center gap-2">
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
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition"
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
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition"
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
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition"
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
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition"
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
                                className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition"
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
                            className="border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-transparent transition resize-none"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1b4242] flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Questions ({questions.length})
                        </h2>
                        <button
                            onClick={() => addQuestion("code")}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5c8374] to-[#1b4242] text-white rounded-lg hover:from-[#1b4242] hover:to-[#092635] transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Add Question
                        </button>
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center py-12 bg-[#9ec8b9]/20 rounded-xl border-2 border-dashed border-[#5c8374]">
                            <FileText className="w-16 h-16 text-[#5c8374] mx-auto mb-4" />
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
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#1b4242] to-[#092635] text-white rounded-lg hover:from-[#092635] hover:to-[#092635] transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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