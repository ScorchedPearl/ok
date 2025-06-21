"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  Check, 
  Clock, 
  AlertCircle, 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"

const interviewServiceUrl =
  import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

// Application status badge styling
const statusStyles = {
  APPLIED: "bg-blue-100 text-blue-700",
  SCREENING: "bg-yellow-100 text-yellow-700",
  INTERVIEWING: "bg-purple-100 text-purple-700",
  REJECTED: "bg-red-100 text-red-700",
  ACCEPTED: "bg-green-100 text-green-700",
  WITHDRAWN: "bg-gray-100 text-gray-700",
};

interface JobApplication {
  id: string;
  userId: number;
  candidateId: number;
  candidateName: string;
  candidatePhone?: string;
  jobId: string;
  tenantId: number;
  status: "APPLIED" | "SCREENING" | "INTERVIEWING" | "REJECTED" | "ACCEPTED" | "WITHDRAWN";
  appliedAt: string;
  updatedAt: string;
  matchScore: number;
  experience?: number;
  skills: string[];
  summary?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
}

export default function JobApplicationsPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Fetch job applications for the current user
  useEffect(() => {
    const fetchApplications = async () => {
      if (!token || !user?.userId) {
        setLoading(false);
        return;
      }

      try {
  setLoading(true);
  const response = await fetch(`${interviewServiceUrl}/api/job-applications/user/${user.userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch job applications');
  }

  const data = await response.json();
  
  // Type assertion to ensure the data is treated as JobApplication[] array
  const typedApplications = data as JobApplication[];
  setApplications(typedApplications);
  
  // Extract job IDs for fetching job details
  const jobIds = [...new Set(typedApplications.map(app => app.jobId))];
  await fetchJobDetails(jobIds);
} catch (err) {
  console.error("Error fetching applications:", err);
  setError(err instanceof Error ? err.message : "Unknown error occurred");
} finally {
  setLoading(false);
}
    };

    fetchApplications();
  }, [token, user]);

  // Fetch job details for the applications
  const fetchJobDetails = async (jobIds: string[]) => {
    if (!token || jobIds.length === 0) return;
    
    const jobsData: Record<string, Job> = {};
    
    try {
      // Fetch job details for each job ID
      await Promise.all(jobIds.map(async (jobId) => {
        try {
          const response = await fetch(`${interviewServiceUrl}/api/jobs/${jobId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const jobData = await response.json();
            jobsData[jobId] = {
              id: jobData.id,
              title: jobData.title || 'Untitled Position',
              company: jobData.companyName || 'Unknown Company',
              location: jobData.location || 'Remote',
              description: jobData.description || 'No job description available.'
            };
          } else {
            // If we can't fetch a job, set default values
            jobsData[jobId] = {
              id: jobId,
              title: 'Position',
              company: 'Company',
              location: 'Location'
            };
          }
        } catch (error) {
          console.error(`Error fetching job ${jobId}:`, error);
          // Set default values on error
          jobsData[jobId] = {
            id: jobId,
            title: 'Position',
            company: 'Company',
            location: 'Location'
          };
        }
      }));
      
      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching job details:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const openApplicationDetail = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  // Render loading skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container px-4 py-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              className="mr-4"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">Job Applications</h1>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-md">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container px-4 py-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              className="mr-4"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">Job Applications</h1>
          </div>
          
          <Card className="shadow-md text-center py-8">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Error Loading Applications</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            className="mr-4"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">Job Applications</h1>
        </div>
        
        {applications.length === 0 ? (
          <Card className="shadow-md text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">No Applications Found</h2>
              <p className="text-gray-600 mb-4">You haven't applied to any jobs yet.</p>
              <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card 
                key={application.id} 
                className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openApplicationDetail(application)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-[#2E2883]">
                        {jobs[application.jobId]?.title || 'Position'}
                      </CardTitle>
                      <p className="text-gray-600">
                        {jobs[application.jobId]?.company || 'Company'} • {jobs[application.jobId]?.location || 'Location'}
                      </p>
                    </div>
                    <Badge className={statusStyles[application.status] || "bg-gray-100 text-gray-700"}>
                      {application.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      Applied: {formatDate(application.appliedAt)}
                    </div>
                    {application.matchScore > 0 && (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-1 text-green-500" />
                        Match Score: {application.matchScore}%
                      </div>
                    )}
                  </div>
                  
                  {application.skills && application.skills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.skills.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {skill}
                          </Badge>
                        ))}
                        {application.skills.length > 5 && (
                          <Badge variant="outline" className="bg-gray-50">
                            +{application.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-[#2E2883] border-[#2E2883] hover:bg-[#2E2883]/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        openApplicationDetail(application);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Application Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-2xl text-[#2E2883]">
                        {jobs[selectedApplication.jobId]?.title || 'Position'}
                      </DialogTitle>
                      <DialogDescription className="text-base mt-1">
                        {jobs[selectedApplication.jobId]?.company || 'Company'} • {jobs[selectedApplication.jobId]?.location || 'Location'}
                      </DialogDescription>
                    </div>
                    <Badge 
                      className={`text-sm px-3 py-1 ${statusStyles[selectedApplication.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {selectedApplication.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </DialogHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Application Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#2E2883] mb-3">Application Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Applied On</p>
                          <p className="text-gray-600">{formatDate(selectedApplication.appliedAt)}</p>
                        </div>
                      </div>
                      
                      {selectedApplication.matchScore > 0 && (
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Match Score</p>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={selectedApplication.matchScore} 
                                className="h-2 w-20" 
                              />
                              <span className="text-gray-600">{selectedApplication.matchScore}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedApplication.experience !== undefined && (
                        <div className="flex items-start">
                          <Briefcase className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Experience</p>
                            <p className="text-gray-600">
                              {selectedApplication.experience} {selectedApplication.experience === 1 ? 'year' : 'years'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedApplication.updatedAt && selectedApplication.updatedAt !== selectedApplication.appliedAt && (
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Last Updated</p>
                            <p className="text-gray-600">{formatDate(selectedApplication.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Skills Section */}
                  {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#2E2883] mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="bg-gray-50 py-1 px-3"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Resume Summary */}
                  {selectedApplication.summary && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#2E2883] mb-3">Resume Analysis</h3>
                      <div className="bg-[#2E2883]/5 rounded-lg p-4 text-gray-700">
                        <p>{selectedApplication.summary}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Job Description */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="job-description">
                      <AccordionTrigger className="text-lg font-semibold text-[#2E2883]">
                        Job Description
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                          <p>{jobs[selectedApplication.jobId]?.description || 'No job description available.'}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                
                <DialogFooter className="flex justify-between items-center mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    Close
                  </Button>
                  <div className="flex gap-3">
                    {selectedApplication.status === 'APPLIED' && (
                      <Button 
                        variant="outline" 
                        className="text-red-500 border-red-500 hover:bg-red-50"
                      >
                        Withdraw Application
                      </Button>
                    )}
                    <Button className="bg-[#2E2883] hover:bg-[#232069]">
                      Track Status
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}