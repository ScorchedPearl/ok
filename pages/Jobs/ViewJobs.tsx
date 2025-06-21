"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import debounce from "lodash/debounce";
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Calendar, 
  Filter, 
  X,
  ArrowUpDown,
  Bookmark,
  AlertCircle,
  Building,
} from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useAuth } from "@/context/AuthContext";

// Service URL
const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

// Job interface to match the exact API response
interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  recruiterId: string;
  testId?: number;
  createdAt: string;
  updatedAt: string;
  companyName?: string; 
  isSaved?: boolean; 
  isViewed?: boolean;
  disable?: boolean;
}

// Filter option interface
interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
  hidden?: boolean;
}

const JobsListingPage = () => {
  // Component references
  const jobsEndRef = useRef<HTMLDivElement>(null);
  
  // Toast notification
  
  
  // States
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [viewedJobs, setViewedJobs] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const {user,token}=useAuth();
  // Filter states
  const [departmentFilters, setDepartmentFilters] = useState<FilterOption[]>([]);
  const [locationFilters, setLocationFilters] = useState<FilterOption[]>([]);
  const [employmentTypeFilters, setEmploymentTypeFilters] = useState<FilterOption[]>([
    { id: "full-time", label: "full-time", checked: false },
    { id: "part-time", label: "part-time", checked: false },
    { id: "contract", label: "contract", checked: false },
    { id: "internship", label: "internship", checked: false },
  ]);
  const [showSaved, setShowSaved] = useState(false);



  // Load saved and viewed jobs from localStorage
  useEffect(() => {
    const savedJobsFromStorage = localStorage.getItem('savedJobs');
    const viewedJobsFromStorage = localStorage.getItem('viewedJobs');
    
    if (savedJobsFromStorage) {
      setSavedJobs(JSON.parse(savedJobsFromStorage));
    }
    
    if (viewedJobsFromStorage) {
      setViewedJobs(JSON.parse(viewedJobsFromStorage));
    }
  }, []);

  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      setError(null);
      
      try {
        // In a real implementation, you'd add pagination params
        // For now, we're simulating pagination with the full dataset
         console.log(token);
        const response = await axios.get(`${interviewServiceUrl}/api/jobs`,{
          headers: {
            Authorization: `Bearer ${token?.access_token}`
          }
        });
        
        if (response.status === 200) {
          const jobsData = response.data;
          
          // Add company name to each job based on department (for demo purposes)
          // In a real app, this would come from the API
          const enhancedJobs = jobsData
            .filter((job: Job) => !job.disable) // Filter out disabled jobs
            .map((job: Job) => ({
              ...job,
              isSaved: savedJobs.includes(job.id),
              isViewed: viewedJobs.includes(job.id)
            }));
          
          if (page === 1) {
            setJobs(enhancedJobs);
          } else {
            // In a real app, we'd append new items
            // Here we're simulating pagination for demo purposes
            setJobs(prev => [...prev]);
          }
          
          // Simulate end of pagination
          setHasMore(false);
          
          // Extract unique values for filters
          if (page === 1) {
            const uniqueDepartments = [...new Set(jobsData.map((job: Job) => job.department))];
            const departmentOptions = uniqueDepartments.map(dept => ({
              id: (dept as string).toLowerCase().replace(/\s+/g, '-'),
              label: dept as string,
              checked: false
            }));
            
            const uniqueLocations = [...new Set(jobsData.map((job: Job) => job.location))];
            const locationOptions = uniqueLocations.map(loc => ({
              id: (loc as string).toLowerCase().replace(/\s+/g, '-'),
              label: loc as string,
              checked: false
            }));
            
            const uniqueEmploymentTypes = [...new Set(jobsData.map((job: Job) => 
              job.employmentType.toLowerCase()
            ))];
            
            const employmentOptions = employmentTypeFilters.map(option => {
              const exists = uniqueEmploymentTypes.includes(option.id);
              return {
                ...option,
                checked: false,
                hidden: !exists
              };
            });
            
            setDepartmentFilters(departmentOptions);
            setLocationFilters(locationOptions);
            setEmploymentTypeFilters(employmentOptions);
          }
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };
    
    fetchJobs();
  }, [page, savedJobs, viewedJobs]);

  // Debounce search input
  const updateDebouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchQuery(value);
    updateDebouncedSearch(value);
  };


  // Filter toggle helpers
  const handleDepartmentFilterChange = (id: string, checked: boolean) => {
    setDepartmentFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, checked } : filter
      )
    );
  };

  const handleLocationFilterChange = (id: string, checked: boolean) => {
    setLocationFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, checked } : filter
      )
    );
  };

  const handleEmploymentTypeFilterChange = (id: string, checked: boolean) => {
    setEmploymentTypeFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, checked } : filter
      )
    );
  };

  // Reset all filters
  const resetAllFilters = () => {
    setDepartmentFilters(prev => prev.map(filter => ({ ...filter, checked: false })));
    setLocationFilters(prev => prev.map(filter => ({ ...filter, checked: false })));
    setEmploymentTypeFilters(prev => prev.map(filter => ({ ...filter, checked: false })));
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSortBy("newest");
    setShowSaved(false);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return (
      departmentFilters.filter(f => f.checked).length +
      locationFilters.filter(f => f.checked).length +
      employmentTypeFilters.filter(f => f.checked).length +
      (showSaved ? 1 : 0)
    );
  }, [departmentFilters, locationFilters, employmentTypeFilters, showSaved]);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];
    
    // Apply saved filter
    if (showSaved) {
      filtered = filtered.filter(job => job.isSaved);
    }
    
    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        (job.companyName && job.companyName.toLowerCase().includes(query))
      );
    }
    
    // Apply department filters
    const activeDepartments = departmentFilters.filter(f => f.checked).map(f => f.label);
    if (activeDepartments.length > 0) {
      filtered = filtered.filter(job => activeDepartments.includes(job.department));
    }
    
    // Apply location filters
    const activeLocations = locationFilters.filter(f => f.checked).map(f => f.label);
    if (activeLocations.length > 0) {
      filtered = filtered.filter(job => activeLocations.includes(job.location));
    }
    
    // Apply employment type filters
    const activeEmploymentTypes = employmentTypeFilters.filter(f => f.checked).map(f => f.label);
    if (activeEmploymentTypes.length > 0) {
      filtered = filtered.filter(job => 
        activeEmploymentTypes.includes(job.employmentType.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "title-asc":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return filtered.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return filtered;
    }
  }, [
    jobs, 
    debouncedSearchQuery, 
    departmentFilters, 
    locationFilters, 
    employmentTypeFilters, 
    sortBy,
    showSaved
  ]);

  // Load more jobs (for infinite scrolling)
  const loadMoreJobs = () => {
    if (!isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Intersection observer for infinite scrolling
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreJobs();
        }
      },
      { threshold: 0.5 }
    );
    
    if (jobsEndRef.current) {
      observer.observe(jobsEndRef.current);
    }
    
    return () => {
      if (jobsEndRef.current) {
        observer.unobserve(jobsEndRef.current);
      }
    };
  }, [hasMore, isLoadingMore, jobsEndRef]);


  // Job list item component (list view)
  const JobListItem = ({ job }: { job: Job }) => (
    <div className={`border rounded-lg ${job.isViewed ? 'border-gray-200' : 'border-indigo-200'} mb-4 overflow-hidden transition-all duration-300 hover:shadow-md`}>
      <div 
        className="p-4 cursor-pointer"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Building className="w-5 h-5" />
              </div>
              
              <div>
                {/* Company Name Above Job Title */}
                <div className="text-lg text-black mb-0.5 flex items-center">
                  <span className="font-bold">{job.title}</span>
                </div>
                
                <div className="flex items-center">
                  <h3 className="text-md font-semibold text-gray-800">{job.companyName}</h3>
                  
                  {job.isSaved && (
                    <Bookmark className="ml-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span>{job.department}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span>{job.location}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span>{job.employmentType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 md:mt-0 flex items-center gap-2">
            <Link to={`/jobs/${job.id}`}>
              <Button 
                size="sm" 
                className="w-full sm:w-auto bg-[#2E2883] hover:bg-[#1e1b4b]"
              >
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // No jobs found component
  const NoJobsFound = () => (
    <div className="bg-gray-50 p-12 rounded-lg text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Briefcase className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
      <p className="text-gray-600 mb-6">
        {showSaved 
          ? "You haven't saved any jobs yet. Browse available positions and bookmark the ones you're interested in."
          : "Try adjusting your search filters or try a different search term."
        }
      </p>
      <Button onClick={resetAllFilters} className="bg-[#2E2883] hover:bg-[#1e1b4b]">
        {showSaved ? "Show All Jobs" : "Reset Filters"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white">
      <BackgroundBeams />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 relative z-10"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore Jobs</h1>
              <p className="text-gray-600 mt-1">
                Find your perfect role from {jobs.length} open positions
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/candidate/home">
                <Button variant="outline" className="px-4 py-2 h-10">
                  Dashboard
                </Button>
              </Link>
              
              
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="Search jobs, skills, or keywords"
                  className="pl-10 h-12 bg-gray-50 border-gray-200"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="flex gap-3">
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-12 px-4 flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <Badge className="ml-1 bg-[#2E2883]">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="text-xl">Filter Jobs</SheetTitle>
                    </SheetHeader>
                    
                    <div className="py-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="saved-jobs-filter" 
                            checked={showSaved}
                            onCheckedChange={(checked) => setShowSaved(checked === true)}
                          />
                          <label htmlFor="saved-jobs-filter" className="text-sm font-medium cursor-pointer flex items-center">
                            <Bookmark className="h-4 w-4 mr-1.5 text-yellow-500" />
                            Saved Jobs Only
                          </label>
                        </div>
                        
                        {savedJobs.length > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {savedJobs.length}
                          </Badge>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <Accordion type="single" collapsible defaultValue="department" className="w-full">
                        <AccordionItem value="department">
                          <AccordionTrigger className="text-base font-semibold">Department</AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <div className="space-y-3">
                              {departmentFilters.map((filter) => (
                                <div key={filter.id} className="flex items-center gap-2">
                                  <Checkbox 
                                    id={`dept-${filter.id}`} 
                                    checked={filter.checked}
                                    onCheckedChange={(checked) => 
                                      handleDepartmentFilterChange(filter.id, checked === true)
                                    }
                                  />
                                  <label htmlFor={`dept-${filter.id}`} className="text-sm font-medium cursor-pointer">
                                    {filter.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="location">
                          <AccordionTrigger className="text-base font-semibold">Location</AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <div className="space-y-3">
                              {locationFilters.map((filter) => (
                                <div key={filter.id} className="flex items-center gap-2">
                                  <Checkbox 
                                    id={`loc-${filter.id}`} 
                                    checked={filter.checked}
                                    onCheckedChange={(checked) => 
                                      handleLocationFilterChange(filter.id, checked === true)
                                    }
                                  />
                                  <label htmlFor={`loc-${filter.id}`} className="text-sm font-medium cursor-pointer">
                                    {filter.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="employmentType">
                          <AccordionTrigger className="text-base font-semibold">Employment Type</AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <div className="space-y-3">
                              {employmentTypeFilters.filter(f => !f.hidden).map((filter) => (
                                <div key={filter.id} className="flex items-center gap-2">
                                  <Checkbox 
                                    id={`type-${filter.id}`} 
                                    checked={filter.checked}
                                    onCheckedChange={(checked) => 
                                      handleEmploymentTypeFilterChange(filter.id, checked === true)
                                    }
                                  />
                                  <label htmlFor={`type-${filter.id}`} className="text-sm font-medium cursor-pointer">
                                    {filter.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                    
                    <div className="pt-4 space-y-4">
                      <Separator />
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={resetAllFilters}
                          className="text-gray-700"
                        >
                          Reset All
                        </Button>
                        <Button 
                          onClick={() => setFiltersOpen(false)}
                          className="bg-[#2E2883] hover:bg-[#1e1b4b]"
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12 w-[160px]">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        <SelectValue placeholder="Sort by" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Active filters display */}
            {activeFilterCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {showSaved && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 pl-2 pr-1 py-1.5">
                    <Bookmark className="mr-1 h-3 w-3" />
                    <span className="mr-1">Saved Jobs</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1 hover:bg-yellow-200 rounded-full p-0"
                      onClick={() => setShowSaved(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {departmentFilters.filter(f => f.checked).map(filter => (
                  <Badge key={`badge-dept-${filter.id}`} variant="secondary" className="bg-gray-100 text-gray-800 pl-2 pr-1 py-1.5">
                    <span className="mr-1">{filter.label}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1 hover:bg-gray-200 rounded-full p-0"
                      onClick={() => handleDepartmentFilterChange(filter.id, false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {locationFilters.filter(f => f.checked).map(filter => (
                  <Badge key={`badge-loc-${filter.id}`} variant="secondary" className="bg-gray-100 text-gray-800 pl-2 pr-1 py-1.5">
                    <span className="mr-1">{filter.label}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1 hover:bg-gray-200 rounded-full p-0"
                      onClick={() => handleLocationFilterChange(filter.id, false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {employmentTypeFilters.filter(f => f.checked).map(filter => (
                  <Badge key={`badge-type-${filter.id}`} variant="secondary" className="bg-gray-100 text-gray-800 pl-2 pr-1 py-1.5">
                    <span className="mr-1">{filter.label}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1 hover:bg-gray-200 rounded-full p-0"
                      onClick={() => handleEmploymentTypeFilterChange(filter.id, false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {activeFilterCount > 1 && (
                  <Button 
                    variant="link" 
                    className="text-[#2E2883] font-medium text-sm h-auto p-0 ml-2"
                    onClick={resetAllFilters}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-gray-700">
              {isLoading 
                ? "Loading jobs..." 
                : filteredAndSortedJobs.length === 0 
                  ? "No jobs found" 
                  : `Showing ${filteredAndSortedJobs.length} ${filteredAndSortedJobs.length === 1 ? 'job' : 'jobs'}`
              }
            </p>
          </div>
          
          {/* Jobs List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E2883]"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
              <AlertCircle className="h-10 w-10 mx-auto mb-4" />
              <p className="mb-3">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : filteredAndSortedJobs.length === 0 ? (
            <NoJobsFound />
          ) : (
            <>
              <div className="space-y-4">
                {filteredAndSortedJobs.map((job) => (
                  <JobListItem key={job.id} job={job} />
                ))}
              </div>
              
              {/* Loading indicator for infinite scrolling */}
              {isLoadingMore && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E2883]"></div>
                </div>
              )}
              
              {/* Intersection observer target */}
              <div ref={jobsEndRef} className="h-4" />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JobsListingPage;