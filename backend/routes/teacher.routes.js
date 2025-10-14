import express from "express"
import authenticateToken from "../middlewares/auth.middleware.js"
import { 
    dashboardData,
    studentList,
    evaluatedPaper
} from "../controllers/teacher.controller.js";

const router = express.Router()

router.get('/dashboard', authenticateToken, dashboardData);
router.get('/exam/students', authenticateToken, studentList);
router.post('/evaluate-paper', authenticateToken, evaluatedPaper);

export default router