import mongoose from "mongoose";

const violationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "paused", "terminated"],
        default: "active"
    },
    violations: [
        {
            type: {
                type: String,
                enum: [
                    "tab_switch",
                    "window_blur",
                    "devtools_opened",
                    "right_click_attempt",
                    "blocked_shortcut",
                    "fullscreen_exit"
                ],
                required: true
            },
            timestamp: { type: Date, default: Date.now },
        }
    ]
}, {
    timestamps: true
});

export const Violation = mongoose.model("Violation", violationSchema);
