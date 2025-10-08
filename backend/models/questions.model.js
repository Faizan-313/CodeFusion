import mongoose from "mongoose";

const QuestionPaperSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    questions: [
        {
        type: {
            type: String,
            enum: ["mcq", "code", "text"],
            required: true,
        },
        questionText: { type: String, required: true },
        marks: { type: Number, required: true },

        // Only if MCQ
        options: [String],
        correctAnswer: { type: Number }, // index (0–3)
        },
    ],
});

export const QuestionPaper = mongoose.model("QuestionPaper", QuestionPaperSchema);
