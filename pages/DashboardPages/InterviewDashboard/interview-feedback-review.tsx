import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Building,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

// API response interfaces
interface ApiFeedback {
  feedbackId: number;
  interviewId: number;
  interviewerId: number;
  recommendation: string;
  submittedAt: string;
  feedbackData: Record<string, string>;
}

// Frontend display interfaces
interface InterviewFeedback {
  id: string;
  interviewer: {
    name: string;
    position: string;
    department: string;
  };
  technicalAssessment: {
    testPlanning: number;
    automationFramework: number;
    troubleshooting: number;
    functionalTesting: number;
  };
  softSkills: {
    experience: number;
    roleFitment: number;
    communication: number;
    preparation: number;
  };
  recommendedLevel?: string;
  flags?: string;
  createdAt: string;
  rawFeedback?: Record<string, string>; // Store the original feedback data
}
  
interface CandidateInfo {
  id: string;
  name: string;
  position: string;
  experience: string;
  interviewDate: string;
  interviewTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedbacks: InterviewFeedback[];
}

// Mock candidate info (since the API only returns feedback, not candidate details)
const mockCandidateInfo = {
  name: "Akshay Waghmare",
  position: "Senior Backend Dev",
  experience: "Ex- Intern at Goldman Sachs | IIIT Allahabad",
  interviewDate: "Mon, 1/27/25",
  interviewTime: "2:00pm - 3:00pm IST",
  status: 'completed' as const,
};

const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

export const InterviewService = {
  // Get interview details with feedbacks
  getInterviewDetails: async (interviewId: string): Promise<CandidateInfo> => {
    try {
      // Fetch the feedbacks from the API
      const feedbacks = await InterviewService.getInterviewFeedbacks(interviewId);
      
      // Return combined data (mock candidate info + real feedbacks)
      return {
        id: interviewId,
        ...mockCandidateInfo,
        feedbacks
      };
    } catch (error) {
      console.error('Error fetching interview details:', error);
      throw error;
    }
  },

  // Get all feedbacks for an interview from the API
  getInterviewFeedbacks: async (interviewId: string): Promise<InterviewFeedback[]> => {
    try {
      
      const response = await fetch(`${interviewServiceUrl}/api/feedback/interview/${interviewId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: ApiFeedback[] = await response.json();
      const transformedData =  data.map(transformApiFeedbackToUI);
      console.log('Fetched feedbacks Response:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  },
};

// Transform API feedback format to UI format
const transformApiFeedbackToUI = (apiFeedback: ApiFeedback): InterviewFeedback => {
  // Extract feedback categories from feedbackData keys
  const feedbackData = apiFeedback.feedbackData;
  
  // For now, we'll generate mock ratings since the structure doesn't match exactly
  return {
    id: apiFeedback.feedbackId.toString(),
    interviewer: {
      name: `Interviewer ${apiFeedback.interviewerId}`,
      position: "Technical Interviewer",
      department: "Engineering"
    },
    technicalAssessment: {
      testPlanning: extractRating(feedbackData, "problem_solving", 8),
      automationFramework: extractRating(feedbackData, "system_design", 7),
      troubleshooting: extractRating(feedbackData, "problem_solving", 9),
      functionalTesting: extractRating(feedbackData, "system_design", 8)
    },
    softSkills: {
      experience: extractRating(feedbackData, "teamwork", 7),
      roleFitment: extractRating(feedbackData, "cultural_alignment", 8),
      communication: extractRating(feedbackData, "teamwork", 9),
      preparation: extractRating(feedbackData, "cultural_alignment", 8)
    },
    recommendedLevel: apiFeedback.recommendation,
    flags: feedbackData["35_overall_impression"] || "No flags raised",
    createdAt: apiFeedback.submittedAt,
    rawFeedback: feedbackData
  };
};

// Helper function to extract a mock rating from feedback data
const extractRating = (
  feedbackData: Record<string, string>,
  category: string,
  defaultValue: number
): number => {
  // Find a key that contains the category
  const key = Object.keys(feedbackData).find(k => k.includes(category));
  
  // For this example, we're generating a mock rating
  // In a real implementation, you would parse the actual rating from the feedback
  return key ? (defaultValue + Math.random() * 2 - 1) : defaultValue;
};

const RatingBar = ({ value, label }: { value: number; label: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-gray-700 text-sm">{label}</span>
      <span className="text-sm font-medium">{value.toFixed(1)}/10</span>
    </div>
    <Progress value={value * 10} className="h-2 bg-gray-100">
      <div 
        className="h-full bg-[#2E2883] transition-all" 
        style={{ width: `${value * 10}%` }}
      />
    </Progress>
  </div>
);

const FeedbackCard = ({ feedback }: { feedback: InterviewFeedback }) => {
  const [expandedContent, setExpandedContent] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100"
    >
      {/* Interviewer Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {feedback.interviewer.name}
            </h3>
            <p className="text-sm text-gray-500">
              {feedback.interviewer.position} • {feedback.interviewer.department}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Content */}
      <div className="p-6">
        <Tabs defaultValue="technical" className="w-full border-solid border-violet-800">
          <TabsList className="grid grid-cols-3 gap-4 bg-gray-200 mb-6 border-violet-600 border-solid">
            <TabsTrigger
              value="technical"
              className="data-[state=active]:bg-[#2E2883] data-[state=active]:text-white text-black"
            >
              Technical
            </TabsTrigger>
            <TabsTrigger
              value="soft-skills"
              className="data-[state=active]:bg-[#2E2883] data-[state=active]:text-white text-black"
            >
              Soft Skills
            </TabsTrigger>
            <TabsTrigger
              value="additional"
              className="data-[state=active]:bg-[#2E2883] data-[state=active]:text-white text-black"
            >
              Additional 
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="space-y-6 pb-3">
            <div className="space-y-4">
              <RatingBar 
                value={feedback.technicalAssessment.testPlanning} 
                label="Test Planning, Test Case Enumeration" 
              />
              <RatingBar 
                value={feedback.technicalAssessment.automationFramework} 
                label="Automation Framework Design" 
              />
              <RatingBar 
                value={feedback.technicalAssessment.troubleshooting} 
                label="Troubleshooting" 
              />
              <RatingBar 
                value={feedback.technicalAssessment.functionalTesting} 
                label="Functional + Non Functional Test" 
              />
            </div>
          </TabsContent>

          <TabsContent value="soft-skills" className="space-y-6">
            <div className="space-y-4">
              <RatingBar 
                value={feedback.softSkills.experience} 
                label="Past & Recent Experience" 
              />
              <RatingBar 
                value={feedback.softSkills.roleFitment} 
                label="Role Fitment & Team Fitment" 
              />
              <RatingBar 
                value={feedback.softSkills.communication} 
                label="Communication / Soft Skills" 
              />
              <RatingBar 
                value={feedback.softSkills.preparation} 
                label="General preparedness for Interview" 
              />
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Recommendation
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-900">
                  {feedback.recommendedLevel || "No recommendation provided"}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Overall Impression / Flags
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-line">
                  {feedback.flags || "No flags raised"}
                </div>
              </div>

              {feedback.rawFeedback && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                      Raw Feedback Data
                    </h4>
                    <button 
                      onClick={() => setExpandedContent(!expandedContent)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {expandedContent ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {expandedContent && (
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-900 max-h-80 overflow-y-auto">
                      {Object.entries(feedback.rawFeedback).map(([key, value]) => (
                        <div key={key} className="mb-3">
                          <div className="font-medium">{key.replace(/^\d+_/, '').replace(/_/g, ' ')}:</div>
                          <div className="whitespace-pre-line text-sm">{value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

const InterviewFeedbackReview = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<CandidateInfo | null>(null);

  useEffect(() => {
    fetchInterviewData();
  }, [interviewId]);

  const fetchInterviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!interviewId) {
        throw new Error('Interview ID is required');
      }

      const data = await InterviewService.getInterviewDetails(interviewId);
      setInterviewData(data);
    } catch (err) {
      console.error('Error fetching interview data:', err);
      setError('Failed to load interview data');
      toast.error('Failed to load interview data'); 
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#2E2883]" />
          <span className="text-gray-600">Loading interview data...</span>
        </div>
      </div>
    );
  }

  if (error || !interviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error || 'Failed to load interview data'}</p>
          <Button onClick={fetchInterviewData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button and Title */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-[#2E2883]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
        </div>

        {/* Candidate Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2E2883] text-white rounded-xl p-6"
        >  
        <div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{interviewData.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 opacity-70" />
                  <span>{interviewData.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 opacity-70" />
                  <span>{interviewData.experience}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 opacity-70" />
                <span>{interviewData.interviewDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 opacity-70" />
                <span>{interviewData.interviewTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 opacity-70" />
                <span>Interview ID: {interviewData.id}</span>
              </div>
            </div>
          </div>
          </div>
        </motion.div>

        {/* Interview Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Interview Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Interviewers</div>
              <div className="text-2xl font-semibold text-[#2E2883]">
                {interviewData.feedbacks.length}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Average Rating</div>
              <div className="text-2xl font-semibold text-[#2E2883]">
                {calculateAverageRating(interviewData.feedbacks)}/10
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feedback Cards */}
        <div className="space-y-6">
          {interviewData.feedbacks.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate average rating
const calculateAverageRating = (feedbacks: InterviewFeedback[]) => {
  const total = feedbacks.reduce((acc, feedback) => {
    const technical = Object.values(feedback.technicalAssessment).reduce((sum, val) => sum + val, 0) / 4;
    const soft = Object.values(feedback.softSkills).reduce((sum, val) => sum + val, 0) / 4;
    return acc + (technical + soft) / 2;
  }, 0);
  return (total / feedbacks.length).toFixed(1);
};

export default InterviewFeedbackReview;