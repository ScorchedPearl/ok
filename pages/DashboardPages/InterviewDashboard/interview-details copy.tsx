"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { BackgroundBeams } from "@/components/ui/background-beams";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useToast } from "@/hooks/use-toast";
// import { Toaster } from "@/components/ui/toaster";
import {
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  BarChart4,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Mail,
  Plus,
  CalendarDays,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  PieChart,
  UserCheck,
  UserX,
  Loader,
} from "lucide-react";

// --- Type Definitions ---

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  experience: string;
  photo: string | null;
  resumeUrl: string;
  currentStatus: string;
  roundNumber: number;
  totalRounds: number;
  applicationDate: string;
  tags: string[];
}

interface StrengthsWeaknesses {
  strengths: string[];
  weaknesses: string[];
}

interface FeedbackSection {
  title: string;
  rating: number;
  notes: string;
  strengthsWeaknesses: StrengthsWeaknesses;
}

interface InterviewFeedback {
  id: string;
  interviewerId: string;
  interviewer: string;
  role: string;
  avatarUrl: string | null;
  date: string;
  duration: string;
  overallRating: number;
  status: string;
  feedbackSections: FeedbackSection[];
  finalRecommendation: string;
  privateNotes: string;
}

interface AIAnalysis {
  overallSummary: string;
  strengthsWeaknesses: {
    keyStrengths: { area: string; details: string }[];
    keyWeaknesses: { area: string; details: string }[];
  };
  fitAssessment: {
    cultureFit: number;
    technicalFit: number;
    growthPotential: number;
  };
  recommendedAction: string;
  confidenceScore: number;
}

interface PreviousRound {
  id: string;
  roundNumber: number;
  type: string;
  date: string;
  interviewers: string[];
  outcome: string;
  summary: string;
}

// API response types for the feedback
interface FeedbackResponseDto {
  id: number;
  feedbackId: number;
  interviewerId: number;
  recommendation: 'STRONG_PROCEED' | 'PROCEED' | 'BORDERLINE' | 'REJECT' | 'STRONG_REJECT';
  submittedAt: string;
  feedbackData: Record<string, any>;
}


const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

// Custom useFetch hook for data fetching
function useFetch<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${interviewServiceUrl}/api/feedback/interview/1`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const json = await response.json();
        setData(json);
        setLoading(false);
        console.log("data",data);
      } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// --- Demo Data ---

const candidateData: Candidate = {
  id: "cand-12345",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  position: "Senior Frontend Developer",
  experience: "7 years",
  photo: null,
  resumeUrl: "#",
  currentStatus: "Interview Feedback Review",
  roundNumber: 2,
  totalRounds: 3,
  applicationDate: "2025-01-15",
  tags: ["React", "TypeScript", "Design Systems"],
};

const aiAnalysis: AIAnalysis = {
  overallSummary:
    "Alex shows strong technical skills with an excellent grasp of React fundamentals. Communication and collaboration are clear strengths while GraphQL and responsive design represent areas for growth. Interviewers largely lean toward a hire, with one suggesting another technical round.",
  strengthsWeaknesses: {
    keyStrengths: [
      { area: "Technical Knowledge", details: "Strong React architecture and performance optimization skills." },
      { area: "Communication", details: "Effectively explains complex topics." },
      { area: "Collaboration", details: "Excellent team player with cross-functional experience." },
    ],
    keyWeaknesses: [
      { area: "GraphQL", details: "Some gaps in advanced GraphQL usage." },
      { area: "Responsive Design", details: "Limited experience in building responsive systems." },
      { area: "Leadership Experience", details: "Has mentoring experience but limited team management." },
    ],
  },
  fitAssessment: {
    cultureFit: 87,
    technicalFit: 92,
    growthPotential: 88,
  },
  recommendedAction:
    "Schedule an additional technical interview focused on system design before finalizing the offer.",
  confidenceScore: 89,
};

const previousRounds: PreviousRound[] = [
  {
    id: "round-1",
    roundNumber: 1,
    type: "Initial Technical Screening",
    date: "2025-02-03",
    interviewers: ["Raj Patel"],
    outcome: "Passed",
    summary:
      "Candidate passed the initial technical screening with strong fundamentals in JavaScript and React.",
  },
];

// --- Helper Functions ---

const calculateAverageRating = (feedback: InterviewFeedback[]): number => {
  if (!feedback.length) return 0;
  const allRatings = feedback.flatMap((f) =>
    f.feedbackSections.map((section) => section.rating)
  );
  return allRatings.length > 0 
    ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
    : 0;
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

// Transform API feedback format to UI format
const transformFeedback = (apiData: any[]): InterviewFeedback[] => {
  if (!apiData || !Array.isArray(apiData)) {
    console.error("Invalid API data format:", apiData);
    return [];
  }
  
  return apiData.map(feedback => {
    // Extract the core feedback fields

    if (feedback.feedbackSections && feedback.finalRecommendation && feedback.interviewer) {
      // Data is already in the expected UI format
      return {
        ...feedback,
        // Store the raw data in privateNotes for display
        privateNotes: JSON.stringify(feedback, null, 2)
      };
    }

    const feedbackId = feedback.feedbackId || 1;
    const interviewerId = feedback.interviewerId || 1;
    const recommendation = feedback.recommendation || "PROCEED";
    const submittedAt = feedback.submittedAt || new Date().toISOString();
    const feedbackData = feedback.feedbackData || {};
    
    // Intelligently categorize feedback fields
    const categorizedData = categorizeFeedbackData(feedbackData);
    
    // Transform categorized data into feedback sections
    const feedbackSections = transformCategorizedData(categorizedData);
    
    // Map recommendation to a user-friendly string
    const finalRecommendation = mapRecommendation(recommendation);
    
    // Calculate overall rating from all sections
    const overallRating = calculateOverallRating(feedbackSections);
    
    // Construct the transformed feedback object
    return {
      id: feedbackId.toString(),
      interviewerId: interviewerId.toString(),
      interviewer: `Interviewer ${interviewerId}`,
      role: "Technical Evaluator",
      avatarUrl: null,
      date: submittedAt,
      duration: "45 minutes",
      overallRating: overallRating,
      status: "COMPLETED",
      feedbackSections: feedbackSections,
      finalRecommendation: finalRecommendation,
      privateNotes: "Private notes about candidate performance and potential team fit.",
    };
  });
};

// Intelligently categorize feedback data based on field patterns
function categorizeFeedbackData(feedbackData: Record<string, any>): Record<string, any> {
  const categorizedData: Record<string, Record<string, any>> = {};
  
  // First pass: Organize by explicit section markers (1_, 2_, etc.)
  Object.entries(feedbackData).forEach(([key, value]) => {
    const sectionMatch = key.match(/^(\d+)_(.+)$/);
    
    if (sectionMatch) {
      const [, sectionNum, fieldName] = sectionMatch;
      
      // Initialize the section if it doesn't exist
      if (!categorizedData[sectionNum]) {
        categorizedData[sectionNum] = {};
      }
      
      // Add the field to the appropriate section
      categorizedData[sectionNum][fieldName] = value;
    } else {
      // Handle fields without section prefix
      // Put them in a special "general" category
      if (!categorizedData["general"]) {
        categorizedData["general"] = {};
      }
      categorizedData["general"][key] = value;
    }
  });
  
  return categorizedData;
}

// Transform categorized data into feedback sections
function transformCategorizedData(categorizedData: Record<string, Record<string, any>>): FeedbackSection[] {
  const feedbackSections: FeedbackSection[] = [];
  
  // Domain-specific section names mapping
  const sectionTitles: Record<string, string> = {
    "1": "Technical Skills",
    "2": "Communication & Collaboration",
    "3": "Cultural Fit & Experience",
    "4": "Leadership & Management",
    "5": "Domain Knowledge",
    "general": "General Assessment"
  };
  
  // Domain-specific field type recognition patterns
  const fieldTypePatterns = {
    rating: /(rating|score|grade|skill|level|proficiency|experience)/i,
    text: /(note|comment|description|feedback|observation|detail)/i,
    boolean: /(flag|is|has|can|should|would|does)/i
  };
  
  // Process each category
  Object.entries(categorizedData).forEach(([sectionKey, fields]) => {
    // Determine fields by type
    const ratingFields: Record<string, number> = {};
    const textFields: Record<string, string> = {};
    const booleanFields: Record<string, boolean> = {};
    
    // Categorize fields by their likely type based on value and name
    Object.entries(fields).forEach(([fieldName, value]) => {
      // Try to determine field type
      if (typeof value === 'number' || (!isNaN(parseFloat(String(value))) && isFinite(Number(value)))) {
        // Numeric values go to rating fields
        ratingFields[fieldName] = parseFloat(String(value));
      } else if (typeof value === 'boolean' || value === 'true' || value === 'false' || fieldTypePatterns.boolean.test(fieldName)) {
        // Boolean values
        booleanFields[fieldName] = value === true || value === 'true';
      } else if (typeof value === 'string' && value.length > 0) {
        // Text values
        textFields[fieldName] = String(value);
      }
    });
    
    // Get section title or use a default
    const sectionTitle = sectionTitles[sectionKey] || formatSectionName(sectionKey);
    
    // Calculate average rating from numeric fields
    const ratings = Object.values(ratingFields);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length
      : 3;
    
    // Generate notes from text fields
    const notes = Object.entries(textFields)
      .map(([key, val]) => `${formatFieldName(key)}: ${val}`)
      .join(". ");
    
    // Generate strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // Add strengths based on high ratings and positive booleans
    Object.entries(ratingFields).forEach(([key, val]) => {
      if (val >= 7) {
        strengths.push(formatFieldName(key));
      } else if (val <= 5) {
        weaknesses.push(formatFieldName(key));
      }
    });
    
    // Add boolean fields as strengths/weaknesses
    Object.entries(booleanFields).forEach(([key, val]) => {
      if (val === true) {
        strengths.push(formatFieldName(key));
      } else {
        weaknesses.push(`Needs improvement in ${formatFieldName(key).toLowerCase()}`);
      }
    });
    
    // Add default strengths/weaknesses if none were generated
    if (strengths.length === 0) {
      strengths.push("Demonstrated competency in this area");
    }
    
    if (weaknesses.length === 0 && avgRating < 7) {
      weaknesses.push("Could improve in this area");
    }
    
    // Create the feedback section
    feedbackSections.push({
      title: sectionTitle,
      rating: avgRating/2,
      notes: notes || `Assessment of candidate's ${sectionTitle.toLowerCase()} capabilities.`,
      strengthsWeaknesses: {
        strengths,
        weaknesses
      }
    });
  });
  
  // Add a fallback section if no sections were created
  if (feedbackSections.length === 0) {
    feedbackSections.push({
      title: "Overall Assessment",
      rating: 3.5,
      notes: "General assessment of candidate suitability for the role.",
      strengthsWeaknesses: {
        strengths: ["Demonstrated relevant skills"],
        weaknesses: ["Areas for improvement"]
      }
    });
  }
  
  return feedbackSections;
}

// Map recommendation to a user-friendly string
function mapRecommendation(recommendation: string): string {
  switch (recommendation) {
    case "STRONG_PROCEED":
      return "Strong Hire";
    case "PROCEED":
      return "Hire";
    case "BORDERLINE":
      return "Hire - with another technical round";
    case "REJECT":
      return "No Hire";
    case "STRONG_REJECT":
      return "Strong No Hire";
    default:
      return "No Decision";
  }
}

// Calculate overall rating from all sections
function calculateOverallRating(sections: FeedbackSection[]): number {
  if (sections.length === 0) return 3.5;
  return sections.reduce((sum, section) => sum + section.rating, 0) / sections.length;
}

// Helper function to format section names for better display
function formatSectionName(name: string): string {
  // Remove numbers and special characters
  return formatFieldName(name.replace(/\d+/g, ''));
}

// Helper function to format field names for better display
function formatFieldName(name: string): string {
  return name
    // Add space before capital letters
    .replace(/([A-Z])/g, ' $1')
    // Replace underscores with spaces
    .replace(/_/g, ' ')
    // Capitalize first letter
    .replace(/^./, str => str.toUpperCase())
    // Cleanup any double spaces
    .replace(/\s+/g, ' ')
    .trim();
}
// --- Interview Insights Page Component ---

export default function InterviewInsightsPage(): JSX.Element {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"feedback" | "ai-analysis" | "history">("feedback");
  const [scheduled, setScheduled] = useState<boolean>(false);
  const [decisionMade, setDecisionMade] = useState<boolean>(false);
  const [decisionType, setDecisionType] = useState<"hire" | "reject" | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState<boolean>(false);
  
  // Fetch feedback data using the custom hook
  const { 
    data: apiFeedbackData, 
    loading: isFeedbackLoading, 
    error: feedbackError 
  } = useFetch<FeedbackResponseDto>('/api/feedback');
  
  // Transform API feedback data to UI format
  const interviewFeedback = transformFeedback(apiFeedbackData) 

  console.log("interviewFeedback",interviewFeedback);

  const averageRating = calculateAverageRating(interviewFeedback);
  const hireRecommendations = interviewFeedback.filter((f) =>
    f.finalRecommendation.includes("Hire")
  ).length;
  const rejectRecommendations = interviewFeedback.length - hireRecommendations;

  // Error handling for feedback fetch
  useEffect(() => {
    if (feedbackError) {
      toast({
        title: "Error loading feedback",
        description: feedbackError,
        variant: "destructive",
      });
    }
  }, [feedbackError, toast]);

  const handleMakeDecision = (decision: "hire" | "reject"): void => {
    setLoading(true);
    setTimeout(() => {
      setDecisionMade(true);
      setDecisionType(decision);
      setLoading(false);
      setShowDecisionDialog(false);
      toast({
        title: decision === "hire" ? "Offer Approval Requested" : "Rejection Notice Queued",
        description:
          decision === "hire"
            ? "The hiring team has been notified to prepare an offer."
            : "A rejection notice has been queued for sending to the candidate.",
        variant: decision === "hire" ? "default" : "destructive",
      });
    }, 1500);
  };

  const handleScheduleRound = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setScheduled(true);
      setLoading(false);
      setShowScheduleDialog(false);
      toast({
        title: "Interview Round Scheduled",
        description: "The candidate has been invited to a System Design interview round.",
      });
    }, 1500);
  };

  // Loading state while feedback is being fetched
  if (isFeedbackLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-[#2E2883]" />
          <p className="mt-2 text-gray-600">Loading interview feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#F8FAFF] to-white overflow-hidden">
      {/* <BackgroundBeams className="opacity-30" /> */}
      {/* <Toaster /> */}
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-[#2E2883]">Interview Insights</h1>
                <Badge className="bg-[#2E2883]/10 text-[#2E2883]">
                  Round {candidateData.roundNumber} of {candidateData.totalRounds}
                </Badge>
              </div>
              <p className="text-gray-600">Analyze feedback and make decisions</p>
            </div>
            <div className="flex items-center gap-2">
              {!decisionMade && !scheduled && (
                <>
                  <Button
                    variant="outline"
                    className="border-[#2E2883] text-[#2E2883] hover:bg-[#2E2883] hover:text-white"
                    onClick={() => setShowScheduleDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule Next Round
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#2E2883] to-[#5D4BC3] hover:from-[#251f68] hover:to-[#4c3da0] text-white"
                    onClick={() => setShowDecisionDialog(true)}
                  >
                    Make Decision
                  </Button>
                </>
              )}
              {decisionMade && (
                <Badge
                  className={
                    decisionType === "hire"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }
                >
                  {decisionType === "hire" ? (
                    <span className="flex items-center">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Offer Approval Requested
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <UserX className="h-3 w-3 mr-1" />
                      Rejection Process Started
                    </span>
                  )}
                </Badge>
              )}
              {scheduled && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  <span className="flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    Next Round Scheduled
                  </span>
                </Badge>
              )}
            </div>
          </div>

          {/* Candidate Card */}
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-[#2E2883]/20">
                  <AvatarImage src={candidateData.photo ?? undefined} />
                  <AvatarFallback className="bg-[#2E2883]/10 text-[#2E2883]">
                    {getInitials(candidateData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-gray-900">{candidateData.name}</h2>
                  <p className="text-gray-600 flex items-center">
                    <Mail className="h-4 w-4 mr-1.5 text-gray-500" /> {candidateData.email}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1 text-gray-500" /> {candidateData.position}
                    </span>
                    <span>•</span>
                    <span>{candidateData.experience} experience</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {candidateData.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="bg-gray-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="ml-auto flex flex-col items-end gap-2">
                  <Button size="sm" className="gap-1.5">
                    <BarChart4 className="h-4 w-4" />
                    View Resume
                  </Button>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(candidateData.applicationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs
            defaultValue="feedback"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "feedback" | "ai-analysis" | "history")
            }
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Analysis
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Feedback Tab */}
            <TabsContent value="feedback">
              <Card className="mb-6 border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-primary font-semibold flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-[#2E2883]" />
                    AI Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-to-r from-[#2E2883]/10 to-[#5D4BC3]/10 rounded-lg mb-4">
                    <p className="text-gray-700">{aiAnalysis.overallSummary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-[#2E2883]/5 to-[#5D4BC3]/10 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-[#2E2883]">
                          {averageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(averageRating)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        From {interviewFeedback.length} interviews
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#2E2883]/5 to-[#5D4BC3]/10 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">Recommendations</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-5 w-5 text-green-600" />
                          <span className="text-xl text-primary font-semibold">
                            {hireRecommendations}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-5 w-5 text-red-500" />
                          <span className="text-xl text-primary font-semibold">
                            {rejectRecommendations}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={(hireRecommendations / interviewFeedback.length) * 100}
                        className="h-2 mt-2"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-[#2E2883]/5 to-[#5D4BC3]/10 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">Current Status</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                          <Clock className="h-3 w-3 mr-1" />
                          {candidateData.currentStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        All interviews completed. Ready for decision.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {interviewFeedback.map((feedback) => (
                  <Card
                    key={feedback.id}
                    className="border-none shadow-sm bg-white/80 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={feedback.avatarUrl ?? undefined} />
                            <AvatarFallback className="bg-[#2E2883]/10 text-[#2E2883]">
                              {getInitials(feedback.interviewer)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg text-primary font-semibold">
                              {feedback.interviewer}
                            </CardTitle>
                            <CardDescription>{feedback.role}</CardDescription>
                          </div>
                        </div>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(feedback.overallRating)
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium">
                                Overall Rating
                              </p>
                              <p className="text-sm font-bold">
                                {feedback.overallRating.toFixed(1)}/5.0
                              </p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(feedback.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{feedback.duration}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <Accordion type="single" collapsible className="w-full">
                        {feedback.feedbackSections.map((section, sIndex) => (
                          <AccordionItem
                            key={sIndex}
                            value={`section-${sIndex}`}
                            className="border-b border-gray-100"
                          >
                            <AccordionTrigger className="py-3 hover:no-underline">
                              <div className="flex justify-between w-full items-center pr-4">
                                <span className="font-medium text-gray-700">
                                  {section.title}
                                </span>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3.5 w-3.5 ${
                                        star <= Math.round(section.rating)
                                          ? "text-amber-400 fill-amber-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-1 pb-3">
                              <p className="text-sm text-gray-700 mb-3">
                                {section.notes}
                              </p>
                              {(section.strengthsWeaknesses.strengths.length > 0 ||
                                section.strengthsWeaknesses.weaknesses.length > 0) && (
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  {section.strengthsWeaknesses.strengths.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-medium text-gray-500 mb-1">
                                        STRENGTHS
                                      </h4>
                                      <ul className="space-y-1">
                                        {section.strengthsWeaknesses.strengths.map(
                                          (strength, i) => (
                                            <li
                                              key={i}
                                              className="text-sm text-gray-700 flex items-center"
                                            >
                                              <ThumbsUp className="h-3.5 w-3.5 text-green-600 mr-1" />
                                              {strength}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                  {section.strengthsWeaknesses.weaknesses.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-medium text-gray-500 mb-1">
                                        AREAS TO IMPROVE
                                      </h4>
                                      <ul className="space-y-1">
                                        {section.strengthsWeaknesses.weaknesses.map(
                                          (weakness, i) => (
                                            <li
                                              key={i}
                                              className="text-sm text-gray-700 flex items-center"
                                            >
                                              <ThumbsDown className="h-3.5 w-3.5 text-amber-600 mr-1" />
                                              {weakness}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                    {/* Update in the interviewFeedback mapping section */}
                    <CardFooter className="pt-0 flex justify-between">
                      <Badge
                        className={`
                          ${feedback.finalRecommendation.includes("Strong Hire") ? "bg-green-100 text-green-800" : ""}
                          ${feedback.finalRecommendation === "Hire" ? "bg-emerald-100 text-emerald-800" : ""}
                          ${feedback.finalRecommendation.includes("another") ? "bg-blue-100 text-blue-800" : ""}
                          ${feedback.finalRecommendation === "No Hire" ? "bg-red-100 text-red-800" : ""}
                        `}
                      >
                        {feedback.finalRecommendation.includes("Strong") ||
                        feedback.finalRecommendation === "Hire" ? (
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                        )}
                        {feedback.finalRecommendation}
                      </Badge>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Private Notes
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-96 max-h-96 overflow-auto">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Raw Feedback Data:</h4>
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                              {JSON.stringify(apiFeedbackData.find(data => 
                                data.feedbackId?.toString() === feedback.id || 
                                data.id?.toString() === feedback.id
                              ), null, 2)}
                            </pre>
                            <p className="text-sm text-gray-700 mt-2">
                              {feedback.privateNotes}
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* AI Analysis Tab */}
            <TabsContent value="ai-analysis">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-primary font-semibold flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-[#2E2883]" />
                    Detailed AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">{aiAnalysis.overallSummary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          Key Strengths
                        </h3>
                        <ul className="mt-2 space-y-2">
                          {aiAnalysis.strengthsWeaknesses.keyStrengths.map((item, i) => (
                            <li key={i} className="bg-green-50 rounded-md p-3">
                              <p className="text-sm font-medium text-green-800">{item.area}</p>
                              <p className="text-xs text-gray-600">{item.details}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <ThumbsDown className="h-4 w-4 text-amber-600" />
                          Areas to Develop
                        </h3>
                        <ul className="mt-2 space-y-2">
                          {aiAnalysis.strengthsWeaknesses.keyWeaknesses.map((item, i) => (
                            <li key={i} className="bg-amber-50 rounded-md p-3">
                              <p className="text-sm font-medium text-amber-800">{item.area}</p>
                              <p className="text-xs text-gray-600">{item.details}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <BarChart4 className="h-4 w-4 text-[#2E2883]" />
                        Organizational Fit
                      </h3>
                      <div className="mt-2 space-y-3">
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600">Culture Fit</span>
                            <span className="font-medium text-gray-800">
                              {aiAnalysis.fitAssessment.cultureFit}%
                            </span>
                          </div>
                          <Progress value={aiAnalysis.fitAssessment.cultureFit} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600">Technical Fit</span>
                            <span className="font-medium text-gray-800">
                              {aiAnalysis.fitAssessment.technicalFit}%
                            </span>
                          </div>
                          <Progress value={aiAnalysis.fitAssessment.technicalFit} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600">Growth Potential</span>
                            <span className="font-medium text-gray-800">
                              {aiAnalysis.fitAssessment.growthPotential}%
                            </span>
                          </div>
                          <Progress value={aiAnalysis.fitAssessment.growthPotential} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 mt-6">
                      <div className="flex-1 border border-dashed border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          Recommended Action
                        </h3>
                        <p className="text-sm text-gray-700">{aiAnalysis.recommendedAction}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center w-32">
                        <div
                          className="radial-progress text-[#2E2883]"
                          style={
                            {
                              "--value": aiAnalysis.confidenceScore,
                              "--size": "4rem",
                              "--thickness": "0.5rem",
                            } as React.CSSProperties
                          }
                        >
                          <span className="text-lg font-bold">{aiAnalysis.confidenceScore}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">AI Confidence</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-primary flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-primary text-[#2E2883]" />
                    Interview History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {previousRounds.map((round) => (
                      <div key={round.id} className="border p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-primary font-semibold">
                              Round {round.roundNumber}: {round.type}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(round.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {round.outcome}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{round.summary}</p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Interviewers: {round.interviewers.join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Schedule Next Round Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview Round</DialogTitle>
            <DialogDescription>
              Enter details for scheduling the next interview round.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleRound} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="date" required className="w-full" />
              <Input type="time" required className="w-full" />
            </div>
            <Textarea placeholder="Additional Notes" className="w-full" />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Scheduling..." : "Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Make Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Decision</DialogTitle>
            <DialogDescription>Select your decision for the candidate.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button variant="default" onClick={() => handleMakeDecision("hire")} disabled={loading}>
              {loading ? "Processing..." : "Hire"}
            </Button>
            <Button variant="destructive" onClick={() => handleMakeDecision("reject")} disabled={loading}>
              {loading ? "Processing..." : "Reject"}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDecisionDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
