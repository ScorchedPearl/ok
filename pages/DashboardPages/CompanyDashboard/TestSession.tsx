"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ClipboardList, ChevronLeft, ChevronRight, Search, Briefcase } from "lucide-react";
import debounce from "lodash/debounce";
import axios from "axios";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";


const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8003";

// Interface for test session data
interface TestSession {
  id: number;
  sessionToken: string;
  status: string;
  candidateId: string;
  testId: number;
  startTime: string;
  endTime: string | null;
}

// Interface for test session with test details and job info
interface TestSessionWithDetails extends TestSession {
  testName: string;
  testType: string;
  category: string;
  tenantId: string;
  totalQuestionsAnswered: number;
  totalQuestions: number;
  completionPercentage: number | null;
  jobId: string;
  jobTitle: string;
}

// Interface for job data
interface Job {
  id: string;
  title: string;
}

export default function TestSessions() {
  // States for data management
  const [detailedSessions, setDetailedSessions] = useState<TestSessionWithDetails[]>([]);
  const [jobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isMobileView, setIsMobileView] = useState(false);

  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;

  // Check for mobile view on mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Fetch detailed sessions and jobs for the current tenant
  useEffect(() => {
    const fetchSessions = async () => {
      if (!tenantId || !token?.access_token) return;
      
      setIsLoading(true);
      setError(null);  
      try {
        const response = await axios.get(
          `${testServiceUrl}/api/v1/test/sessions/tenant/${tenantId}/detailed`,
          {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            }
          }
        );
        setDetailedSessions(response.data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch sessions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [tenantId, token]);

  // Debounced search
  const updateDebouncedSearch = useCallback(
    debounce((search: string) => {
      setDebouncedSearchTerm(search);
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchTerm(value);
    updateDebouncedSearch(value);
  };

  // Handle job selection change
  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);  
    setCurrentPage(1); // Reset to first page when changing job filter
  };

  // Handle view results click
  const handleViewResults = (session: TestSessionWithDetails, event: React.MouseEvent) => {
    if (session.status.toUpperCase() === "IN_PROGRESS") {
      event.preventDefault();
      toast.error("Test is still in progress. Please wait for the candidate to complete the assessment before viewing results.", {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }
    // If status is not IN_PROGRESS, the link will work normally
  };

  // Search and filter logic for detailed sessions
  const detailedSessionMatchesSearch = (session: TestSessionWithDetails, search: string): boolean => {
    search = search.toLowerCase();
    
    // Safe checks for each field
    const tokenMatch = session.sessionToken?.toLowerCase().includes(search) || false;
    const statusMatch = session.status?.toLowerCase().includes(search) || false;
    const candidateMatch = session.candidateId?.toLowerCase().includes(search) || false;
    const testIdMatch = session.testId?.toString().includes(search) || false;
    const testNameMatch = session.testName ? session.testName.toLowerCase().includes(search) : false;
    const testTypeMatch = session.testType ? session.testType.toLowerCase().includes(search) : false;
    const categoryMatch = session.category ? session.category.toLowerCase().includes(search) : false;
    const jobTitleMatch = session.jobTitle ? session.jobTitle.toLowerCase().includes(search) : false;
    
    return tokenMatch || statusMatch || candidateMatch || testIdMatch || 
           testNameMatch || testTypeMatch || categoryMatch || jobTitleMatch;
  };

  // Apply search and job filter
  const filteredSessions = useMemo(() => {
    let filtered = detailedSessions;

    // Apply job filter first
    if (selectedJobId !== "all") {
      filtered = filtered.filter((session) => session.jobId === selectedJobId);
    }

    // Then apply search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter((session) => 
        detailedSessionMatchesSearch(session, debouncedSearchTerm)
      );
    }
    
    return filtered;
  }, [detailedSessions, debouncedSearchTerm, selectedJobId]);

  // Pagination calculations
  const indexOfLastSession = currentPage * pageSize;
  const indexOfFirstSession = indexOfLastSession - pageSize;
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession);
  const totalPages = Math.ceil(filteredSessions.length / pageSize);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Loading state
  if (isLoading) {
    return <div className="p-4 text-center">Loading sessions...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error loading sessions: {error}</p>
      </div>
    );
  }

  // Format date string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "ENDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format percentage
  const formatPercentage = (value: number | null) => {
    if (value === null) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-white min-h-screen rounded-lg p-4">
      {/* Header with added Job Selector */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
         <div className="bg-white rounded-lg p-3 md:p-6 border-gray-200">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                        <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                          Test Session
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                          Manage and track sessions of completed assessments.
                        </p>
                      </div>
                    </div>
                  </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          {/* Job Selector */}
          <div className="w-full md:w-64 flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
            <Select value={selectedJobId} onValueChange={handleJobChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search sessions..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={handleSearchChange}
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {/* Empty state when no sessions are found */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">
            {selectedJobId !== "all" 
              ? "No test sessions found for the selected job." 
              : "No test sessions found for your tenant."}
          </p>
        </div>
      )}

      {/* Table View for Desktop */}
      {!isMobileView && filteredSessions.length > 0 && (
        <div className="mt-4 overflow-x-auto hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {session.testName || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.testType} - {session.category}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{session.candidateId}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{session.jobTitle}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(session.startTime)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {session.totalQuestionsAnswered} / {session.totalQuestions}
                      <span className="ml-2 text-xs text-gray-500">
                        ({formatPercentage(session.completionPercentage)})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a href={`/dashboard/sessions/${session.sessionToken}`} onClick={(e) => handleViewResults(session, e)}>
                      <Button
                        size="sm"
                        className={`${session.status.toUpperCase() === "IN_PROGRESS" 
                          ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" 
                          : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
                      >
                        View Results
                      </Button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View for Mobile */}
      {(isMobileView) && filteredSessions.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
          {currentSessions.map((session) => (
            <Card key={`card-${session.id}`} className="overflow-hidden">
              <CardContent key={`content-${session.id}`} className="p-0">
                <div key={`header-${session.id}`} className="p-4 border-b">
                  <div key={`title-row-${session.id}`} className="flex justify-between items-center">
                    <h3 key={`title-${session.id}`} className="font-semibold text-lg">{session.testName || "Unknown Test"}</h3>
                    <span key={`status-${session.id}`} className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  <p key={`subtitle-${session.id}`} className="text-sm text-gray-500 mt-1">{session.testType} - {session.category}</p>
                  <p key={`job-title-${session.id}`} className="text-sm font-medium text-indigo-600 mt-1">{session.jobTitle}</p>
                </div>
                
                <div key={`grid-${session.id}`} className="p-4 grid grid-cols-2 gap-2 text-sm">
                  <div key={`${session.id}-candidate`}>
                    <p key={`${session.id}-candidate-label`} className="text-gray-500">Candidate</p>
                    <p key={`${session.id}-candidate-value`} className="font-medium">{session.candidateId}</p>
                  </div>
                  <div key={`${session.id}-started`}>
                    <p key={`${session.id}-started-label`} className="text-gray-500">Started</p>
                    <p key={`${session.id}-started-value`} className="font-medium">{formatDate(session.startTime)}</p>
                  </div>
                  <div key={`${session.id}-progress`}>
                    <p key={`${session.id}-progress-label`} className="text-gray-500">Progress</p>
                    <p key={`${session.id}-progress-value`} className="font-medium">
                      {session.totalQuestionsAnswered} / {session.totalQuestions} questions
                    </p>
                  </div>
                  <div key={`${session.id}-completion`}>
                    <p key={`${session.id}-completion-label`} className="text-gray-500">Completion</p>
                    <p key={`${session.id}-completion-value`} className="font-medium">
                      {formatPercentage(session.completionPercentage)}
                    </p>
                  </div>
                </div>
                
                <div key={`footer-${session.id}`} className="p-4 bg-gray-50 border-t">
                  <a key={`link-${session.id}`} href={`/dashboard/sessions/${session.sessionToken}`} onClick={(e) => handleViewResults(session, e)}>
                    <Button
                      key={`button-${session.id}`}
                      className={`w-full ${session.status.toUpperCase() === "IN_PROGRESS" 
                        ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
                    >
                      View Results
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {filteredSessions.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstSession + 1} to {Math.min(indexOfLastSession, filteredSessions.length)} of {filteredSessions.length} results
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[90px] h-8">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex rounded-md shadow-sm">
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {totalPages > 5 ? (
                <>
                  <Button
                    variant={currentPage === 1 ? "default" : "outline"}
                    className={`h-8 rounded-none ${currentPage === 1 ? "bg-indigo-600" : ""}`}
                    onClick={() => paginate(1)}
                    size="sm"
                    key="page-1"
                  >
                    1
                  </Button>
                  
                  {currentPage > 3 && (
                    <Button variant="outline" className="h-8 rounded-none" disabled key="ellipsis-1">
                      ...
                    </Button>
                  )}
                  
                  {currentPage !== 1 && currentPage !== totalPages && (
                    <Button
                      variant="default"
                      className="h-8 rounded-none bg-indigo-600"
                      size="sm"
                      key={`page-${currentPage}`}
                    >
                      {currentPage}
                    </Button>
                  )}
                  
                  {currentPage < totalPages - 2 && (
                    <Button variant="outline" className="h-8 rounded-none" disabled key="ellipsis-2">
                      ...
                    </Button>
                  )}
                  
                  {totalPages > 1 && (
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      className={`h-8 rounded-none ${currentPage === totalPages ? "bg-indigo-600" : ""}`}
                      onClick={() => paginate(totalPages)}
                      size="sm"
                      key={`page-${totalPages}`}
                    >
                      {totalPages}
                    </Button>
                  )}
                </>
              ) : (
                [...Array(totalPages)].map((_, index) => (
                  <Button
                    key={`page-${index + 1}`}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    onClick={() => paginate(index + 1)}
                    className={`h-8 rounded-none ${currentPage === index + 1 ? "bg-indigo-600" : ""}`}
                    size="sm"
                  >
                    {index + 1}
                  </Button>
                ))
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}