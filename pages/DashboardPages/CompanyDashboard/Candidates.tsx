"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  type KeyboardEvent,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CandidatesTable from "./components/candidate-table";
import { FilterPill } from "./components/filter-pill";
import { ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import debounce from "lodash/debounce";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export interface TestAssignment {
  assignmentId: number;
  testId: number;
  candidateId: number;
  candidateEmail: string;
  secureToken: string;
  tokenExpiration: string;
  emailSent: boolean;
  // Extended fields:
  invitationStatus?: "Sent" | "Not Sent";
  assessmentCleared?: boolean;
  interviewScheduled?: boolean;
  roundsCompleted?: number;
  totalRounds?: number;
}

const assessServiceUrl = import.meta.env.VITE_ASSESMENT_SERVICE || "http://localhost:8002";
const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8003";

// Define the available tabs.
export type ActiveTab = "Invitations" | "Assessments" | "Interviews" | "Rounds";

export default function Candidates() {
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [tenantTests, setTenantTests] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<ActiveTab>("Invitations");

  // Get authentication details from auth context
  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;

  // ----------------------------------------------------------------
  // 1. First fetch all tests belonging to the tenant
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchTenantTests = async () => {
      if (!tenantId || !token?.access_token) return;

      setIsLoading(true);
      const controller = new AbortController();
      const signal = controller.signal;
      
      try {
        const res = await fetch(`${testServiceUrl}/api/v1/tests`, {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
          signal,
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch tenant tests. Status: ${res.status}`);
        }
        
        const tests = await res.json();
        const testIds = tests.map((test: any) => test.id);
        setTenantTests(testIds);
        console.log("Fetched tenant tests:", testIds);
      } catch (err: any) {
        console.error("Error fetching tenant tests:", err);
        setError(err.message || "Failed to load tenant tests");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTenantTests();
  }, [tenantId, token]);

  // ----------------------------------------------------------------
  // 2. Then fetch all assignments and filter based on tenant's tests
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!tenantId || tenantTests.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all assignments
        const res = await fetch(`${assessServiceUrl}/assignments`);
        if (!res.ok) {
          throw new Error(`Failed to fetch assignments. Status: ${res.status}`);
        }
        
        const data: TestAssignment[] = await res.json();
        console.log("Fetched assignments data:", data);
        
        // This is the critical step - filter to only include assignments
        // where the testId is in the tenant's tests array
        const filteredAssignments = data.filter(assignment => 
          tenantTests.includes(assignment.testId)
        );
        
        // Add invitation status based on emailSent flag
        const processedAssignments: TestAssignment[] = filteredAssignments.map(assignment => ({
          ...assignment,
          invitationStatus: assignment.emailSent ? "Sent" : "Not Sent"
        } as TestAssignment));
        
        setAssignments(processedAssignments);
        console.log("Filtered assignments for tenant:", processedAssignments);
      } catch (err: any) {
        console.error("Error fetching assignments:", err);
        setError(err.message || "Failed to load assignments");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssignments();
  }, [tenantTests, tenantId]);

  // ----------------------------------------------------------------
  // 3. Debounce the search input.
  // ----------------------------------------------------------------
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
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      setActiveFilters((prev) => {
        const trimmedSearch = searchTerm.trim();
        if (!prev.includes(trimmedSearch)) {
          return [...prev, trimmedSearch];
        }
        return prev;
      });
      setSearchTerm("");
      setDebouncedSearchTerm("");
    }
  };
  const removeFilter = (filterToRemove: string) => {
    setActiveFilters((prev) =>
      prev.filter((filter) => filter !== filterToRemove)
    );
  };

  // ----------------------------------------------------------------
  // 4. Filter assignments: first by active tab, then by search & filters.
  // ----------------------------------------------------------------
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;
    filtered = filtered.filter((assignment) => {
      switch (activeTab) {
        case "Invitations":
          // Show all assignments but with their email status
          return true;
        case "Assessments":
          // Only show assignments where email was sent and assessment is relevant
          return assignment.emailSent && assignment.assessmentCleared !== undefined;
        case "Interviews":
          // Only show assignments where email was sent
          return assignment.emailSent;
        case "Rounds":
          // Only show assignments where email was sent and rounds are defined
          return assignment.emailSent && assignment.totalRounds !== undefined && assignment.totalRounds > 0;
        default:
          return true;
      }
    });

    // Rest of the filtering logic for search and active filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter((assignment) =>
        activeFilters.every((f) =>
          assignment.candidateEmail.toLowerCase().includes(f.toLowerCase())
        )
      );
    }
    if (debouncedSearchTerm) {
      filtered = filtered.filter((assignment) =>
        assignment.candidateEmail
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [assignments, activeFilters, debouncedSearchTerm, activeTab]);
  
  // ----------------------------------------------------------------
  // 5. Pagination Calculations.
  // ----------------------------------------------------------------
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentPageData = filteredAssignments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAssignments.length / pageSize);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // ----------------------------------------------------------------
  // 6. Tabs for Candidate Statuses.
  // ----------------------------------------------------------------
  const tabs: ActiveTab[] = ["Invitations", "Assessments", "Interviews", "Rounds"];

  // ----------------------------------------------------------------
  // 7. Interview status update handler.
  // ----------------------------------------------------------------
  const handleUpdateInterviewStatus = async (
    assignmentId: number,
    newStatus: boolean
  ) => {
    try {
      // Make PUT request to update interviewScheduled
      const res = await fetch(`${assessServiceUrl}/assignments/${assignmentId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token?.access_token}`
        },
        body: JSON.stringify({ interviewScheduled: newStatus }),
      });
      
      if (!res.ok) {
        throw new Error(`Update failed with status: ${res.status}`);
      }
      
      // Update local state on success
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.assignmentId === assignmentId
            ? { ...assignment, interviewScheduled: newStatus }
            : assignment
        )
      );
      
      toast.success("Interview status updated");
    } catch (err: any) {
      console.error("Error updating interview status:", err);
      toast.error(err.message || "Failed to update interview status");
    }
  };

  // ----------------------------------------------------------------
  // 8. Render the UI.
  // ----------------------------------------------------------------
  if (isLoading) {
    return <div className="p-4 text-center">Loading candidate assignments...</div>;
  }
  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error loading assignments: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen rounded-lg p-2 md:p-4">
      {/* Header & Filter Section */}
      <div className="flex flex-col gap-4 bg-white px-2 md:px-6 py-4 border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title Section */}
          <div className="bg-white rounded-lg p-3 md:p-6 border-gray-200">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Invitation Management
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Manage and track test assignments, invitations, assessments,
                  interviews, and rounds.
                </p>
              </div>
            </div>
          </div>

          {/* Search and Add Candidate in responsive layout */}
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="w-full md:flex-grow">
              <Input
                type="search"
                placeholder="Search candidates..."
                className="w-full pl-4 pr-10 py-2 md:py-3 bg-gray-100 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Add Candidate Button */}
            <Link to="/candidate/email-send" className="w-full md:w-auto">
              <Button
                className="w-full md:w-auto text-white font-bold py-2 px-4 md:px-6 rounded-full shadow-lg transition-all duration-150 ease-in-out"
                style={{ background: "linear-gradient(to bottom right, #1e1b4b, #4338ca)" }}
              >
                Add Candidate
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs for Candidate Statuses - Scrollable on mobile */}
        <div className="flex overflow-x-auto pb-2 gap-2 md:gap-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`text-sm font-medium whitespace-nowrap py-2 px-3 md:px-4 ${
                activeTab === tab
                  ? "text-[#4338ca] border-b-2 border-[#1e1b4b] bg-indigo-50 rounded-t-lg"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <FilterPill
                isActive={true}
                key={index}
                label={filter}
                onClick={() => removeFilter(filter)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Display message if no assignments match tenant tests */}
      {assignments.length === 0 && !isLoading && (
        <div className="p-6 text-center text-gray-500">
          <p>No assignments found for the current tenant's tests.</p>
        </div>
      )}

      {/* Render the candidate table and pass the active tab along with the interview update callback */}
      {assignments.length > 0 && (
        <div className="overflow-x-auto">
          <CandidatesTable
            assignments={currentPageData}
            activeTab={activeTab}
            onUpdateCandidate={handleUpdateInterviewStatus}
          />
        </div>
      )}

      {/* Pagination Controls - Mobile Friendly */}
      {filteredAssignments.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 gap-4">
          {/* Results count - show on all screen sizes */}
          <div className="text-sm text-gray-700 text-center md:text-left">
            Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(indexOfLast, filteredAssignments.length)}
            </span>{" "}
            of <span className="font-medium">{filteredAssignments.length}</span> results
          </div>
          
          {/* Page size selector and pagination */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Page Size Selector */}
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()} className="px-4 py-2 hover:bg-gray-100">
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Pagination Controls */}
            <nav className="flex items-center justify-center rounded-lg bg-gray-200 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="hidden md:flex">
                {/* For larger screens, show actual page numbers */}
                {[...Array(totalPages).keys()].map((number) => {
                  const pageNum = number + 1;
                  // Only show a reasonable number of page buttons
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        className={`px-4 py-1 text-sm ${
                          currentPage === pageNum
                            ? "bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white hover:bg-indigo-700"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (
                    (pageNum === currentPage - 2 && currentPage > 3) ||
                    (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    // Show ellipsis for skipped pages
                    return (
                      <Button
                        key={pageNum}
                        variant="ghost"
                        disabled
                        className="px-4 py-1 text-sm text-gray-600"
                      >
                        ...
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>

              {/* For mobile, just show current page / total */}
              <div className="flex md:hidden items-center px-4 text-sm">
                <span className="text-gray-700">
                  {currentPage} / {totalPages}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}