import express from "express"
import authenticateToken from "../middlewares/auth.middleware.js"
import { dashboardData } from "../controllers/dashboard.controller.js";

const router = express.Router()

router.get('/dashboard', authenticateToken, dashboardData);

export default router