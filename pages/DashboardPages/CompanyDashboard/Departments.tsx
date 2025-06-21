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
import DepartmentsTable from "./components/department-table";
import { FilterPill } from "./components/filter-pill";
import { ChevronLeft, ChevronRight, Building2, Search, Plus } from "lucide-react";
import debounce from "lodash/debounce";
import { useAuth } from "@/context/AuthContext";
import CreateDepartmentModal from "./components/create-department-modal";
import EditDepartmentModal from "./components/edit-department-modal";
import DeleteDepartmentModal from "./components/delete-department-modal";


export default function Departments() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const {token, user} = useAuth();
  console.log("USer: ", user)
  const tenantId = user?.tenant?.tenantId;

  // Debounce search input to limit re-renders
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

  let authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL||  "http://localhost:8005"; 
  let interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";


  
  const fetchDepartments = useCallback(async () => {
    if (!tenantId) {
      console.error("No tenant ID available");
      return;
    }

    console.log(tenantId)

    try {
      const response = await fetch(`${authServiceUrl}/tenant/${tenantId}/departments`, {
        headers: {
          "Authorization": `Bearer ${token?.access_token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data && data.departments && Array.isArray(data.departments)) {
        setDepartments(data.departments);
      } else {
        console.error("Unexpected data format:", data);
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
     
    }
  }, [tenantId, token, authServiceUrl]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Open edit modal
  const handleEditDepartment = (departmentName: string) => {
    setSelectedDepartment(departmentName);
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const handleDeleteDepartment = (departmentName: string) => {
    setSelectedDepartment(departmentName);
    setIsDeleteModalOpen(true);
  };

  const departmentMatchesSearch = (departmentName: string, search: string): boolean => {
    return departmentName.toLowerCase().includes(search.toLowerCase());
  };

  const departmentMatchesFilter = (departmentName: string, filter: string): boolean => {
    return departmentName.toLowerCase().includes(filter.toLowerCase());
  };

  const filteredDepartments = useMemo(() => {
    let filtered =
      activeFilters.length === 0
        ? departments
        : departments.filter((department) =>
            activeFilters.every((filter) => departmentMatchesFilter(department, filter))
          );

    if (debouncedSearchTerm) {
      filtered = filtered.filter((department) => departmentMatchesSearch(department, debouncedSearchTerm));
    }

    return filtered;
  }, [departments, activeFilters, debouncedSearchTerm]);

  const indexOfLastDepartment = currentPage * pageSize;
  const indexOfFirstDepartment = indexOfLastDepartment - pageSize;
  const currentDepartments = filteredDepartments.slice(indexOfFirstDepartment, indexOfLastDepartment);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredDepartments.length / pageSize);

  // State to store job counts for each department
  const [departmentJobCounts, setDepartmentJobCounts] = useState<Record<string, number>>({});

  // Function to fetch job counts for departments
  const fetchDepartmentJobCounts = useCallback(async (deptNames: string[]) => {
    if (!tenantId || deptNames.length === 0) return;

    try {
      const counts: Record<string, number> = {};
      
      // Create an array of promises for all department job count fetches
      const fetchPromises = deptNames.map(async (deptName) => {
        const response = await fetch(
          `${interviewServiceUrl}/api/jobs/by-tenant-department/${tenantId}/${encodeURIComponent(deptName)}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch jobs for department ${deptName}`);
          counts[deptName] = 0;
          return;
        }

        const jobs = await response.json();
        counts[deptName] = Array.isArray(jobs) ? jobs.length : 0;
      });

      // Wait for all fetches to complete
      await Promise.all(fetchPromises);
      setDepartmentJobCounts(counts);
      console.log("Department job counts:", counts);
    } catch (error) {
      console.error("Error fetching department job counts:", error);
    }
  }, [tenantId, token, interviewServiceUrl]);

  useEffect(() => {
    if (departments.length > 0) {
      fetchDepartmentJobCounts(departments);
    }
  }, [departments, fetchDepartmentJobCounts]);

  // Convert string array to the format expected by DepartmentsTable
  const departmentsForTable = currentDepartments.map((name, index) => ({
    id: `dept-${index}`,
    name: name,
    tenantId: tenantId || 0,
    jobCount: departmentJobCounts[name] || 0,
  }));

  return (
    <div className="bg-white min-h-screen rounded-lg p-4">
      <div className="flex flex-col gap-4 overflow-x-auto bg-white px-6 py-4 border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="bg-white rounded-lg p-6 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Departments Management
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage and track all departments in your organization
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

        {/* Create Department Button */}
        <div className="flex justify-start px-2 pb-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-150 ease-in-out flex items-center gap-2"
            style={{
              background: "linear-gradient(to bottom right, #1e1b4b, #4338ca)",
            }}
          >
            <Plus className="h-5 w-5" />
            Create Department
          </Button>
        </div>
      </div>
      
      <DepartmentsTable 
        departments={departmentsForTable} 
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
      />

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
              Showing <span className="font-medium">{indexOfFirstDepartment + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastDepartment, filteredDepartments.length)}
              </span>{" "}
              of <span className="font-medium">{filteredDepartments.length}</span> results
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

      {/* Modals */}
      <CreateDepartmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchDepartments}
      />

      <EditDepartmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchDepartments}
        departmentName={selectedDepartment}
        allDepartments={departments}
      />

      <DeleteDepartmentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={fetchDepartments}
        departmentName={selectedDepartment}
      />
    </div>
  );
}