import React from "react";
import ExamInstructions from "../../components/ExamInstruction"
import { toast } from "react-hot-toast";
import { useExam } from "../../context/ExamContext";
import { useNavigate } from "react-router-dom";

function StartExam() {
    const [openCodeWindow, setOpenCodeWindow] = React.useState(false);
    const [examCode, setExamCode] = React.useState("");
    const { validateExamCode } = useExam();
    const navigate = useNavigate();

    const checkCheckBox = () => {
        const checkbox = document.getElementById("instructionsAck");
        if(!checkbox.checked){
            toast.error("Please acknowledge that you have read the instructions.");
            return false;
        }
        return true;
    }

    const handleClick = () => {
        if(!checkCheckBox()) return;
        setOpenCodeWindow(true);
    }

    const handleEnterExam = async () => {
        if(!examCode.trim()){
            toast.error("Please enter a valid exam code.");
            return;
        }
        const res = await validateExamCode(examCode.trim());
        if(res.success){
            toast.success("Code validated!");
            toast.dismiss();
            navigate("/exam/student/details");
            return;
        }else{
            toast.error(res.error);
            return;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-cyan-600 dark:text-cyan-400">
                    Exam Portal
                </h1>

                {/* Instructions Section */}
                <ExamInstructions />
                
                <div className="flex items-start sm:items-center justify-center mb-6 mt-4 px-2">
                    <input 
                        type="checkbox" 
                        id="instructionsAck"
                        required
                        className="mt-1 mr-3 w-4 h-4 sm:w-5 sm:h-5 rounded focus:ring-cyan-500 text-cyan-500 cursor-pointer flex-shrink-0" 
                    />
                    <label htmlFor="instructionsAck" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                        I have read and understood the instructions.
                    </label>
                </div>

                <div className="text-center">
                    <button
                        className="px-6 sm:px-8 py-3 sm:py-3.5 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
                        onClick={handleClick}
                    >
                        Start Assessment
                    </button>
                </div>

                {openCodeWindow && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center relative animate-fade-in">
                            <button
                                onClick={() => setOpenCodeWindow(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                ✕
                            </button>

                            <div className="mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🔐</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                                    Enter Exam Code
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                    Please enter the exam code provided by your instructor to begin.
                                </p>
                            </div>

                            <input
                                type="text"
                                placeholder="Type your exam code here"
                                value={examCode}
                                onChange={(e) => setExamCode(e.target.value)}
                                className="w-full p-3 sm:p-4 text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none mb-6 text-sm sm:text-base transition-all"
                                autoFocus
                            />
                            
                            <button
                                onClick={handleEnterExam}
                                className="w-full px-6 py-3 sm:py-3.5 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
                            >
                                Enter Exam
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StartExam;