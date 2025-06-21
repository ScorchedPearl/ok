"use client";

import React, { useState, useEffect , forwardRef, ForwardedRef} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

interface Interviewer {
  id: number;
  name: string;
  email: string;
  password: string;
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
  interviews: Interviewer[];
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
};

// Interview Card Component
// InterviewCard Component with updated button logic
const InterviewCard = forwardRef(({ interview }: { interview: Interview }, ref: ForwardedRef<HTMLDivElement>) => {
  
  const [currentStatus, setCurrentStatus] = useState<string>(interview.status);
  console.log(currentStatus);


  const navigate = useNavigate();
  
  const config =
  statusConfig[currentStatus] || {
    label: currentStatus,
    color: "bg-gray-100 text-gray-800",
    icon: <Clock className="h-4 w-4" />,
    description: "Status not recognized",
  };

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
  const diffTime = interviewDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const timeStatus =
    diffDays > 0
      ? `In ${diffDays} day${diffDays > 1 ? "s" : ""}`
      : diffDays === 0
      ? "Today"
      : `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago`;

  // Navigation handlers
  const handleViewInsight = () => {
    navigate(
      `/jobs/interviews/${interview.interviewId}/${interview.candidate_job_id}/details`
    );
  };

  const handleGiveFeedback = () => {
    navigate(
      `/job/interviewer/interview/${interview.interviewId}`
    );
  };

  const handleJoinMeeting = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    link: string
  ) => {
    e.stopPropagation();
    window.open(link, "_blank", "noopener,noreferrer");
  };




  const handleMarkAsCompleted = async () => {
    try {
      const statusUrl = `${interviewServiceUrl}/api/interviews/${interview.interviewId}/status?status=COMPLETED_OVERDUE`;
      const response = await fetch(statusUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to update interview status: ${response.statusText}`);
      }
      
      
      setCurrentStatus("COMPLETED_OVERDUE");
    } catch (error) {
      console.error("Error updating interview status:", error);
    }
  };

// ... inside the returned JSX, replace the action buttons block:
<div className="flex flex-row sm:flex-col gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
  {currentStatus === "SCHEDULED" ? (
    <Button
      size="sm"
      variant="outline"
      className="border-[#2E2883] text-[#2E2883] hover:bg-[#2E2883] hover:text-white text-xs sm:text-sm flex-1 sm:flex-none"
      onClick={handleMarkAsCompleted}
    >
      Mark as Completed
    </Button>
  ) : currentStatus === "COMPLETED_OVERDUE" ? (
    <Button
      size="sm"
      variant="outline"
      className="border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-white text-xs sm:text-sm flex-1 sm:flex-none"
      onClick={handleGiveFeedback}
    >
      Give Feedback
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      className="border-[#2E2883] text-[#2E2883] hover:bg-[#2E2883] hover:text-white text-xs sm:text-sm flex-1 sm:flex-none"
      onClick={handleViewInsight}
    >
      View Insight
    </Button>
  )}

  {interview.meetingLink && (
    <Button
      size="sm"
      variant="ghost"
      className="text-white bg-blue-600 text-xs sm:text-sm flex-1 sm:flex-none"
      onClick={(e) => handleJoinMeeting(e, interview.meetingLink as string)}
    >
      <Video className="h-3.5 w-3.5 mr-1" /> Join
    </Button>
  )}
</div>


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
          {/* Status Indicator */}
          <div className={`h-1 w-full ${config.color.split(" ")[0]}`}></div>
          <div className="p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              {/* Date/Time Section */}
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 w-full">
                <div className="flex flex-row sm:flex-col items-center justify-center bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-0 w-full sm:w-auto sm:min-w-[90px]">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#2E2883] sm:mb-1 mr-2 sm:mr-0" />
                  <div className="flex flex-col sm:items-center">
                    <span className="text-sm font-medium text-gray-800">{date}</span>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-center sm:gap-0">
                      <span className="text-xs font-medium text-gray-600">{time}</span>
                      <span className="text-xs text-gray-500 sm:mt-1">{timeStatus}</span>
                    </div>
                  </div>
                </div>
                
                {/* Interview Details */}
                <div className="space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-base sm:text-lg group-hover:text-[#2E2883] transition-colors text-slate-800">
                      {interview.position}
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
                  {interview.interviews.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-1 mb-1">
                        <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />{" "}
                        <span className="font-medium">Interviewers:</span>
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {interview.interviews.map((interviewer, index) => (
                          <Badge
                            key={index}
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
              
              {/* Action Buttons */}
              <div className="flex flex-row sm:flex-col gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
  {currentStatus === "SCHEDULED" ? (
    <Button
      size="sm"
      variant="outline"
      className="border-[#2E2883] text-[#2E2883] hover:bg-[#2E2883] hover:text-white text-xs sm:text-sm flex-1 sm:flex-none"
      onClick={handleMarkAsCompleted}
    >
      Mark as Completed
    </Button>
  ) : currentStatus === "COMPLETED_OVERDUE" ? (
    <Button
      size="sm"
      variant="outline"
      className="border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-white text-xs sm:text-sm flex-1 sm:flex-none"
      onClick={handleGiveFeedback}
    >
      Give Feedback
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      className="border-[#2E2883] text-[#2E2883] hover:bg-[#2E2883] hover:text-white text-xs sm:text-sm flex-1 sm:flex-none"
      onClick={handleViewInsight}
    >
      View Insight
    </Button>
  )}

  {interview.meetingLink && (
    <Button
      size="sm"
      variant="ghost"
      className="text-white bg-blue-600 text-xs sm:text-sm flex-1 sm:flex-none"
      onClick={(e) => handleJoinMeeting(e, interview.meetingLink as string)}
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

// Loading Skeleton
const InterviewCardSkeleton = () => (
  <Card className="border border-gray-200 shadow-sm mb-4 overflow-hidden">
    <CardContent className="p-0">
      <div className="h-1 w-full bg-gray-200"></div>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-32 mt-1" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function InterviewInterviewerPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [positions, setPositions] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { user } = useAuth();

  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

  useEffect(() => {
    if(user)
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [interviews, activeTab, searchQuery, filterPosition]);
  

  const fetchInterviews = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${interviewServiceUrl}/api/interviews/interviewer/${user?.userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }
      const data: Record<string, any>[] = await response.json();
      
      const transformedInterviews: Interview[] = data.map((interview) => ({
        interviewId: interview.interviewId,
        candidateId: interview.candidateId,
        candidateEmail: interview.candidateEmail,
        candidate_job_id: interview.candidateJobId,
        testId: interview.testId,
        position: interview.position,
        roundNumber: interview.roundNumber,
        interviewDate: interview.interviewDate,
        mode: interview.mode,
        meetingLink: interview.meetingLink,
        status: interview.status,
        createdAt: interview.createdAt,
        emailSent: interview.emailSent,
        interviews: interview.interviews || [],
        secureToken: interview.secureToken,
        tokenExpiration: interview.tokenExpiration,
      }));

      const uniquePositions = [
        ...new Set(transformedInterviews.map((i) => i.position)),
      ];
      setPositions(uniquePositions);

      // Always sort with most recent date first (descending)
      const sortedInterviews = transformedInterviews.sort(
        (a, b) =>
          new Date(b.interviewDate).getTime() -
          new Date(a.interviewDate).getTime()
      );
      setInterviews(sortedInterviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInterviews();
    setTimeout(() => setRefreshing(false), 800);
  };

  const applyFilters = () => {
    let result = [...interviews];
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
            return true;
        }
      });
    }
    if (filterPosition !== "all") {
      result = result.filter(
        (interview) => interview.position === filterPosition
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (interview) =>
          interview.candidateEmail.toLowerCase().includes(query) ||
          interview.position.toLowerCase().includes(query) ||
          interview.interviews.some(
            (i) =>
              i.name.toLowerCase().includes(query) ||
              i.email.toLowerCase().includes(query)
          )
      );
    }
    // Always sort descending (most recent first)
    result = result.sort(
      (a, b) =>
        new Date(b.interviewDate).getTime() -
        new Date(a.interviewDate).getTime()
    );
    setFilteredInterviews(result);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterPosition("all");
    setActiveTab("all");
  };

  const counts = {
    all: interviews.length,
    scheduled: interviews.filter((i) => i.status === "SCHEDULED").length,
    overdue: interviews.filter((i) => i.status === "COMPLETED_OVERDUE").length,
    completed: interviews.filter((i) => i.status === "COMPLETED_COMPLETED").length,
    cancelled: interviews.filter((i) => i.status === "CANCELLED").length,
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Calendar className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No interviews found</h3>
      <p className="text-sm text-gray-500 mb-4">
        {searchQuery || filterPosition !== "all"
          ? "Try changing your search criteria or clear filters"
          : "No interviews match the current selection"}
      </p>
      {(searchQuery || filterPosition !== "all" || activeTab !== "all") && (
        <Button onClick={resetFilters} variant="outline" size="sm">
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* <BackgroundBeams /> */}

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-3xl font-bold text-[#2E2883] mb-1">
                  Interview Management
                </h1>
                <p className="text-gray-600">
                  Manage and track all your interview sessions
                </p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
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

       

          {/* Filter and Search */}
          <Card className="border-none shadow-sm bg-white/80 transition-all duration-300 mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1">
                  <label htmlFor="search" className="text-sm font-medium text-gray-700">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-500" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by candidate, position, or interviewer..."
                      className="pl-9 text-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-64 space-y-1">
                  <label htmlFor="position" className="text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <Select value={filterPosition} onValueChange={setFilterPosition}>
                    <SelectTrigger
                      id="position"
                      className="bg-white border border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-[#2E2883] rounded-md px-3 py-1"
                    >
                      <SelectValue placeholder="All positions" className="text-gray-500" />
                    </SelectTrigger>
                    <SelectContent className="border border-primary rounded-md">
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
                  className="text-gray-500"
                  onClick={resetFilters}
                  disabled={!searchQuery && filterPosition === "all" && activeTab === "all"}
                >
                  <Filter className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Interviews List */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6 bg-gray-100">
              <TabsTrigger value="all" className="relative text-gray-800">
                All
                <Badge className="ml-1.5 bg-gray-100 text-gray-800 hover:bg-gray-100">{counts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="relative text-gray-800">
                Scheduled
                <Badge className="ml-1.5 bg-blue-100 text-blue-800 hover:bg-blue-100">{counts.scheduled}</Badge>
              </TabsTrigger>
              <TabsTrigger value="overdue" className="relative text-gray-800">
                Overdue
                <Badge className="ml-1.5 bg-amber-100 text-amber-800 hover:bg-amber-100">{counts.overdue}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="relative text-gray-800">
                Completed
                <Badge className="ml-1.5 bg-green-100 text-green-800 hover:bg-green-100">{counts.completed}</Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="relative text-gray-800">
                Cancelled
                <Badge className="ml-1.5 bg-red-100 text-red-800 hover:bg-red-100">{counts.cancelled}</Badge>
              </TabsTrigger>
            </TabsList>
            <TracingBeam>
              <ScrollArea className="h-[calc(100vh-320px)] pr-4">
                {loading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <InterviewCardSkeleton key={i} />
                    ))}
                  </>
                ) : filteredInterviews.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {filteredInterviews.map((interview) => (
                      <InterviewCard key={interview.interviewId} interview={interview} />
                    ))}
                  </AnimatePresence>
                ) : (
                  <EmptyState />
                )}
                {filteredInterviews.length > 0 && (
                  <div className="text-center text-sm text-gray-500 mt-6 mb-4">
                    <p>
                      Interviews older than 60 days are archived.{" "}
                      <Button
                        variant="link"
                        className="text-[#2E2883] hover:text-[#1E1A5F] text-sm h-auto p-0"
                      >
                        View archives
                      </Button>
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
