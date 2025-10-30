import express from "express"
import {
    createExam,
    validateCode,
    storeStudentDetails,
    submitAnswers,
    getExamData
} from "../controllers/exams.controller.js"
import authenticateToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createExam);
router.post("/validate-code", validateCode);
router.post("/submit-student-details", storeStudentDetails);
router.post("/submit", submitAnswers);
router.get("/:examId", getExamData);

export default router;