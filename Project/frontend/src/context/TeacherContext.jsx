import { createContext, useState, useContext, useCallback } from "react";
import toast from "react-hot-toast";
import { apiCall } from "../api/api";

const TeacherContext = createContext();
export const useTeacher = () => useContext(TeacherContext);

const url = import.meta.env.VITE_API_URL;

export const TeacherProvider = ({ children }) => {
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);

    const [exams, setExams] = useState([]);
    const [examsLoading, setExamsLoading] = useState(false);
    const [examsError, setExamsError] = useState(null);

    const fetchStudents = useCallback(async (examId) => {
        try {
            setStudentsLoading(true);
            setStudentsError(null);
            const response = await apiCall(`${url}/api/v1/teacher/exam/students`, "GET", {
                params: { examId },
            });

            if (response.status === 200) {
                setStudents(Array.isArray(response.data.students) ? response.data.students : []);
            }
        } catch (err) {
            setStudentsError("Failed to load students");
            toast.error("Failed to load students");
        } finally {
            setStudentsLoading(false);
        }
    }, []);

    const fetchExams = useCallback(async () => {
        try {
            setExamsLoading(true);
            setExamsError(null);
            const response = await apiCall(`${url}/api/v1/teacher/dashboard`, "GET");

            if (response.data?.success) {
                setExams(response.data.exams || []);
            } else {
                setExamsError("Failed to load exams");
                toast.error("Failed to load exams");
            }
        } catch (err) {
            setExamsError("Error loading dashboard");
            toast.error("Error loading dashboard");
        } finally {
            setExamsLoading(false);
        }
    }, []);

    return (
        <TeacherContext.Provider
            value={{
                students,
                studentsLoading,
                studentsError,
                fetchStudents,
                exams,
                examsLoading,
                examsError,
                fetchExams,
            }}
        >
            {children}
        </TeacherContext.Provider>
    );
};
