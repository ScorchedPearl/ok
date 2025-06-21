"use client";

import { useState, useEffect, useCallback, type KeyboardEvent } from "react";
import { Briefcase } from "lucide-react"; // ChevronLeft, ChevronRight removed
import debounce from "lodash/debounce";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
// Select components removed as page size selector is gone
import { Button } from "@/components/ui/button";
import AssessmentsTable, { Assessment } from "./components/assessments-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

// Use your test service URL
const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8003";

// Extend the Assessment interface to include an optional "archived" property.
export interface ExtendedAssessment extends Assessment {
  archived?: boolean;
}

// PagedResponse interface removed as pagination is removed.
// If your API returns all items in a structure like { content: [...] },
// you might need a simpler interface or adjust parsing.
// This version assumes the API returns ExtendedAssessment[] directly.

// Define the auth context interface
interface AuthContextType {
  token: {
    access_token: string;
    expires_in: number;
    token_type: string;
  } | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenant?: {
      tenantId: string;
      name: string;
    };
  } | null;
}

export default function Assessments() {
  // States for data, filtering
  const [assessments, setAssessments] = useState<ExtendedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"Active" | "Archived">("Active");
  // Pagination states removed: currentPage, pageSize, totalItems, totalPages

  const { token, user } = useAuth() as AuthContextType;
  const tenantId = user?.tenant?.tenantId;
  
  // State for multi-selection
  const [selectedTests, setSelectedTests] = useState<number[]>([]);

  // States for the confirmation dialog
  const [showActionDialog, setShowActionDialog] = useState<boolean>(false);
  const [actionConfirmInput, setActionConfirmInput] = useState<string>("");
  const [actionType, setActionType] = useState<"delete" | "archive" | "unarchive" | null>(null);

  // Fetch assessments from the backend (all matching items, no pagination)
  const fetchAssessments = useCallback(async () => {
    if (!token?.access_token || !tenantId) {
      setAssessments([]);
      setIsLoading(false); // Ensure loading is false if prerequisites missing
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let queryParams = new URLSearchParams();
      
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }
      
      if (activeTab) {
        queryParams.append('status', activeTab);
      }
      
      activeFilters.forEach(filter => {
        queryParams.append('search', filter); // Backend needs to handle multiple 'search' params
      });
      
      // const queryString = queryParams.toString();
      const url = `${testServiceUrl}/api/v1/tests/tenant/${tenantId}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching assessments: ${response.status} ${response.statusText}`);
      }
      
      // Assuming API returns an array of ExtendedAssessment directly when not paginated
      const data: ExtendedAssessment[] = await response.json();
      
      setAssessments(Array.isArray(data) ? data : []); // Ensure assessments is always an array
      
      // Reset selected tests when data reloads
      setSelectedTests([]);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setAssessments([]); // Ensure assessments is an array on error
    } finally {
      setIsLoading(false);
    }
  }, [token, tenantId, searchTerm, activeFilters, activeTab]); // Dependencies updated

  // Fetch assessments on mount and when dependencies change
  useEffect(() => {
    if (tenantId && token?.access_token) {
        fetchAssessments();
    } else {
        setAssessments([]); // Clear if no tenantId or token
        if(!isLoading) setIsLoading(false);
    }
  }, [fetchAssessments, tenantId, token]);

  // Debounced search update
  const updateSearchTerm = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      // No longer need to reset currentPage
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    updateSearchTerm(value);
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
      // No longer need to reset currentPage
    }
  };

  interface FilterPillProps {
    label: string;
    onClick: () => void;
  }

  const FilterPill = ({ label, onClick }: FilterPillProps) => (
    <div className="inline-flex items-center bg-indigo-100 px-3 py-1 rounded-full text-sm text-indigo-700 mr-2">
      {label}
      <button onClick={onClick} className="ml-2 font-bold">
        &times;
      </button>
    </div>
  );

  const removeFilter = (filterToRemove: string) => {
    setActiveFilters((prev) => prev.filter((filter) => filter !== filterToRemove));
    // No longer need to reset currentPage
  };

  // paginate function removed

  // Toggle selection of an individual test
  const toggleTestSelection = (id: number) => {
    setSelectedTests((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  // Toggle "select all" for the currently loaded assessments
  const toggleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const allAssessmentIds = assessments.map((assessment) => assessment.id);
      setSelectedTests(Array.from(new Set([...selectedTests, ...allAssessmentIds])));
    } else {
      const allAssessmentIds = assessments.map((assessment) => assessment.id);
      setSelectedTests(selectedTests.filter((id) => !allAssessmentIds.includes(id)));
    }
  };

  // Determine the statuses of the selected tests.
  const selectedAssessmentsData = assessments.filter((assessment) => // Renamed for clarity
    selectedTests.includes(assessment.id)
  );
  const selectedActiveCount = selectedAssessmentsData.filter(
    (assessment) => assessment.testStatus === "Active"
  ).length;
  const selectedArchivedCount = selectedAssessmentsData.filter(
    (assessment) => assessment.testStatus === "Archived"
  ).length;

  const openActionDialog = (action: "delete" | "archive" | "unarchive") => {
    if (selectedTests.length === 0) return;

    if (action === "archive" && selectedArchivedCount > 0) {
        toast.error("Cannot archive already archived tests. Please deselect archived tests.");
        return;
    }
    if (action === "unarchive" && selectedActiveCount > 0) {
        toast.error("Cannot unarchive active tests. Please deselect active tests.");
        return;
    }

    setActionType(action);
    setShowActionDialog(true);
    setActionConfirmInput("");
  };

  // Action functions (performDeletion, performArchive, performUnarchive) remain largely the same
  // but ensure fetchAssessments() is called to refresh the complete list.

  const performDeletion = async () => {
    if (!user?.id || !token?.access_token) {
      toast.error("User or token not found. Cannot delete.");
      return;
    }
    try {
      await Promise.all(
        selectedTests.map((id) =>
          fetch(`${testServiceUrl}/api/v1/tests/${id}`, {
            method: "DELETE",
            headers: { 
              "X-User-Id": user.id,
              Authorization: `Bearer ${token.access_token}`
            },
          })
        )
      );
      fetchAssessments(); // Refresh the full list
      setSelectedTests([]);
      toast.success("Selected tests deleted successfully");
    } catch (err) {
      console.error("Error deleting tests:", err);
      toast.error("Error deleting tests");
    } finally {
      setShowActionDialog(false);
      setActionConfirmInput("");
    }
  };

  const performArchive = async () => {
    if (!user?.id || !token?.access_token) {
      toast.error("User or token not found. Cannot archive.");
      return;
    }
    try {
      await Promise.all(
        selectedTests.map((id) =>
          fetch(`${testServiceUrl}/api/v1/tests/${id}`, {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json", 
              "X-User-Id": user.id,
              Authorization: `Bearer ${token.access_token}`
            },
            body: JSON.stringify({ testStatus: "Archived" }),
          })
        )
      );
      fetchAssessments(); // Refresh the full list
      setSelectedTests([]);
      toast.success("Selected tests archived successfully");
    } catch (err) {
      console.error("Error archiving tests:", err);
      toast.error("Error archiving tests");
    } finally {
      setShowActionDialog(false);
      setActionConfirmInput("");
    }
  };

  const performUnarchive = async () => {
    if (!user?.id || !token?.access_token) {
      toast.error("User or token not found. Cannot unarchive.");
      return;
    }
    try {
      await Promise.all(
        selectedTests.map((id) =>
          fetch(`${testServiceUrl}/api/v1/tests/${id}`, {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json", 
              "X-User-Id": user.id,
              Authorization: `Bearer ${token.access_token}`
            },
            body: JSON.stringify({ testStatus: "Active" }),
          })
        )
      );
      fetchAssessments(); // Refresh the full list
      setSelectedTests([]);
      toast.success("Selected tests unarchived successfully");
    } catch (err) {
      console.error("Error unarchiving tests:", err);
      toast.error("Error unarchiving tests");
    } finally {
      setShowActionDialog(false);
      setActionConfirmInput("");
    }
  };

  const handleActionConfirm = () => {
    if (actionType === "delete") {
      performDeletion();
    } else if (actionType === "archive") {
      performArchive();
    } else if (actionType === "unarchive") {
      performUnarchive();
    }
  };

  const getRequiredConfirmText = () => {
    if (actionType === "delete") return "Delete Test";
    if (actionType === "archive") return "Archive Test";
    if (actionType === "unarchive") return "Unarchive Test";
    return "";
  };

  const handleTabChange = (tab: "Active" | "Archived") => {
    setActiveTab(tab);
    setSelectedTests([]); // Clear selection when changing tabs
    // fetchAssessments will be called by useEffect due to activeTab change
  };

  if (isLoading && assessments.length === 0) {
    return <div className="p-4 text-center">Loading assessments...</div>;
  }

  if (error && assessments.length === 0) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error loading assessments: {error}</p>
        <Button onClick={() => fetchAssessments()} className="mt-2">Try Again</Button>
      </div>
    );
  }
  
  // Message for no assessments found after loading
  if (!isLoading && !error && assessments.length === 0) {
    return (
      <div className="bg-white min-h-screen rounded-lg p-4">
        {/* Header Section (simplified, no pagination dependent elements) */}
        <div className="flex flex-col gap-4 overflow-x-auto bg-white px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Tests Management</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage and track all tests across departments
                  </p>
                </div>
              </div>
            </div>
             <div className="flex-grow">
              <Input
                type="search"
                placeholder="Type to search and press Enter to add filter..."
                className="w-full pl-4 pr-10 py-3 bg-gray-100 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Link to="/add-test/1">
              <Button
                className="text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-150 ease-in-out"
                style={{ background: "linear-gradient(to bottom right, #1e1b4b, #4338ca)" }}
              >
                Add Test
              </Button>
            </Link>
          </div>
           {/* Tab Selection */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "Active"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("Active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "Archived"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("Archived")}
            >
              Archived
            </button>
          </div>
           {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <FilterPill key={index} label={filter} onClick={() => removeFilter(filter)} />
              ))}
            </div>
          )}
        </div>
        <div className="p-4 text-center">
            No assessments found for the current filters.
            {activeTab === "Active" && activeFilters.length === 0 && searchTerm === "" && (
                 <Link to="/add-test/1" className="ml-2">
                    <Button variant="link">Add your first test</Button>
                 </Link>
            )}
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white min-h-screen rounded-lg p-4">
      {/* Action Confirmation Dialog */}
      {showActionDialog && (
        <Dialog
          open={showActionDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowActionDialog(false);
              setActionConfirmInput("");
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Confirm{" "}
                {actionType === "delete"
                  ? "Deletion"
                  : actionType === "archive"
                  ? "Archiving"
                  : "Unarchiving"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Please type <span className="font-bold">{getRequiredConfirmText()}</span> to confirm{" "}
                {actionType === "delete"
                  ? "deletion"
                  : actionType === "archive"
                  ? "archiving"
                  : "unarchiving"}{" "}
                of the selected tests.
              </p>
              <Input
                value={actionConfirmInput}
                onChange={(e) => setActionConfirmInput(e.target.value)}
                placeholder={`Type '${getRequiredConfirmText()}'`}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowActionDialog(false);
                    setActionConfirmInput("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={actionConfirmInput !== getRequiredConfirmText()}
                  onClick={handleActionConfirm}
                >
                  Confirm{" "}
                  {actionType === "delete"
                    ? "Deletion"
                    : actionType === "archive"
                    ? "Archiving"
                    : "Unarchiving"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-4 overflow-x-auto bg-white px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Assessment Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and track all tests across departments
                </p>
              </div>
            </div>
          </div>

          <div className="flex-grow">
            <Input
              type="search"
              placeholder="Type to search and press Enter to add filter..."
              className="w-full pl-4 pr-10 py-3 bg-gray-100 border border-gray-300 rounded-lg"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="flex flex-col gap-2">
            {selectedTests.length === 0 ? (
              <Link to="/add-test/1">
                <Button
                  className="text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-150 ease-in-out"
                  style={{ background: "linear-gradient(to bottom right, #1e1b4b, #4338ca)" }}
                >
                  Add Test
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="destructive"
                  onClick={() => openActionDialog("delete")}
                  className="rounded-full"
                >
                  Delete Selected ({selectedTests.length})
                </Button>
                {selectedTests.length > 0 && selectedActiveCount === selectedTests.length && (
                  <Button
                    variant="secondary"
                    onClick={() => openActionDialog("archive")}
                    className="rounded-full"
                  >
                    Archive Selected ({selectedActiveCount})
                  </Button>
                )}
                {selectedTests.length > 0 && selectedArchivedCount === selectedTests.length && (
                  <Button
                    variant="secondary"
                    onClick={() => openActionDialog("unarchive")}
                    className="rounded-full"
                  >
                    Unarchive Selected ({selectedArchivedCount})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "Active"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange("Active")}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "Archived"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange("Archived")}
          >
            Archived
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4"> {/* Added mb-4 for spacing */}
            {activeFilters.map((filter, index) => (
              <FilterPill key={index} label={filter} onClick={() => removeFilter(filter)} />
            ))}
          </div>
        )}
      </div>

      <AssessmentsTable
        assessments={assessments}
        selectedTests={selectedTests}
        onToggleSelect={toggleTestSelection}
        onToggleSelectAll={toggleSelectAll}
      />

      {/* Pagination controls removed */}
      {/* The div below was the pagination container, now removed. */}
      {/* <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4"> ... </div> */}
      
      {/* Display total assessments count if assessments are present */}
      {assessments.length > 0 && (
        <div className="text-sm text-gray-700 px-4 py-3 sm:px-6 mt-4 border-t border-gray-200">
          Total assessments found: <span className="font-medium">{assessments.length}</span>
        </div>
      )}
    </div>
  );
}