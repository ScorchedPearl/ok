"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterPill } from "../../components/filter-pill";
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Calendar,
  CheckCircle,
  SlidersHorizontal,
  X,
  ArrowUpDown,
} from "lucide-react";
import debounce from "lodash/debounce";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

// Updated candidate interface from the API response
interface Candidate {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  status: string; // e.g. "pending"
  appliedAt: string;
  updatedAt: string;
  matchScore: number;
  experience: number;
  skills: string[];
  summary: string;
  shortlisted?: boolean;
  email: string; // added email field
}

// Job interface (if needed; update as required)
interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  postedDate: string;
  applicantCount: number;
}

export default function CandidatesApplied() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  // Since API response does not include job details, job can be set separately or left null.
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // We'll use the candidate status from API in filtering.
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const [showShortlist, setShowShortlist] = useState<boolean>(false);
  // Instead of sorting by "name", we'll sort by "summary" (the candidate overview)
  const [sortBy, setSortBy] = useState<string>("matchScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Shortlist filter options
  const [minMatchScore, setMinMatchScore] = useState<number>(70);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [shortlistFiltersOpen, setShortlistFiltersOpen] = useState<boolean>(false);

  // Common skills for filter options
  const commonSkills = [
    "JavaScript",
    "React",
    "Java",
    "Python",
    "AWS",
    "Docker",
    "Spring Boot",
    "Node.js",
    "TypeScript",
    "SQL",
  ];

  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

  // ----------------------------------------------------------------
  // 1. Fetch candidates from the backend API
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${interviewServiceUrl}/api/job-applications/job/${jobId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch candidates. Status: ${response.status}`);
        }
        const data = await response.json();
        // The API returns an array of job application objects.
        // Map directly to candidates state. If needed, transform properties.
        setCandidates(data || []);
        // Optionally, set job details separately if provided by another endpoint.
      } catch (err: any) {
        console.error("Error fetching candidates:", err);
        setError(err.message || "Failed to load candidates");
      } finally {
        setIsLoading(false);
      }
    };
    if (jobId) {
      fetchCandidates();
    }
  }, [jobId]);

  // ----------------------------------------------------------------
  // 2. Debounce the search input
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  // 3. Handle shortlisting candidates
  // ----------------------------------------------------------------
  const toggleShortlist = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, shortlisted: !candidate.shortlisted }
          : candidate
      )
    );
    toast.success("Candidate shortlist status updated");
  };

  const handleApplyShortlistFilters = () => {
    const updatedCandidates = candidates.map((candidate) => {
      const meetsScoreRequirement = candidate.matchScore >= minMatchScore;
      const meetsExperienceRequirement = candidate.experience >= minExperience;
      const meetsSkillsRequirement =
        requiredSkills.length === 0 ||
        requiredSkills.every((skill) =>
          candidate.skills.some(
            (s) => s.toLowerCase() === skill.toLowerCase()
          )
        );

      const shouldBeShortlisted =
        meetsScoreRequirement && meetsExperienceRequirement && meetsSkillsRequirement;
      return {
        ...candidate,
        shortlisted: shouldBeShortlisted,
      };
    });
    setCandidates(updatedCandidates);
    setShowShortlist(true);
    setShortlistFiltersOpen(false);
    toast.success("Candidates shortlisted based on criteria");
  };

  const resetShortlist = () => {
    setCandidates((prev) =>
      prev.map((candidate) => ({ ...candidate, shortlisted: false }))
    );
    setShowShortlist(false);
    setMinMatchScore(70);
    setMinExperience(0);
    setRequiredSkills([]);
    toast.success("Shortlist reset");
  };

  const handleToggleRequiredSkill = (skill: string) => {
    setRequiredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // ----------------------------------------------------------------
  // 4. Filter and sort candidates
  // ----------------------------------------------------------------
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates;

    if (showShortlist) {
      filtered = filtered.filter((candidate) => candidate.shortlisted);
    }

    if (activeStatus !== "All") {
      filtered = filtered.filter((candidate) => candidate.status === activeStatus);
    }

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.summary.toLowerCase().includes(searchLower) ||
          candidate.candidateId.toLowerCase().includes(searchLower) ||
          candidate.skills.some((skill) => skill.toLowerCase().includes(searchLower))
      );
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter((candidate) =>
        activeFilters.every((f) => {
          const filterLower = f.toLowerCase();
          return (
            candidate.summary.toLowerCase().includes(filterLower) ||
            candidate.candidateId.toLowerCase().includes(filterLower) ||
            candidate.skills.some((skill) => skill.toLowerCase().includes(filterLower))
          );
        })
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "matchScore":
          comparison = a.matchScore - b.matchScore;
          break;
        case "experience":
          comparison = a.experience - b.experience;
          break;
        case "appliedDate":
          comparison =
            new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
          break;
        case "summary":
          comparison = a.summary.localeCompare(b.summary);
          break;
        default:
          comparison = a.matchScore - b.matchScore;
      }
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [
    candidates,
    debouncedSearchTerm,
    activeFilters,
    activeStatus,
    showShortlist,
    sortBy,
    sortDirection,
  ]);

  // ----------------------------------------------------------------
  // 5. Pagination calculations
  // ----------------------------------------------------------------
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentCandidates = filteredAndSortedCandidates.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAndSortedCandidates.length / pageSize);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // ----------------------------------------------------------------
  // 6. Status tabs (you may want to add "pending" or others if applicable)
  // ----------------------------------------------------------------
  const statusTabs = ["All", "pending"];

  // ----------------------------------------------------------------
  // 7. View details handler
  // ----------------------------------------------------------------
  const handleViewDetails = (candidateId: string) => {
    toast.success(`Viewing details for candidate ${candidateId}`);
    // Navigation to a candidate detail page could be implemented here
  };

  // ----------------------------------------------------------------
  // 8. Toggle sort direction
  // ----------------------------------------------------------------
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  // ----------------------------------------------------------------
  // 9. Render the UI
  // ----------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4338ca] mx-auto"></div>
        <p className="mt-4">Loading candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error loading candidates: {error}</p>
      </div>
    );
  }

  const shortlistedCount = candidates.filter((c) => c.shortlisted).length;

  return (
    <div className="bg-white min-h-screen rounded-lg p-4">
      {/* Header & Filter Section */}
      <div className="flex flex-col gap-4 overflow-x-auto bg-white px-6 py-4 border-gray-200">
        <div className="flex items-center justify-between gap-4">
          {/* Job Info Section */}
          <div className="bg-white rounded-lg p-6 border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {job ? job.title : "Job Applicants"}
                </h1>
                <div className="text-sm text-gray-500 mt-1 flex items-center space-x-3">
                  {job && (
                    <>
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>Posted: {job.postedDate}</span>
                      <span>•</span>
                      <span>{job.applicantCount} applicants</span>
                    </>
                  )}
                  {shortlistedCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-[#4338ca] font-medium">
                        {shortlistedCount} shortlisted
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shortlist Button, Search Input & Send to Test */}
          <div className="flex-grow flex gap-4">
            <div className="w-full relative">
              <Input
                type="search"
                placeholder="Search by candidate ID, summary, or skills..."
                className="w-full pl-4 pr-10 py-3 bg-gray-100 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Shortlist Controls */}
            <div className="flex items-center gap-2">
              <Dialog open={shortlistFiltersOpen} onOpenChange={setShortlistFiltersOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 border-[#4338ca] text-[#4338ca]">
                    <SlidersHorizontal className="h-4 w-4" />
                    Shortlist
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Shortlist Candidates</DialogTitle>
                    <DialogDescription>
                      Set criteria to automatically shortlist top candidates for this position.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="match-score" className="text-sm">
                            Minimum Match Score: {minMatchScore}%
                          </Label>
                        </div>
                        <Slider
                          id="match-score"
                          min={50}
                          max={100}
                          step={5}
                          value={[minMatchScore]}
                          onValueChange={(values) => setMinMatchScore(values[0])}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="experience" className="text-sm">
                            Minimum Experience: {minExperience} {minExperience === 1 ? "year" : "years"}
                          </Label>
                        </div>
                        <Slider
                          id="experience"
                          min={0}
                          max={10}
                          step={1}
                          value={[minExperience]}
                          onValueChange={(values) => setMinExperience(values[0])}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm block mb-2">Required Skills</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {commonSkills.map((skill) => (
                            <div key={skill} className="flex items-center space-x-2">
                              <Checkbox
                                id={`skill-${skill}`}
                                checked={requiredSkills.includes(skill)}
                                onCheckedChange={() => handleToggleRequiredSkill(skill)}
                              />
                              <label htmlFor={`skill-${skill}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {skill}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShortlistFiltersOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleApplyShortlistFilters} className="bg-[#4338ca] hover:bg-[#3730a3]">
                      Apply Filters
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {showShortlist && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-red-500 text-red-500"
                  onClick={resetShortlist}
                >
                  <X className="h-4 w-4" />
                  Reset Shortlist
                </Button>
              )}
              {shortlistedCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const shortlistedEmails = candidates
                      .filter(candidate => candidate.shortlisted)
                      .map(candidate => candidate.email);
                    if (shortlistedEmails.length > 0) {
                      navigate("/add-test/1", { state: { candidateEmails: shortlistedEmails } });
                    } else {
                      toast.error("No email addresses found for shortlisted candidates");
                    }
                  }}
                  className="flex items-center gap-2 border-green-500 text-green-500"
                >
                  Send to Test
                </Button>
              )}
            </div>
          </div>

          {/* Back Button */}
          <Link to="/jobs">
            <Button
              variant="outline"
              className="border-[#4338ca] text-[#4338ca] font-bold py-2 px-6 rounded-full shadow-sm transition-all duration-150 ease-in-out hover:bg-[#4338ca] hover:text-white"
            >
              Back to Jobs
            </Button>
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-4 border-b border-gray-200 pb-2">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => {
                setActiveStatus(status);
                setCurrentPage(1);
              }}
              className={`text-sm font-medium whitespace-nowrap py-2 px-4 ${
                activeStatus === status ? "text-[#4338ca] border-b-2 border-[#1e1b4b]" : "text-[#718EBF] hover:text-gray-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Filter Pills & Sort Controls */}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <FilterPill key={index} isActive={true} label={filter} onClick={() => removeFilter(filter)} />
            ))}
            {showShortlist && (
              <FilterPill isActive={true} label="Shortlisted" onClick={resetShortlist} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setSortDirection("desc");
              }}
            >
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matchScore">Match Score</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="appliedDate">Applied Date</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}>
              <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="mt-4 overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Candidate</span>
                  <button className="ml-1" onClick={() => handleSort("summary")}>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Applied Date</span>
                  <button className="ml-1" onClick={() => handleSort("appliedDate")}>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Match Score</span>
                  <button className="ml-1" onClick={() => handleSort("matchScore")}>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Experience</span>
                  <button className="ml-1" onClick={() => handleSort("experience")}>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shortlist
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCandidates.length > 0 ? (
              currentCandidates.map((candidate) => (
                <tr key={candidate.id} className={`hover:bg-gray-50 ${candidate.shortlisted ? "bg-blue-50" : ""}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] rounded-full flex items-center justify-center text-white">
                        {candidate.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{candidate.candidateName}</div>
                        
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(candidate.appliedAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`px-2 py-1 text-xs font-medium rounded ${
                        candidate.matchScore >= 90
                          ? "bg-green-100 text-green-800"
                          : candidate.matchScore >= 80
                          ? "bg-blue-100 text-blue-800"
                          : candidate.matchScore >= 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {candidate.matchScore}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {candidate.experience} {candidate.experience === 1 ? "year" : "years"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleShortlist(candidate.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        candidate.shortlisted
                          ? "bg-[#4338ca] text-white hover:bg-[#3730a3]"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/job-application-details/${candidate.id}`}>
                      <Button
                        onClick={() => handleViewDetails(candidate.id)}
                        className="text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] hover:bg-indigo-700 px-4 py-2 rounded-md text-sm shadow-sm"
                      >
                        View Details
                      </Button>
                    </Link>
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Button>
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLast, filteredAndSortedCandidates.length)}
              </span>{" "}
              of <span className="font-medium">{filteredAndSortedCandidates.length}</span> results
              {showShortlist && (
                <span className="ml-1 text-[#4338ca]">(shortlisted)</span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-white">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[120px] relative">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent className="absolute z-10 w-full bg-white text-black mt-1 border border-gray-300 rounded-md shadow-lg">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()} className="px-4 py-2 hover:bg-gray-100">
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <nav
              className="flex items-center justify-center rounded-lg bg-gray-200 shadow-sm"
              aria-label="Pagination"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              {totalPages <= 5 ? (
                [...Array(totalPages).keys()].map((number) => (
                  <Button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    variant={currentPage === number + 1 ? "default" : "ghost"}
                    className={`px-5 py-1.5 text-sm ${
                      currentPage === number + 1
                        ? "bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white hover:bg-indigo-700"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {number + 1}
                  </Button>
                ))
              ) : (
                <>
                  {[...Array(Math.min(3, totalPages)).keys()].map((number) => (
                    <Button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      variant={currentPage === number + 1 ? "default" : "ghost"}
                      className={`px-5 py-1.5 text-sm ${
                        currentPage === number + 1
                          ? "bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white hover:bg-indigo-700"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {number + 1}
                    </Button>
                  ))}
                  {totalPages > 3 && currentPage > 3 && <span className="px-2">...</span>}
                  {currentPage > 3 && currentPage < totalPages - 1 && (
                    <Button
                      onClick={() => paginate(currentPage)}
                      variant="default"
                      className="px-5 py-1.5 text-sm bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white hover:bg-indigo-700"
                    >
                      {currentPage}
                    </Button>
                  )}
                  {currentPage < totalPages - 2 && currentPage > 2 && <span className="px-2">...</span>}
                  {currentPage < totalPages - 1 && (
                    <Button
                      onClick={() => paginate(totalPages)}
                      variant="ghost"
                      className="px-5 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                    >
                      {totalPages}
                    </Button>
                  )}
                </>
              )}

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
    </div>
  );
}