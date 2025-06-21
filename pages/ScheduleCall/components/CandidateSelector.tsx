import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, ChevronRight, ChevronLeft, Search, FileUp } from "lucide-react";
import { Candidate } from "../types/ScheduleCallTypes";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

interface CandidateSelectorProps {
  jobId: string | undefined;
  onCandidateSelect: (candidate: Candidate) => void;
}

export default function CandidateSelector({ jobId, onCandidateSelect }: CandidateSelectorProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [newCandidate, setNewCandidate] = useState<Partial<Candidate>>({
    fullName: "",
    email: "",
    phoneNumber: ""
  });
  
  const { user, token } = useAuth();
  
  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

  // Fetch candidates for the job
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoading(true);
        
        if (jobId) {
          // Using the actual API endpoint based on CandidatesApplied
          try {
            const response = await fetch(`${interviewServiceUrl}/api/job-applications/job/${jobId}`,{
              headers: {
                Authorization: `Bearer ${token?.access_token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch candidates. Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Transform the API response to match our Candidate type
            const transformedCandidates = data.map((candidate: any) => ({
              id: candidate.candidateId,
              fullName: candidate.candidateName || "",
              email: candidate.email || "",
              phoneNumber: candidate.candidatePhone || "",
              resumeFileUrl: candidate.resumeFileUrl || "",
              // Add any other required fields
            }));

            console.log("Transformed candidates:", transformedCandidates);  
            
            setCandidates(transformedCandidates);
            setFilteredCandidates(transformedCandidates);
            console.log("Candidates loaded:", transformedCandidates);
          } catch (apiError) {
            console.error("API Error:", apiError);
            // Fall back to mock data
            useMockCandidates();
          }
        } else {
          // If no jobId is provided, use mock data
          useMockCandidates();
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast.error("Failed to fetch candidates");
        // Fall back to mock data
        useMockCandidates();
      } finally {
        setIsLoading(false);
      }
    };

    const useMockCandidates = () => {
      const mockCandidates = [
        { id: 1, fullName: "Jane Smith", email: "jane.smith@example.com", phoneNumber: "+1234567890", resumeFileUrl: "https://example.com/resume/jane" },
        { id: 2, fullName: "John Doe", email: "john.doe@example.com", phoneNumber: "+9876543210" },
        { id: 3, fullName: "Emily Johnson", email: "emily.j@example.com", resumeFileUrl: "https://example.com/resume/emily" }
      ];
      
      setCandidates(mockCandidates);
      setFilteredCandidates(mockCandidates);
    };

    loadCandidates();
  }, [jobId, interviewServiceUrl]);

  // Filter candidates based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCandidates(candidates);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = candidates.filter(
        candidate => 
          candidate.fullName.toLowerCase().includes(query) || 
          candidate.email.toLowerCase().includes(query) ||
          (candidate.phoneNumber && candidate.phoneNumber.toLowerCase().includes(query))
      );
      setFilteredCandidates(filtered);
    }
  }, [searchQuery, candidates]);

  // Handle new candidate form submission
  const handleAddCandidate = async () => {
    if (!newCandidate.fullName || !newCandidate.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      // Try to use the API if we have a jobId
      if (jobId && token) {
        try {
          // The API endpoint might need adjusting based on actual backend requirements
          const response = await axios.post(
            `${interviewServiceUrl}/api/job-applications/candidate`,
            {
              candidateName: newCandidate.fullName,
              email: newCandidate.email,
              phoneNumber: newCandidate.phoneNumber || "",
              jobId: jobId
            },
            {
              headers: {
                Authorization: `Bearer ${token.access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          const newCandidateWithId = {
            id: response.data.id || Math.floor(Math.random() * 10000) + 100,
            fullName: newCandidate.fullName,
            email: newCandidate.email,
            phoneNumber: newCandidate.phoneNumber || ""
          } as Candidate;
          
          setCandidates([...candidates, newCandidateWithId]);
          setFilteredCandidates([...candidates, newCandidateWithId]);
        } catch (apiError) {
          console.error("API Error adding candidate:", apiError);
          // Fall back to mock response
          useMockAddResponse();
        }
      } else {
        // If no jobId or token, use mock response
        useMockAddResponse();
      }
      
      toast.success("Candidate added successfully");
      setShowAddNew(false);
      setNewCandidate({ fullName: "", email: "", phoneNumber: "" });
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
    }
  };

  const useMockAddResponse = () => {
    const mockResponse = {
      ...newCandidate,
      id: Math.floor(Math.random() * 10000) + 100
    } as Candidate;
    
    setCandidates([...candidates, mockResponse]);
    setFilteredCandidates([...candidates, mockResponse]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  if (showAddNew) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddNew(false)}
            className="bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to candidates
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input
              value={newCandidate.fullName}
              onChange={(e) => setNewCandidate({...newCandidate, fullName: e.target.value})}
              placeholder="Enter candidate's full name"
              className="bg-white/90 text-gray-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              value={newCandidate.email}
              onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
              placeholder="Enter candidate's email"
              type="email"
              className="bg-white/90 text-gray-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <Input
              value={newCandidate.phoneNumber}
              onChange={(e) => setNewCandidate({...newCandidate, phoneNumber: e.target.value})}
              placeholder="Enter candidate's phone number"
              className="bg-white/90 text-gray-800"
            />
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              type="button"
              onClick={handleAddCandidate}
              className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white font-medium py-2 px-4 rounded-lg flex items-center"
            >
              Add Candidate
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full md:w-1/2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates..."
            className="pr-10 bg-white/90 text-gray-800"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={16} />
          </div>
        </div>
        <Button
          onClick={() => setShowAddNew(true)}
          className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white ml-4"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New
        </Button>
      </div>
      
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredCandidates.map((candidate) => (
            <div 
              key={candidate.id}
              onClick={() => onCandidateSelect(candidate)}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{candidate.fullName}</h4>
                  <p className="text-sm text-gray-500">{candidate.email}</p>
                  {candidate.phoneNumber && (
                    <p className="text-xs text-gray-400">{candidate.phoneNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {candidate.resumeFileUrl && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <FileUp className="h-3 w-3 mr-1" />
                      Has Resume
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-gray-600 font-medium">No candidates found</h3>
          <p className="text-gray-500 text-sm mt-1">Add a new candidate to continue</p>
        </div>
      )}
    </div>
  );
}