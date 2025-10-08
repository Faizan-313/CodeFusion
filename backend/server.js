import express from "express"
import "dotenv/config"
import cors from "cors"
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

connectDB();

//routes
import authRouter from "./routes/auth.routes.js"
import examRouter from "./routes/exam.routes.js"
import dashboardRouter from "./routes/teacher.routes.js"

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/exams', examRouter);
app.use('/api/v1/teacher', dashboardRouter);


app.listen(port, () =>{
    console.log(`Server is listining on PORT ${port}`)
})