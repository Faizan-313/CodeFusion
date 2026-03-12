import { FaGithub, FaLinkedin, FaTwitter, FaCode, FaShieldAlt, FaChartLine, FaLaptopCode, FaUsers, FaBrain } from "react-icons/fa";

function Home() {
    const features = [
        {
            icon: <FaShieldAlt className="text-5xl text-[#5c8374]" />,
            title: "AI-Powered Proctoring",
            description: "Advanced monitoring system ensures exam integrity with real-time behavioral analysis"
        },
        {
            icon: <FaCode className="text-5xl text-green-500" />,
            title: "Code Evaluation",
            description: "Intelligent code assessment with syntax checking and automated test case execution"
        },
        {
            icon: <FaChartLine className="text-5xl text-[#5c8374]" />,
            title: "Real-Time Analytics",
            description: "Comprehensive performance metrics and instant result generation for educators"
        },
        {
            icon: <FaLaptopCode className="text-5xl text-[#9ec8b9]" />,
            title: "Multi-Format Support",
            description: "MCQs, coding challenges, and descriptive questions all in one seamless platform"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900" id='home'>
            <div className="relative h-screen overflow-hidden inset-0 bg-gradient-to-br from-[#092635] via-[#1b4242] to-[#5c8374]">
                <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4 z-10">
                    <div className="mb-6 animate-bounce">
                        <FaBrain className="text-7xl text-[#9ec8b9] drop-shadow-2xl" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-2xl">
                        Welcome to <span className="bg-gradient-to-r from-[#9ec8b9] to-[#5c8374] bg-clip-text text-transparent">CodeFusion</span>
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mb-8 drop-shadow-lg leading-relaxed">
                        Next-Generation Online Programming Assessments with AI-Powered Proctoring
                        By Mir Mohsin
                    </p>
                    <div className="flex gap-4 flex-wrap justify-center">
                        <a href="/exam" className="px-8 py-4 bg-[#5c8374] hover:bg-[#1b4242] rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                            Start Exam
                        </a>
                        <a href="#features" className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full font-semibold text-lg transition-all transform hover:scale-105 border-2 border-white/30">
                            Learn More
                        </a>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                        <div className="w-1 h-3 bg-white/70 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
                            Why Choose <span className="text-[#9ec8b9]">CodeFusion?</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            A complete solution for secure, intelligent, and scalable online assessments
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
                            >
                                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-r from-[#1b4242] to-[#092635] text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="transform hover:scale-105 transition-transform">
                            <div className="text-5xl font-bold mb-2">99.9%</div>
                            <div className="text-xl opacity-90">Uptime Reliability</div>
                        </div>
                        <div className="transform hover:scale-105 transition-transform">
                            <div className="text-5xl font-bold mb-2">
                                <FaUsers className="inline text-4xl mr-2" />1000+
                            </div>
                            <div className="text-xl opacity-90">Active Users</div>
                        </div>
                        <div className="transform hover:scale-105 transition-transform">
                            <div className="text-5xl font-bold mb-2">24/7</div>
                            <div className="text-xl opacity-90">Support Available</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 dark:text-white mb-16">
                        How It Works
                    </h2>
                    <div className="space-y-20">

                        {/* Student Flow */}
                        <div>
                            <div className="flex items-center justify-center mb-10">
                                <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#5c8374] to-[#1b4242] rounded-full shadow-lg">
                                    <FaUsers className="text-2xl text-white" />
                                    <h3 className="text-3xl font-bold text-white">
                                        For Students
                                    </h3>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    {
                                        step: "01", title: "Enter Exam Portal", desc: (
                                            <>
                                                Click on{" "}
                                                <span className='text-[#03608e] font-bold hover:text-[#5c8374]'>
                                                    <a href='/exam'>Enter Exam</a>
                                                </span>
                                                , read instructions, enter the exam code, fill in details and start the exam
                                            </>
                                        )
                                    },
                                    { step: "02", title: "Start Assessment", desc: "Attempt multi format questions in a unified workspace" },
                                    { step: "03", title: "Submit", desc: "On complete click on submit or wait till time runs out" }
                                ].map((item, index) => (
                                    <div key={index} className="relative group">
                                        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-[#5c8374]">
                                            <div className="inline-block mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#5c8374] to-[#1b4242] items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                {item.step}
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                                                {item.title}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {item.desc}
                                            </p>
                                        </div>
                                        {index < 2 && (
                                            <div className="hidden md:block absolute top-10 left-full w-full h-1 bg-gradient-to-r from-[#5c8374] to-[#1b4242] transform -translate-x-1/2 opacity-30"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Teacher Flow */}
                        <div>
                            <div className="flex items-center justify-center mb-10">
                                <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg">
                                    <FaChartLine className="text-2xl text-white" />
                                    <h3 className="text-3xl font-bold text-white">
                                        For Teachers
                                    </h3>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-4 gap-8">
                                {[
                                    { step: "01", title: "Register & Login", desc: "Create your instructor account and access the admin dashboard" },
                                    { step: "02", title: "Create Assessment", desc: "Design exams with code and text formats, set duration, and assign students" },
                                    { step: "03", title: "Monitor in Real-Time", desc: "Track student activity with AI-based proctoring and receive alerts" },
                                    { step: "04", title: "Generate Results", desc: "Access comprehensive results and analytics for each student" }
                                ].map((item, index) => (
                                    <div key={index} className="relative group">
                                        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-500">
                                            <div className="inline-block mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                {item.step}
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                                                {item.title}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {item.desc}
                                            </p>
                                        </div>
                                        {index < 3 && (
                                            <div className="hidden md:block absolute top-10 left-full w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600 transform -translate-x-1/2 opacity-30"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <footer className="bg-gray-900 text-gray-300 px-4 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 mb-8">
                        <div>
                            <div className="text-4xl font-bold mb-4">
                                <span className="text-[#9ec8b9]">Code</span>
                                <span className="text-white">Fusion</span>
                                <span className="text-green-500">.</span>
                            </div>
                            <p className="text-gray-400">
                                Revolutionizing online assessments with AI-powered security and intelligent evaluation.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#home" className="hover:text-[#5c8374] transition-colors">Home</a></li>
                                <li><a href="/exam" className="hover:text-[#5c8374] transition-colors">Start Exam</a></li>
                                <li><a href="#features" className="hover:text-[#5c8374] transition-colors">Features</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Connect With Us</h3>
                            <div className="flex gap-4 text-3xl">
                                <a target="_blank" href="#" className="hover:text-[#5c8374] transition-colors transform hover:scale-110">
                                    <FaGithub />
                                </a>
                                <a target="_blank" href="#" className="hover:text-[#5c8374] transition-colors transform hover:scale-110">
                                    <FaLinkedin />
                                </a>
                                <a target="_blank" href="#" className="hover:text-[#5c8374] transition-colors transform hover:scale-110">
                                    <FaTwitter />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                        <p>© {new Date().getFullYear()} CodeFusion. All rights reserved. Built with passion for education.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;