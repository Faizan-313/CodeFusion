import mongoose from "mongoose";

const AuthResetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        resetCodeHash: {
            type: String,
            required: true
        },

        isUsed: {
            type: Boolean,
            default: false
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true
        },
        attempts: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export const AuthReset = mongoose.model("AuthReset", AuthResetSchema);
