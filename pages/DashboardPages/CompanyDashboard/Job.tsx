import React, { useState, useMemo, useEffect, KeyboardEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JobsTable from "./components/job-table";
import { FilterPill } from "./components/filter-pill";
import { ChevronLeft, ChevronRight, Briefcase, Search, Filter, Download, Phone } from "lucide-react";
import debounce from "lodash/debounce";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { printJobDescription } from "@/utils/pdfGenerator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import EditJobModal from "./components/edit-job-modal"; // Import the EditJobModal component
import { toast } from "react-toastify";

// Updated Job interface based on your JobDTO
interface Job {
  id: string; // UUID from backend
  title: string;
  department: string;
  company: string;
  companyName: string; // Added for compatibility with both field names
  location: string;
  employmentType: string;
  description: string;
  recruiterId: string;
  testId: number;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  disable: boolean;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  
  // Added filter states - use "all" instead of empty string
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>("all");

  // Add state for the edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  const {token, user} = useAuth();
  const tenantId = user?.tenant?.tenantId;
  const navigate = useNavigate();

  // Debounce search input to limit re-renders
  const updateDebouncedSearch = useCallback(
    debounce((search: string) => {
      setDebouncedSearchTerm(search);
    }, 300),
    []
  );

  const toggleJobStatus = (job: Job, e: React.MouseEvent) => {
  e.stopPropagation();
  
  const actionText = job.disable ? 'enable' : 'disable';
  
  // Confirm with the user
  if (window.confirm(`Are you sure you want to ${actionText} this job?`)) {
    
    fetch(`${interviewServiceUrl}/api/jobs/${job.id}/toggle-status`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to ${actionText} job`);
      }
      return response.json();
    })
    .then(() => {
      // Show success message
      toast.success(`Job successfully ${actionText}d!`);
      // Refresh the jobs list
      fetchJobs();
    })
    .catch(error => {
      console.error(`Error ${actionText}ing job:`, error);
      toast.error(`Error ${actionText}ing job. Please try again.`);
    });
  }
};

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
    setActiveFilters((prev) => prev.filter((filter) => filter !== filterToRemove));
  };

 const clearAllFilters = () => {
  setActiveFilters([]);
  setDepartmentFilter("all");
  setLocationFilter("all");
  setEmploymentTypeFilter("all");
  setStatusFilter("all"); // Add this line
};

  let interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

  const fetchJobs = useCallback(() => {
    if (!tenantId) {
      console.error("No tenant ID available");
      return;
    }

    // Use the tenant-specific endpoint
    fetch(`${interviewServiceUrl}/api/jobs/tenant/${tenantId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: Job[]) => setJobs(data))
      .catch((error) => console.error("Error fetching jobs:", error));
  }, [tenantId, token, interviewServiceUrl]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle opening the edit modal
  const openEditModal = (job: Job) => {
    setJobToEdit(job);
    setIsEditModalOpen(true);
  };

  const jobMatchesSearch = (job: Job, search: string): boolean => {
    search = search.toLowerCase();
    return Object.keys(job).some((key) => {
      const value = job[key as keyof Job];
      if (typeof value === "string") {
        return value.toLowerCase().includes(search);
      }
      return false;
    });
  };

  const jobMatchesFilter = (job: Job, filter: string): boolean => {
    filter = filter.toLowerCase();
    return Object.keys(job).some((key) => {
      const value = job[key as keyof Job];
      if (typeof value === "string") {
        return value.toLowerCase().includes(filter);
      }
      return false;
    });
  };

  // Get unique values for filter options
  const departments = useMemo(() => 
    Array.from(new Set(jobs.map(job => job.department))).filter(Boolean),
    [jobs]
  );
  
  const locations = useMemo(() => 
    Array.from(new Set(jobs.map(job => job.location))).filter(Boolean),
    [jobs]
  );
  
  const employmentTypes = useMemo(() => 
    Array.from(new Set(jobs.map(job => job.employmentType))).filter(Boolean),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
  let filtered = activeFilters.length === 0
    ? jobs
    : jobs.filter((job) => activeFilters.every((filter) => jobMatchesFilter(job, filter)));

  if (debouncedSearchTerm) {
    filtered = filtered.filter((job) => jobMatchesSearch(job, debouncedSearchTerm));
  }
  
  // Apply dropdown filters
  if (departmentFilter && departmentFilter !== "all") {
    filtered = filtered.filter(job => job.department === departmentFilter);
  }
  
  if (locationFilter && locationFilter !== "all") {
    filtered = filtered.filter(job => job.location === locationFilter);
  }
  
  if (employmentTypeFilter && employmentTypeFilter !== "all") {
    filtered = filtered.filter(job => job.employmentType === employmentTypeFilter);
  }
  
  // Add this new filter
  if (statusFilter && statusFilter !== "all") {
    filtered = filtered.filter(job => {
      if (statusFilter === "active") return !job.disable;
      if (statusFilter === "disabled") return job.disable;
      return true;
    });
  }

  return filtered;
}, [jobs, activeFilters, debouncedSearchTerm, departmentFilter, locationFilter, employmentTypeFilter, statusFilter]);


  const indexOfLastJob = currentPage * pageSize;
  const indexOfFirstJob = indexOfLastJob - pageSize;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredJobs.length / pageSize);

  // Function to handle downloading job description
  const handleDownloadPDF = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    printJobDescription(job);
  };

  // Custom action cell with dropdown including Edit and Download options
  const actionCell = (job: Job) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white"
          size="sm"
        >
          Actions <MoreHorizontal className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => openEditModal(job)}
          className="cursor-pointer"
        >
          Edit Job
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => window.location.href = `/job/interviews/scheduling/${job.id}`}
          className="cursor-pointer"
        >
          Schedule Interview
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => window.location.href = `/jobs/candidates-applied/${job.id}`}
          className="cursor-pointer"
        >
          View Job Applications
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/job/calls/job/${job.id}`} className="cursor-pointer">
            <Phone className="mr-2 h-4 w-4" />
            <span>View Scheduled Calls</span>
          </Link>
        </DropdownMenuItem>
		<DropdownMenuItem
		  onClick={() => navigate(`/schedule-call/${job.id}`, { state: { job } })}
		  className="cursor-pointer">
		  <Phone className="mr-2 h-4 w-4" />
		  <span>Schedule Call</span>
		</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => handleDownloadPDF(job, e)}
          className="cursor-pointer"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Job Description
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="bg-white min-h-screen rounded-lg p-4">
      <div className="flex flex-col gap-4 overflow-x-auto bg-white px-6 py-4 border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="bg-white rounded-lg p-6 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Jobs Management
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage and track all job postings across departments
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Type to search and press Enter to add filter..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <Link to="/create-job">
            <Button
              className="text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-150 ease-in-out"
              style={{
                background: "linear-gradient(to bottom right, #1e1b4b, #4338ca)",
              }}
            >
              Add Job
            </Button>
          </Link>
        </div>

        {/* Filter section above table - updated SelectItem values */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Employment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {employmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Add this dropdown menu to the filter section */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Job Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Jobs</SelectItem>
                <SelectItem value="disabled">Disabled Jobs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(departmentFilter !== "all" || locationFilter !== "all" || employmentTypeFilter !== "all" || activeFilters.length > 0) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFilters}
              className="ml-auto"
            >
              Clear All
            </Button>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <FilterPill
                key={index}
                label={filter}
                isActive={true}
                onClick={() => removeFilter(filter)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Pass the updated action cell render function to JobsTable */}
      <JobsTable jobs={currentJobs} actionCell={actionCell} />

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
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
              Showing <span className="font-medium">{indexOfFirstJob + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastJob, filteredJobs.length)}
              </span>{" "}
              of <span className="font-medium">{filteredJobs.length}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-white">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[120px] relative">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent className="absolute z-10 w-full bg-white text-black mt-1 border border-gray-300 rounded-md shadow-lg">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem
                    key={size}
                    value={size.toString()}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
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

              {[...Array(totalPages).keys()].map((number) => (
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

      {/* Add the Edit Job Modal with direct API handling */}
      {jobToEdit && (
        <EditJobModal 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setJobToEdit(null);
          }}
          job={jobToEdit}
          onSuccess={fetchJobs} // Just refresh the jobs list after successful update
        />
      )}
    </div>
  );
}