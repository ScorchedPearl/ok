import React, { useState, useMemo, type KeyboardEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobsTable from "../CompanyDashboard/components/job-table";
import { FilterPill } from "../CompanyDashboard/components/filter-pill";
import { ChevronLeft, ChevronRight , Briefcase, Search} from "lucide-react";
import debounce from 'lodash/debounce';

const sampleJobs = [
  {
    id: 1,
    title: "Software Engineer",
    department: "Engineering",
    startDate: "2025-01-01",
    endDate: "Open",
    recruiter: "Dr. Alice Smith",
    status: "Active",
    jobUrl: "https://example.com/job1.pdf",
    requirements: ["5 years experience", "React knowledge"],
  },
];

export default function JobApplicationsPage() {
  const [jobs] = useState(sampleJobs);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    setActiveFilters((prev) => prev.filter((filter) => filter !== filterToRemove));
  };

  interface Job {
    id: number;
    title: string;
    department: string;
    startDate: string;
    endDate: string;
    recruiter: string;
    status: string;
    jobUrl: string;
    requirements: string[];
  }

  const jobMatchesSearch = (job: Job, search: string): boolean => {
    search = search.toLowerCase();
    return Object.keys(job).some((key) => {
      const value = job[key as keyof Job];
      if (typeof value === "string") {
        return value.toLowerCase().includes(search);
      } else if (Array.isArray(value)) {
        return value.some((item) => item.toLowerCase().includes(search));
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
      } else if (Array.isArray(value)) {
        return value.some((item) => item.toLowerCase().includes(filter));
      }
      return false;
    });
  };

  const filteredJobs = useMemo(() => {
    let filtered = activeFilters.length === 0
      ? jobs
      : jobs.filter((job) => activeFilters.every((filter) => jobMatchesFilter(job, filter)));
    
    if (debouncedSearchTerm) {
      filtered = filtered.filter((job) => jobMatchesSearch(job, debouncedSearchTerm));
    }
    
    return filtered;
  }, [jobs, activeFilters, debouncedSearchTerm]);

  const indexOfLastJob = currentPage * pageSize;
  const indexOfFirstJob = indexOfLastJob - pageSize;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredJobs.length / pageSize);

  return (
    <div className="bg-white rounded-lg  p-4">
      <div className="flex flex-col gap-4 overflow-x-auto bg-white  px-6 py-4 border-gray-200">
        <div className="flex items-center justify-between gap-4">
          
        <div className="bg-white rounded-lg  p-6 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Jobs Management</h1>
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
          <Button
            onClick={() => {
              /* handle add job */
            }}
            className="text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-150 ease-in-out"
            style={{ background: "linear-gradient(to bottom right, #1e1b4b, #4338ca)" }}>
            Add Job
          </Button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <FilterPill key={index} label={filter} isActive={true} onClick={() => removeFilter(filter)} />
            ))}
          </div>
        )}
      </div>
      <JobsTable jobs={currentJobs} />

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
              <span className="font-medium">{Math.min(indexOfLastJob, filteredJobs.length)}</span> of{" "}
              <span className="font-medium">{filteredJobs.length}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-white">
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
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
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-sm font-medium text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              {[...Array(totalPages).keys()].map((number) => (
                <Button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === number + 1
                      ? "z-10 bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  {number + 1}
                </Button>
              ))}
              <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-sm font-medium text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
