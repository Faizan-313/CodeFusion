import mongoose from "mongoose";

const ExamSubmissionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    evaluatorsComments: {
        type: String,
        default: "",
    },
    evaluateStatus: {
        type: String,
        enum : ["Pending", "Evaluated"],
        default: "Pending"
    },
    answers: [
        {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        questionType: {
            type: String,
            enum: ["mcq", "code", "text", "diagram"],
            required: true,
        },
        answerText: String,
        marks: { type: Number },
        marksObtained: { type: Number, default: 0 },
        },
    ],
    totalScore: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
},{timestamps: true });

export const ExamSubmission = new mongoose.model("ExamSubmission", ExamSubmissionSchema);
