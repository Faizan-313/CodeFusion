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
        enum: ["active", "paused", "terminated", "submitted"],
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

// Add indexes for frequently queried fields
violationSchema.index({ examId: 1 });
violationSchema.index({ studentId: 1, examId: 1 });

export const Violation = mongoose.model("Violation", violationSchema);
