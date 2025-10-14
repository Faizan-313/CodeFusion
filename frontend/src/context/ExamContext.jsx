import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ExamContext = createContext();

export function useExam() {
    return useContext(ExamContext);
}

const url = import.meta.env.VITE_API_URL;

export function ExamProvider({ children }) {
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [studentDetails, setStudentDetails] = useState(null);
    const [questionPaper, setQuestionPaper] = useState(null); 

    //Restore exam details if present
    useEffect(() => {
        const storedExam = sessionStorage.getItem("examDetails");
        if (storedExam) {
            setExam(JSON.parse(storedExam));
        }
    }, []);

    //Persist exam details when updated
    useEffect(() => {
        if (exam) {
            sessionStorage.setItem("examDetails", JSON.stringify(exam));
        }
    }, [exam]);

    const validateExamCode = async (examCode) => {
        try {
            setLoading(true);
            const res = await axios.post(
                `${url}/api/v1/exams/validate-code`,
                { examCode },
                { withCredentials: true }
            );

            if (res.status === 200) {
                setExam(res.data.examDetails);
                return { success: true };
            }
        } catch (error) {
            console.log("Error in validating exam code:", error);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const submitStudentDetails = async (details) => {
        try {
            setLoading(true);
            const res = await axios.post(`${url}/api/v1/exams/submit-student-details`, details, { withCredentials: true});
            if(res.status === 200){
                setStudentDetails(res.data.student);
                setQuestionPaper(res.data.question);
                return { success: true };
            }
        } catch (error) {
            console.log("Error in submitting student details: ", error);
            toast.error(error?.response?.data?.message)
            return { success: false };
        }finally{
            setLoading(false);
        }
    }

    const value = {
        exam,
        setExam,
        validateExamCode,
        submitStudentDetails,
        questionPaper,
        studentDetails,
        loading,
    };

    return (
        <ExamContext.Provider value={value}>
            {children}
        </ExamContext.Provider>
    );
}
