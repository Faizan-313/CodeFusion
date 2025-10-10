import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    batch: { type: Number, required: true },
    session: { type: String, required: true },
    collegeId: { type: String, required: true },
    token: { type: String },
    examsAttempted: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExamSubmission",
            default: [],
        },
    ],
}, { timestamps: true });

export const Student = new mongoose.model("Student", StudentSchema);
