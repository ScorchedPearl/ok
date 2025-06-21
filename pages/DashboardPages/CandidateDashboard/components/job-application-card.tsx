import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Briefcase, Calendar, Clock, AlertCircle, Star, FileText, User, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const interviewServiceUrl =
  import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

interface JobApplication {
  id: string;
  userId: number;
  jobTitle?: string;
  status: string;
  companyName?: string;
  invitedDate?: string;
  lastActivity?: string;
  candidateId: number;
  candidateName?: string;
  jobId?: string;
  tenantId?: number;
  appliedAt?: string;
  updatedAt?: string;
  matchScore?: number;
  experience?: number;
  skills?: string[];
  summary?: string;
}

export default function JobApplicationCard() {
  const { token, user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have a token and user
    if (token && user) {
      fetchJobApplications();
    }
  }, [token, user]);

  const fetchJobApplications = async () => {
    try {
      setLoading(true);
      
      // Replace with your actual API endpoint
      const response = await fetch(`${interviewServiceUrl}/api/job-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job applications');
      }

      const data = await response.json();
      
      // Filter applications to only show those matching the current user
      console.log("Fetched job applications:", data);
      console.log("User ID:", user?.userId);

      const filteredApplications = data.filter(
        (app: JobApplication) => app.userId === user?.userId
      );

      console.log("Filtered job applications:", filteredApplications);
      
      setApplications(filteredApplications);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  // Format date to display like "21st January 2025"
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).replace(/(\d+)(?=(st|nd|rd|th))/, '$1$2');
  };

  // Calculate days since last activity
  const getLastActivity = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getStatusVariant = (status: string): "success" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "completed":
      case "accepted":
        return "success";
      case "in progress":
      case "applied":
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedApplicationId(expandedApplicationId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse text-gray-500">Loading job applications...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center h-32 text-red-500 gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center justify-center h-32 text-gray-500 gap-2">
          <Briefcase className="h-8 w-8 text-gray-300" />
          <span className="text-center">No job applications found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My Applications</h2>
      <div className="space-y-4">
        {applications.map((application) => (
          <div 
            key={application.id}
            className="border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 overflow-hidden"
          >
            {/* Header Section */}
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(application.id)}
            >
              {/* Status indicator bar */}
              <div className={`w-1 self-stretch ${
                application.status.toLowerCase() === "completed" || application.status.toLowerCase() === "accepted" ? "bg-green-500" :
                application.status.toLowerCase() === "in progress" || application.status.toLowerCase() === "applied" ? "bg-amber-500" :
                application.status.toLowerCase() === "rejected" ? "bg-red-500" : "bg-blue-500"
              }`} />
              
              <div className="flex-1 p-4">
                {/* Title and Status Section */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-800">
                    {application.jobTitle || "Job Application"}
                  </h3>
                  <Badge 
                    variant={getStatusVariant(application.status)}
                    className="font-medium px-3 py-1"
                  >
                    {application.status}
                  </Badge>
                </div>
                
                {/* Company & Activity Section */}
                <div className="text-sm space-y-3">
                  <div className="flex items-center text-gray-700 gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Company:</span> {application.companyName || "N/A"}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-6 text-gray-600">
                    <div className="flex items-center gap-2 mb-1 sm:mb-0">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Applied:</span> {formatDate(application.appliedAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Last updated:</span> {getLastActivity(application.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chevron Icon */}
              <div className="pr-4">
                <div className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  {expandedApplicationId === application.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Expanded Details Section */}
            {expandedApplicationId === application.id && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Candidate Details
                      </h4>
                      <div className="bg-white p-4 rounded-md border border-gray-200 text-sm">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <span className="font-medium text-gray-600">Name:</span>
                            <span className="ml-2 text-gray-800">{application.candidateName || "N/A"}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Candidate ID:</span>
                            <span className="ml-2 text-gray-800">{application.candidateId}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">User ID:</span>
                            <span className="ml-2 text-gray-800">{application.userId}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Experience:</span>
                            <span className="ml-2 text-gray-800">
                              {typeof application.experience === 'number' ? 
                                `${application.experience} ${application.experience === 1 ? 'year' : 'years'}` : 
                                'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Application Details
                      </h4>
                      <div className="bg-white p-4 rounded-md border border-gray-200 text-sm">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <span className="font-medium text-gray-600">Job ID:</span>
                            <span className="ml-2 text-gray-800 text-xs break-all">{application.jobId || "N/A"}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Tenant ID:</span>
                            <span className="ml-2 text-gray-800">{application.tenantId || "N/A"}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Applied Date:</span>
                            <span className="ml-2 text-gray-800">{formatDate(application.appliedAt)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Last Updated:</span>
                            <span className="ml-2 text-gray-800">{formatDate(application.updatedAt)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Application ID:</span>
                            <span className="ml-2 text-gray-800 text-xs break-all">{application.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Match Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        Match Assessment
                      </h4>
                    </div>
                    
                    {application.skills && application.skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Skills
                        </h4>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <div className="flex flex-wrap gap-2">
                            {application.skills.map((skill, index) => (
                              <Badge 
                                key={index} 
                                variant="outline"
                                className="px-2 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}