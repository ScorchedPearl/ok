import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Coins,
  ClipboardList,
  PlusCircle,
  TrendingUp,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuestionLibraries from "./components/question-libraries";
import NewLibraryModal from "./NewLibraryModal";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { UserProfile } from "@/context/types";

const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || 'http://localhost:8004';

console.log("questionBankServiceUrl", questionBankServiceUrl);
const partnerServiceUrl = import.meta.env.VITE_PARTNER_SERVICE_URL || 'http://localhost:8008';

export default function PartnerDashboard() {
  const { token } = useAuth();
  const [isNewLibraryModalOpen, setIsNewLibraryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
    
  interface Library {
    libraryId: number;
    libraryName: string;
    questionCount: number;
    questions?: { length: number }[];
  }

  const [libraries, setLibraries] = useState<Library[]>([]);
  const [points, setPoints] = useState(0);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);



 // Fetch partner profile using the API
useEffect(() => {
  
  async function fetchPartnerProfile() {
  
    if (!token) return;
    
    try {
      const profile = await api.auth.getPartnerProfile(token);
      setPartnerProfile(profile);
      
    } catch (error) {
      console.error("Error fetching partner profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }
  
  fetchPartnerProfile();
}, [token]);


 // Fetch points for this partner from the new API endpoint
useEffect(() => {
  async function fetchPoints() {
    if (!partnerProfile || !partnerProfile.userId) {
      
      return;
    }
    
    const partnerId = partnerProfile.userId;
    
    try {
      const response = await fetch(`${partnerServiceUrl}/api/partners/${partnerId}/points`);
      if (response.ok) {
        const data = await response.json();
        setPoints(data);
        
      } else {
        console.error("Error fetching points");
      }
    } catch (error) {
      console.error("Error fetching points", error);
    }
  }
  fetchPoints();
}, [partnerProfile]);

 // Fetch libraries for this partner from the API endpoint
useEffect(() => {
  async function fetchLibraries() {
    if (!partnerProfile || !partnerProfile.userId) {
      
      return;
    }
    
    const partnerId = partnerProfile.userId;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${questionBankServiceUrl}/libraries/user/${partnerId}`);
      if (response.ok) {
        const libs = await response.json();
        setLibraries(libs);
        
      } else {
        console.error("Error fetching libraries");
      }
    } catch (error) {
      console.error("Error fetching libraries", error);
    } finally {
      setIsLoading(false);
    }
  }
  fetchLibraries();
}, [partnerProfile, questionBankServiceUrl]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-gradient-to-br from-[#F3F4FF] to-white min-h-screen px-4 py-6">
      <motion.div 
        className="w-full max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold mb-8 pt-5 bg-clip-text text-transparent bg-gradient-to-r from-[#2E2883] to-[#5D56E0]">
            Partner Dashboard
          </h1>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col lg:flex-row bg-white shadow-xl rounded-2xl overflow-hidden mb-10"
        >
          {/* Left Section */}
          <div
            className="bg-gradient-to-br from-[#2E2883] to-[#5D56E0] p-8 lg:flex-[0.35] text-white"
            
          >
            <h2 className="text-2xl font-semibold mb-4">Your Partner Overview</h2>
            <p className="text-gray-200 mb-8">
              Keep your profile and libraries updated to attract more job
              seekers and increase your earnings.
            </p>
            
            <div className="flex gap-4 flex-col sm:flex-row">
              <Button
                variant="outline"
                className="text-white bg-white/10 border-white hover:bg-white hover:text-[#2E2883] hover:border-transparent transition-all duration-300"
              >
                Update Profile
              </Button>
            </div>
          </div>

          {/* Right Section */}
          <motion.div
            className="p-8 lg:flex-[0.65] bg-[#F9FAFF]"
            variants={itemVariants}
          >
            {/* Profile Card */}
            <div
              className="bg-white rounded-xl p-6 mb-8 shadow-md hover:shadow-lg transition-shadow duration-300"
             
            >
              <div className="flex flex-col sm:flex-row items-start justify-between">
                <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-0">
                  
                  <div className="py-3">
                    <h3 className="font-semibold text-2xl text-[#2E2883]">
                      {partnerProfile?.fullName} - {partnerProfile?.role}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-600 mt-1">
                      <span>{partnerProfile?.email}</span>
                      <span className="hidden sm:inline">•</span>
                      
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex bg-gradient-to-r from-[#2E2883] to-[#5D56E0] text-white items-center gap-2 mt-5 sm:mt-0"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
              </div>
            </div>

            {/* Statistics Section */}
            <motion.div
              className="mb-8 bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
            >
              <h4 className="font-bold text-[#2E2883] mb-6 text-xl flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Statistics
              </h4>
              <div className="grid gap-5">
                <div 
                  className="flex items-center justify-between px-5"
                  
                >
                  <span className="text-primary w-40 font-semibold">
                    Libraries Created
                  </span>
                  <div className="flex items-center gap-2 w-60">
                    <Progress
                      value={(libraries.length / 10) * 100}
                      className="w-full h-3"
                    />
                    <span className="text-[#2E2883] font-medium min-w-[40px] text-right">
                      {libraries.length}
                    </span>
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between px-5 font-semibold"
                  
                >
                  <span className="text-primary w-40">Total Questions</span>
                  <div className="flex items-center gap-3 w-60">
                    <Progress
                      value={
                        (libraries.reduce(
                          (total, lib) =>
                            total + (lib.questions ? lib.questions.length : 0),
                          0
                        ) /
                          200) *
                        100
                      }
                      className="w-full h-3"
                    />
                    <span className="text-[#2E2883] font-medium min-w-[40px] text-right">
                      {libraries.reduce(
                        (total, lib) =>
                          total + (lib.questions ? lib.questions.length : 0),
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Points Section */}
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <h4 className="font-semibold text-[#2E2883] mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Points Information
              </h4>
              <div 
                className="bg-gradient-to-r from-[#F9FAFF] to-white p-6 rounded-xl shadow-md border border-[#E5E7F8]"
                              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#2E2883]/10 p-3 rounded-full">
                    <Coins className="w-6 h-6 text-[#2E2883]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">
                      Available Points:
                    </span>
                    <div className="text-2xl font-bold text-[#2E2883]">
                      {points.toLocaleString()} pts
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-[#2E2883]/10 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-[#2E2883]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">
                      Next Points Update:
                    </span>
                    <div className="text-lg font-semibold text-[#2E2883]">
                      15th of next month
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex gap-4 flex-col sm:flex-row"
              variants={itemVariants}
            >
                <Button
                className="bg-gradient-to-r from-[#2E2883] to-[#5D56E0] text-white hover:opacity-90 transition-all duration-300"
                onClick={() => (window.location.href = "/partner-dashboard/redeem-points")}
                >
                <Coins className="mr-2 w-4 h-4" />
                Redeem Points
                </Button>
              <Button
                variant="outline"
                className="text-[#2E2883] bg-white border-[#2E2883] hover:bg-slate-100 hover:text-black transition-all duration-300"
                onClick={() => (window.location.href = "/partner-dashboard/redeem-points")}
              >
                <ClipboardList className="mr-2 w-4 h-4" />
                View Points History
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Libraries Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-8 shadow-xl mb-8"
        >
          <div className="flex justify-between items-center mb-8 flex-col sm:flex-row gap-4">
            <h4 className="font-semibold text-[#2E2883] text-2xl flex items-center">
              <ClipboardList className="mr-2 w-6 h-6" />
              Your Libraries
            </h4>
            <Button
              className="bg-gradient-to-r from-[#2E2883] to-[#5D56E0] text-white hover:opacity-90 transition-all duration-300"
              onClick={() => setIsNewLibraryModalOpen(true)}
            >
              Create Library
              <PlusCircle className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-8 h-8 border-4 border-[#2E2883] border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <AnimatePresence>
              <QuestionLibraries libraries={libraries} />
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>

      <NewLibraryModal
      isOpen={isNewLibraryModalOpen}
      onClose={() => setIsNewLibraryModalOpen(false)}
      partnerId={partnerProfile?.userId}
    />
    </div>
  );
}