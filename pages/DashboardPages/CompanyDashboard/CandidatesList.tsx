"use client";

import React, { useState, useEffect, useMemo, useCallback, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterPill } from "./components/filter-pill";
import { ChevronLeft, ChevronRight, Users, AlertCircle } from "lucide-react";
import debounce from "lodash/debounce";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
// import CandidateDashboard from "./CandidateDashboard";

// Define candidate interface to match API response
export interface Candidate {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  resumeContent?: string;
  resumeSummary?: string;
  firstName?: string;
  lastName?: string;
  status: "Active" | "Inactive" | "On Hold";
  applicationCount: number;
  testCount: number;
  interviewCount: number;
  createdAt: string;
}

// Define the available filters
export type CandidateFilter = "All" | "Active" | "Inactive" | "On Hold";

const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";


export default function CandidateList() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeFilter, setActiveFilter] = useState<CandidateFilter>("All");
  // Track if we're showing mock data
  const [usingMockData, setUsingMockData] = useState(false);

  // Get authentication details from auth context
  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;

  // ----------------------------------------------------------------
  // 1. Fetch candidates with fallback to mock data if API fails
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!tenantId || !token?.access_token) return;

      setIsLoading(true);
      setError(null);
      const controller = new AbortController();
      const signal = controller.signal;
      
      try {
        // Update: Fetch from the correct API endpoint with tenantId
        const res = await fetch(`${interviewServiceUrl}/api/tenant-candidates/tenants/${tenantId}/candidates`, {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
          signal,
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch candidates. Status: ${res.status}`);
        }
        
        // If successful, use the API data
        const apiCandidates = await res.json();

        console.log("API response:", apiCandidates);
        
        // Map API response to our Candidate interface with additional hardcoded fields
        const mappedCandidates = apiCandidates.map((candidate: any) => {
          // Split fullName into firstName and lastName (best effort)
          const nameParts = candidate.fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Generate a random date within the last 90 days for createdAt
          const daysAgo = Math.floor(Math.random() * 90);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);
          
          // Generate random status
          const statuses: ("Active" | "Inactive" | "On Hold")[] = ["Active", "Inactive", "On Hold"];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          
          return {
            id: candidate.id,
            fullName: candidate.fullName,
            firstName: firstName,
            lastName: lastName,
            email: candidate.email,
            phoneNumber: candidate.phoneNumber,
            resumeContent: candidate.resumeContent,
            resumeSummary: candidate.resumeSummary,
            
            status: randomStatus,
            applicationCount: Math.floor(Math.random() * 5),
            testCount: Math.floor(Math.random() * 3),
            interviewCount: Math.floor(Math.random() * 2),
            createdAt: createdAt.toISOString(),
          };
        });
        
        setCandidates(mappedCandidates);
        console.log("Successfully fetched candidates from API:", mappedCandidates);
        
      } catch (err: any) {
        // If API call fails, set the error state
        // We'll still display the UI with mock data, but show error indicators
        setError(err.message || "Failed to connect to API");
        
        // Generate mock data for demonstration
        const mockCandidates: Candidate[] = generateMockCandidates();
        setCandidates(mockCandidates);
        
        // Using mock data
        setUsingMockData(true);
        
        console.log("Using mock data:", mockCandidates.length);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Function to generate realistic mock candidate data
    const generateMockCandidates = (): Candidate[] => {
      const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah", "Thomas", "Karen", "Charles", "Nancy"];
      const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
      const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com", "protonmail.com", "mail.com"];
      const statuses: ("Active" | "Inactive" | "On Hold")[] = ["Active", "Inactive", "On Hold"];

      return Array.from({ length: 35 }, (_, i) => {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Create a random date within the last 90 days
        const daysAgo = Math.floor(Math.random() * 90);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        
        return {
          id: i + 1,
          fullName: `${firstName} ${lastName}`,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
          phoneNumber: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          status,
          applicationCount: Math.floor(Math.random() * 5),
          testCount: Math.floor(Math.random() * 3),
          interviewCount: Math.floor(Math.random() * 2),
          createdAt: createdAt.toISOString(),
        };
      });
    };
    
    fetchCandidates();
  }, [tenantId, token]);

  // ----------------------------------------------------------------
  // 2. Debounce search input
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
  // 3. Filter candidates based on status and search terms
  // ----------------------------------------------------------------
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;
    
    // First filter by status
    if (activeFilter !== "All") {
      filtered = filtered.filter(candidate => candidate.status === activeFilter);
    }

    // Then filter by search terms from active filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter((candidate) =>
        activeFilters.every((f) => {
          const searchLower = f.toLowerCase();
          return (
            candidate.fullName.toLowerCase().includes(searchLower) ||
            candidate.email.toLowerCase().includes(searchLower) ||
            candidate.phoneNumber.includes(f)
          );
        })
      );
    }

    // Then filter by the current search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.fullName.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower) ||
          candidate.phoneNumber.includes(debouncedSearchTerm)
      );
    }

    return filtered;
  }, [candidates, activeFilter, activeFilters, debouncedSearchTerm]);

  // ----------------------------------------------------------------
  // 4. Pagination calculations
  // ----------------------------------------------------------------
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentPageData = filteredCandidates.slice(indexOfFirst, indexOfLast);
  console.log("Current page data:", currentPageData);
  const totalPages = Math.ceil(filteredCandidates.length / pageSize);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // ----------------------------------------------------------------
  // 5. Handle candidate selection
  // ----------------------------------------------------------------
  const handleCandidateClick = (candidateId: number) => {
    navigate(`/dashboard/candidate/${candidateId}`);
  };
  
  // Status filter options
  const filterOptions: CandidateFilter[] = ["All", "Active", "Inactive", "On Hold"];
  
  // ----------------------------------------------------------------
  // 6. Track if we're using mock data
  // ----------------------------------------------------------------
  useEffect(() => {
    // If we have candidates but also have an error, we must be using mock data
    if (candidates.length > 0 && error) {
      setUsingMockData(true);
    } else {
      setUsingMockData(false);
    }
  }, [candidates, error]);

  // ----------------------------------------------------------------
  // 6. Render UI
  // ----------------------------------------------------------------
  if (isLoading) {
    return <div className="p-4 text-center">Loading candidates...</div>;
  }

  // Only show a full error page if we have an error AND no candidates data
  // (meaning we couldn't even fall back to mock data)
  if (error && candidates.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-2xl mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading candidate data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen rounded-lg p-2 md:p-4">
      {/* Mock Data Banner */}
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
      
      {/* Header & Filter Section */}
      <div className="flex flex-col gap-4 bg-white px-2 md:px-6 py-4 border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title Section */}
          <div className="bg-white rounded-lg p-3 md:p-6 border-gray-200">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Candidate Management
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  View and manage all candidates in your organization
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
            
          </div>
        </div>

        {/* Status Filter Tabs - Scrollable on mobile */}
        <div className="flex overflow-x-auto pb-2 gap-2 md:gap-4 border-b border-gray-200">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setCurrentPage(1);
              }}
              className={`text-sm font-medium whitespace-nowrap py-2 px-3 md:px-4 ${
                activeFilter === filter
                  ? "text-[#4338ca] border-b-2 border-[#1e1b4b] bg-indigo-50 rounded-t-lg"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg"
              }`}
            >
              {filter}
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

      {/* Candidates Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Phone
              </th>
            
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date Added
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageData.length > 0 ? (
              currentPageData.map((candidate) => (
                <tr 
                  key={candidate.id}
                  onClick={() => handleCandidateClick(candidate.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-800 font-medium">
                          {/* Display initials from fullName */}
                          {candidate.fullName.split(' ')[0]?.[0] || ''}
                          {candidate.fullName.split(' ')[1]?.[0] || ''}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate.phoneNumber}</div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        candidate.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : candidate.status === "Inactive"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {candidate.status}
                    </span>
                  </td> */}
                
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No candidates found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Mobile Friendly */}
      <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 gap-4">
        {/* Results count - show on all screen sizes */}
        <div className="text-sm text-gray-700 text-center md:text-left">
          Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(indexOfLast, filteredCandidates.length)}
          </span>{" "}
          of <span className="font-medium">{filteredCandidates.length}</span> results
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
    </div>
  );
}