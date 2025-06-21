"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AssessmentCard } from "./components/assesment-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Send, Plus, AlertCircle, Search, ArrowLeft, Phone, UserPlus, CheckCircle2, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface TestDTO {
  id: number;
  category: string;
  createdAt: string;
  questionLibraryIds: string[];
  stream: string;
  tenantId: number;
  testName: string;
  testType: string;
  timeLimit: number;
  updatedAt: string;
}

interface Candidate {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  resumeFileUrl?: string;
  resumeContent?: string;
  resumeSummary?: string;
}

const assesmentServiceUrl = import.meta.env.VITE_ASSESMENT_SERVICE || "http://localhost:8002";
const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8003";
const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

export default function CandidateAssessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramTestId = searchParams.get("testId");

  // Tab state
  const [activeTab, setActiveTab] = useState<string>("existing");

  // State for selected assessment and for storing fetched tests
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null);
  const [assessments, setAssessments] = useState<TestDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State for candidates - CHANGED TO SUPPORT MULTIPLE SELECTIONS
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]); // Now an array
  const [isFetchingCandidates, setIsFetchingCandidates] = useState<boolean>(false);
  const [candidateSearch, setCandidateSearch] = useState<string>("");
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);

  // Manual form input state
  const [manualCandidate, setManualCandidate] = useState({
    fullName: "",
    email: "",
    phoneNumber: ""
  });

  // For handling form submission & mail sending
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<{ success: boolean; message: string } | null>(null);
  const [currentSendingIndex, setCurrentSendingIndex] = useState<number>(0);
  const [totalToSend, setTotalToSend] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failCount, setFailCount] = useState<number>(0);

  // For search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;

  // -----------------------------
  // 1. Fetch Tests on Mount
  // -----------------------------
  useEffect(() => {
    setIsLoading(true);

    fetch(`${testServiceUrl}/api/v1/tests`, {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tests");
        }
        return response.json();
      })
      .then((data: TestDTO[]) => {
        setAssessments(data);
        setIsLoading(false);
        console.log("Fetched tests:", data);
        // If there's a testId in the URL, try to pre-select that test.
        if (paramTestId) {
          const parsedId = parseInt(paramTestId, 10);
          const found = data.find((test) => test.id === parsedId);
          if (found) {
            setSelectedAssessment(found.id);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
        setFetchError(error.message);
        setIsLoading(false);
      });
  }, [paramTestId, token?.access_token]);

  // -----------------------------
  // 2. Fetch Candidates on Mount
  // -----------------------------
  useEffect(() => {
    if (!tenantId || selectedAssessment === null) return;

    setIsFetchingCandidates(true);

    const selectedTest = assessments.find(test => test.id === selectedAssessment);
    if (!selectedTest || !('jobIDs' in selectedTest)) {
      setIsFetchingCandidates(false);
      return;
    }

    fetch(`${interviewServiceUrl}/api/candidates/${(selectedTest as any).jobIDs}/candidates?tenantId=${tenantId}`, {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
      
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch candidates");
        }
        return response.json();
      })
      .then((data: Candidate[]) => {
        console.log(data);
        setCandidates(data);
        setFilteredCandidates(data);
        setIsFetchingCandidates(false);
      })
      .catch((error) => {
        console.error("Error fetching candidates:", error);
        setIsFetchingCandidates(false);
      });
  }, [tenantId, token?.access_token, selectedAssessment, assessments]);

  useEffect(() => {





  },[tenantId, token?.access_token,selectedAssessment]);
  // Filter candidates when search term changes
  useEffect(() => {
    if (candidateSearch.trim() === '') {
      setFilteredCandidates(candidates);
      return;
    }
    
    const searchLower = candidateSearch.toLowerCase();
    const filtered = candidates.filter(
      candidate => 
        candidate.fullName.toLowerCase().includes(searchLower) || 
        candidate.email.toLowerCase().includes(searchLower)
    );
    
    setFilteredCandidates(filtered);
  }, [candidateSearch, candidates]);

  // Toggle candidate selection
  const toggleCandidateSelection = (candidate: Candidate) => {
    const isSelected = selectedCandidates.some(c => c.id === candidate.id);
    
    if (isSelected) {
      // Remove candidate
      setSelectedCandidates(prev => prev.filter(c => c.id !== candidate.id));
    } else {
      // Add candidate
      setSelectedCandidates(prev => [...prev, candidate]);
    }
  };

  // Remove a specific candidate from selection
  const removeSelectedCandidate = (id: number) => {
    setSelectedCandidates(prev => prev.filter(c => c.id !== id));
  };

  // -----------------------------
  // 3. Handle Form Submission
  // -----------------------------
  // -----------------------------
// 3. Handle Form Submission - FIXED VERSION
// -----------------------------
const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  // If user hasn't selected a test, show an error message.
  if (selectedAssessment === null) {
    setFormState({ success: false, message: "Please select an assessment first." });
    return;
  }

  // Check candidate information based on active tab
  const candidatesToProcess: Array<{id: number, name: string, email: string}> = [];
  
  if (activeTab === "existing") {
    if (selectedCandidates.length === 0) {
      setFormState({ success: false, message: "Please select at least one candidate first." });
      return;
    }
    
    // Prepare all selected candidates for processing
    selectedCandidates.forEach(candidate => {
      candidatesToProcess.push({
        id: candidate.id,
        name: candidate.fullName,
        email: candidate.email
      });
    });
  } else {
    // Extract form data for manual candidate
    const formData = new FormData(event.currentTarget);
    const candidateName = formData.get("name") as string;
    const candidateEmail = formData.get("email") as string;
    
    // Create new candidate in database if on manual tab
    try {
      const response = await fetch(`${interviewServiceUrl}/api/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token?.access_token}`,
        },
        body: JSON.stringify({
          fullName: candidateName,
          email: candidateEmail,
          phoneNumber: manualCandidate.phoneNumber
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to create candidate");
      }
      
      // Add to candidates list
      const newCandidate = await response.json();
      setCandidates(prev => [...prev, newCandidate]);
      
      // Add to processing list
      candidatesToProcess.push({
        id: newCandidate.id,
        name: candidateName,
        email: candidateEmail
      });
    } catch (error) {
      console.error("Error creating candidate:", error);
      setFormState({ success: false, message: "Error creating candidate. Please try again." });
      return;
    }
  }

  setIsSubmitting(true);
  setFormState(null);
  
  // Initialize counts before processing
  let successCount = 0;
  let failCount = 0;
  const totalToSend = candidatesToProcess.length;
  
  setTotalToSend(totalToSend);
  
  // Check if we can find the selected test in our state
  const selectedTestObj = assessments.find((test) => test.id === selectedAssessment);
  if (!selectedTestObj) {
    setIsSubmitting(false);
    setFormState({ success: false, message: "Invalid test selection." });
    return;
  }

  // Show a loading modal that will update with progress
  Swal.fire({
    title: "Sending Assessments...",
    html: `Sending invitations to ${candidatesToProcess.length} candidate(s).<br/>Progress: 0/${candidatesToProcess.length}`,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  // Process each candidate
  for (let i = 0; i < candidatesToProcess.length; i++) {
    setCurrentSendingIndex(i + 1);
    
    const candidate = candidatesToProcess[i];
    const { tenantId } = selectedTestObj;
    const testId = selectedTestObj.id;
    
    // Update progress in Swal
    Swal.update({
      html: `Sending invitations to ${candidatesToProcess.length} candidate(s).<br/>Progress: ${i+1}/${candidatesToProcess.length}<br/>Current: ${candidate.name}`
    });

    // Construct the POST URL
    const postUrl = `${assesmentServiceUrl}/assignments/${tenantId}/${testId}/${candidate.id}`;

    try {
      // Make the POST request - add timeout to avoid overwhelming the server
      await axios.post(postUrl, {
        candidateEmail: candidate.email,
        messageTemplate: `Hi ${candidate.name},\n\nPlease complete the assessment.\n\nRegards,\nTeam`,
      }, {
        timeout: 15000 // 15 seconds timeout
      });
      
      // Update success count directly (don't use state setter in loop)
      successCount++;
    } catch (error) {
      console.error(`Error sending assessment to ${candidate.email}:`, error);
      // Update fail count directly (don't use state setter in loop)
      failCount++;
    }
  }

  // After processing all candidates, update the state once
  setSuccessCount(successCount);
  setFailCount(failCount);

  // Show results
  Swal.close();
  
  if (successCount === candidatesToProcess.length) {
    setFormState({ 
      success: true, 
      message: `Assessments sent successfully to all ${candidatesToProcess.length} candidates!` 
    });
    
    Swal.fire({
      icon: "success",
      title: "Invitations Sent!",
      text: `Assessments have been sent to all ${candidatesToProcess.length} candidates successfully.`,
      confirmButtonColor: "#1e1b4b",
    });
  } else if (successCount > 0) {
    setFormState({ 
      success: true, 
      message: `${successCount} out of ${candidatesToProcess.length} assessments sent successfully. ${failCount} failed.` 
    });
    
    Swal.fire({
      icon: "info",
      title: "Partial Success",
      text: `${successCount} out of ${candidatesToProcess.length} assessments sent successfully. ${failCount} failed.`,
      confirmButtonColor: "#1e1b4b",
    });
  } else {
    setFormState({ 
      success: false, 
      message: "Failed to send assessments. Please try again." 
    });
    
    Swal.fire({
      icon: "error",
      title: "Sending Failed",
      text: "There was an error sending the invitations. Please try again.",
      confirmButtonColor: "#1e1b4b",
    });
  }
  
  // Reset form if in manual mode
  if (activeTab === "manual") {
    setManualCandidate({
      fullName: "",
      email: "",
      phoneNumber: ""
    });
  }
  
  // Clear selections in existing mode
  if (activeTab === "existing") {
    setSelectedCandidates([]);
  }
  
  setIsSubmitting(false);
};

  // Handle input change for manual candidate form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManualCandidate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // -----------------------------
  // 4. Filtering & Ordering Tests
  // -----------------------------
  const filteredAssessments = assessments.filter((test) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      test.testName.toLowerCase().includes(lowerSearch) ||
      test.category.toLowerCase().includes(lowerSearch)
    );
  });

  // Move the selected test (if any) to the top of the list
  let orderedAssessments = [...filteredAssessments];
  if (selectedAssessment) {
    const idx = orderedAssessments.findIndex((test) => test.id === selectedAssessment);
    if (idx > 0) {
      const [pinned] = orderedAssessments.splice(idx, 1);
      orderedAssessments.unshift(pinned);
    }
  }

  // -----------------------------
  // 5. UI Rendering
  // -----------------------------
  if (isLoading) {
    return <div className="p-4 text-center text-gray-600">Loading available tests...</div>;
  }

  if (fetchError) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Failed to load tests: {fetchError}</p>
        <Button variant="outline" onClick={() => navigate(0)} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  // Candidate Card Component - UPDATED FOR MULTIPLE SELECTION
  const CandidateCard = ({ candidate }: { candidate: Candidate }) => {
    const isSelected = selectedCandidates.some(c => c.id === candidate.id);
    
    return (
      <div 
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'border-indigo-600 bg-indigo-50 shadow-md' 
            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
        }`}
        onClick={() => toggleCandidateSelection(candidate)}
      >
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10 bg-indigo-100">
            <div className="text-indigo-800">{candidate.fullName.charAt(0)}</div>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{candidate.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{candidate.email}</p>
            {candidate.phoneNumber && (
              <p className="text-xs text-gray-500 truncate">{candidate.phoneNumber}</p>
            )}
          </div>
          {isSelected && (
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 bg-white min-h-screen">
      {/* Header with Back Button and Title */}
      <div className="relative mb-8">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/invitations")}
          className="absolute left-0 flex items-center shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold text-[#1e1b4b] text-center">
          Create Candidate and Send Assessment Invitation
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Candidate Info Card */}
        <div className="space-y-8">
          <Card className="border-[#1e1b4b]/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#1e1b4b] text-2xl">Candidate Information</CardTitle>
              <CardDescription className="text-[#1e1b4b]">
                Select existing candidates or add a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="existing" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="existing" className="text-sm">
                    <User className="w-4 h-4 mr-2" />
                    Existing Candidates
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="text-sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New Candidate
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4">
                  {/* Search box for candidates */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1e1b4b]/50" />
                    <Input
                      placeholder="Search candidates by name or email..."
                      className="pl-10 border-[#1e1b4b]/10 text-[#1e1b4b]"
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                    />
                  </div>

                  {/* Selected candidates count */}
                  {selectedCandidates.length > 0 && (
                    <div className="mb-2 px-2">
                      <p className="text-sm text-indigo-600 font-medium">
                        {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}

                  {/* Candidate list */}
                  <div className="border rounded-lg border-[#1e1b4b]/10 h-[300px] overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-2 p-2">
                        {isFetchingCandidates ? (
                          // Loading skeletons
                          Array(5).fill(0).map((_, i) => (
                            <div key={i} className="p-4 border rounded-lg">
                              <div className="flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-3 w-1/2" />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : filteredCandidates.length > 0 ? (
                          filteredCandidates.map(candidate => (
                            <CandidateCard key={candidate.id} candidate={candidate} />
                          ))
                        ) : (
                          <p className="text-center py-4 text-gray-500">
                            {candidateSearch ? "No candidates found matching your search." : "No candidates available."}
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Selected candidates list with badges */}
                  {selectedCandidates.length > 0 && (
                    <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                      <h3 className="font-medium text-indigo-900 mb-2">Selected Candidates</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidates.map(candidate => (
                          <Badge key={candidate.id} className="flex items-center bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                            {candidate.fullName}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSelectedCandidate(candidate.id);
                              }} 
                              className="ml-1 p-1 rounded-full hover:bg-indigo-300 text-indigo-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manual">
                  <form id="manualCandidateForm" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[#1e1b4b]">
                        Candidate Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1e1b4b]/50" />
                        <Input
                          id="name"
                          name="name"
                          value={manualCandidate.fullName}
                          onChange={handleInputChange}
                          className="pl-10 border-[#1e1b4b]/10 text-[#1e1b4b]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#1e1b4b]">
                        Candidate Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1e1b4b]/50" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={manualCandidate.email}
                          onChange={handleInputChange}
                          className="pl-10 border-[#1e1b4b]/10 text-[#1e1b4b]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-[#1e1b4b]">
                        Phone Number (Optional)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1e1b4b]/50" />
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={manualCandidate.phoneNumber}
                          onChange={handleInputChange}
                          className="pl-10 border-[#1e1b4b]/10 text-[#1e1b4b]"
                        />
                      </div>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Submit button section - outside of tabs to be consistent */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6 pt-6 border-t">
                <Button
                  type="submit"
                  form={activeTab === "manual" ? "manualCandidateForm" : "existingCandidateForm"}
                  className="flex-1 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white"
                  disabled={isSubmitting || (activeTab === "existing" && selectedCandidates.length === 0) || !selectedAssessment}
                  onClick={activeTab === "existing" ? (e) => {
                    e.preventDefault();
                    if (selectedCandidates.length === 0 || !selectedAssessment) return;
                    
                    // Create a mock form for existing candidates
                    const mockForm = document.createElement('form');
                    mockForm.id = "existingCandidateForm";
                    document.body.appendChild(mockForm);
                    
                    const formEvent = new Event('submit', { cancelable: true });
                    handleSubmit(formEvent as unknown as React.FormEvent<HTMLFormElement>);
                    
                    document.body.removeChild(mockForm);
                  } : undefined}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Assessment{activeTab === "existing" && selectedCandidates.length > 1 ? 's' : ''}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-white border-[#1e1b4b] bg-[#1e1b4b] hover:text-white transition-all transform hover:scale-105"
                  onClick={() => {
                    navigate("/add-test/1");
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Test
                </Button>
              </div>

              {formState && (
                <p
                  className={`mt-4 text-center ${
                    formState.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formState.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Important Notes Card */}
          <Card className="border-[#1e1b4b]/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#1e1b4b] text-xl flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-[#1e1b4b]/80">
                <li>Ensure the candidate&apos;s email is correct before sending the assessment.</li>
                <li>The assessment link will be valid for 24 hours from the time of sending.</li>
                <li>Candidates can only attempt the assessment once.</li>
                <li>Results will be automatically sent to the hiring manager upon completion.</li>
                <li>You can now select multiple candidates to send the same assessment.</li>
              </ul>
              <Separator className="my-4" />
              <p className="text-xs text-[#1e1b4b]/60 italic">
                For any issues or queries, please contact the IT support team.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Assessments Card */}
        <Card className="border-[#1e1b4b]/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#1e1b4b] text-2xl">Available Assessments</CardTitle>
            <CardDescription className="text-[#1e1b4b]">
              Select an appropriate assessment for the candidate{selectedCandidates.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1e1b4b]/50" />
              <Input
                placeholder="Search by test name or category..."
                className="pl-10 border-[#1e1b4b]/10 text-[#1e1b4b]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="grid gap-4 p-2">
                {orderedAssessments.length > 0 ? (
                  orderedAssessments.map((test) => (
                    <AssessmentCard
                      key={test.id}
                      id={test.id}
                      testName={test.testName}
                      category={test.category}
                      timeLimit={test.timeLimit}
                      testType={test.testType}
                      createdAt={test.createdAt}
                      updatedAt={test.updatedAt}
                      questionLibraryIds={test.questionLibraryIds}
                      stream={test.stream}
                      tenantId={test.tenantId}
                      selected={selectedAssessment === test.id}
                      onSelect={(id) => setSelectedAssessment(id)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No assessments found matching your search.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}