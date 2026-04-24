import { useState, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useExam } from '../../context/ExamContext'
import { useProctoringCtx } from '../../context/ProctoringContext'
import toast from 'react-hot-toast'
import { User, Hash, Calendar, Users, Clock, BookOpen, Award, FileText, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'


const StudentDetailsFilling = () => {
    const { exam, submitStudentDetails } = useExam()
    const { phase, startCalibration, finishCalibration, stop, setStatusMessage } = useProctoringCtx()

    const [formData, setFormData] = useState({
        examId: exam._id,
        fullName: '',
        rollNumber: '',
        collegeId: '',
        session: '',
        batch: ''
    })

    const [submitting, setSubmitting] = useState(false);
    const submitPromiseRef = useRef(null);
    const handledRef = useRef(false);

    const navigate = useNavigate();

    // Once the proctoring pipeline reaches "monitoring", the baseline is locked in. 
    // The overlay stays up (with an updated "finalizing…" status) until the submit request resolves, 
    // so there's no dead interval where the form sits blurred with a tiny PIP.
    useEffect(() => {
        if (!submitting || phase !== "monitoring" || handledRef.current) return;
        if (!submitPromiseRef.current) return;
        handledRef.current = true;

        const pending = submitPromiseRef.current;
        submitPromiseRef.current = null;

        setStatusMessage("Finalizing and securing your session…");

        (async () => {
            const res = await pending;
            toast.dismiss();
            if (res?.success) {
                toast.success("You're all set. Starting exam…");
                // flushSync forces React to commit the overlay-close and route change in a single synchronous pass. Without it, the route change would cause the overlay to briefly re-appear in the new page before disappearing again.
                flushSync(() => {
                    finishCalibration();
                    navigate("/exam/student/section");
                });
            } else {
                toast.error(res?.error || "Failed to submit details");
                stop();
                setSubmitting(false);
                handledRef.current = false;
            }
        })();
    }, [phase, submitting, finishCalibration, stop, setStatusMessage, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.fullName || !formData.fullName.trim()) {
            toast.error("Please enter your full name");
            return;
        }

        if (!formData.rollNumber || !formData.rollNumber.trim()) {
            toast.error("Please enter your roll number");
            return;
        }

        if (!formData.collegeId || !formData.collegeId.trim()) {
            toast.error("Please enter your college ID");
            return;
        }

        if (!formData.session || !formData.session.trim()) {
            toast.error("Please enter the session");
            return;
        }

        if (!formData.batch || !formData.batch.trim()) {
            toast.error("Please enter your batch");
            return;
        }

        const nameParts = formData.fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
            toast.error("Please enter your full name (first and last name)");
            return;
        }

        if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
            toast.error("Name should only contain letters and spaces");
            return;
        }

        if (formData.rollNumber.length < 3) {
            toast.error("Please enter a valid roll number");
            return;
        }

        if (formData.collegeId.length < 6) {
            toast.error("Please enter a valid college ID");
            return;
        }

        // Kick off details submission and camera calibration in parallel.
        submitPromiseRef.current = submitStudentDetails(formData);
        setSubmitting(true);
        startCalibration();
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#9ec8b9] via-[#9ec8b9] to-[#5c8374] py-8 px-4">
            <div className={`max-w-5xl mx-auto transition-all ${submitting ? 'blur-sm pointer-events-none' : ''}`}>
                <div className="bg-gradient-to-r from-[#1b4242] to-[#092635] rounded-2xl shadow-2xl p-8 mb-8 text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{exam.title.toUpperCase()}</h1>
                            <p className="text-[#9ec8b9] text-sm">Examination</p>
                        </div>
                    </div>

                    {exam.description && (
                        <div className="mb-6 pb-6 border-b border-white/20">
                            <p className="text-[#9ec8b9] leading-relaxed">{exam.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-[#9ec8b9]" />
                                <p className="text-xs text-[#9ec8b9] uppercase tracking-wide">Duration</p>
                            </div>
                            <p className="text-2xl font-bold">{exam.duration}</p>
                            <p className="text-xs text-[#9ec8b9]">minutes</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-[#9ec8b9]" />
                                <p className="text-xs text-[#9ec8b9] uppercase tracking-wide">Total Marks</p>
                            </div>
                            <p className="text-2xl font-bold">{exam.totalMarks}</p>
                            <p className="text-xs text-[#9ec8b9]">marks</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-[#9ec8b9]" />
                                <p className="text-xs text-[#9ec8b9] uppercase tracking-wide">Exam Code</p>
                            </div>
                            <p className="text-lg font-bold font-mono">{exam.examCode}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-[#9ec8b9]" />
                                <p className="text-xs text-[#9ec8b9] uppercase tracking-wide">Schedule</p>
                            </div>
                            <p className="text-xs text-[#9ec8b9] leading-tight">
                                {new Date(exam.startTime).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-[#9ec8b9]">
                                {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-[#9ec8b9] to-[#5c8374] px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#1b4242] rounded-lg">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Student Registration</h2>
                                <p className="text-sm text-gray-600">Please fill in your details to continue</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-[#5c8374] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Roll Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                            <Hash className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="rollNumber"
                                            value={formData.rollNumber}
                                            maxLength={15}
                                            onChange={handleChange}
                                            placeholder="CSE-22-80"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-[#5c8374] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        College ID <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                            <Hash className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="collegeId"
                                            value={formData.collegeId}
                                            maxLength={16}
                                            onChange={handleChange}
                                            placeholder="Enter college ID"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-[#5c8374] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Session <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="session"
                                            value={formData.session}
                                            maxLength={15}
                                            onChange={handleChange}
                                            placeholder="Autumn 2025"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-[#5c8374] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Batch <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                            <Users className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="batch"
                                            value={formData.batch}
                                            onChange={handleChange}
                                            maxLength={10}
                                            placeholder="2022"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5c8374] focus:border-[#5c8374] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-[#5c8374] to-[#1b4242] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-[#1b4242] hover:to-[#092635] transform hover:scale-[1.01] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {submitting ? "Calibrating camera…" : "Proceed to Examination"}
                                </button>
                            </div>

                            <div className="pt-2">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-sm text-amber-800 text-center">
                                        <span className="font-semibold">Important:</span> Please ensure all details are accurate before submitting. Do not refresh the page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentDetailsFilling
