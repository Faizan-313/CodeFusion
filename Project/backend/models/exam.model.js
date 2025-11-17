import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    duration: { type: Number, required: true }, //minutes
    examCode: { type: String, unique: true, required: true }, // auto-generated
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalMarks: { type: Number, default: 0 },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // teacher ID
    questionPaper: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionPaper" },
    createdAt: { type: Date, default: Date.now },
});

export const Exam = mongoose.model("Exam", ExamSchema);
