import { Exam } from "../models/exam.model.js";
import { ExamSubmission } from "../models/examSubmission.model.js";
import { QuestionPaper } from "../models/questions.model.js";
import { Student } from "../models/student.model.js";
import { Violation } from "../models/violation.model.js";


const dashboardData = async (req, res) => {
    try {
        const id = req.user._id;
        const exams = await Exam.find({ createdBy: id })
            .populate({
                path: "questionPaper",
                select: "questions",
            })
            .sort({ createdAt: -1 });

        if (!exams || exams.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No exams created yet",
                exams: [],
            });
        }
        
        // Prepare formatted response for frontend
        const formattedExams = await Promise.all(exams.map(async (exam) => {
            const paper = await QuestionPaper.findOne({ examId: exam._id });
            return {
                _id: exam._id,
                title: exam.title,
                examCode: exam.examCode,
                description: exam.description,
                duration: exam.duration,
                totalMarks: exam.totalMarks,
                startTime: exam.startTime,
                endTime: exam.endTime,
                questions: paper?.questions || [],
                createdAt: exam.createdAt,
            };
        }));

        return res.status(200).json({
            success: true,
            exams: formattedExams,
        });
    } catch (error) {
        console.log("Error in dashboard: ", error)
        return res.status(500).json({ message: "Something went wrong" });
    }
}

const studentList = async (req, res) => {
    try {
        const { examId } = req.query;
        if (!examId) {
            return res.status(400).json({ message: "Exam ID is required." });
        }

        //Find students who have attempted this exam
        const students = await Student.find({
            examsAttempted: { $exists: true, $ne: [] },
            })
            .populate({
                    path: "examsAttempted",
                    match: { examId }, // filter submissions related to this exam
                    populate: {
                        path: "examId",
                },
        })
        .select("name rollNumber collegeId batch session examsAttempted");

        // Filter only those who actually have an attempt for this exam
        const filtered = students.filter(
            (stu) => stu.examsAttempted && stu.examsAttempted.length > 0
        );

        if (filtered.length === 0) {
            return res.status(200).json({
                message: "No students have attempted this exam yet.",
                students: [],
            });
        }

        //Success response
        return res.status(200).json({
            message: "Students and their answer sheets fetched successfully.",
            students: filtered,
        });

    } catch (error) {
        console.error("Error in getting students for evaluation:", error);
        return res.status(500).json({ message: "Something went wrong." });
    }
};


const evaluatedPaper = async (req, res) => {
    try {
        const {
            examId,
            studentId,
            totalScore,
            evaluatorComments,
            answers, 
        } = req.body.data || req.body;

        if (!examId || !studentId || totalScore == null || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Invalid data received" });
        }

        const studentSubmission = await ExamSubmission.findOne({ examId, studentId });
        if (!studentSubmission) {
            return res.status(404).json({ message: "No submission found" });
        }

        // Update answers with evaluated marks
        studentSubmission.answers = studentSubmission.answers.map((ans) => {
            const updated = answers.find(
                (a) => String(a.questionId) === String(ans.questionId)
            );
            if (updated) {
                ans.marksObtained = updated.marksObtained || 0;
            }
            return ans;
        });

        studentSubmission.totalScore = totalScore;
        studentSubmission.evaluatorComments = evaluatorComments || "";
        studentSubmission.evaluateStatus = "Evaluated";

        await studentSubmission.save();

        return res.status(200).json({
            message: "Evaluation saved successfully",
            updatedSubmission: studentSubmission,
        });
    } catch (error) {
        console.error("Error in storing evaluated paper:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


const getStudent = async (req, res) => {
    try {
        const studentId = req.query.studentId || req.params.studentId || req.body.studentId;

        if (!studentId) {
            return res.status(400).json({ message: "Student ID is missing" });
        }

        let student = await Student.findById(studentId)
            .populate({
                path: "examsAttempted",
                populate: {
                    path: "examId",
                },
            })
            .lean();

        if (!student) {
            student = await Student.findOne({
                $or: [{ studentId: studentId }, { rollNumber: studentId }],
            })
            .populate({
                path: "examsAttempted",
                populate: {
                    path: "examId",
                },
            })
            .lean();
        }

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const violations = await Violation.find({ studentId: student._id }).select("violations");
        student.violations = violations || [];

        return res.status(200).json({ student });
    } catch (error) {
        console.error("Error fetching student:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


export {
    dashboardData,
    studentList,
    evaluatedPaper,
    getStudent
}