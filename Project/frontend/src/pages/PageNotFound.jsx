import { Home, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

            <div className="max-w-2xl w-full text-center relative z-10">
                <div className="absolute inset-0 bg-red-500 opacity-10 animate-ping rounded-lg" />

                {/* 404 Number with glitch effect */}
                <div className="relative mb-8">
                    <h1
                        className={`text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 leading-none select-none`}
                    >
                        404
                    </h1>

                    {/* Floating elements around 404 */}
                    <div className="absolute top-4 left-4 animate-bounce">
                        <Zap className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div className="absolute top-8 right-8 animate-bounce delay-300">
                        <Star className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce delay-500">
                        <div className="w-3 h-3 bg-pink-400 rounded-full" />
                    </div>
                </div>

                {/* Error message */}
                <div className="mb-8 space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
                        The page you're looking for seems to have vanished into the digital void.
                        Don't worry, even the best explorers get lost sometimes!
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <button
                        onClick={handleGoHome}
                        className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                        <div className="relative flex items-center gap-3">
                            <Home className="w-5 h-5" />
                            <span>Go Home</span>
                        </div>
                    </button>
                </div>

                {/* Fun fact */}
                <div className="mt-8 text-sm text-gray-400">
                    <p className="animate-pulse">
                        Fun fact: Colleges waste your precious time in the most useless things, and pretend like this will benefit you in the future.🌐
                    </p>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-10 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-500" />
        </div>
    );
}