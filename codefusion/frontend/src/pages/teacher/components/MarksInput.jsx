import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const MarksInput = ({ question, studentAnswer, setLocalExamAttempt }) => {
    const [inputValue, setInputValue] = useState(studentAnswer?.marksObtained ?? "");
    const isUserTypingRef = useRef(false);

    useEffect(() => {
        if (!isUserTypingRef.current) {
            setInputValue((prev) => {
                const newValue = studentAnswer?.marksObtained ?? "";
                // Only update if it's genuinely different
                return prev !== newValue ? newValue : prev;
            });
        }
    }, [studentAnswer?.marksObtained]);


    const handleMarksChange = (value) => {
        isUserTypingRef.current = true;
        setInputValue(value);

        if (value === "") {
            setLocalExamAttempt((prev) => {
                const existingAnswerIndex = prev.answers.findIndex(
                    (ans) => ans.questionId === question._id
                );

                if (existingAnswerIndex !== -1) {
                    const updatedAnswers = prev.answers.map((ans) =>
                        ans.questionId === question._id
                            ? { ...ans, marksObtained: "" }
                            : ans
                    );
                    return { ...prev, answers: updatedAnswers };
                } else {
                    const newAnswer = {
                        questionId: question._id,
                        answerText: studentAnswer?.answerText || "",
                        marksObtained: ""
                    };
                    return { ...prev, answers: [...prev.answers, newAnswer] };
                }
            });
            
            // Reset typing flag after a short delay
            setTimeout(() => {
                isUserTypingRef.current = false;
            }, 100);
            return;
        }

        const numValue = parseFloat(value).toFixed(1);
        const maxMarks = question.marks || 0;

        // Allow typing even if invalid, just don't save to state
        if (isNaN(numValue)) {
            setTimeout(() => {
                isUserTypingRef.current = false;
            }, 100);
            return;
        }

        if (numValue < 0) {
            toast.error(`Marks cannot be negative`);
            setTimeout(() => {
                isUserTypingRef.current = false;
            }, 100);
            return;
        }

        if (numValue > maxMarks) {
            toast.error(`Marks cannot exceed ${maxMarks}`);
            setTimeout(() => {
                isUserTypingRef.current = false;
            }, 100);
            return;
        }

        setLocalExamAttempt((prev) => {
            const existingAnswerIndex = prev.answers.findIndex(
                (ans) => ans.questionId === question._id
            );

            if (existingAnswerIndex !== -1) {
                const updatedAnswers = prev.answers.map((ans) =>
                    ans.questionId === question._id
                        ? { ...ans, marksObtained: numValue }
                        : ans
                );
                return { ...prev, answers: updatedAnswers };
            } else {
                const newAnswer = {
                    questionId: question._id,
                    answerText: studentAnswer?.answerText || "",
                    marksObtained: numValue
                };
                return { ...prev, answers: [...prev.answers, newAnswer] };
            }
        });

        // Reset typing flag after state update
        setTimeout(() => {
            isUserTypingRef.current = false;
        }, 100);
    };

    const handleBlur = () => {
        isUserTypingRef.current = false;
        
        // Validate and format on blur
        if (inputValue !== "" && !isNaN(parseFloat(inputValue))) {
            const numValue = parseFloat(inputValue);
            const maxMarks = question.marks || 0;
            
            if (numValue < 0 || numValue > maxMarks) {
                // Reset to previous valid value
                setInputValue(studentAnswer?.marksObtained ?? "");
                toast.error(`Marks must be between 0 and ${maxMarks}`);
            }
        }
    };

    return (
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-[#9ec8b9]/30 dark:border-[#5c8374]/30">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Marks:
            </label>
            <input
                type="text"
                inputMode="decimal"
                min={0}
                max={question.marks || 0}
                value={inputValue}
                onChange={(e) => handleMarksChange(e.target.value)}
                onBlur={handleBlur}
                className="w-20 px-2 py-1 border border-[#9ec8b9] dark:border-[#5c8374] rounded text-sm text-gray-900 dark:text-gray-100 bg-white/70 dark:bg-gray-700 focus:ring-2 focus:ring-[#5c8374] focus:border-[#1b4242] outline-none transition-all"
            />
            <span className="text-gray-500 text-xs">/ {question.marks || 0}</span>
        </div>
    );
};

export default React.memo(MarksInput)