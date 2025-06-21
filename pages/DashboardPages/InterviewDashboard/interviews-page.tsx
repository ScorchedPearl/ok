"use client";

import React, { useState, useEffect, forwardRef, ForwardedRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import ManageInterviewersSection from "./ManageInterviewers"; // Assuming this will be used later
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Video,
  Mail,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

interface Interviewer {
  id: number;
  name: string;
  email: string;
  // Removed password as it's unlikely to be needed/exposed on the frontend for display
  // password: string;
}

export interface Interview {
  interviewId: number;
  candidateId: number;
  candidateEmail: string;
  testId?: number;
  position: string;
  roundNumber: number;
  interviewDate: string;
  mode: string;
  meetingLink: string | null;
  status: string;
  createdAt: string;
  emailSent: boolean;
  interviews: Interviewer[]; // Corrected: it was 'interviews: Interviewer[]' inside Interviewer, should be on Interview
  secureToken?: string;
  tokenExpiration?: string;
  candidate_job_id?: number;
}

// Status mapping for visual elements
const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon: JSX.Element;
    description: string;
  }
> = {
  SCHEDULED: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-800",
    icon: <Clock className="h-4 w-4" />,
    description: "Interview scheduled and pending",
  },
  COMPLETED_OVERDUE: {
    label: "Overdue",
    color: "bg-amber-100 text-amber-800",
    icon: <AlertTriangle className="h-4 w-4" />,
    description: "Feedback submission overdue",
  },
  COMPLETED_COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
    description: "Interview and feedback completed",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="h-4 w-4" />,
    description: "Interview has been cancelled",
  },
  // Added a default for unknown statuses
  UNKNOWN: {
    label: "Unknown",
    color: "bg-gray-100 text-gray-800",
    icon: <Clock className="h-4 w-4" />,
    description: "Status not recognized",
  }
};

// Interview Card Component
const InterviewCard = forwardRef(({ interview }: { interview: Interview }, ref: ForwardedRef<HTMLDivElement>) => {
  const navigate = useNavigate();
  const status = interview.status;
  // Use a default config if status is not found to prevent errors
  const config = statusConfig[status] || statusConfig.UNKNOWN;


  // Format date and time
  const interviewDateObj = new Date(interview.interviewDate);
  const date = interviewDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = interviewDateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  // Calculate relative time status
  const today = new Date();
  today.setHours(0,0,0,0); // Normalize today to the start of the day for accurate day diff
  const interviewDay = new Date(interviewDateObj);
  interviewDay.setHours(0,0,0,0); // Normalize interview date

  const diffTime = interviewDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let timeStatusText: string;
  if (diffDays > 0) {
    timeStatusText = `In ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  } else if (diffDays === 0) {
    timeStatusText = "Today";
  } else {
    timeStatusText = `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago`;
  }


  // Navigation handlers
  const handleViewInsight = () => {
    if (interview.interviewId && interview.candidate_job_id) {
      navigate(
        `/jobs/interviews/${interview.interviewId}/${interview.candidate_job_id}/details`
      );
    } else {
      console.warn("Missing interviewId or candidate_job_id for navigation", interview);
      // Optionally navigate to a more general page or show a toast
    }
  };

  const handleJoinMeeting = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    link: string | null // Allow link to be null
  ) => {
    e.stopPropagation();
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white mb-4 overflow-hidden">
        <CardContent className="p-0">
          <div className={`h-1 w-full ${config.color.split(" ")[0]}`}></div>
          <div className="p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 w-full">
                <div className="flex flex-row sm:flex-col items-center justify-center bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-0 w-full sm:w-auto sm:min-w-[90px]">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#2E2883] sm:mb-1 mr-2 sm:mr-0" />
                  <div className="flex flex-col sm:items-center">
                    <span className="text-sm font-medium text-gray-800">{date}</span>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-center sm:gap-0">
                      <span className="text-xs font-medium text-gray-600">{time}</span>
                      <span className="text-xs text-gray-500 sm:mt-1">{timeStatusText}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-base sm:text-lg group-hover:text-[#2E2883] transition-colors text-slate-800">
                      {interview.position || "N/A"}
                    </h3>
                    <Badge className={`${config.color} flex items-center gap-1 text-xs`}>
                      {config.icon} {config.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-1">
                    <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-1 truncate">
                      <span className="text-gray-500">Candidate:</span> {interview.candidateEmail}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-1">
                      <span className="text-gray-500">Round:</span> {interview.roundNumber}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-1">
                      <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" /> {interview.mode}
                    </p>
                    {interview.emailSent && (
                      <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-1">
                        <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" /> Invitation sent
                      </p>
                    )}
                  </div>
                  {interview.interviews && interview.interviews.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-1 mb-1">
                        <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />{" "}
                        <span className="font-medium">Interviewers:</span>
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {interview.interviews.map((interviewer) => ( // Changed index to interviewer.id for key if available and unique
                          <Badge
                            key={interviewer.id || interviewer.email} // Use a unique ID, fallback to email
                            variant="outline"
                            className="text-[10px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2 bg-gray-50"
                          >
                            {interviewer.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-row sm:flex-col gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#2E2883] text-[#2E2883] hover:bg-[#2E2883] hover:text-white text-xs sm:text-sm flex-1 sm:flex-none"
                  onClick={handleViewInsight}
                  disabled={!interview.interviewId || !interview.candidate_job_id} // Disable if IDs are missing
                >
                  View Insight
                </Button>
                {interview.meetingLink && (
                  <Button
                    size="sm"
                    // variant="ghost" // Ghost might not be prominent enough for "Join"
                    className="text-white bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm flex-1 sm:flex-none"
                    onClick={(e) => handleJoinMeeting(e, interview.meetingLink)}
                  >
                    <Video className="h-3.5 w-3.5 mr-1" /> Join
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
InterviewCard.displayName = "InterviewCard"; // For better debugging


// Loading Skeleton
const InterviewCardSkeleton = () => (
  <Card className="border border-gray-200 shadow-sm mb-4 overflow-hidden">
    <CardContent className="p-0">
      <div className="h-1 w-full bg-gray-200"></div>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-lg shrink-0" /> {/* Added shrink-0 */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-3/5" /> {/* Adjusted width */}
              <Skeleton className="h-5 w-1/5" /> {/* Adjusted width */}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Skeleton className="h-4 w-4/5" /> {/* Adjusted width */}
              <Skeleton className="h-4 w-3/5" /> {/* Adjusted width */}
              <Skeleton className="h-4 w-3/5" /> {/* Adjusted width */}
              <Skeleton className="h-4 w-4/5" /> {/* Adjusted width */}
            </div>
            <Skeleton className="h-4 w-2/5 mt-1" /> {/* Adjusted width */}
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0"> {/* Added shrink-0 */}
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Keep true initially
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [positions, setPositions] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const { user, loading: authLoading } = useAuth(); // Assuming useAuth provides a loading state
  const tenantId = user?.tenant?.tenantId;

  // Check your VITE_INTERVIEW_SERVICE_URL. If it's "https://api.screenera.ai/api/api/interviews",
  // and you append "/api/interviews/tenant/id/${id}", the URL becomes duplicated.
  // It should likely be just "https://api.screenera.ai" or "https://api.screenera.ai/api"
  const interviewServiceBaseUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;
  const interviewServiceUrl = `${interviewServiceBaseUrl}/api/interviews`; // Construct full base path here

  const fetchInterviews = async (currentTenantId: string | number) => { // Explicitly type currentTenantId
    console.log("Fetching interviews for tenantId:", currentTenantId);
    setLoading(true);
    try {
      // Ensure your URL construction is correct here:
      // The original error showed: /api/api/interviews/api/interviews/...
      // This suggests `interviewServiceUrl` might already contain /api/interviews or similar
      // Let's assume `interviewServiceUrl` is the base for the interview service (e.g., https://api.screenera.ai/interview-service)
      // and the specific path is /tenant/id/{id}
      // Updated fetch URL:
      const response = await fetch(`${interviewServiceUrl}/tenant/id/${currentTenantId}`);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to fetch interviews. Status:", response.status, "Response:", errorData);
        throw new Error(`Failed to fetch interviews. Status: ${response.status}`);
      }
      const data: any[] = await response.json(); // Assume API returns an array
      console.log("Raw Interviews Data from API:", data);

      const transformedInterviews: Interview[] = data.map((interview: any) => ({
        interviewId: interview.interviewId,
        candidateId: interview.candidateId,
        candidateEmail: interview.candidateEmail,
        candidate_job_id: interview.candidate_job_id,
        testId: interview.testId,
        position: interview.position || "N/A", // Default for missing position
        roundNumber: interview.roundNumber,
        interviewDate: interview.interviewDate,
        mode: interview.mode,
        meetingLink: interview.meetingLink,
        status: interview.status || "UNKNOWN", // Default for missing status
        createdAt: interview.createdAt,
        emailSent: interview.emailSent || false, // Default for missing emailSent
        // Ensure 'interviews' (for interviewers) is an array, default to empty if null/undefined
        interviews: Array.isArray(interview.interviews) ? interview.interviews.map((i: any) => ({
          id: i.id,
          name: i.name || "Unnamed Interviewer",
          email: i.email,
          // password field removed from Interviewer interface
        })) : [],
        secureToken: interview.secureToken,
        tokenExpiration: interview.tokenExpiration,
      }));

      const uniquePositions = [
        ...new Set(transformedInterviews.map((i) => i.position).filter(p => p && p !== "N/A")), // Filter out "N/A" or nulls
      ];
      setPositions(uniquePositions);

      const sortedInterviews = transformedInterviews.sort(
        (a, b) =>
          new Date(b.interviewDate).getTime() -
          new Date(a.interviewDate).getTime()
      );
      setInterviews(sortedInterviews);
      setFilteredInterviews(sortedInterviews); // Initialize filtered interviews
    } catch (error) {
      console.error("Error fetching or processing interviews:", error);
      setInterviews([]); // Clear interviews on error
      setFilteredInterviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    // Wait for auth to finish loading and for tenantId to be available
    if (!authLoading && tenantId) {
      fetchInterviews(tenantId);
    } else if (!authLoading && !tenantId) {
      // Handle case where user is loaded but no tenantId (e.g., different user role)
      console.warn("User loaded, but no tenantId found. Cannot fetch interviews.");
      setLoading(false); // Stop loading as we can't proceed
      setInterviews([]);
      setFilteredInterviews([]);
    }
    // The dependency array now correctly lists `tenantId` and `authLoading`.
  }, [tenantId, authLoading]); // Effect depends on tenantId and authLoading state

  useEffect(() => {
    applyFilters();
  }, [interviews, activeTab, searchQuery, filterPosition]); // applyFilters depends on these


  const handleRefresh = async () => {
    if (tenantId) { // Only refresh if tenantId is available
      setRefreshing(true);
      await fetchInterviews(tenantId);
      // setLoading(false) and setRefreshing(false) is handled in fetchInterviews finally block
    } else {
      console.warn("Cannot refresh, tenantId is not available.");
    }
  };

  const applyFilters = () => {
    let result = [...interviews]; // Start with all fetched interviews

    // Filter by active tab (status)
    if (activeTab !== "all") {
      result = result.filter((interview) => {
        switch (activeTab) {
          case "scheduled":
            return interview.status === "SCHEDULED";
          case "overdue":
            return interview.status === "COMPLETED_OVERDUE";
          case "completed":
            return interview.status === "COMPLETED_COMPLETED";
          case "cancelled":
            return interview.status === "CANCELLED";
          default:
            return true; // Should not happen if activeTab is one of the defined values
        }
      });
    }

    // Filter by position
    if (filterPosition !== "all") {
      result = result.filter(
        (interview) => interview.position === filterPosition
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (interview) =>
          interview.candidateEmail.toLowerCase().includes(query) ||
          (interview.position && interview.position.toLowerCase().includes(query)) || // Check if position exists
          (interview.interviews && interview.interviews.some( // Check if interviewers exist
            (i) =>
              i.name.toLowerCase().includes(query) ||
              (i.email && i.email.toLowerCase().includes(query)) // Check if email exists
          ))
      );
    }
    // Sorting is already done in fetchInterviews, but if you re-filter, ensure it's re-applied or applied here if needed.
    // For simplicity, initial sort is maintained unless filters imply a different order.
    // result = result.sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());
    setFilteredInterviews(result);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterPosition("all");
    setActiveTab("all");
    // applyFilters will be called by useEffect due to state changes
  };

  const counts = React.useMemo(() => ({ // useMemo for counts
    all: interviews.length,
    scheduled: interviews.filter((i) => i.status === "SCHEDULED").length,
    overdue: interviews.filter((i) => i.status === "COMPLETED_OVERDUE").length,
    completed: interviews.filter((i) => i.status === "COMPLETED_COMPLETED").length,
    cancelled: interviews.filter((i) => i.status === "CANCELLED").length,
  }), [interviews]);


  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Calendar className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No interviews found</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
        {searchQuery || filterPosition !== "all" || activeTab !== "all"
          ? "Try adjusting your search criteria or clearing the filters to see all interviews."
          : "There are currently no interviews scheduled or recorded."}
      </p>
      {(searchQuery || filterPosition !== "all" || activeTab !== "all") && (
        <Button onClick={resetFilters} variant="outline" size="sm">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  if (authLoading || (loading && !interviews.length && !filteredInterviews.length)) { // Show skeletons if auth is loading OR data is loading and nothing is displayed yet
      return (
          <div className="container mx-auto px-4 py-8">
              {/* Simplified header skeleton */}
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-8 w-1/2 mb-8" />
              <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                      <InterviewCardSkeleton key={i} />
                  ))}
              </div>
          </div>
      );
  }


  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2883] mb-1">
                Interview Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage and track all interview sessions
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={loading || refreshing || !tenantId} // Disable if no tenantId
                  >
                    <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* ManageInterviewersSection can be added here when ready */}
          {/* <ManageInterviewersSection /> */}

          <Card className="border-none shadow-sm bg-white/80 transition-all duration-300 mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1 min-w-0"> {/* Added min-w-0 for flex child */}
                  <label htmlFor="search" className="text-sm font-medium text-gray-700">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Candidate, position, interviewer..." // Shortened placeholder
                      className="pl-9 text-primary" // Ensure primary text color is appropriate
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-64 space-y-1">
                  <label htmlFor="position-filter" className="text-sm font-medium text-gray-700"> {/* Changed id for clarity */}
                    Position
                  </label>
                  <Select value={filterPosition} onValueChange={setFilterPosition}>
                    <SelectTrigger
                      id="position-filter"
                      className="bg-white border border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-[#2E2883] rounded-md" // Removed py-1, rely on default padding
                    >
                      <SelectValue placeholder="All positions" />
                    </SelectTrigger>
                    <SelectContent className="border border-primary rounded-md"> {/* Ensure primary is defined */}
                      <SelectItem value="all">All positions</SelectItem>
                      {positions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800" // Adjusted hover color
                  onClick={resetFilters}
                  disabled={!searchQuery && filterPosition === "all" && activeTab === "all"}
                >
                  <Filter className="h-4 w-4 mr-1.5" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 mb-6 bg-gray-100 p-1 rounded-lg">
              {(Object.keys(counts) as Array<keyof typeof counts>).map((key) => (
                  <TabsTrigger key={key} value={key} className="relative text-gray-700 data-[state=active]:bg-white data-[state=active]:text-[#2E2883] data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      <Badge className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" variant={activeTab === key ? "default" : "secondary"}>
                          {counts[key]}
                      </Badge>
                  </TabsTrigger>
              ))}
            </TabsList>
            <TracingBeam className="ml-0"> {/* Ensure TracingBeam styling is appropriate */}
              <ScrollArea className="h-[calc(100vh-380px)] sm:h-[calc(100vh-350px)] pr-3 -mr-3"> {/* Adjusted height and padding for scrollbar */}
                {loading && filteredInterviews.length === 0 ? ( // Show skeletons only if loading AND no data yet
                  <>
                    {[...Array(3)].map((_, i) => ( // Reduced skeleton count for faster perceived load
                      <InterviewCardSkeleton key={i} />
                    ))}
                  </>
                ) : !loading && filteredInterviews.length === 0 ? ( // Show empty state if not loading and no results
                  <EmptyState />
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredInterviews.map((interview) => (
                      <InterviewCard key={interview.interviewId} interview={interview} />
                    ))}
                  </AnimatePresence>
                )}
                {!loading && interviews.length > 0 && ( // Show only if not loading and there are some interviews (filtered or not)
                  <div className="text-center text-sm text-gray-500 mt-6 mb-4">
                    <p>
                      Showing {filteredInterviews.length} of {interviews.length} interviews.
                      {/* Interviews older than 60 days are archived.{" "}
                      <Button
                        variant="link"
                        className="text-[#2E2883] hover:text-[#1E1A5F] text-sm h-auto p-0"
                        onClick={() => alert("Archive view not implemented yet.")} // Placeholder action
                      >
                        View archives
                      </Button> */}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TracingBeam>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}