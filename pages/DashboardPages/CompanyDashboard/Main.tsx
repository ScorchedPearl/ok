import { useState, useEffect } from "react";
import AnalyticsCard from "./components/analytics-card";
// import AssessmentsTable from "./components/assessments-table"; // Assuming you will uncomment this
import { Button } from "@/components/ui/button";
import AnalyticsMan from "../CompanyDashboard/Analytics/Main";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import AssessmentsTable from "./components/assessments-table";

// Base URLs for the services
const testServiceUrl =
  import.meta.env.VITE_TEST_SERVICE || "http://localhost:8000";
const assignmentServiceUrl =
  import.meta.env.VITE_ASSESMENT_SERVICE || "http://localhost:8000";
const interviewServiceUrl =
  import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

// Assessment interface (fetched from test service)
// Export this interface to be used by other components like AssessmentsTable
export interface Assessment {
  id: number;
  testName: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string; // Assuming tenantId from API is a string
  testType: string;
  timeLimit: number;
  testStatus: "Active" | "Archived"; // Make type more specific
  stream: string;
  questionLibraryIds: string[];
  jobIDs: string[];
}

// TestAssignment interface (fetched from assignment service)
interface TestAssignment {
  assignmentId: number;
  testId: number;
  candidateId: number;
  secureToken: string;
  candidateEmail: string;
  tokenExpiration: string;
  emailSent: boolean;
}

// TestSession interface (fetched from test service)
interface TestSession {
  id: number;
  testId: string;
  candidateId: string;
  sessionToken: string;
  status: string;
  currentLibraryIndex: number;
  questionIndexInLibrary: number;
  answeredQuestions: number[];
  remainingQuestionIds: number[];
  startTime: string;
  endTime: string | null;
  lastActivityTime: string | null;
}

const DashboardPage = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [completedInterviews, setCompletedInterviews] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm] = useState("");
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"archive" | "unarchive" | null>(
    null
  );
  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId; // This might be string or number depending on your useAuth

  

  // console.log("Tenant ID from user:", tenantId);
  // console.log("Token from useAuth:", token);  
  // console.log("User from useAuth:", user);

  // Fetch assessments from the test service
  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ensure tenantId and token are available
        if (!tenantId || !token?.access_token) {
          // setError("Tenant ID or authentication token is missing.");
          console.log("Tenant ID or token missing for fetching assessments, waiting...");
          setIsLoading(false); // Stop loading if prerequisites not met
          return;
        }
        const response = await fetch(
          `${testServiceUrl}/api/v1/tests/tenant/${tenantId}`, // tenantId will be stringified here
          {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
          }
        );
        if (!response.ok)
          throw new Error(`Failed to fetch. Status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched assessments for home page from backend:", data);
        setAssessments(data);
      } catch (err: any) {
        console.error("Error fetching assessments:", err);
        setError(err.message || "Error loading assessments");
        setAssessments([]); // Clear assessments on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessments();
  }, [tenantId, token]); // Add tenantId and token to dependency array

  // Fetch test assignments from the assignment service
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // Ensure tenantId and token are available
        if (!tenantId || !token?.access_token) {
          console.log("Tenant ID or token missing for fetching assignments, waiting...");
          return;
        }
        const response = await fetch(
          `${assignmentServiceUrl}/assignments/tenant/${tenantId}`,
          {
            // headers: {
            //   Authorization: `Bearer ${token.access_token}`,
            // },
          }
        );
        if (!response.ok)
          throw new Error(
            `Failed to fetch assignments. Status: ${response.status}`
          );
        const data = await response.json();
        console.log("Fetched assignments from backend:", data);
        setAssignments(data);
      } catch (err: any) {
        console.error("Error fetching assignments:", err);
        setAssignments([]); // Clear assignments on error
      }
    };
    fetchAssignments();
  }, [tenantId, token]); // Add tenantId and token to dependency array

  useEffect(() => {
  const fetchTestSessions = async () => {
    try {
      // Ensure tenantId and token are available
      if (!tenantId || !token?.access_token) {
        console.log("Tenant ID or token missing for fetching test sessions, waiting...");
        return;
      }
      // Get valid test IDs from assessments, converting to strings
      const validTestIds = assessments.map((assessment) => String(assessment.id));
      if (validTestIds.length === 0) {
        console.log("No assessments available for tenant, skipping test session fetch.");
        setTestSessions([]);
        return;
      }
      const response = await fetch(
        `${testServiceUrl}/api/v1/test/session/list`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(
          `Failed to fetch test sessions. Status: ${response.status}`
        );
      const data = await response.json();
      console.log("Fetched test sessions from backend:", data);
      // Filter test sessions to only include those with testId in validTestIds
      const filteredSessions = data.filter((session: TestSession) =>
        validTestIds.includes(session.testId)
      );
      console.log("Filtered test sessions for tenant:", filteredSessions);
      setTestSessions(filteredSessions);
    } catch (err: any) {
      console.error("Error fetching test sessions:", err);
      setTestSessions([]);
    }
  };
  fetchTestSessions();
}, [token, tenantId, assessments]); // Added tenantId and assessments to dependencies
  // Fetch interview sessions from the interview service


useEffect(() => {
  const fetchInterviewSessions = async () => {
    try {
      // Ensure tenantId and token are available
      if (!tenantId || !token?.access_token) {
        console.log("Tenant ID or token missing for fetching interview sessions, waiting...");
        return;
      }
      console.log("tenantId in interview fetch:", tenantId);
      const response = await fetch(
        `${interviewServiceUrl}/api/interviews/tenant/id/${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(
          `Failed to fetch interviews. Status: ${response.status}`
        );
      const data = await response.json();
      setCompletedInterviews(data.length);
      console.log("Fetched interviews from backend:", data.length);
    } catch (err: any) {
      console.error("Error fetching interviews:", err);
    }
  };
  fetchInterviewSessions();
}, [token, tenantId]); // Removed completedInterviews from dependencies

  // Filter assessments based on search term.
  const filteredAssessments = assessments.filter((assessment) =>
    Object.values(assessment).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Only display top 5 assessments. (You might want to slice this if that's the intent)
  const displayedAssessments = filteredAssessments; // .slice(0, 5) if you want only top 5

  const toggleTestSelection = (id: number) => {
    setSelectedTests((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const selectedAssessments = assessments.filter((assessment) =>
    selectedTests.includes(assessment.id)
  );
  const selectedActiveCount = selectedAssessments.filter(
    (assessment) => assessment.testStatus === "Active"
  ).length;
  const selectedArchivedCount = selectedAssessments.filter(
    (assessment) => assessment.testStatus === "Archived"
  ).length;

  const openActionDialog = (action: "archive" | "unarchive") => {
    if (selectedTests.length === 0) return;
    // Logic to prevent archiving already archived tests or unarchiving active tests
    if (action === "archive" && selectedAssessments.every(test => test.testStatus === "Archived")) {
        toast.error("Selected tests are already archived.");
        return;
    }
    if (action === "unarchive" && selectedAssessments.every(test => test.testStatus === "Active")) {
        toast.error("Selected tests are already active.");
        return;
    }

    setActionType(action);
    setShowActionDialog(true);
  };

  const handleArchiveAction = async () => {
    if (!actionType) return;
    setIsLoading(true);
    try {
      const testsToUpdate = selectedTests.filter(id => {
        const assessment = assessments.find(a => a.id === id);
        if (!assessment) return false;
        return actionType === "archive" ? assessment.testStatus === "Active" : assessment.testStatus === "Archived";
      });

      if (testsToUpdate.length === 0) {
        toast.error(`No tests to ${actionType}. They might already be in the desired state.`);
        setShowActionDialog(false);
        setIsLoading(false);
        return;
      }

      await Promise.all(
        testsToUpdate.map((id) =>
          fetch(`${testServiceUrl}/api/v1/tests/${id}`, {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token?.access_token}`, // Add auth token if required by PUT endpoint
            },
            body: JSON.stringify({
              testStatus: actionType === "archive" ? "Archived" : "Active",
            }),
          })
          .then(response => {
            if (!response.ok) throw new Error(`Failed to ${actionType} test ID ${id}`);
            return response.json();
          })
        )
      );
      setAssessments((prev) =>
        prev.map((assessment) =>
          testsToUpdate.includes(assessment.id)
            ? {
                ...assessment,
                testStatus: actionType === "archive" ? "Archived" : "Active",
              }
            : assessment
        )
      );
      setSelectedTests([]);
      toast.success(
        `Selected tests ${
          actionType === "archive" ? "archived" : "unarchived"
        } successfully`
      );
    } catch (err) {
      console.error(
        `Error ${actionType === "archive" ? "archiving" : "unarchiving"} tests:`,
        err
      );
      toast.error(`Error performing ${actionType} action`);
    } finally {
      setShowActionDialog(false);
      setIsLoading(false);
    }
  };

  // Total assessments count
  const totalAssessments = assessments.length;
  // Calculate total invitations sent by counting assignments where emailSent is true
  const totalInvitationsSent = assignments.filter((a) => a.emailSent).length;
  // Calculate completed sessions count by filtering test sessions with status "COMPLETED"
  const completedSessionsCount = testSessions.filter(
    (session) => session.status === "COMPLETED"
  ).length;

  const analyticsStats = [
    {
      title: "Active Assessment",
      value: assessments.filter(a => a.testStatus === "Active").length, // Count only active
      label: "Assessments currently active",
      color: "text-green-400",
    },
    {
      title: "Total Invitations Sent",
      value: totalInvitationsSent,
      label: "Invitations sent to candidates",
      color: "text-blue-400",
    },
    {
      title: "Completed Sessions",
      value: completedSessionsCount,
      label: "Assessment sessions completed",
      color: "text-yellow-400",
    },
    {
      title: "Interviews Taken",
      value: completedInterviews,
      label: "Interviews completed",
      color: "text-purple-400",
    },
  ];

  if (isLoading && assessments.length === 0) { // Show a loading state if initial data is loading
    return <div className="flex justify-center items-center min-h-screen"><p>Loading dashboard...</p></div>;
  }

  if (error) { // Show an error state
    return <div className="flex justify-center items-center min-h-screen"><p>Error loading dashboard: {error}</p></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Analytics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {analyticsStats.map((stat) => (
                <AnalyticsCard key={stat.title} {...stat} />
              ))}
            </div>

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h2 className="text-2xl text-[#343C6A] font-semibold">
                Assessments
              </h2>
              {/* Conditional rendering of "View All" button */}
              {assessments.length > 0 && ( // Show only if there are assessments
                 <Link to="/dashboard/tests">
                   <Button variant="outline">View All Assessments</Button>
                 </Link>
              )}
            </div>

            {/* Action Buttons */}
            {selectedTests.length > 0 && (
              <div className="flex gap-2 my-4">
                {/* Show Archive if any selected is Active */}
                {selectedAssessments.some(a => a.testStatus === "Active") && (
                   <Button
                     variant="secondary"
                     onClick={() => openActionDialog("archive")}
                   >
                     Archive Selected ({selectedAssessments.filter(a => a.testStatus === "Active").length})
                   </Button>
                )}
                {/* Show Unarchive if any selected is Archived */}
                {selectedAssessments.some(a => a.testStatus === "Archived") && (
                  <Button
                    variant="secondary"
                    onClick={() => openActionDialog("unarchive")}
                  >
                    Unarchive Selected ({selectedAssessments.filter(a => a.testStatus === "Archived").length})
                  </Button>
                )}
              </div>
            )}
            
            {/* Assessments Table - Uncomment and use when ready */}
            {/* Make sure AssessmentsTable component is correctly imported */}
            <AssessmentsTable
              assessments={displayedAssessments} // Pass all filtered assessments or a slice
              selectedTests={selectedTests}
              onToggleSelect={toggleTestSelection}
              // onToggleSelectAll={handleSelectAll} // Implement if needed
            />

            {/* Placeholder if no assessments */}
            {assessments.length === 0 && !isLoading && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">No assessments found.</p>
                <Link to="/add-test/1"> {/* Ensure this link is correct */}
                  <Button className="mt-4">Create New Assessment</Button>
                </Link>
              </div>
            )}


            {/* Extra Analytics Section */}
            <AnalyticsMan />
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      {showActionDialog && (
        <Dialog
          open={showActionDialog}
          onOpenChange={() => setShowActionDialog(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Confirm {actionType === "archive" ? "Archiving" : "Unarchiving"}
              </DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to {actionType} the selected{" "}
              {actionType === "archive" 
                ? selectedAssessments.filter(a => a.testStatus === "Active").length 
                : selectedAssessments.filter(a => a.testStatus === "Archived").length} test(s)?
            </p>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowActionDialog(false)}>Cancel</Button>
                <Button 
                    variant={actionType === "archive" ? "destructive" : "default"} 
                    onClick={handleArchiveAction}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Confirm"}
                </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardPage;