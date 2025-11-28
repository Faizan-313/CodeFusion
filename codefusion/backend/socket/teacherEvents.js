import { Violation } from "../models/violation.model.js";
import { Exam } from "../models/exam.model.js";
import { submitExam } from "../controllers/exams.controller.js";

export default function registerTeacherEvents(io, socket) {
    socket.on("teacher-action", async (payload) => {
        try {
            const { examId, studentId, action, reason } = payload;

            if (!examId || !studentId || !action) {
                console.warn("Invalid teacher action payload:", payload);
                return;
            }

            const status =
                action === "pause"
                    ? "paused"
                    : action === "terminate"
                    ? "terminated"
                    : action === "resume"
                    ? "active"
                    : null;

            //Update student's violation status in DB
            if (status) {
                await Violation.findOneAndUpdate(
                    { examId, studentId },
                    { status },
                    { new: true, upsert: false }
                );
                console.log(`Violation status updated: ${studentId} → ${status}`);
            }

             // Fetch violations for this exam and populate student info
            const violations = await Violation.find({ examId })
                .populate({
                    path: "studentId",
                    select: "name rollNumber collegeId session batch"
                });

            // Transform to include studentDetails
            const formatted = violations.map(v => ({
                _id: v._id,
                examId: v.examId,
                studentId: v.studentId._id,
                studentDetails: {
                    name: v.studentId.name,
                    rollNumber: v.studentId.rollNumber,
                    collegeId: v.studentId.collegeId,
                    session: v.studentId.session,
                    batch: v.studentId.batch
                },
                violations: v.violations,
                status: v.status,
            }));

            // Send them to the teacher who just joined
            socket.emit("violations-history", { violations: formatted });

            // emit action to the specific student's room
            io.to(`student_${studentId}`).emit("exam-action", { action, reason });

            // emit confirmation back to teachers in the same exam room (optional)
            io.to(`exam_${examId}`).emit("teacher-action-applied", {
                studentId,
                action,
                reason,
            });
        } catch (err) {
            console.error("Error processing teacher action:", err);
        }
    });

    socket.on("fetch-violations", async ({ examId }) => {
        try {
            // Fetch the exam to get all enrolled students
            const exam = await Exam.findById(examId)
                .populate("students", "name rollNumber collegeId session batch")
                .lean();

            if (!exam) {
                console.warn("Exam not found:", examId);
                socket.emit("violations-history", { violations: [] });
                return;
            }

            // Fetch all violations for this exam
            const violations = await Violation.find({ examId })
                .populate("studentId", "name rollNumber collegeId session batch")
                .lean();

            // Create a map of violations by studentId for quick lookup
            const violationsMap = {};
            violations.forEach(v => {
                violationsMap[v.studentId._id.toString()] = v;
            });

            // Combine: violations + all enrolled students
            const formatted = exam.students.map(student => {
                const studentIdStr = student._id.toString();
                const violation = violationsMap[studentIdStr];

                return {
                    studentId: studentIdStr,
                    studentDetails: {
                        name: student.name,
                        rollNumber: student.rollNumber,
                        collegeId: student.collegeId,
                        session: student.session,
                        batch: student.batch,
                    },
                    violations: violation?.violations || [],
                    status: violation?.status || "active",
                };
            });

            socket.emit("violations-history", { violations: formatted });
        } catch (err) {
            console.error("Error fetching violations history:", err);
        }
    });
}
