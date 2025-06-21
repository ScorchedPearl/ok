import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar,
  Clock,
  Filter,
  Phone,
  Video,
  Info,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
} from "lucide-react";
import { format } from "date-fns";
import { mockScheduledCalls, getCallsByJobId } from "../data/mockCalls";

// Define types for the scheduled calls
interface Question {
  questionId: string;
  questionText: string;
}

interface ScheduledCall {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobTitle: string;
  jobId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  questions: Question[];
  createdBy: string;
  tenantId: string;
  notes?: string;
}

// Helper to map API response to ScheduledCall[]
const mapApiCallsToScheduledCalls = (
  apiCalls: any[],
  jobTitle: string = ""
): ScheduledCall[] => {
  return apiCalls.map((call) => ({
    id: call.callId,
    candidateName: call.candidateFullName || "N/A",
    candidateEmail: call.candidateEmail || "N/A",
    candidatePhone: call.candidatePhone || "",
    jobTitle: jobTitle || "N/A",
    jobId: call.jobId,
    scheduledAt: call.scheduledAt,
    durationMinutes: call.durationMinutes,
    status: call.status,
    questions: (call.questionIds || []).map((qid: string) => ({
      questionId: qid,
      questionText: "", // No question text in API, can be fetched if needed
    })),
    createdBy: call.createdBy,
    tenantId: String(call.tenantId),
    notes: call.remark || "",
  }));
};

export default function ScheduledCallsPage() {
  const [calls, setCalls] = useState<ScheduledCall[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { jobId: urlJobId } = useParams();

  const { user,token } = useAuth();
  const tenantId = user?.tenant?.tenantId;
  const navigate = useNavigate();

  const interviewServiceUrl =
    import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

  // Fetch calls on component mount
  useEffect(() => {
    fetchCalls();
  }, [tenantId, urlJobId]);

  // Function to fetch all scheduled calls
  const fetchCalls = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 700));

      let data: ScheduledCall[] = [];
      if (urlJobId) {
        // Try API first
        try {
          const response = await axios.get(
            `${interviewServiceUrl}/api/calls/job/${urlJobId}`
            ,{
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token?.access_token}`,
            }
          }
          );
          if (response.data && Array.isArray(response.data.content)) {
            // If you have job title, pass it here
            data = mapApiCallsToScheduledCalls(response.data.content);
          } else {
            data = getCallsByJobId(urlJobId);
          }
        } catch (apiErr) {
          // fallback to mock
          data = getCallsByJobId(urlJobId);
        }
      } else {
        data = mockScheduledCalls;
      }

      setCalls(data);
      setFilteredCalls(data);
      applyFilters(data, activeTab, searchQuery);
    } catch (error) {
      console.error("Error fetching scheduled calls:", error);
      toast.error("Failed to fetch scheduled calls");
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh calls data
  const refreshCalls = async () => {
    setRefreshing(true);
    try {
      await fetchCalls();
      toast.success("Scheduled calls refreshed");
    } catch (error) {
      console.error("Error refreshing calls:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Apply filters function
  const applyFilters = (
    callsData: ScheduledCall[],
    tab: string,
    query: string
  ) => {
    let result = [...callsData];

    // Filter by tab (status)
    if (tab !== "all") {
      result = result.filter((call) => {
        switch (tab) {
          case "pending":
            return call.status === "PENDING";
          case "scheduled":
            return call.status === "SCHEDULED";
          case "completed":
            return call.status === "COMPLETED";
          case "cancelled":
            return call.status === "CANCELLED";
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      result = result.filter(
        (call) =>
          call.candidateName.toLowerCase().includes(lowercaseQuery) ||
          call.candidateEmail.toLowerCase().includes(lowercaseQuery) ||
          call.jobTitle.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Sort by date (newest first)
    result = result.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

    setFilteredCalls(result);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(calls, activeTab, query);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    applyFilters(calls, value, searchQuery);
  };

  // Get counts for each status category
  const counts = {
    all: calls.length,
    pending: calls.filter((call) => call.status === "PENDING").length,
    scheduled: calls.filter((call) => call.status === "SCHEDULED").length,
    completed: calls.filter((call) => call.status === "COMPLETED").length,
    cancelled: calls.filter((call) => call.status === "CANCELLED").length,
  };

  // Handle navigation to call details
  const navigateToCallDetails = (callId: string) => {
    navigate(`/job/calls/details/${callId}`);
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Phone className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No scheduled calls found
      </h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {searchQuery
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Schedule your first call to start interviewing candidates."}
      </p>
      <Button
        onClick={() => navigate("/job/schedule-call")}
        className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white"
      >
        Schedule a Call
      </Button>
    </div>
  );

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
    </div>
  );

  return (
    <div
      className="w-screen min-h-screen h-full bg-white p-0 m-0"
      style={{ maxWidth: "100vw", overflowX: "hidden" }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-8 pt-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Calls</h1>
          <p className="text-gray-500">
            {urlJobId
              ? "View all scheduled calls for this job"
              : "View and manage all scheduled calls"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={refreshCalls}
            variant="outline"
            size="sm"
            className="border-gray-300"
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            onClick={() => navigate(`/schedule-call/${urlJobId}`)}
            className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white"
          >
            Schedule a Call
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-sm mx-8">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email or job"
                className="pl-10 bg-white border-gray-300"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                All
                <Badge className="ml-2 bg-gray-200 text-gray-700">
                  {counts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                Pending
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                  {counts.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                Scheduled
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {counts.scheduled}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                Completed
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {counts.completed}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                Cancelled
                <Badge className="ml-2 bg-red-100 text-red-800">
                  {counts.cancelled}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <LoadingState />
              ) : filteredCalls.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">
                          Scheduled By
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-medium text-[#1e1b4b] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-right py-4 px-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCalls.map((call) => (
                        <tr
                          key={call.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-gray-900">
                                {call.candidateName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {call.candidateEmail}
                              </p>
                              <p className="text-xs text-gray-400">
                                {call.candidatePhone}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-gray-900">{call.createdBy}</p>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <div className="flex items-center text-gray-700">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {format(
                                  new Date(call.scheduledAt),
                                  "MMM d, yyyy"
                                )}
                              </div>
                              <div className="flex items-center text-gray-700 mt-1">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                {format(new Date(call.scheduledAt), "h:mm a")}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-gray-700">
                              {call.durationMinutes} minutes
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {call.status === "PENDING" && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                Pending
                              </Badge>
                            )}
                            {call.status === "SCHEDULED" && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                Scheduled
                              </Badge>
                            )}
                            {call.status === "COMPLETED" && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Completed
                              </Badge>
                            )}
                            {call.status === "CANCELLED" && (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                Cancelled
                              </Badge>
                            )}
                          </td>
						  <td className="py-4 px-6 text-right">
							{call.status === "COMPLETED" ? (
							  <Button
								onClick={() => navigateToCallDetails(call.id)}
								variant="ghost"
								size="sm"
								className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
							  >
								<Info className="h-4 w-4 mr-1" />
								Details
							  </Button>
							) : (
							  <Button
								disabled
								variant="ghost"
								size="sm"
								className="text-gray-400 cursor-not-allowed"
							  >
								<Info className="h-4 w-4 mr-1" />
								Unavailable
							  </Button>
							)}
						  </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
