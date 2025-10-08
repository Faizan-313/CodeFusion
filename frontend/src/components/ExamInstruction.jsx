import React from 'react';

function ExamInstructions() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-8 transition-colors duration-300">
        
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                Instructions
            </h2>

            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm md:text-base leading-relaxed">
                        Ensure you have a stable internet connection and webcam enabled.
                    </span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm md:text-base leading-relaxed">
                        Do not leave or minimize the exam window — suspicious activity will be flagged.
                    </span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm md:text-base leading-relaxed">
                        Do not look away from your screen frequently — gaze detection will be active.
                    </span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm md:text-base leading-relaxed">
                        Copy-pasting answers is strictly prohibited.
                    </span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm md:text-base leading-relaxed">
                        Do not switch tabs or open other applications during the exam.
                    </span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm md:text-base leading-relaxed">
                        All responses must be submitted before the timer runs out.
                    </span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm md:text-base leading-relaxed">
                        If the timer ends, your exam will be <strong className="text-red-600 dark:text-red-400">auto-submitted</strong>.
                    </span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm md:text-base leading-relaxed">
                        You can answer using <strong className="text-blue-600 dark:text-blue-400">Code Editor or Text Editor</strong>.
                    </span>
                </li>
            </ul>
            {/* Warning Footer */}
            <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-lg">
                <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                    <span className="text-red-600 dark:text-red-400 font-bold">⚠️ Important:</span> Violation of any instruction may result in automatic exam termination and disqualification.
                </p>
            </div>
        </div>
    );
}

export default ExamInstructions;