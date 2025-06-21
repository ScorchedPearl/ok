import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  ClipboardList,
  Calendar,
  Medal,
  TrendingUp,
  Filter,
  ChevronRight,
  Gift,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { UserProfile } from "@/context/types";

const partnerServiceUrl = import.meta.env.VITE_PARTNER_SERVICE_URL || 'http://localhost:8008';

interface Activity {
  id: number;
  date: string;
  type: "Mission" | "Bonus" | "Contribution" | string;
  description: string;
  points: number;
}

interface RedemptionOption {
  id: number;
  title: string;
  pointsCost: number;
  icon: React.ReactNode;
}

interface PointsData {
  totalPoints: number;
  activities: Activity[];
  redemptionOptions: RedemptionOption[];
}


interface RedemptionState {
  isConfirmOpen: boolean;
  isSuccessOpen: boolean;
  isErrorOpen: boolean;
  selectedOption: RedemptionOption | null;
  isProcessing: boolean;
  errorMessage: string;
}



const PointsRedemptionPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [points, setPoints] = useState(0);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { token } = useAuth();

  const [redemptionState, setRedemptionState] = useState<RedemptionState>({
    isConfirmOpen: false,
    isSuccessOpen: false,
    isErrorOpen: false,
    selectedOption: null,
    isProcessing: false,
    errorMessage: ""
  });
  const [pointsData, setPointsData] = useState<PointsData>({
    totalPoints: 0,
    activities: [],
    redemptionOptions: [
      {
        id: 1,
        title: "Encash $10 Reward",
        pointsCost: 500,
        icon: <CreditCard />
      },
      {
        id: 2,
        title: "Encash $20 Reward",
        pointsCost: 950,
        icon: <CreditCard />
      },
      {
        id: 3,
        title: "AI Enhanced Upgrade (1 Month)",
        pointsCost: 1200,
        icon: <Gift />
      }
    ]
  });

  // Fetching partner profile
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

  // Fetch points and activities for this partner from the API endpoints
  useEffect(() => {
    async function fetchData() {
      if (!partnerProfile || !partnerProfile.userId) {
        
        return;
      }
      const partnerId = partnerProfile.userId;
      
      

      setIsLoading(true);
      try {
        // Fetch points
        const pointsResponse = await fetch(`${partnerServiceUrl}/api/partners/${partnerId}/points`);
        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          setPoints(pointsData);
          setPointsData(prev => ({
            ...prev,
            totalPoints: pointsData
          }));
        } else {
          console.error("Error fetching points");
        }

        // Fetch activities
        const activitiesResponse = await fetch(`${partnerServiceUrl}/api/activities/partner/${partnerId}`);
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          // Transform backend activity data to match our frontend model
          const transformedActivities = activitiesData.map((activity: any) => ({
            id: activity.id,
            date: new Date(activity.date).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            type: activity.type,
            description: activity.description,
            points: activity.points
          }));
          
          setPointsData(prev => ({
            ...prev,
            activities: transformedActivities
          }));
        } else {
          console.error("Error fetching activities");
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [partnerProfile]);

  // Handle opening the confirmation dialog
  const handleRedeemClick = (option: RedemptionOption) => {
    setRedemptionState({
      ...redemptionState,
      isConfirmOpen: true,
      selectedOption: option
    });
  };
  
  // Handle confirmation and process redemption
  const handleConfirmRedemption = async () => {
    if (!redemptionState.selectedOption) return;
    
    setRedemptionState({
      ...redemptionState,
      isProcessing: true
    });
    
    try {
      // Simulate API call to process redemption
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if redemption was successful (simulate 90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (!isSuccess) {
        throw new Error("Transaction processing failed. Please try again later.");
      }
      
      // Update points balance
      const newTotal = pointsData.totalPoints - redemptionState.selectedOption.pointsCost;
      setPointsData({
        ...pointsData,
        totalPoints: newTotal
      });
      
      // Add the redemption to activities
      const newActivity = {
        id: pointsData.activities.length + 1,
        date: new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: "Redemption",
        description: `Redeemed ${redemptionState.selectedOption.title}`,
        points: -redemptionState.selectedOption.pointsCost
      };
      
      setPointsData({
        ...pointsData,
        totalPoints: newTotal,
        activities: [newActivity, ...pointsData.activities]
      });
      
      // Show success state
      setRedemptionState({
        ...redemptionState,
        isConfirmOpen: false,
        isSuccessOpen: true,
        isProcessing: false
      });
      
    } catch (error) {
      // Handle errors
      setRedemptionState({
        ...redemptionState,
        isConfirmOpen: false,
        isErrorOpen: true,
        isProcessing: false,
        errorMessage: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };
  
  // Close all dialogs
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

  // Function to determine activity icon
  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case "Mission":
        return <Medal className="w-5 h-5 text-yellow-500" />;
      case "Bonus":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "Contribution":
        return <ClipboardList className="w-5 h-5 text-blue-500" />;
      default:
        return <Coins className="w-5 h-5 text-purple-500" />;
    }
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
            Redeem Points
          </h1>
        </motion.div>

        {/* Points Information Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white shadow-xl rounded-2xl overflow-hidden mb-10 p-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#2E2883] to-[#5D56E0] p-3 rounded-full">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Your Points:</span>
                  <h2 className="text-3xl font-bold text-[#2E2883]">🪙 {points}</h2>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-[#F9FAFF] p-3 rounded-lg border border-[#E5E7F8]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2E2883]" />
                  <div>
                    <span className="text-xs text-gray-500">Points Expiry</span>
                    <p className="font-medium text-sm text-[#2E2883]">Dec 31, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Redemption Options Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-8 shadow-xl mb-10"
        >
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-semibold text-[#2E2883] text-2xl flex items-center">
              <Gift className="mr-2 w-6 h-6" />
              Redemption Options
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pointsData.redemptionOptions.map(option => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                className="bg-[#F9FAFF] rounded-xl p-6 border border-[#E5E7F8] hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col h-full">
                  <div className="bg-[#2E2883]/10 p-4 rounded-full w-fit mb-4">
                    <div className="text-[#2E2883] w-6 h-6">
                      {option.icon}
                    </div>
                  </div>
                  <h5 className="text-xl font-semibold text-[#2E2883] mb-2">{option.title}</h5>
                  <div className="flex items-center gap-1 font-bold text-lg text-[#2E2883] mt-auto mb-4">
                    {option.pointsCost}
                    <Coins className="w-4 h-4 text-yellow-500" />
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-[#2E2883] to-[#5D56E0] text-white hover:opacity-90 w-full"
                    disabled={pointsData.totalPoints < option.pointsCost}
                  >
                    Redeem Now
                  </Button>
                  {pointsData.totalPoints < option.pointsCost && (
                    <p className="text-sm text-red-500 mt-2 text-center">
                      Need {option.pointsCost - pointsData.totalPoints} more points
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity History Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-8 shadow-xl mb-8"
        >
          <div className="flex justify-between items-center mb-8 flex-col sm:flex-row gap-4">
            <h4 className="font-semibold text-[#2E2883] text-2xl flex items-center">
              <ClipboardList className="mr-2 w-6 h-6" />
              Activity History
            </h4>
            <Button
              variant="outline"
              className="text-[#2E2883] border-[#2E2883] hover:bg-[#2E2883]/10"
            >
              <Filter className="mr-2 w-4 h-4" />
              Filter Activities
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
            <div className="space-y-4">
              {pointsData.activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all duration-200 bg-[#F9FAFF]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-full shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">{activity.date}</div>
                        <div className="font-medium text-[#2E2883]">{activity.type}</div>
                        <div className="text-gray-700">{activity.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-bold text-lg text-[#2E2883]">
                        +{activity.points}
                        <Coins className="w-5 h-5 text-yellow-500" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="flex justify-center mt-8">
                <Button variant="outline" className="text-[#2E2883] border-[#2E2883]">
                  Load More Activities
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PointsRedemptionPage;