import { Violation } from "../models/violation.model.js";

export default function registerStudentEvents(io, socket) {
    // Handle student joining exam
    socket.on("student-joined", async (payload) => {
        try {
            const { examId, studentId, studentDetails } = payload;

            if (!examId || !studentId || !studentDetails) {
                console.warn("Invalid student-joined payload:", payload);
                return;
            }

            // Broadcast to teachers monitoring this exam
            const broadcastData = {
                examId,
                studentId,
                studentDetails,
                joinedAt: new Date().toISOString()
            };
            
            io.to(`exam_${examId}`).emit("student-joined", broadcastData);
            
            console.log(`Broadcasted successfully to exam_${examId}`);
        } catch (err) {
            console.error("Error handling student join:", err);
        }
    });

    // Handle new violations
    socket.on("new-violation", async (payload) => {
        try {
            const { examId, studentId, violation, studentDetails } = payload;

            if (!studentId || !examId || !violation?.type) {
                console.warn("Invalid violation payload:", payload);
                return;
            }

            const violationDoc = await Violation.findOneAndUpdate(
                { studentId, examId },
                { 
                    $push: { violations: violation },
                    $set: { 
                        studentDetails,
                        lastViolationAt: new Date()
                    }
                },
                { new: true, upsert: true }
            );

            // Broadcast to teachers monitoring this exam
            const broadcastData = {
                examId,
                studentId,
                violation,
                studentDetails,
                timestamp: new Date().toISOString()
            };
            
            io.to(`exam_${examId}`).emit("new-violation", broadcastData);
            
            console.log(`Violation broadcasted successfully`);
        } catch (err) {
            console.error("Error saving violation:", err);
        }
    });

    // Handle student heartbeat (for monitoring)
    socket.on("studentHeartbeat", (payload) => {
        const { examId, studentId, timeLeft } = payload;
        
        // Broadcast heartbeat to teachers (silent, no logs to avoid spam)
        io.to(`exam_${examId}`).emit("student-heartbeat", {
            studentId,
            timeLeft,
            timestamp: new Date().toISOString()
        });
    });

    // Handle student submission
    socket.on("student-submitted", async (payload) => {
        try {
            const { examId, studentId } = payload;

            if (!examId || !studentId) {
                console.warn("Invalid student-submitted payload:", payload);
                return;
            }
            
            //if violation exists, update status to submitted
            await Violation.findOneAndUpdate(
                { examId, studentId },
                { status: "submitted" },
                { new: true, upsert: false }
            );

            console.log(`Student ${studentId} submitted exam ${examId}`);

            // Broadcast to teachers
            const broadcastData = {
                examId,
                studentId,
                submittedAt: new Date().toISOString()
            };
            
            io.to(`exam_${examId}`).emit("student-submitted", broadcastData);
            
            console.log(`Submission broadcasted successfully`);
        } catch (err) {
            console.error("Error handling student submission:", err);
        }
    });
}