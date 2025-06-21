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
import { FileText } from "lucide-react";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useToast } from "@/hooks/use-toast";
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
  VideoIcon,
  MapPin,
  Users,
  Building,
  ArrowLeft,
} from "lucide-react";
import { useParams, useSearchParams } from 'react-router-dom';
// import InterviewScheduler from "./interview-scheduling";
import RoundScheduler from "./round-scheduling";


// --- Type Definitions ---

interface CandidateJob {
  id: number;
  candidate: {
    id: number;
    fullName: string;
    email: string;
    resumeContent: string;
    resumeSummary: string;
  };
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
  };
  currentRound: number;
  status: string;
  interviews: Interview[];
}

interface Interview {
  interviewId: number;
  roundNumber: number;
  interviewDate: string;
  position: string;
  status: string;
  mode: string;
  meetingLink: string;
  createdAt: string;
  resumeContent: string;
  resumeSummary: string;
  interviewers: {
    userId: number;
    name: string;
    email: string;
  }[];
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

// API response types for the feedback
interface FeedbackResponseDto {
  id: number;
  feedbackId: number;
  interviewerId: number;
  recommendation: 'STRONG_PROCEED' | 'PROCEED' | 'BORDERLINE' | 'REJECT' | 'STRONG_REJECT';
  submittedAt: string;
  feedbackData: Record<string, any>;
}


// --- Demo Data (for fallback) ---

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

// 2. Create a new custom hook for fetching AI analysis

// 3. Add the fallback data in case the API call fails
const aiAnalysisFallbackData: AIAnalysis = {
  overallSummary:
    "Candidate shows strong Java development skills with excellent grasp of Spring Boot and microservices. Communication and collaboration are clear strengths while some advanced cloud patterns and security considerations represent areas for growth. Interviewers largely lean toward a hire, with one suggesting another technical round.",
  strengthsWeaknesses: {
    keyStrengths: [
      { area: "Java Expertise", details: "Strong core Java skills and Spring Boot implementation." },
      { area: "Communication", details: "Effectively explains complex technical topics." },
      { area: "Problem Solving", details: "Excellent approach to breaking down complex problems." },
    ],
    keyWeaknesses: [
      { area: "Cloud Technologies", details: "Some gaps in advanced cloud patterns." },
      { area: "Security Considerations", details: "Could improve knowledge of security best practices." },
      { area: "Advanced Spring", details: "Needs strengthening in advanced Spring concepts." },
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

const demoFeedback: InterviewFeedback[] = [
  {
    id: "1",
    interviewerId: "111",
    interviewer: "Jane Doe",
    role: "Technical Evaluator",
    avatarUrl: null,
    date: "2025-03-01",
    duration: "45 minutes",
    overallRating: 4.2,
    status: "COMPLETED",
    feedbackSections: [
      {
        title: "Technical Skills",
        rating: 4,
        notes: "Strong Java fundamentals. Good knowledge of Spring Boot and microservices architecture.",
        strengthsWeaknesses: {
          strengths: ["Java expertise", "Design patterns", "API design"],
          weaknesses: ["Could improve on cloud technologies"]
        }
      },
      {
        title: "Problem Solving",
        rating: 4.5,
        notes: "Excellent approach to breaking down complex problems. Communicates thought process clearly.",
        strengthsWeaknesses: {
          strengths: ["Systematic approach", "Creative solutions"],
          weaknesses: []
        }
      }
    ],
    finalRecommendation: "Hire",
    privateNotes: "Would be a great fit for the backend team."
  },
  {
    id: "2",
    interviewerId: "222",
    interviewer: "John Smith",
    role: "Senior Developer",
    avatarUrl: null,
    date: "2025-03-01",
    duration: "50 minutes",
    overallRating: 3.8,
    status: "COMPLETED",
    feedbackSections: [
      {
        title: "Technical Skills",
        rating: 3.5,
        notes: "Good Java skills. Solid understanding of microservices but some gaps in advanced patterns.",
        strengthsWeaknesses: {
          strengths: ["Core Java", "REST API design"],
          weaknesses: ["Advanced Spring concepts", "Cloud patterns"]
        }
      },
      {
        title: "System Design",
        rating: 4,
        notes: "Good approach to designing scalable systems. Considers performance and maintainability.",
        strengthsWeaknesses: {
          strengths: ["Architecture thinking", "Performance considerations"],
          weaknesses: ["Security considerations could be improved"]
        }
      }
    ],
    finalRecommendation: "Hire - with another technical round",
    privateNotes: "Would like to see more depth in system design capabilities."
  }
];

// const aiAnalysis: AIAnalysis = {
//   overallSummary:
//     "Candidate shows strong Java development skills with excellent grasp of Spring Boot and microservices. Communication and collaboration are clear strengths while some advanced cloud patterns and security considerations represent areas for growth. Interviewers largely lean toward a hire, with one suggesting another technical round.",
//   strengthsWeaknesses: {
//     keyStrengths: [
//       { area: "Java Expertise", details: "Strong core Java skills and Spring Boot implementation." },
//       { area: "Communication", details: "Effectively explains complex technical topics." },
//       { area: "Problem Solving", details: "Excellent approach to breaking down complex problems." },
//     ],
//     keyWeaknesses: [
//       { area: "Cloud Technologies", details: "Some gaps in advanced cloud patterns." },
//       { area: "Security Considerations", details: "Could improve knowledge of security best practices." },
//       { area: "Advanced Spring", details: "Needs strengthening in advanced Spring concepts." },
//     ],
//   },
//   fitAssessment: {
//     cultureFit: 87,
//     technicalFit: 92,
//     growthPotential: 88,
//   },
//   recommendedAction:
//     "Schedule an additional technical interview focused on system design before finalizing the offer.",
//   confidenceScore: 89,
// };

// --- Custom Hooks ---

// Custom useFetch hook for data fetching

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

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

const getInitials = (name: string): string => {
  if (!name) return "NA";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

// Format date to human-readable format
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Get total rounds from interview data
const getTotalRounds = (interviews: Interview[] = []): number => {
  if (!interviews || interviews.length === 0) return 3; // Default fallback
  return Math.max(...interviews.map(interview => interview.roundNumber));
};

// Extract skills from resume content
const extractSkillsFromResume = (resumeContent: string = ""): string[] => {
  if (!resumeContent) return ["Java", "Backend", "API"];
  
  const commonTechSkills = [
    "Java", "Spring Boot", "Microservices", "REST", "API", "AWS", "Cloud", 
    "Docker", "Kubernetes", "React", "Angular", "JavaScript", "TypeScript",
    "SQL", "NoSQL", "MongoDB", "MySQL", "PostgreSQL", "CI/CD", "Git",
    "Agile", "Scrum", "DevOps", "Python", "C#", ".NET", "Node.js"
  ];
  
  return commonTechSkills.filter(skill => 
    resumeContent.toLowerCase().includes(skill.toLowerCase())
  ).slice(0, 5); // Limit to 5 skills
};

// Transform API feedback format to UI format
// Add these helper functions first
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

// Add this function to transform categorized data
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

// Add this helper function for mapping recommendations 
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

// Add this helper function to calculate overall rating
function calculateOverallRating(sections: FeedbackSection[]): number {
  if (sections.length === 0) return 3.5;
  return sections.reduce((sum, section) => sum + section.rating, 0) / sections.length;
}

// Add these helper formatting functions
function formatSectionName(name: string): string {
  // Remove numbers and special characters
  return formatFieldName(name.replace(/\d+/g, ''));
}

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

// Now replace the transformFeedback function
const transformFeedback = (apiData: any[]): InterviewFeedback[] => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    console.log("No feedback data available");
    return []; // Return empty array instead of fallback data
  }
  
  return apiData.map(feedback => {
    // Extract the core feedback fields
    if (feedback.feedbackSections && feedback.finalRecommendation && feedback.interviewer) {
      // Data is already in the expected UI format
      return {
        ...feedback,
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

// Map interview status to badge style
const getStatusBadgeStyle = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
    case 'PASSED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

let interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL ;

// --- Main Component ---

export default function InterviewInsightsPage(): JSX.Element {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"feedback" | "ai-analysis" | "history">("feedback");
  const [scheduled, setScheduled] = useState<boolean>(false);
  const [decisionMade, setDecisionMade] = useState<boolean>(false);
  const [decisionType, setDecisionType] = useState<"hire" | "reject" | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const {candidateJobId} = useParams();
  const [data, setData] = useState<AIAnalysis | null>(null);
  



  

  function useAIAnalysis(candidateJobId: string | number | null) {
    
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      if (!candidateJobId) {
        setData(null);
        setLoading(false);
        return;
      }

      
      const fetchAnalysis = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${interviewServiceUrl}/api/feedback/analysis/candidate/${candidateJobId}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const analysisData = await response.json();
          
          // Map backend data to frontend interface
          interface StrengthWeaknessItem {
            area: string;
            details: string;
          }
  
          interface AnalysisData {
            overallSummary?: string;
            strengthsWeaknesses?: {
              keyStrengths?: StrengthWeaknessItem[];
              keyWeaknesses?: StrengthWeaknessItem[];
            };
            fitAssessment?: {
              cultureFit?: number;
              technicalFit?: number;
              growthPotential?: number;
            };
            recommendedAction?: string;
            confidenceScore?: number;
          }
  
          const mappedAnalysis: AIAnalysis = {
            overallSummary: analysisData.overallSummary || 
              "No comprehensive summary available for this candidate.",
            
            strengthsWeaknesses: {
              keyStrengths: analysisData.strengthsWeaknesses?.keyStrengths?.map((strength: StrengthWeaknessItem) => ({
                area: strength.area || "Unspecified Strength",
                details: strength.details || "Additional details not provided"
              })) || [],
              
              keyWeaknesses: analysisData.strengthsWeaknesses?.keyWeaknesses?.map((weakness: StrengthWeaknessItem) => ({
                area: weakness.area || "Unspecified Weakness",
                details: weakness.details || "Additional details not provided"
              })) || []
            },
            
            fitAssessment: {
              cultureFit: analysisData.fitAssessment?.cultureFit ?? 75,
              technicalFit: analysisData.fitAssessment?.technicalFit ?? 80,
              growthPotential: analysisData.fitAssessment?.growthPotential ?? 75
            },
            
            recommendedAction: analysisData.recommendedAction || 
              "No specific action recommended at this time.",
            
            confidenceScore: analysisData.confidenceScore ?? 85
          };
  
          console.log("Mapped AI Analysis:", mappedAnalysis);
          setData(mappedAnalysis);
          setLoading(false);
        } catch (error) {
          console.error(`Error fetching AI analysis for candidateJob ${candidateJobId}:`, error);
          setError(`Failed to load AI analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setLoading(false);
          
          // Fallback to demo data in case of error
          setData(aiAnalysisFallbackData);
        }
      };
      
      fetchAnalysis();
    }, [candidateJobId]);
    
    return { data, loading, error };
  }

  
  // Fetch candidate job data from API
  // Fetch candidate job data from API
const { 
  data: candidateJobData, 
  loading: isCandidateJobLoading, 
  error: candidateJobError 
} = useFetch<CandidateJob>(`${interviewServiceUrl}/api/candidate-jobs/${candidateJobId}`);

// Fetch feedback data
const { 
  data: apiFeedbackData, 
  loading: isFeedbackLoading, 
  error: feedbackError 
} = useFetch<FeedbackResponseDto[]>(`${interviewServiceUrl}/api/feedback/interview/${candidateJobId}`);

const {
  loading: isAiAnalysisLoading,
  error: aiAnalysisError
} = useAIAnalysis(candidateJobId || 1);


const [decisionStep, setDecisionStep] = useState<"initial" | "email">("initial");
const [decision, setDecision] = useState<"hire" | "reject" | null>(null);
const [sendRejectionEmail, setSendRejectionEmail] = useState<boolean>(false);
const [emailContent, setEmailContent] = useState<string>("");
const [decisionNotes, setDecisionNotes] = useState<string>("");

// Default email templates
const defaultHireEmailTemplate = `Dear ${candidateJobData?.candidate?.fullName || "[Candidate Name]"},

We are pleased to inform you that we would like to move forward with your application for the ${candidateJobData?.job?.title || "[Job Title]"} position. Our team was impressed with your skills and experience during the interview process.

Our HR team will be in touch with you shortly to discuss the next steps including compensation and start date details.

We look forward to potentially welcoming you to our team!

Best regards,
Company Hiring Team`;

const defaultRejectEmailTemplate = `Dear ${candidateJobData?.candidate?.fullName || "[Candidate Name]"},

Thank you for your interest in the ${candidateJobData?.job?.title || "[Job Title]"} position and for taking the time to interview with us.

After careful consideration, we have decided to pursue other candidates whose qualifications better meet our current needs. We appreciate your interest in our company and wish you the best in your job search.

Best regards,
Company Hiring Team`;


// Function to handle decision submission with API call
const handleDecisionSubmit = async () => {
  setLoading(true);
  
  try {
    // Prepare request payload
    const payload = {
      interviewId: candidateJobData?.interviews?.[0]?.interviewId || 0,
      sendEmail: decision === "hire" ? true : sendRejectionEmail,
      emailContent: emailContent.trim()
    };
    
    // Make API call based on decision
    const endpoint = decision === "hire" 
      ? `${interviewServiceUrl}/api/hiring/hire` 
      : `${interviewServiceUrl}/api/hiring/reject`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    // Process successful response
    setDecisionMade(true);
    setDecisionType(decision || "");
    setShowDecisionDialog(false);
    console.log("EMAILL SENTTTT");
    toast({
      title: decision === "hire" ? "Offer Approval Requested" : "Rejection Process Started",
      description: decision === "hire" 
        ? "The hiring team has been notified to prepare an offer."
        : sendRejectionEmail 
          ? "A rejection notice has been sent to the candidate." 
          : "The candidate has been marked as rejected.",
      variant: decision === "hire" ? "default" : "destructive",
    });
  } catch (error) {
    console.error("Error submitting decision:", error);
    toast({
      title: "Error",
      description: `Failed to process your decision. Please try again.`,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
    // Reset states for next use
    setDecisionStep("initial");
    setDecision(null);
    setSendRejectionEmail(false);
    setEmailContent("");
    setDecisionNotes("");
  }
};

useEffect(() => {
  if (candidateJobError) {
    toast({
      title: "Error loading candidate data",
      description: candidateJobError,
      variant: "destructive",
    });
  }
  
  if (feedbackError) {
    toast({
      title: "Error loading feedback data",
      description: feedbackError,
      variant: "destructive",
    });
  }
  
  if (aiAnalysisError) {
    toast({
      title: "Error loading AI analysis",
      description: aiAnalysisError,
      variant: "destructive",
    });
  }
}, [candidateJobError, feedbackError, aiAnalysisError, toast]);

// Transform API feedback data to UI format
const interviewFeedback = transformFeedback(apiFeedbackData || []);

console.log("interviewFeedback",interviewFeedback);
  
  // Calculate statistics for UI
  const averageRating = calculateAverageRating(interviewFeedback);
  const hireRecommendations = interviewFeedback.filter((f) =>
    f.finalRecommendation.includes("Hire")
  ).length;
  const rejectRecommendations = interviewFeedback.length - hireRecommendations;

  // Handle making a hire/reject decision
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

  // Handle scheduling a new interview round
  const handleScheduleRound = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setScheduled(true);
      setLoading(false);
      setShowScheduleDialog(false);
      toast({
        title: "Interview Round Scheduled",
        description: "The candidate has been invited to the next interview round.",
      });
    }, 1500);
  };

  // Loading state
  // Loading state while data is being fetched
  if (isCandidateJobLoading || isFeedbackLoading || isAiAnalysisLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-[#2E2883]" />
          <p className="mt-2 text-gray-600">Loading interview data and analysis...</p>
        </div>
      </div>
    );
  }

  console.log("aiAnalysis",data);

// Enhanced FeedbackDetailsContent component that handles multiple domains
const FeedbackDetailsContent: React.FC<{ feedback: InterviewFeedback, rawFeedback: any }> = 
  ({ feedback, rawFeedback }) => {
  if (!rawFeedback || !rawFeedback.feedbackData) {
    return (
      <div className="p-2">
        <p className="text-sm text-gray-500">No detailed feedback available</p>
      </div>
    );
  }

  // Detect domain type from feedback content
  const domains = {
    "Technical": ["code", "programming", "software", "readability", "maintainability", "documentation"],
    "Medical": ["patient", "diagnosis", "treatment", "clinical", "medical"],
    "Legal": ["legal", "law", "case", "client", "court"],
    "Educational": ["teaching", "student", "classroom", "education"]
  };

  // Determine domain by checking feedback content
  let detectedDomain = "Professional";
  const feedbackText = JSON.stringify(rawFeedback.feedbackData).toLowerCase();
  
  for (const [domain, keywords] of Object.entries(domains)) {
    if (keywords.some(word => feedbackText.includes(word))) {
      detectedDomain = domain;
      break;
    }
  }



  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold">Detailed Feedback</h4>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {detectedDomain} Assessment
        </span>
      </div>
      
      <div className="space-y-3">
        {Object.entries(rawFeedback.feedbackData).map(([key, value]) => {
          if (typeof value !== 'string') return null;
          
          // Format the field key for display
          let displayKey = key;
          // Remove numbering prefix (e.g., "1_readability" -> "readability")
          if (/^\d+_/.test(key)) {
            displayKey = key.replace(/^\d+_/, '');
          }
          
          const formattedKey = formatFieldName(displayKey);
          
          return (
            <div key={key} className="bg-gray-50 p-3 rounded-md">
              <h5 className="text-sm font-medium text-gray-800">{formattedKey}</h5>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{value}</p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800">Assessment Meta Data:</h4>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-xs bg-gray-50 p-2 rounded text-gray-500">
            <span className="font-medium text-gray-600">ID:</span> {rawFeedback.feedbackId || rawFeedback.id}
          </div>
          <div className="text-xs bg-gray-50 p-2 rounded text-gray-500">
            <span className="font-medium text-gray-600">Evaluator:</span> {rawFeedback.interviewerId}
          </div>
          <div className="text-xs bg-gray-50 p-2 rounded text-gray-500">
            <span className="font-medium text-gray-600">Recommendation:</span> {rawFeedback.recommendation}
          </div>
          <div className="text-xs bg-gray-50 p-2 rounded text-gray-500">
            <span className="font-medium text-gray-600">Date:</span> {formatDate(rawFeedback.submittedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#F8FAFF] to-white overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="space-y-6 relative z-10"
        >
          {/* Header */}
        {/* Header */}
<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
  <div>
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        className="p-0 mr-2 hover:bg-transparent hover:text-[#2E2883]"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-3xl font-bold text-[#2E2883]">Interview Insights</h1>
      {candidateJobData && (
        <Badge className="bg-[#2E2883]/10 text-[#2E2883]">
          Round {candidateJobData.currentRound} of {getTotalRounds(candidateJobData.interviews)}
        </Badge>
      )}
    </div>
    <p className="text-gray-600 ml-7">Review candidate progress and make hiring decisions</p>
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
          {candidateJobData && (
  <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Candidate profile */}
        <div className="flex-1 flex items-start gap-4 min-w-0">
          <Avatar className="h-16 w-16 flex-shrink-0 border-2 border-[#2E2883]/20">
            <AvatarFallback className="bg-[#2E2883]/10 text-[#2E2883]">
              {getInitials(candidateJobData.candidate.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 min-w-0 flex-1">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 truncate">{candidateJobData.candidate.fullName}</h2>
              <p className="text-gray-600 flex items-center">
                <Mail className="h-4 w-4 mr-1.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">{candidateJobData.candidate.email}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {extractSkillsFromResume(candidateJobData.candidate.resumeContent).map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-gray-50">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-gray-700 mt-1">
              <div className="mt-1 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                <p className="line-clamp-none">{data?.overallSummary}</p>
              </div>
            </div>

            <div className="mt-2">
              <Button size="sm" className="gap-1.5">
                <BarChart4 className="h-4 w-4" />
                View Resume
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right column - Job details */}
        <div className="md:w-2/5 lg:w-1/3 md:border-l md:pl-6 mt-4 md:mt-0 flex-shrink-0">
          <div>
            <h3 className="font-medium text-gray-900">Job Details</h3>
            <Badge className="mt-1 bg-blue-100 text-blue-800">
              {candidateJobData.status}
            </Badge>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-start">
              <Briefcase className="h-5 w-5 text-[#2E2883] mt-0.5 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-medium text-gray-800">Position</h4>
                <p className="text-gray-600 break-words">{candidateJobData.job.title}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Building className="h-5 w-5 text-[#2E2883] mt-0.5 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-medium text-gray-800">Department</h4>
                <p className="text-gray-600 break-words">{candidateJobData.job.department}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-[#2E2883] mt-0.5 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-medium text-gray-800">Location</h4>
                <p className="text-gray-600 break-words">{candidateJobData.job.location}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CalendarDays className="h-5 w-5 text-[#2E2883] mt-0.5 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-medium text-gray-800">Current Stage</h4>
                <p className="text-gray-600">Round {candidateJobData.currentRound} of {getTotalRounds(candidateJobData.interviews)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)}

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
        <p className="text-gray-700">{data?.overallSummary}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-[#2E2883]/5 to-[#5D4BC3]/10 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-[#2E2883]">
              {interviewFeedback.length > 0 ? averageRating.toFixed(1) : "-"}
            </span>
            {interviewFeedback.length > 0 ? (
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
            ) : (
              <span className="text-sm text-gray-500">No ratings</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            From {interviewFeedback.length} interviews
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#2E2883]/5 to-[#5D4BC3]/10 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600 mb-1">Recommendations</p>
          {interviewFeedback.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center h-12 text-sm text-gray-500">
              No recommendations yet
            </div>
          )}
        </div>
        <div className="bg-gradient-to-br from-[#2E2883]/5 to-[#5D4BC3]/10 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600 mb-1">Current Status</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
              <Clock className="h-3 w-3 mr-1" />
              {candidateJobData?.status || "Interview Process"}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {candidateJobData ? 
              `Round ${candidateJobData.currentRound} of ${getTotalRounds(candidateJobData.interviews)}` :
              "All interviews completed. Ready for decision."
            }
          </p>
        </div>
      </div>
    </CardContent>
  </Card>

  {interviewFeedback.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {interviewFeedback.map((feedback) => (
        <Card
          key={feedback.id}
          className="border-none shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-300"
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
              <div className="flex flex-col items-end">
                <div className="flex items-center mb-1">
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
                <span className="text-xs text-gray-500 font-medium">
                  {feedback.overallRating.toFixed(1)}/5.0
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(feedback.date)}</span>
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
              
              {/* Private Notes Section */}
              <AccordionItem value="private-notes" className="border-b border-gray-100">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center text-gray-700 font-medium">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    Private Notes
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4">
                    <FeedbackDetailsContent 
                      feedback={feedback} 
                      rawFeedback={apiFeedbackData?.find(data => 
                        data.feedbackId?.toString() === feedback.id || 
                        data.id?.toString() === feedback.id
                      )} 
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between">
            <Badge
              className={`
                font-medium flex items-center
                ${feedback.finalRecommendation.includes("Strong Hire") ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                ${feedback.finalRecommendation === "Hire" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : ""}
                ${feedback.finalRecommendation.includes("another") ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
                ${feedback.finalRecommendation === "No Hire" ? "bg-red-100 text-red-800 hover:bg-red-200" : ""}
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
          </CardFooter>
        </Card>
      ))}
    </div>
  ) : (
    <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border-none">
      <MessageSquare className="h-12 w-12 mx-auto text-gray-300" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">No Feedback Available</h3>
      <p className="mt-2 text-gray-500 max-w-md mx-auto">
        No feedback has been submitted for this candidate yet. Feedback will appear here once interviewers submit their evaluations.
      </p>
    </div>
  )}
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
                    <p className="text-gray-700">{data?.overallSummary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          Key Strengths
                        </h3>
                        <ul className="mt-2 space-y-2">
                          {data?.strengthsWeaknesses.keyStrengths.map((item, i) => (
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
                          {data?.strengthsWeaknesses.keyWeaknesses.map((item, i) => (
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
                              {data?.fitAssessment.cultureFit}%
                            </span>
                          </div>
                          <Progress value={data?.fitAssessment.cultureFit} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600">Technical Fit</span>
                            <span className="font-medium text-gray-800">
                              {data?.fitAssessment.technicalFit}%
                            </span>
                          </div>
                          <Progress value={data?.fitAssessment.technicalFit} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600">Growth Potential</span>
                            <span className="font-medium text-gray-800">
                              {data?.fitAssessment.growthPotential}%
                            </span>
                          </div>
                          <Progress value={data?.fitAssessment.growthPotential} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 mt-6">
                      <div className="flex-1 border border-dashed border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          Recommended Action
                        </h3>
                        <p className="text-sm text-gray-700">{data?.recommendedAction}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center w-32">
                        <div
                          className="radial-progress text-[#2E2883]"
                          style={
                            {
                              "--value": data?.confidenceScore,
                              "--size": "4rem",
                              "--thickness": "0.5rem",
                            } as React.CSSProperties
                          }
                        >
                          <span className="text-lg font-bold">{data?.confidenceScore}%</span>
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
                    <CalendarDays className="h-5 w-5 mr-2 text-[#2E2883]" />
                    Interview History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {candidateJobData && candidateJobData.interviews && candidateJobData.interviews.length > 0 ? (
                    <div className="space-y-4">
                      {candidateJobData.interviews.map((interview) => (
                        <div key={interview.interviewId} className="border p-4 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-primary font-semibold">
                                Round {interview.roundNumber}: {interview.position}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatDate(interview.interviewDate)}
                              </p>
                            </div>
                            <Badge className={getStatusBadgeStyle(interview.status)}>
                              {interview.status}
                            </Badge>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant="outline" className="bg-gray-50 flex items-center">
                              <VideoIcon className="h-3 w-3 mr-1" />
                              {interview.mode}
                            </Badge>
                            <Badge variant="outline" className="bg-gray-50 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              45 min
                            </Badge>
                          </div>
                          <div className="mt-3">
                            {/* <p className="text-sm text-gray-700 mt-2">{interview.resumeSummary}</p> */}
                            <div className="mt-2 flex items-center">
                              <Users className="h-3.5 w-3.5 text-gray-500 mr-1" />
                              <p className="text-xs text-gray-500">
                                Interviewers: {interview.interviewers.map(i => i.name).join(", ")}
                              </p>
                            </div>
                            {interview.meetingLink && (
                              <a 
                                href={interview.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-2 text-xs text-blue-600 hover:underline flex items-center"
                              >
                                <VideoIcon className="h-3 w-3 mr-1" />
                                Meeting Link
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarDays className="h-12 w-12 mx-auto text-gray-300" />
                      <p className="mt-2 text-gray-500">No interview history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Schedule Next Round Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-6xl w-[80vw] overflow-scroll h-[80vh]">
          <DialogTitle>Schedule Next Rounds</DialogTitle>
        <RoundScheduler candidateData={candidateJobData}/> 
        </DialogContent>
      </Dialog>

      {/* Make Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={(open) => {
  setShowDecisionDialog(open);
  if (!open) {
    // Reset form when dialog closes
    setDecisionStep("initial");
    setDecision(null);
    setSendRejectionEmail(false);
    setEmailContent("");
    setDecisionNotes("");
  }
}}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-xl text-[#2E2883]">
        {decisionStep === "initial" 
          ? "Make a Decision"
          : decision === "hire"
            ? "Send Job Offer Notification"
            : "Send Rejection Notification"}
      </DialogTitle>
      <DialogDescription>
        {decisionStep === "initial" 
          ? "Review the candidate's performance and select your decision."
          : decision === "hire"
            ? "Customize the job offer notification email that will be sent to the candidate."
            : "Customize the rejection notification email that will be sent to the candidate."}
      </DialogDescription>
    </DialogHeader>

    {/* Initial Decision Step */}
    {decisionStep === "initial" && (
      <div className="space-y-6">
        {/* Candidate Summary */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[#2E2883]/10 text-[#2E2883]">
                {getInitials(candidateJobData?.candidate?.fullName || "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">{candidateJobData?.candidate?.fullName}</h3>
              <p className="text-sm text-gray-600">{candidateJobData?.job?.title}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <h4 className="text-xs uppercase text-gray-500 font-medium">Interviews Completed</h4>
              <p className="text-2xl font-semibold text-gray-800 mt-1">{interviewFeedback.length}</p>
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-500 font-medium">Average Rating</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-semibold text-gray-800">{averageRating.toFixed(1)}</span>
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
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-500 font-medium">Recommendation</h4>
              <div className="flex flex-col mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Hire: {hireRecommendations}</span>
                  <span className="text-sm font-medium text-gray-700">· Reject: {rejectRecommendations}</span>
                </div>
                <Progress 
                  value={(hireRecommendations / interviewFeedback.length) * 100} 
                  className="h-2 mt-1.5" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decision Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`p-5 border rounded-lg cursor-pointer transition-all ${
              decision === "reject" 
                ? "border-red-500 bg-red-50" 
                : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
            }`}
            onClick={() => setDecision("reject")}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                decision === "reject" ? "bg-red-100" : "bg-gray-100"
              }`}>
                <XCircle className={`h-6 w-6 ${
                  decision === "reject" ? "text-red-600" : "text-gray-500"
                }`} />
              </div>
              <div>
                <h3 className={`font-medium ${
                  decision === "reject" ? "text-red-700" : "text-gray-700"
                }`}>Reject Candidate</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Decline this candidate and optionally send a rejection email
                </p>
              </div>
            </div>
            
            {decision === "reject" && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <label 
                    htmlFor="send-email-toggle" 
                    className="text-sm font-medium text-gray-700 flex items-center cursor-pointer"
                  >
                    <Mail className="h-4 w-4 mr-1.5" />
                    Send rejection email to candidate
                  </label>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      id="send-email-toggle"
                      checked={sendRejectionEmail}
                      onChange={() => {
                        setSendRejectionEmail(!sendRejectionEmail);
                        if (!sendRejectionEmail) {
                          setEmailContent(defaultRejectEmailTemplate);
                        }
                      }}
                      className="sr-only"
                    />
                    <div 
                      className={`block w-12 h-6 rounded-full ${sendRejectionEmail ? 'bg-[#2E2883]' : 'bg-gray-300'}`}
                      onClick={() => {
                        setSendRejectionEmail(!sendRejectionEmail);
                        if (!sendRejectionEmail) {
                          setEmailContent(defaultRejectEmailTemplate);
                        }
                      }}
                    ></div>
                    <div 
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${
                        sendRejectionEmail ? 'translate-x-6' : 'translate-x-0'
                      }`}
                      onClick={() => {
                        setSendRejectionEmail(!sendRejectionEmail);
                        if (!sendRejectionEmail) {
                          setEmailContent(defaultRejectEmailTemplate);
                        }
                      }}
                    ></div>
                  </div>
                </div>

                {sendRejectionEmail && (
                  <div className="space-y-3 animation-fade-in">
                    <label className="text-sm font-medium text-gray-700 block">
                      Rejection Email Content
                    </label>
                    <Textarea 
                      placeholder="Email content for the candidate..." 
                      className="w-full min-h-[150px]" 
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div 
            className={`p-5 border rounded-lg cursor-pointer transition-all ${
              decision === "hire" 
                ? "border-green-500 bg-green-50" 
                : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
            }`}
            onClick={() => {
              setDecision("hire");
              setEmailContent(defaultHireEmailTemplate);
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                decision === "hire" ? "bg-green-100" : "bg-gray-100"
              }`}>
                <CheckCircle className={`h-6 w-6 ${
                  decision === "hire" ? "text-green-600" : "text-gray-500"
                }`} />
              </div>
              <div>
                <h3 className={`font-medium ${
                  decision === "hire" ? "text-green-700" : "text-gray-700"
                }`}>Move to Offer</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Approve for job offer and notify the candidate
                </p>
              </div>
            </div>
            
            {decision === "hire" && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    Offer Notification Email
                  </label>
                  <Textarea 
                    placeholder="Email content for the candidate..." 
                    className="w-full min-h-[150px]" 
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decision Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Internal Decision Notes (Optional)
          </label>
          <Textarea 
            placeholder="Add your notes about this decision for internal reference..." 
            className="w-full" 
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            variant="outline"
            onClick={() => {
              setShowDecisionDialog(false);
              setDecision(null);
            }}
          >
            Cancel
          </Button>
          
          {decision && (
            <Button 
              variant={decision === "hire" ? "default" : "destructive"}
              onClick={handleDecisionSubmit}
              disabled={loading || (sendRejectionEmail && !emailContent.trim()) || (decision === "hire" && !emailContent.trim())}
              className={decision === "hire" ? "bg-[#2E2883] hover:bg-[#251f68]" : ""}
            >
              {loading ? (
                <><Loader className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                decision === "hire" 
                  ? "Confirm & Send Offer Notification" 
                  : sendRejectionEmail 
                    ? "Confirm & Send Rejection" 
                    : "Confirm Rejection"
              )}
            </Button>
          )}
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}

      