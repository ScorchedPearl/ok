"use client";

import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Download, 
  XCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

// Updated CandidateDetail interface based on the API sample response
interface CandidateDetail {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  status: string; // e.g., "pending"
  appliedAt: string;
  updatedAt: string;
  matchScore: number;
  experience: number;
  skills: string[];
  summary: string;
}

const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || 'http://localhost:8007';

export default function CandidateDetail() {
  // Using "id" from the URL since API endpoint is /api/job-applications/{id}
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  

  // Fetch candidate details from the API
  useEffect(() => {
    const fetchCandidateDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${interviewServiceUrl}/api/job-applications/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch candidate details. Status: ${response.status}`);
        }
        const data = await response.json();
        setCandidate(data);
      } catch (err: any) {
        console.error("Error fetching candidate details:", err);
       
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCandidateDetails();
    }
  }, [id]);

 

  // Handle viewing or downloading the resume (for demonstration only)
  const handleViewResume = () => {
    toast.success("Opening resume PDF");
    // window.open(candidate?.resumeUrl, '_blank');  // Uncomment when a resumeUrl is available
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4338ca] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading candidate details...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-red-600">
        <XCircle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
        <p>{error || "Candidate not found"}</p>
        <Button 
          onClick={() => navigate(-1)} 
          className="mt-4 bg-[#4338ca] hover:bg-[#3730a3]"
        >
          Go Back
        </Button>
      </div>
    );
  }

  // Determine match score color based on candidate.matchScore
  const getMatchScoreColor = () => {
    const score = candidate.matchScore;
    if (score >= 90) return "from-green-500 to-green-700";
    if (score >= 80) return "from-blue-500 to-blue-700";
    if (score >= 70) return "from-yellow-500 to-yellow-700";
    return "from-red-500 to-red-700";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Back Button and Candidate ID */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Candidate: {candidate.candidateName}</h1>
              <p className="text-sm text-gray-500">Job ID: {candidate.jobId}</p>
            </div>
          </div>
          <div>
            <Badge 
              className={`px-3 py-1 text-sm ${
                candidate.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {candidate.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Match Score Card */}
          <div className="mb-8">
            <Card className="shadow-sm overflow-hidden border-none">
              <div className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Match Score</h2>
                  <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <span className="text-xs uppercase tracking-wider opacity-80">Job Match</span>
                      <div className="text-4xl font-bold">{candidate.matchScore}%</div>
                    </div>
                    <div className="h-24 w-24 rounded-full bg-white p-1 flex items-center justify-center">
                      <div className={`h-full w-full rounded-full bg-gradient-to-br ${getMatchScoreColor()} flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">{candidate.matchScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Candidate Fit Summary */}
          <div className="mb-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-black">Candidate Fit Summary</CardTitle>
                <CardDescription className="text-black">AI-generated analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {candidate.summary}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Basic Info and Resume Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-black">Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Applied on {new Date(candidate.appliedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">
                      Experience: {candidate.experience} {candidate.experience === 1 ? "year" : "years"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">
                      Skills: {candidate.skills.join(", ")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resume Viewer (Placeholder) */}
            <div>
              <Card className="shadow-sm">
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-black">Resume</CardTitle>
                    <CardDescription className="text-black">Click to view/download</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewResume}
                    className="text-xs flex items-center bg-[#4338ca] hover:bg-[#3730a3]"
                  >
                    <Download className="h-3 w-3 mr-1 text-white" />
                    Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <div 
                    className="border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors p-8 flex flex-col items-center justify-center"
                    onClick={handleViewResume}
                  >
                    <FileText className="h-20 w-20 text-gray-400 mb-4" />
                    <div className="text-center">
                      <p className="text-gray-700 font-medium mb-2">Resume.pdf</p>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-[#4338ca] hover:bg-[#3730a3] flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Resume PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-gray-500">
                  Note: The resume is available as a PDF document.
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to Applications
            </Button>
            <Button 
              className="bg-[#4338ca] hover:bg-[#3730a3]" 
              onClick={() => toast.success("Interview scheduled")}
            >
              Schedule Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}