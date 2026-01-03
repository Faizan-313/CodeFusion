import { useState } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

function ForgotPassword() {
    const [formData, setFormData] = useState({
        email: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState("email") // email, otp, resetPassword
    const [resetToken, setResetToken] = useState("")

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!formData.email || formData.email.trim() === ""){
            toast.error("Please enter email")
            return
        }
        if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)){
            toast.error("Please enter a valid email address")
            return;
        }

        try {
            setIsLoading(true)
            const res = await register(formData.email)
            if(res.success){
                setStep("otp")
                //show the otp section and submit button
                //on submit if otp is correct show change password section
                //on changing the password redirect to signin
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            console.error("Forgot password error: ", error);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#092635] via-[#1b4242] to-[#5c8374] px-4 py-12 relative overflow-hidden'>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#5c8374] opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#092635] opacity-10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">CodeFusion</h1>
                    <p className="text-sm text-gray-300">Password Recovery</p>
                </div>

                <div className="bg-white bg-opacity-95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-8">
                        {step === "email" && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Reset Your Password</h2>
                                    <p className="text-sm text-gray-600">
                                        Enter your email address and we'll send you OTP to reset your password.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            required
                                            className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 text-gray-700 bg-gray-50 hover:bg-white focus:bg-white shadow-sm focus:border-[#5c8374] focus:ring-2 focus:ring-[#5c8374] focus:outline-none transition-all placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-[#092635] to-[#1b4242] hover:from-[#0d3140] hover:to-[#1f4a4f] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? "Sending..." : "Send OTP"}
                                </button>

                                <div className="text-center">
                                    <Link 
                                        to="/signin" 
                                        className="inline-flex items-center justify-center text-sm text-gray-600 hover:text-[#5c8374] transition-colors gap-1"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Sign In
                                    </Link>
                                </div>
                            </form>
                        )}

                        {step === "otp" && (
                            <div className="space-y-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Verify Your Email</h2>
                                    <p className="text-sm text-gray-600">
                                        Enter the OTP sent to {formData.email}
                                    </p>

                                    //need to add otp input section here 
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep("email")}
                                    className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 rounded-lg border border-gray-300 transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        )}

                        {step === "resetPassword" && (
                            <div className="space-y-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Create New Password</h2>
                                    <p className="text-sm text-gray-600">
                                        Enter your new password below
                                    </p>
                                    //need to add input password section here
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep("otp")}
                                    className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 rounded-lg border border-gray-300 transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-r from-[#092635] to-[#1b4242] bg-opacity-5 px-8 py-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            Don't have an account? <Link to="/signup" className="text-[#b5d0c6] hover:underline font-semibold">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
