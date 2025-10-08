import express from "express"
import {
    createExam
} from "../controllers/exams.controller.js"
import authenticateToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createExam);

export default router;