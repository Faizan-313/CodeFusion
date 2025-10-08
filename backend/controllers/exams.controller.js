import { Exam } from "../models/exam.model.js";
import { QuestionPaper } from "../models/questions.model.js"; 
import { User } from "../models/user.model.js"; 
import { v4 as uuidv4 } from "uuid";


const createExam = async (req, res) => {
    try {
        const { examDetails, questions, totalMarks } = req.body;
        
        //generate the unique code
        const code = examDetails.examCode;
        const uniqueCode = `${code}-${uuidv4().split("-")[0].toUpperCase()}`; 

        //create new exam and save it
        const newExam = new Exam({
            ...examDetails,
            duration: parseInt(examDetails.duration),
            totalMarks,
            examCode: uniqueCode,
            createdBy: req.user._id
        });
        await newExam.save();

        //create question paper linked to it
        const newQuestionPaper = new QuestionPaper({
            examId: newExam._id,
            questions: questions.map(q => ({
                ...q,
                marks: parseInt(q.marks),
                Options: q.options,
            })),
        })
        await newQuestionPaper.save();

         // Link QuestionPaper to Exam
        newExam.questionPaper = newQuestionPaper._id;
        await newExam.save();

        // Update teacher record (add exam to their created list)
        await User.findByIdAndUpdate(req.user._id, {
            $push: { examsCreated: newExam._id },
        });

        // Send success response
        return res.status(200).json({ message: "Exam created successfully" });
    } catch (error) {
        console.log("Error in creating exam: ", error);
        return res.status(500).json({ message: "Something went wrong" })
    }
}

export {
    createExam
}