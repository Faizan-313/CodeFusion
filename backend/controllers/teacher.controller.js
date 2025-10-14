import { Exam } from "../models/exam.model.js";
import { ExamSubmission } from "../models/examSubmission.model.js";
import { QuestionPaper } from "../models/questions.model.js";
import { Student } from "../models/student.model.js";


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

const evaluatedPaper = async (req, res)=>{
    try {
        const { examId, studentId, totalScore, evaluatorsComments, answers } = req.body;
        //check for input correctness
        if(!examId || !studentId || !totalScore || !answers || answers.length === 0){
            return res.status(400).json({ message: "Invalid Data" })
        }

        //find the examsubmission form the database for this student
        const studentSubmission = await ExamSubmission.findOne({ examId, studentId });
        if(!studentSubmission){
            return res.status(404).json({ message: "No submission present" });
        }
        
        //store the evaluated results
        studentSubmission.answers = answers;
        studentSubmission.totalScore = totalScore;
        studentSubmission.evaluatorsComments = evaluatorsComments || "";
        studentSubmission.evaluateStatus = "Evaluated";
        await studentSubmission.save();

        //return success
        return res.status(200).json({ message: "Done" });
    } catch (error) {
        console.log("Error in storing evaluated paper: ", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

export {
    dashboardData,
    studentList,
    evaluatedPaper
}