"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from 'axios';
import toast from "react-hot-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  FileUp,
  AlertCircle,
  ChevronRight,
  X,
  Send,
  Loader2,
  UserCircle,
} from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TracingBeam } from "@/components/ui/tracing-beam";
import {  KeycloakTokenResponse } from '../../../context/types';
import { api } from '@/utils/api';
import { useNavigate } from "react-router-dom";
import { Candidate } from "@/pages/DashboardPages/CompanyDashboard/CandidatesList";
import { ca } from "date-fns/locale";

// Service URLs
const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

// Resume parsing response interface
interface ResumeParseResponse {
  content: string;
  summary: string;
  fileId?: string;
  fileName?: string;
  fileUrl?: string;
  expiresAfter?: string;
}

// Match score response interface
interface MatchScoreResponse {
  matchPercentage: number;
  fitSummary: string;
  skills: string[];
  yearsOfExperience: number;
}

// Job interface
interface Job {
  id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
  tenantId: number
}

// User Profile interface
interface UserProfile {
  userId: number;
  keycloakId: string;
  username: string | null;
  email: string;
  fullName: string;
  role: string;
  tenant?: {
    tenantId: number;
    tenantName: string;
    subscriptionPlanId: string;
    metadata: string;
    createdAt: string;
    updatedAt: string;
  };
  status: string;
  createdAt: string;
}

// Form schema
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(7, { message: "Please enter a valid phone number." }),
  coverLetter: z.string().optional(),
  resumeFileId: z.string().optional(),
  resumeFileUrl: z.string().optional(),
  resumeFileName: z.string().optional(),
  resumeFileExpiresAfter: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function JobApplicationForm() {
  const { jobId } = useParams<{ jobId: string }>();
  
  // States
  const [job, setJob] = useState<Job | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState<ResumeParseResponse | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<MatchScoreResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const navigate = useNavigate();
  const [token] = useState<KeycloakTokenResponse | null>(() => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          return JSON.parse(savedToken);
        } catch {
          return null;
        }
      }
      return null;
    });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      coverLetter: "",
      resumeFileId: "",
      resumeFileUrl: "",
      resumeFileName: "",
      resumeFileExpiresAfter: "",
    },
  });

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (jobId) {
        try {
          const response = await fetch(`${interviewServiceUrl}/api/jobs/${jobId}`);
          if (response.ok) {
            const jobData = await response.json();
              console.log(jobData);
            setJob(jobData);
          } else {
            toast.error("Failed to fetch job details");
          }
        } catch (error) {
          console.error('Error fetching job details:', error);
          toast.error('Failed to fetch job details');
        }
      }
    };

    // console.log(job.)

  

    fetchJobDetails();
    fetchUserProfile();
  }, [jobId]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    if(token){
    try {
      // For this implementation, we'll assume we're using the candidate profile API
      // In a real implementation, you would use the token and check the realm
      const response = await api.auth.getCandidateProfile(token);
      if (response.status === "active" ) {
        const profileData: UserProfile = response;
        setUserProfile(profileData);
        console.log("User Profile Data:", profileData);
        
        
        // Split fullName into firstName and lastName
        if (profileData.fullName) {
          const nameParts = profileData.fullName.split(' ');
          const firstName = nameParts[0] || '';
          // Join the rest as lastName to handle multiple last names
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Set form values when we move to step 2
          form.setValue('firstName', firstName);
          form.setValue('lastName', lastName);
          form.setValue('email', profileData.email || '');
          
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast.error('Failed to load your profile details');
    } finally {
      setIsLoadingProfile(false);
    }
  }
  };

  /**
   * Function to handle resume file upload and processing in the background
   * @param file The file to upload
   */
  const handleResumeUpload = async (file: File): Promise<void> => {
    if (!file) return;
    
    setResumeFile(file);
    setIsProcessingResume(true);
    setResumeError(null);
    
    try {
      // Loading indicator with optimistic message
      toast.loading("Processing your resume...");
      
      // First, upload the file to get a presigned URL
      const fileFormData = new FormData();
      fileFormData.append("file", file);
      
      const fileUploadResponse = await axios.post<{
        fileName: string;
        fileUrl: string;
        expiresAfter: string;
      }>(
        `${interviewServiceUrl}/api/files/upload`, 
        fileFormData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (fileUploadResponse.status !== 200) {
        throw new Error("Failed to upload resume file");
      }
      
      const fileData = fileUploadResponse.data;
      const resumeFileUrl = fileData.fileUrl;
      const resumeFileName = fileData.fileName;
      const expiresAfter = fileData.expiresAfter || "7 days";
      
      // Use the upload-and-summarize endpoint with the file
      const formData = new FormData();
      formData.append("file", file);
      
      interface DocumentResponse {
        content: string;
        summary: string;
        fileId?: string;
        fileName?: string;
      }
      
      const response = await axios.post<DocumentResponse>(
        `${interviewServiceUrl}/api/documents/upload-and-summarize`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.status === 200) {
        // Store resume data (but don't display it)
        const parsedContent = response.data.content || "";
        const summary = response.data.summary || "";
        const fileId = response.data.fileId || "";
        
        // Set form values for submission
        form.setValue("resumeFileId", fileId);
        form.setValue("resumeFileUrl", resumeFileUrl);
        form.setValue("resumeFileName", resumeFileName);
        form.setValue("resumeFileExpiresAfter", expiresAfter);
        
        setParsedResumeData({
          content: parsedContent,
          summary: summary,
          fileId: fileId,
          fileName: resumeFileName,
          fileUrl: resumeFileUrl,
          expiresAfter: expiresAfter
        });
        
        // If job description exists, calculate match score in the background
        if (job && job.description) {
          await calculateMatchScore(parsedContent, job.description);
          await handleResumeCandidateUpload(resumeFileUrl);
        }
        
        // Dismiss loading toast and show success
        toast.dismiss();
        toast.success("Resume processed successfully");
      }
    } catch (error: unknown) {
      toast.dismiss();
      console.error("Error processing resume:", error);
      
      if (error instanceof Error) {
        setResumeError(error.message || "Failed to process resume. Please try again.");
      } else {
        setResumeError("Failed to process resume. Please try again.");
      }
      
      toast.error("Failed to process resume");
    } finally {
      setIsProcessingResume(false);
    }
  };
  const handleResumeCandidateUpload=async(resumeFileUrl:string)=>{
    if(!resumeFileUrl) return;
    try {
      if (!userProfile) {
        toast.error("User profile not loaded");
        return;
      }
      // Try to fetch candidate by email, fallback to userId if needed
      let resp= await axios.get(`${interviewServiceUrl}/api/candidates/email/${encodeURIComponent(userProfile.email)}`);
      
      const candidateData = resp.data;
      if (!candidateData) {
        toast.error("Candidate not found");
        return;
      }
      const candidateUpdatePayload = {
        ...candidateData,
        resumeFileUrl: parsedResumeData?.fileUrl || resumeFileUrl,
        resumeFileName: parsedResumeData?.fileName || "",
        resumeFileExpiresAfter: parsedResumeData?.expiresAfter || "7 days",
        resumeFileId: parsedResumeData?.fileId || ""
      };
      console.log("Candidate Update Payload:", candidateUpdatePayload);
      await axios.put(
        `${interviewServiceUrl}/api/candidates/${candidateData.id}`,
        candidateUpdatePayload,
        {
          headers: {
        'Content-Type': 'application/json'
          }
        }
      );
  }
  catch (error) {
      console.error("Error updating candidate profile:", error);
      toast.error("Failed to update candidate profile");
    }
}
  /**
   * 
   * Calculate match score between resume and job description (in background)
   */
  const calculateMatchScore = async (resume: string, jobDescription: string) => {
    try {
      const response = await axios.post<MatchScoreResponse>(
        `${interviewServiceUrl}/api/documents/calculate-match-score`,
        {
          resume: resume,
          jobDescription: jobDescription
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        // Store match score data but don't display it
        setMatchScore(response.data);
        
        
      }
    }
    catch (error) {
      console.error("Error calculating match score:", error);
      // Don't show error to user since it's a background process
    }
  };

  /**
   * Handle form submission to create job application
   */
  const onSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (!jobId || !parsedResumeData) {
        toast.error("Missing job or resume data");
        return;
      }
      
      
      // Create candidate ID (in real app this would be handled by backend)
      const formattedJobId = jobId.includes('-') ? jobId : 
            jobId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
      
      
      // Prepare application data
      const applicationData = {
        userId: userProfile?.userId || 0,
        candidateName: `${form.getValues('firstName')} ${form.getValues('lastName')}`,
        candidateEmail: form.getValues('email'),
        jobId: formattedJobId,
        mobileNumber: form.getValues('phone'),
        status: "APPLIED",
        appliedAt: new Date().toISOString().replace('Z', ''), // Remove 'Z' to match ISO format for LocalDateTime
        updatedAt: new Date().toISOString().replace('Z', ''),
        matchScore: matchScore?.matchPercentage || 0,
        experience: matchScore?.yearsOfExperience || 0,
        skills: matchScore?.skills || [],
        summary: matchScore?.fitSummary,
        tenantId: job?.tenantId
      };

      console.log("Application Data:", applicationData);
      
      const response = await axios.post(
        `${interviewServiceUrl}/api/job-applications`,
        applicationData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 201 || response.status === 200) {
        toast.success("Application submitted successfully");
        navigate(`/candidate/home`);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Validate if we can move to the next step
  const canProceedToNextStep = () => {
    if (step === 1) {
      return parsedResumeData !== null && !isProcessingResume;
    }
    return true;
  };

  // Handle moving to the next step
  const handleNextStep = async () => {
    if (step === 1) {
      if (canProceedToNextStep()) {
        setStep(2);
        
        // If we have user profile data, prefill the form fields
        if (userProfile) {
          const nameParts = userProfile.fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          form.setValue('firstName', firstName);
          form.setValue('lastName', lastName);
          form.setValue('email', userProfile.email || '');
          
          // Note: Phone is not in userProfile so we leave it blank
          // or it could be prefilled from another source if available
        }
      } else {
        toast.error("Please upload and process your resume first");
      }
    } else if (step === 2) {
      const valid = await form.trigger(["firstName", "lastName", "email", "phone"]);
      if (valid) {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white">
      <BackgroundBeams />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="relative z-10 flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4 text-[#2E2883]" />
            <a href="/jobs" className="text-[#2E2883] hover:underline text-md">
              Back to Jobs
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left sidebar - Job details */}
            <div className="lg:col-span-1">
              <TracingBeam>
                <Card className="border-none shadow-lg bg-white backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#2E2883]">Apply for Position</CardTitle>
                    {job && (
                      <div className="mt-4">
                        <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                            {job.department}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                            {job.location}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                            {job.employmentType}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User profile info */}
                    {userProfile && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center space-x-3">
                        <UserCircle className="w-8 h-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium text-blue-900">Applying as</h3>
                          <p className="text-blue-700">{userProfile.fullName}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Progress Steps */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-full flex items-center">
                          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-[#2E2883]' : 'bg-gray-200'}`}></div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#2E2883] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-[#2E2883]' : 'bg-gray-200'}`}></div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#2E2883] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Resume</span>
                        <span>Personal Info</span>
                      </div>
                    </div>

                    {/* Job Description */}
                    {job && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[300px] overflow-y-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-line">{job.description}</p>
                          </div>
                        </div>
                        
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-indigo-900">Application Tips</h3>
                              <ul className="text-sm text-indigo-700 mt-2 space-y-2">
                                <li>• Upload a well-formatted resume</li>
                                <li>• Complete all required fields</li>
                                <li>• Include a brief cover letter if desired</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TracingBeam>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-lg bg-white backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#2E2883] text-3xl">
                      {step === 1 ? "Resume Upload" : "Personal Information"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form className="space-y-6 text-black" onSubmit={(e) => e.preventDefault()}>
                      {/* Step 1: Resume Upload */}
                      {step === 1 && (
                        <div className="space-y-6">
                          {/* Resume Upload Section */}
                          <div className="mb-6">
                            <FormLabel className="text-gray-700 font-medium text-md">Upload Your Resume <span className="text-red-500">*</span></FormLabel>
                            <p className="text-sm text-gray-500 mb-3">
                              Please upload your resume in PDF, DOCX, or TXT format
                            </p>
                            <div className="mt-2">
                              <div className="flex items-center justify-center w-full">
                                <label
                                  htmlFor="resume-upload"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PDF, DOCX or TXT (MAX. 10MB)</p>
                                  </div>
                                  <input
                                    id="resume-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleResumeUpload(e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                            
                            {/* Resume Status Display */}
                            {resumeFile && (
                              <div className="mt-3">
                                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700">{resumeFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                  
                                  {isProcessingResume ? (
                                    <div className="flex items-center text-blue-600">
                                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                      <span className="text-xs">Processing...</span>
                                    </div>
                                  ) : parsedResumeData ? (
                                    <Badge className="bg-green-100 text-green-800">Processed</Badge>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setResumeFile(null);
                                        setParsedResumeData(null);
                                        setMatchScore(null);
                                      }}
                                      className="text-red-500 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {resumeError && (
                              <div className="mt-2 flex items-center p-2 bg-red-50 rounded text-red-700 text-sm">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {resumeError}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end mt-6">
                            <Button
                              type="button"
                              onClick={handleNextStep}
                              disabled={!canProceedToNextStep()}
                              className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white font-medium py-2 px-4 rounded-lg flex items-center"
                            >
                              Continue to Personal Info
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Personal Information (with prefilled data) */}
                      {step === 2 && (
                        <div className="space-y-6">
                          {isLoadingProfile ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                              <span>Loading your profile information...</span>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="firstName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700 font-medium">First Name <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter your first name" className="bg-white/90 text-gray-800" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="lastName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700 font-medium">Last Name <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter your last name" className="bg-white/90 text-gray-800" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700 font-medium">Email <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="email" 
                                          placeholder="your.email@example.com" 
                                          className="bg-white/90 text-gray-800" 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700 font-medium">Phone <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input placeholder="(123) 456-7890" className="bg-white/90 text-gray-800" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={form.control}
                                name="coverLetter"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Cover Letter (Optional)</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Write a brief cover letter explaining why you're interested in this position..." 
                                        className="min-h-[150px] bg-white/90 text-gray-800" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              {/* Application Summary (simplified) */}
                              <div className="bg-blue-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">Application Summary</h3>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Position:</span>
                                    <span className="font-medium text-gray-900">{job?.title}</span>
                                  </div>
                                  <Separator className="bg-blue-200" />
                                  
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Resume:</span>
                                    <span className="font-medium text-gray-900">
                                      {parsedResumeData?.fileName || "Uploaded"}
                                    </span>
                                  </div>
                                  <Separator className="bg-blue-200" />
                                  
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Applicant:</span>
                                    <span className="font-medium text-gray-900">
                                      {form.getValues('firstName')} {form.getValues('lastName')}
                                    </span>
                                  </div>
                                  <Separator className="bg-blue-200" />
                                </div>
                              </div>
                              
                              <div className="flex justify-between mt-6">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setStep(1)}
                                  className="bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
                                >
                                  <ArrowLeft className="mr-2 h-4 w-4" />
                                  Back
                                </Button>
                                <Button
                                  type="button"
                                  onClick={handleNextStep}
                                  disabled={isSubmitting}
                                  className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white font-medium py-2 px-4 rounded-lg flex items-center"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      Submit Application
                                      <Send className="ml-2 h-4 w-4" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}