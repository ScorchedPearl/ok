"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Briefcase, 
  ClipboardCheck, 
  Calendar, 
  Mail, 
  Phone, 
  ExternalLink, 
  AlertCircle,
  ChevronDown,
  ChevronUp,PhoneCall
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

// Define interfaces for the candidate detail page

interface Call {
  callId: string;
  remark: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  jobId: string;
  candidateId: number;
  tenantId: number;
  createdBy: string;
  createdAt: string;
  questionIds: string[];
}


interface Candidate {
  id: number;
  userId:number;
  fullName: string;
  email: string;
  phoneNumber: string;
  resumeContent: string;
  resumeSummary: string;
}

// First, let's update our JobApplication interface to match the API response
interface JobApplication {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  tenantId: number;
  matchScore?: number;
  experience?: number;
  skills?: string[];
  summary?: string;
}

interface TestAssignment {
  id: number;
  testId: number;
  testName: string;
  sessionToken: string;
  status: string;
  startTime: string;
  endTime: string | null;
  lastActivityTime: string | null;
}

interface Interview {
  id: number;
  jobTitle: string;
  interviewType: string;
  scheduledDate: string;
  interviewers: string[];
  candidate_job_id: number;
  status: string;
  feedback: string | null;
  mode?: string;
  meetingLink?: string;
}



const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";
const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8003";


export default function CandidateDetail() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [tests, setTests] = useState<TestAssignment[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeTab, setActiveTab] = useState("applications");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

  console.log("Candidate ID:", candidateId);


  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;


const generateMockCandidateData = (id: number) => {
    try {
      // Array of possible first names
      const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda"];
      
      // Array of possible last names
      const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
      
      // Simple, reliable bio generation
      const bio = "Experienced software developer with 5+ years of experience in React, TypeScript, and Node.js. Passionate about building user-friendly interfaces and scalable applications.";
      
      // Create simple candidate data
      const mockCandidate: Candidate = {
        id: id,
        fullName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        userId: id,
        email: `candidate${id}@example.com`,
        phoneNumber: "+1 (555) 123-4567",
        resumeContent: bio,
        resumeSummary: bio,
      };
      
      // Set the mock data safely
      setCandidate(mockCandidate);
      
      // Simple mock applications
      const mockApplications: JobApplication[] = [
        {
          id: "1",
          candidateId: "1",
          candidateName: "John Doe",
          jobId: "1",
          status: "Interview",
          appliedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          tenantId: 1,
        }
      ];
      
      setApplications(mockApplications);
      
      // Simple mock test assignments
      const mockTests: TestAssignment[] = [
        {
          id: 1,
          testId: 1,
          testName: "JavaScript Proficiency Test",
          sessionToken: "abc123",
          status: "Completed",
          startTime: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivityTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      setTests(mockTests);
      
      // Simple mock interviews
      const mockInterviews: Interview[] = [
        {
          id: 1,
          jobTitle: "Senior Frontend Developer",
          interviewType: "Technical",
          scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          interviewers: ["John Smith", "Emily Chen"],
          status: "Completed",
          feedback: "Strong technical skills. Recommended for next round.",
          candidate_job_id: 1,
        }
      ];
      
      setInterviews(mockInterviews);
      
      return true; // Success
    } catch (error) {
      console.error("Error generating mock data:", error);
      return false; // Failed
    }
  };

  // ----------------------------------------------------------------
  // 1. Fetch candidate details and related data with fallback to mock data
  // ----------------------------------------------------------------
  
useEffect(() => {
  const fetchCandidateData = async () => {
    if (!candidateId) {
      setError("No candidate ID provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch candidate details
      const candidateRes = await fetch(`${interviewServiceUrl}/api/candidates/${candidateId}`, {
        headers: {
          Authorization: `Bearer ${token?.access_token || ""}`,
        },
      });

      if (!candidateRes.ok) {
        throw new Error(`Failed to fetch candidate data. Status: ${candidateRes.status}`);
      }

      const candidateData = await candidateRes.json();
      setCandidate(candidateData);
      console.log("Successfully fetched candidate data from API for ID:", candidateId);
    } catch (err: any) {
      console.error("API error, falling back to mock data:", err);
      setError(err.message || "Failed to connect to API");

      // Use mock data as fallback
      try {
        generateMockCandidateData(parseInt(candidateId || "1"));
        setUsingMockData(true);
      } catch (mockError) {
        console.error("Error generating mock data:", mockError);
        setError("Failed to generate mock data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchCandidateData();
}, [candidateId, token]);

// Fetch dependent data (applications, interviews, tests) after candidate is set
useEffect(() => {
  const fetchDependentData = async () => {
    if (!candidate?.userId || !tenantId) {
      console.log("Skipping dependent data fetch: candidate.userId or tenantId missing");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch job applications
      const applicationsRes = await fetch(
        `${interviewServiceUrl}/api/job-applications/candidate/${candidate.userId}/tenant/${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${token?.access_token || ""}`,
          },
        }
      );

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData);
        console.log("Job applications fetched successfully:", applicationsData);
      } else {
        console.error("Failed to fetch job applications data");
      }

      // Fetch interviews
      const interviewsRes = await fetch(
        `${interviewServiceUrl}/api/interviews/candidate/${candidate.userId}/tenant/${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${token?.access_token || ""}`,
          },
        }
      );

      if (interviewsRes.ok) {
        const interviewsData = await interviewsRes.json();
        const formattedInterviews = interviewsData.map((interview: any) => ({
          id: interview.interviewId,
          jobTitle: interview.position,
          interviewType: `Round ${interview.roundNumber}`,
          scheduledDate: interview.interviewDate,
          interviewers: interview.interviewers.map((interviewer: any) => interviewer.name),
          status: interview.status,
          feedback: null,
          mode: interview.mode,
          meetingLink: interview.meetingLink,
          candidate_job_id: interview.candidate_job_id,
        }));
        setInterviews(formattedInterviews);
      } else {
        console.error("Failed to fetch interview data");
      }

      // Fetch scheduled calls
      const callsRes = await fetch(
        `${interviewServiceUrl}/api/calls/candidate/${candidate.id}`,
        {
          headers: {
            Authorization: `Bearer ${token?.access_token || ""}`,
          },
        }
      );

      if (callsRes.ok) {
        const callsData = await callsRes.json();
        setCalls(callsData.content);
        console.log("Calls fetched successfully:", callsData.content);
      } else {
        console.error("Failed to fetch calls data");
      }

      // Fetch test sessions
const testSessionsRes = await axios.get(
          `${testServiceUrl}/api/v1/test/sessions/tenant/${tenantId}/detailed`,
          {
            headers: {
              Authorization: `Bearer ${token?.access_token || ""}`,
            }
          }
        );

      if (testSessionsRes.data) {
        const testSessionsData = await testSessionsRes.data;
        console.log("Test sessions data:", testSessionsData);
        const filtereddata= testSessionsData.filter((session: any)=>{
          return session.candidateId===candidate.email}
        );
        setTests(filtereddata);
        console.log("Test sessions fetched successfully:", filtereddata);
      } else {
        console.error("Failed to fetch test sessions data");
      }
    } catch (err: any) {
      console.error("Error fetching dependent data:", err);
      setError(err.message || "Failed to fetch dependent data");
    } finally {
      setIsLoading(false);
    }
  };

  fetchDependentData();
}, [candidate?.userId, tenantId, token]);

  // ----------------------------------------------------------------
  // 2. Helper functions for formatting data
  // ----------------------------------------------------------------
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color based on status
  // Get status badge color based on status
const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    // Candidate statuses
    "Active": "bg-green-100 text-green-800",
    "Inactive": "bg-red-100 text-red-800",
    "On Hold": "bg-yellow-100 text-yellow-800",
    
    // Application statuses
    "Applied": "bg-blue-100 text-blue-800",
    "Screening": "bg-purple-100 text-purple-800",
    "Interview": "bg-indigo-100 text-indigo-800",
    "Offer": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800",
    "Hired": "bg-emerald-100 text-emerald-800",
    
    // Test statuses (updated for API response format)
    "PENDING": "bg-blue-100 text-blue-800",
    "IN_PROGRESS": "bg-yellow-100 text-yellow-800",
    "COMPLETED": "bg-green-100 text-green-800",
    "EXPIRED": "bg-gray-100 text-gray-800",
    "CANCELLED": "bg-red-100 text-red-800",
    
    // Interview statuses
    "Scheduled": "bg-blue-100 text-blue-800",
    "No Show": "bg-red-100 text-red-800",
    "Cancelled": "bg-gray-100 text-gray-800",
"NO_SHOW": "bg-amber-100 text-amber-800",
  };
  
  return statusMap[status] || "bg-gray-100 text-gray-800";
};



// ----------------------------------------------------------------
// 4. Render UI
// ----------------------------------------------------------------
// Force isLoading to false after a timeout to prevent infinite loading
useEffect(() => {
    // Safety mechanism to prevent indefinite loading
    if (isLoading) {
      const timer = setTimeout(() => {
        console.log("Loading timeout - forcing loading state to complete");
        setIsLoading(false);
        if (!candidate && !error) {
          setError("Loading timeout - please try again");
        }
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, candidate, error]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard/candidates">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  // Show error page if we have an error and no candidate data
  if (error && !candidate) {
    return (
      <div className="bg-white min-h-screen rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard/candidates">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Back to Candidates</h1>
        </div>
        <div className="p-4 text-center text-red-600">
          <p>Error loading candidate: {error || "Candidate not found"}</p>
          <Button 
            variant="default" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Show not found page if we have no candidate and no loading/error state
  if (!candidate) {
    return (
      <div className="bg-white min-h-screen rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard/candidates">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Back to Candidates</h1>
        </div>
        <div className="p-4 text-center text-amber-600">
          <p>No candidate data found for ID: {candidateId}</p>
          <Button 
            variant="default" 
            className="mt-4"
            onClick={() => window.location.replace('/dashboard/candidates')}
          >
            Return to Candidates List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen rounded-lg p-2 md:p-6">
      {/* Demo Mode Banner */}
      {usingMockData && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <span className="font-medium">Demo Mode:</span> Displaying mock candidate data because the API request failed.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="ml-auto text-amber-700 hover:text-amber-900 text-sm font-medium underline"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}
      
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard/candidates">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Back to Candidates</h1>
      </div>
      
      {/* Candidate profile and tabs in vertical layout */}
      <div className="flex flex-col gap-6">
        {/* Candidate Profile Card - Now at the top */}
        <Card className="bg-white shadow-md w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-semibold text-indigo-800">
                  {candidate.fullName ? candidate.fullName.charAt(0) : "?"}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-blue-800">
                    {candidate.fullName}
                  </CardTitle>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Contact Information</h3>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{candidate.email}</p>
                    <p className="text-xs text-gray-500">Email</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{candidate.phoneNumber}</p>
                    <p className="text-xs text-gray-500">Phone</p>
                  </div>
                </div>
              </div>
              
              {/* Resume Summary Section */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">Resume Summary</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowFullSummary(!showFullSummary)}
                  >
                    {showFullSummary ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className={`text-sm text-gray-700 ${!showFullSummary ? 'line-clamp-2' : ''}`}>
                  {candidate.resumeSummary}
                </div>
                {!showFullSummary && candidate.resumeSummary && candidate.resumeSummary.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 p-0 h-auto"
                    onClick={() => setShowFullSummary(true)}
                  >
                    Show more
                  </Button>
                )}
                {showFullSummary && candidate.resumeSummary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 p-0 h-auto"
                    onClick={() => setShowFullSummary(false)}
                  >
                    Show less
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs Container for Applications, Tests, Interviews - Now below the profile */}
        <div className="w-full">
          <Tabs defaultValue="applications" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-gray-200 text-black"> {/* Changed from grid-cols-3 to grid-cols-4 */}
    <TabsTrigger value="applications" className="flex items-center gap-2">
      <Briefcase className="h-4 w-4" />
      <span>Applications</span>
    </TabsTrigger>
    <TabsTrigger value="tests" className="flex items-center gap-2">
      <ClipboardCheck className="h-4 w-4" />
      <span>Tests</span>
    </TabsTrigger>
    <TabsTrigger value="interviews" className="flex items-center gap-2">
      <Calendar className="h-4 w-4" />
      <span>Interviews</span>
    </TabsTrigger>
    <TabsTrigger value="calls" className="flex items-center gap-2">
      <PhoneCall className="h-4 w-4" />
      <span>Calls</span>
    </TabsTrigger>
  </TabsList>
            
            {/* Job Applications Tab */}
            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800">Job Applications</CardTitle>
                  <CardDescription className="text-gray-500">
                    View all job applications submitted by this candidate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <Card key={app.id} className="overflow-hidden">
                          <div className="p-4 border-l-4 border-indigo-500 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {/* Using candidateName since jobTitle isn't directly available */}
                                  Job Application
                                </h3>
                                {app.matchScore && (
                                  <p className="text-sm text-gray-500">
                                    Match Score: {app.matchScore}%
                                  </p>
                                )}
                              </div>
                              <Badge className={getStatusColor(app.status)}>
                                {app.status}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              {app.skills && app.skills.length > 0 && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Skills:</span> {app.skills.join(", ")}
                                </p>
                              )}
                              {app.experience !== undefined && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Experience:</span> {app.experience} years
                                </p>
                              )}
                              {app.summary && (
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-medium">Summary:</span> {app.summary}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <div className="text-sm text-gray-500">
                                Applied on {formatDate(app.appliedAt)}
                                {app.updatedAt !== app.appliedAt && (
                                  <span> · Updated on {formatDate(app.updatedAt)}</span>
                                )}
                              </div>
                              <Link to={`/job-application-details/${app.id}`}>
                                <Button variant="outline" size="sm" className="flex items-center gap-1 text-indigo-600">
                                  <span>View Details</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No job applications found for this candidate.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tests Tab */}
            <TabsContent value="tests" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800">Test Sessions</CardTitle>
                  <CardDescription className="text-gray-500">
                    View all test sessions for this candidate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tests.length > 0 ? (
                    <div className="space-y-4">
                      {tests.map((test) => (
                        <Card key={test.id} className="overflow-hidden">
                          <div className="p-4 border-l-4 border-indigo-500 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{test.testName}</h3>
                                <p className="text-sm text-gray-500">
                                  {test.startTime && `Started: ${formatDate(test.startTime)}`}
                                </p>
                              </div>
                              <Badge className={getStatusColor(test.status)}>
                                {test.status}
                              </Badge>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <div className="text-sm text-gray-500">
                                {test.endTime ? (
                                  <span>
                                    Completed on {formatDate(test.endTime)}
                                  </span>
                                ) : test.lastActivityTime ? (
                                  <span>Last active on {formatDate(test.lastActivityTime)}</span>
                                ) : (
                                  <span>Session created</span>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-indigo-600">
                                <span>View Details</span>
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No test sessions found for this candidate.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Interviews Tab */}
            <TabsContent value="interviews" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800">Interviews</CardTitle>
                  <CardDescription className="text-gray-500">
                    View all interviews scheduled for this candidate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {interviews.length > 0 ? (
                    <div className="space-y-4">
                      {interviews.map((interview) => (
                        <Card key={interview.id} className="overflow-hidden">
                          <div className="p-4 border-l-4 border-indigo-500 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {interview.interviewType} - {interview.jobTitle}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {formatDate(interview.scheduledDate)}
                                </p>
                              </div>
                              <Badge className={getStatusColor(interview.status)}>
                                {interview.status}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Interviewers:</span>{" "}
                                {interview.interviewers.join(", ")}
                              </p>
                              {interview.mode && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Mode:</span>{" "}
                                  {interview.mode}
                                </p>
                              )}
                              {interview.meetingLink && (
                                <p className="text-sm text-gray-600">
                                  <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                    <span>Meeting Link</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </p>
                              )}
                            </div>
                            <div className="mt-3 flex justify-end">
                              <Link to={`/jobs/interviews/${interview.id}/${interview.candidate_job_id}/details`} >
                              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-indigo-600">
                                <span>View Details</span>
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No interviews found for this candidate.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calls" className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-800">Scheduled Calls</CardTitle>
        <CardDescription className="text-gray-500">
          View all scheduled calls for this candidate
        </CardDescription>
      </CardHeader>
      <CardContent>
        {calls.length > 0 ? (
          <div className="space-y-4">
            {calls.map((call) => (
              <Card key={call.callId} className="overflow-hidden">
                <div className="p-4 border-l-4 border-indigo-500 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Screening Call</h3>
                      <p className="text-sm text-gray-500">
                        Scheduled for {formatDate(call.scheduledAt)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(call.status)}>
                      {call.status}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Duration:</span> {call.durationMinutes} minutes
                    </p>
                    {call.remark && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Remark:</span> {call.remark}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Created by:</span> {call.createdBy}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Questions:</span> {call.questionIds.length} questions
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link to={`/calls/details/${call.callId}`}>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-indigo-600">
                        <span>View Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No scheduled calls found for this candidate.
          </div>
        )}
      </CardContent>
    </Card>
  </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}