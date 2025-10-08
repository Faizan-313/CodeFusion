import { Exam } from "../models/exam.model.js";
import { QuestionPaper } from "../models/questions.model.js";


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

export {
    dashboardData
}