import express from "express"
import {
    createExam,
    validateCode,
    storeStudentDetails,
    submitExam,
    getExamData,
    deleteExam
} from "../controllers/exams.controller.js"
import authenticateToken from "../middlewares/auth.middleware.js";
import { multipartRequestHandlerMiddleware } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/create", authenticateToken, multipartRequestHandlerMiddleware, createExam);
router.post("/validate-code", validateCode);
router.post("/submit-student-details", storeStudentDetails);
router.post("/submit", submitExam);
router.get("/:examId", getExamData);
router.delete('/:id', authenticateToken, deleteExam)

export default router;