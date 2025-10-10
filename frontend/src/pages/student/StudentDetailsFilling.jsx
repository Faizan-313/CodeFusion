import { useState } from 'react'
import { useExam } from '../../context/ExamContext'
import toast from 'react-hot-toast'
import { User, Hash, Calendar, Users, Clock, BookOpen, Award, FileText, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const StudentDetailsFilling = () => {
    const { exam, submitStudentDetails } = useExam()
    const [formData, setFormData] = useState({
        examId: exam._id,
        fullName: '',
        rollNumber: '',
        collegeId: '',
        session: '',
        batch: ''
    })
    const navigate = useNavigate();

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

        // Validation: Full name should have at least 2 words
        const nameParts = formData.fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
            toast.error("Please enter your full name (first and last name)");
            return;
        }

        // Validation: Name should only contain letters and spaces
        if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
            toast.error("Name should only contain letters and spaces");
            return;
        }

        // Validation: Roll number format (adjust regex based on your format)
        if (formData.rollNumber.length < 3) {
            toast.error("Please enter a valid roll number");
            return;
        }

        // Validation: College ID format
        if (formData.collegeId.length < 6) {
            toast.error("Please enter a valid college ID");
            return;
        }

        // Handle form submission
        const res = await submitStudentDetails(formData);
        if(res.success){
            toast.dismiss();
            toast.success("Details submitted successfully!");
            navigate("/exam/student/section");
            return;
        }else{
            toast.dismiss();
            toast.error("Could not submit the details.");
            return;
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-50 to-indigo-400 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Exam Information Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 mb-8 text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{exam.title.toUpperCase()}</h1>
                            <p className="text-blue-100 text-sm">Examination</p>
                        </div>
                    </div>

                    {exam.description && (
                        <div className="mb-6 pb-6 border-b border-white/20">
                            <p className="text-blue-50 leading-relaxed">{exam.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-blue-200" />
                                <p className="text-xs text-blue-200 uppercase tracking-wide">Duration</p>
                            </div>
                            <p className="text-2xl font-bold">{exam.duration}</p>
                            <p className="text-xs text-blue-100">minutes</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-blue-200" />
                                <p className="text-xs text-blue-200 uppercase tracking-wide">Total Marks</p>
                            </div>
                            <p className="text-2xl font-bold">{exam.totalMarks}</p>
                            <p className="text-xs text-blue-100">marks</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-blue-200" />
                                <p className="text-xs text-blue-200 uppercase tracking-wide">Exam Code</p>
                            </div>
                            <p className="text-lg font-bold font-mono">{exam.examCode}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-blue-200" />
                                <p className="text-xs text-blue-200 uppercase tracking-wide">Schedule</p>
                            </div>
                            <p className="text-xs text-blue-100 leading-tight">
                                {new Date(exam.startTime).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-blue-100">
                                {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Student Registration</h2>
                                <p className="text-sm text-gray-600">Please fill in your details to continue</p>
                            </div>
                        </div>
                    </div>

                    {/*Student Form Body */}
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
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                                            onChange={handleChange}
                                            placeholder="CSE-22-80"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                                            onChange={handleChange}
                                            placeholder="Enter college ID"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                                            onChange={handleChange}
                                            placeholder="Autumn 2025"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                                            placeholder="2022"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01] transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Proceed to Examination
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