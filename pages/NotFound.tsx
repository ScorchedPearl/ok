
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// import { BackgroundBeams } from '@/components/ui/background-beams';
import { ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="relative h-screen w-full bg-gradient-to-b from-indigo-50 to-white overflow-hidden">
      {/* <BackgroundBeams /> */}
      
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-12"
        >
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex justify-center mb-4">
                <div className="h-32 w-32 text-[#2E2883] flex items-center justify-center rounded-full bg-indigo-100">
                  <span className="text-7xl font-bold">4</span>
                  <span className="inline-block w-16 h-16 border-8 border-[#2E2883] rounded-full mx-1"></span>
                  <span className="text-7xl font-bold">4</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-[#2E2883] mb-2">Page Not Found</h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </motion.div>
            
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to="/"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white font-medium transition-all duration-200 hover:shadow-lg w-full sm:w-auto justify-center"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
              
              <button 
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </button>
            </motion.div>

            <div className="mt-12 text-center text-gray-600 text-sm">
              <p>
                Need help? <a href="/contact" className="text-indigo-600 hover:text-indigo-800 underline">Contact support</a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;