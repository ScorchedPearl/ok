import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import axios from 'axios';
import TimeSelector from "./TimeSelector";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";


import {
  ArrowLeft,
  Calendar as CalendarIcon,
  HelpCircle,
  Plus,
  X,
  Send,
  Users,
  FileUp,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TracingBeam } from "@/components/ui/tracing-beam";
import toast from "react-hot-toast";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


// ----------------- Invitation Email Templates -----------------
const defaultEmailTemplates = {
  interviewer: `Subject: Interview Invitation for {position} - {round} Interview

Dear {interviewer},

We are pleased to invite you to conduct an interview with {candidate} for the {position} position.

Interview Details:
- Interview Round: {round}
- Date: {date}
- Time: {time}
- Mode: {mode}

Please review the candidate's resume attached and prepare your questions. Kindly confirm your availability.

`,
  candidate: `Subject: Interview Invitation for {position} Position

Dear {candidate},

Thank you for applying for the {position} position at our company. We are excited to invite you to the next stage of our interview process.

Interview Details:
- Interview Round: {round}
- Date: {date}
- Time: {time}
- Mode: {mode}

Please let us know if you require any accommodations or have any questions.

Best regards,
HR Team,`,
};

// ----------------- Zod Schema -----------------
// ----------------- Zod Schema -----------------
const formSchema = z.object({
  candidateName: z.string().min(2, { message: "Candidate name must be at least 2 characters." }),
  candidateEmail: z.string().email({ message: "Please enter a valid email address." }),
  position: z.string().min(1, { message: "Please specify the position." }),
  department: z.string().min(1, { message: "Please specify the department." }),
  interviewRound: z.string().min(1, { message: "Please select an interview round." }),
  interviewers: z
    .array(
      z.object({
        userId: z.string().min(1, { message: "Please select an interviewer." }),
        name: z.string().min(2, { message: "Interviewer name must be at least 2 characters." }),
        email: z.string().email({ message: "Please enter a valid email address." }),
      })
    )
    .min(1, { message: "Please add at least one interviewer." }),
  date: z.date({ required_error: "Please select a date." }),
  time: z.string().min(1, { message: "Please select a time." }),
  interviewMode: z.string().min(1, { message: "Please select an interview mode." }),
  interviewerEmailContent: z.string().min(1, { message: "Please enter email content for interviewers." }),
  candidateEmailContent: z.string().min(1, { message: "Please enter email content for the candidate." }),
  jobId: z.string().min(1, { message: "Job selection is required" }),
  manualFeedbackQuestions: z
    .array(z.object({ question: z.string().min(1, { message: "Question cannot be empty" }) }))
    .optional(),
  resumeFile: z.any().optional(),
  resumeFileId: z.string().optional(),
  resumeFileUrl: z.string().optional(),
  resumeFileName: z.string().optional(),
  resumeFileExpiresAfter: z.string().optional(),
});

interface FormValues {
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  interviewRound: string;
  interviewers: { 
    userId: string;
    name: string; 
    email: string;
    role: string;
  }[];
  date: Date;
  time: string;
  interviewMode: string;
  resumeFileId?: string;
  resumeFileUrl?: string;
  resumeFileName?: string;
  resumeFileExpiresAfter?: string;
  interviewerEmailContent: string;
  candidateEmailContent: string;
  jobId: string;
  manualFeedbackQuestions?: { question: string }[];
  resumeFile?: File;
}

// Resume parsing response interface
interface ResumeParseResponse {
  content: string;
  summary: string;
  fileId?: string;
  fileName?: string;
  fileUrl?: string;
  expiresAfter?: string;
  isStreaming?: boolean;
}


interface Job {
  id: number;
  jobId: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  recruiterId: string;
  testId: null | string;
  createdAt: string;
  updatedAt: string;
}

interface ApiInterviewer {
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

// ----------------- Import Feedback Templates -----------------
// data.json exports an object with a "professions" array.
// Each profession contains its feedbackTemplates.
import feedbackData from "./data.json";
import { useAuth } from "@/context/AuthContext";
console.log("feedbackData", feedbackData);

interface FeedbackTemplate {
  id: string;
  name: string;
  fields: {
    name: string;
    label: string;
    icon: string;
    type: string;
    placeholder: string;
    validation: {
      minLength: number;
      message: string;
    };
  }[];
  subject?: string;
  body?: string;
}

interface ProfessionFeedback {
  profession: string;
  feedbackTemplates: FeedbackTemplate[];
}
const professions: ProfessionFeedback[] = feedbackData.professions;


export default function InterviewScheduler() {
  const { jobId: urlJobId } = useParams();
  
  const {token} = useAuth();
  // console.log(token);
  
  
  // Stepper state: Step 1, 2, and 3
  const [step, setStep] = useState(0);
  // Allow multiple feedback templates (manual selection).
  const [selectedFeedbackTemplates, setSelectedFeedbackTemplates] = useState<FeedbackTemplate[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<string>(
    professions.length > 0 ? professions[0].profession : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateEmails, setCandidateEmails] = useState<string[]>([""]);
  const [previewTemplate, setPreviewTemplate] = useState<FeedbackTemplate | null>(null);

  // New state for feedback method. Options: "template", "ai", "manual"
  const [feedbackMethod, setFeedbackMethod] = useState<"template" | "ai" | "manual">("template");
  const [jobDetails, setJobDetails] = useState<Job | null>(null);

  const [apiInterviewers, setApiInterviewers] = useState<ApiInterviewer[]>([]);
  // New state for jobs list
  const [jobs, setJobs] = useState<Job[]>([]);
  
  // New state for resume file handling
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState<ResumeParseResponse | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const {  user } = useAuth();
  const tenantId = user?.tenant?.tenantId;

  // Add new state for candidates
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [showAddNewCandidate, setShowAddNewCandidate] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    // Populate form fields with candidate data
    form.setValue("candidateName", candidate.fullName);
    form.setValue("candidateEmail", candidate.email);
    console.log("Selected candidate:", candidate);
    // If candidate has resume data, populate that as well
    if (candidate.resumeFileUrl) {
      setParsedResumeData({
        content: candidate.resumeContent || "",
        summary: candidate.resumeSummary || "",
        fileUrl: candidate.resumeFileUrl,
        fileName: candidate.resumeFileUrl.split('/').pop() || "",
        expiresAfter: "7 days"
      });
      console.log("Parsed resume data:", parsedResumeData);
      
      form.setValue("resumeFileUrl", candidate.resumeFileUrl);
      form.setValue("resumeFileName", candidate.resumeFileUrl.split('/').pop() || "");
    }
    
    // Move to step 1
    setStep(1);
  };
  
  // Add this component for the candidate selection list (Step 0)
  const CandidateSelectionStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Select a Candidate</h3>
        <Button
          onClick={() => setShowAddNewCandidate(true)}
          className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Candidate
        </Button>
      </div>
      
      {isLoadingCandidates ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {candidates.map((candidate) => (
            <div 
              key={candidate.id}
              onClick={() => handleCandidateSelect(candidate)}
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
          <Button
            onClick={() => setShowAddNewCandidate(true)}
            className="mt-4 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Candidate
          </Button>
        </div>
      )}
    </div>
  );

  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateName: "",
      candidateEmail: "",
      position: "",
      department: "",
      resumeFileId: "",
      resumeFileUrl: "",
      resumeFileName: "",
      resumeFileExpiresAfter: "",
      interviewRound: "",
      interviewers: [{ userId: "", name: "", email: "", role: "" }],
      date: new Date(),
      time: "",
      interviewMode: "",
      interviewerEmailContent: defaultEmailTemplates.interviewer,
      candidateEmailContent: defaultEmailTemplates.candidate,
      jobId: "",
      manualFeedbackQuestions: [],
    },
  });

  interface Candidate {
    id: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    resumeFileUrl?: string;
    resumeContent?: string;
    resumeSummary?: string;
    candidateJobs?: any[];
  }

  const { fields: interviewerFields, append, remove } = useFieldArray({
    control: form.control,
    name: "interviewers",
  });

  // New field array for manual feedback questions.
  const { fields: manualQuestionFields, append: appendManualQuestion, remove: removeManualQuestion } = useFieldArray({
    control: form.control,
    name: "manualFeedbackQuestions",
  });

  const watchedCandidateName = useWatch({ control: form.control, name: "candidateName" });
  const watchedPosition = useWatch({ control: form.control, name: "position" });
  const watchedRound = useWatch({ control: form.control, name: "interviewRound" });
  const watchedDate = useWatch({ control: form.control, name: "date" });
  const watchedTime = useWatch({ control: form.control, name: "time" });
  const watchedMode = useWatch({ control: form.control, name: "interviewMode" });
  const watchedManualQuestions = useWatch({ control: form.control, name: "manualFeedbackQuestions" });

  // Function to handle resume file upload and parsing with upload-and-summarize endpoint
/**
 * Function to handle resume file upload and processing
 * @param file The file to upload
 */
const handleResumeUpload = async (file: File): Promise<void> => {
  if (!file) return;
  
  setResumeFile(file);
  setIsParsingResume(true);
  setResumeError(null);
  
  try {
    // First, upload the file to get a presigned URL with 7-day expiration
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
    const expiresAfter = fileData.expiresAfter || "7 days"; // Changed from "21 weeks" to "7 days"

    console.log("resumeFileUrl", resumeFileUrl);
    
    // Now use the upload-and-summarize endpoint with the file URL
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
      // The API endpoint returns fileId, fileName, content, and summary
      const parsedContent = response.data.content || "";
      const summary = response.data.summary || "";
      const fileId = response.data.fileId || "";
      
      // Store the file ID and URL for future reference when submitting the form
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
      
      toast.success("Resume parsed and uploaded successfully");
    }
  } catch (error: unknown) {
    console.error("Error processing resume:", error);
    
    // Handle error more specifically with type checking
    if (error instanceof Error) {
      setResumeError(error.message || "Failed to process resume. Please try again.");
    } else {
      setResumeError("Failed to process resume. Please try again.");
    }
    
    toast.error("Failed to process resume");
  } finally {
    setIsParsingResume(false);
  } 
};

const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8005';
  
  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const response = await axios.get(`${authServiceUrl}/tenant/users/role/INTERVIEWER`, {
          headers: {
            Authorization: `Bearer ${token?.access_token}`
          }
        });

        
        setApiInterviewers(response.data);
        console.log("response interviewerss.",response.data);
      } catch (error) {
        console.error('Error fetching interviewers:', error);
        toast.error('Failed to fetch interviewers');
      }
    };

    fetchInterviewers();
  }, []);

  // Add this useEffect to fetch the candidates
useEffect(() => {
  const fetchCandidates = async () => {
    if (!tenantId) return;
    
    setIsLoadingCandidates(true);
    try {
      const response = await axios.get(
        `${interviewServiceUrl}/api/tenant-candidates/tenants/${tenantId}/candidates`,
        {
          headers: {
            Authorization: `Bearer ${token?.access_token}`
          }
        }
      );
      console.log("response candidates", response.data);
      setCandidates(response.data);
      console.log("Candidates loaded:", response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  fetchCandidates();
}, [tenantId, token]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (urlJobId) {
        try {
          const response = await fetch(`${interviewServiceUrl}/api/jobs/${urlJobId}`);
          if (response.ok) {
            const job = await response.json();
            // Pre-fill the form with job details
            form.setValue("jobId", job.id.toString());
            form.setValue("position", job.title);
            form.setValue("department", job.department);
            setJobDetails(job);
            console.log(job);
          }
        } catch (error) {
          console.error('Error fetching job details:', error);
          toast.error('Failed to fetch job details');
        }
      }
    };

    fetchJobDetails();
  }, [urlJobId, form]);

  const JobSelectionSection = () => {
    if (urlJobId) {
      // If jobId is provided, show the selected job without dropdown
      const selectedJob = jobs.find(job => job.id.toString() === form.getValues("jobId"));
      return (
        <div className="mb-6">
          <FormField
            control={form.control}
            name="jobId"
            render={() => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium text-md">
                  Selected Job
                </FormLabel>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-medium">{selectedJob?.title}</p>
                  <p className="text-gray-600 text-sm">{selectedJob?.department}</p>
                </div>
              </FormItem>
            )}
          />
        </div>
      );
    }

    // If no jobId provided, show the dropdown to select from all jobs
    return (
      <div className="mb-6">
        <FormField
          control={form.control}
          name="jobId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium text-md">
                Select Job: <span className="text-red-500">*</span>
              </FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  const selectedJob = jobs.find(job => job.id.toString() === value);
                  if (selectedJob) {
                    form.setValue("position", selectedJob.title);
                    form.setValue("department", selectedJob.department);
                    setJobDetails(selectedJob);
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" className="text-black" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title} - {job.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  };

  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

  // Fetch all jobs for the dropdown
  useEffect(() => {
    fetch(`${interviewServiceUrl}/api/jobs`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch jobs');
        return res.json();
      })
      .then((data: Job[]) => {
        setJobs(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Update invitation email content dynamically.
  useEffect(() => {
    const newInterviewerContent = defaultEmailTemplates.interviewer
      .replace("{candidate}", watchedCandidateName || "{candidate}")
      .replace("{position}", watchedPosition || "{position}")
      .replace("{round}", watchedRound || "{round}")
      .replace("{date}", watchedDate ? format(watchedDate, "PPP") : "{date}")
      .replace("{time}", watchedTime || "{time}")
      .replace("{mode}", watchedMode || "{mode}");
    form.setValue("interviewerEmailContent", newInterviewerContent);

    const newCandidateContent = defaultEmailTemplates.candidate
      .replace("{candidate}", watchedCandidateName || "{candidate}")
      .replace("{position}", watchedPosition || "{position}")
      .replace("{round}", watchedRound || "{round}")
      .replace("{date}", watchedDate ? format(watchedDate, "PPP") : "{date}")
      .replace("{time}", watchedTime || "{time}")
      .replace("{mode}", watchedMode || "{mode}");
    form.setValue("candidateEmailContent", newCandidateContent);
  }, [watchedCandidateName, watchedPosition, watchedRound, watchedDate, watchedTime, watchedMode, form]);

  // Helper function to convert interview round to a number.
  function convertRound(round: string): number {
    switch (round.toLowerCase()) {
      case "screening":
        return 1;
      case "technical":
        return 2;
      case "system-design":
        return 3;
      case "behavioral":
        return 4;
      case "manager":
        return 5;
      case "hr":
        return 6;
      default:
        return 1;
    }
  }

  // Validate Step 1 fields before proceeding.
  async function handleNextFromStep1() {
    const jobId = form.getValues("jobId");
    if (!jobId) {
      toast.error("Please select a Job");
      return;
    }

    const valid = await form.trigger([
      "jobId",
      "candidateName",
      "candidateEmail",
      "position",
      "department",
    ]);
    
    if (valid) {
      setStep(2);
    } else {
      toast.error("Please complete all required fields before proceeding.");
    }
  }

  // Validate Step 2 fields before proceeding.
  async function handleNextFromStep2() {
    const valid = await form.trigger([
      "interviewRound",
      "interviewMode",
      "date",
      "time",
      // "interviewers",
    ]);
    
    if (valid) {
      setStep(3);
    } else {
      toast.error("Please complete all required fields before proceeding.");
    }
  }

  // Toggle feedback template selection (manual selection).
  function toggleFeedbackTemplate(template: FeedbackTemplate) {
    setSelectedFeedbackTemplates((current) => {
      if (current.some((t) => t.id === template.id)) {
        return current.filter((t) => t.id !== template.id);
      } else {
        return [...current, template];
      }
    });
  }

async function onSubmit(values: FormValues): Promise<void> {
  setIsSubmitting(true);
  try {
    const interviewDate = new Date(values.date);
    const [hours, minutes] = values.time.split(":");
    interviewDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    const transformedInterviewers = values.interviewers.map(interviewer => ({
      userId: parseInt(interviewer.userId),
      name: interviewer.name,
      email: interviewer.email,
    }));

    // Build payload dynamically based on the selected feedback method
    const payload: any = {
      candidateId: selectedCandidate?.id || 1, // Use selected candidate ID or default to 1
      candidateEmail: selectedCandidate?.email || candidateEmails[0],
      position: values.position,
      tenantId: tenantId,
      roundNumber: convertRound(values.interviewRound),
      interviewDate: interviewDate.toISOString(),
      mode: values.interviewMode.toUpperCase(),
      meetingLink: "",
      interviewerEmailContent: values.interviewerEmailContent,
      candidateEmailContent: values.candidateEmailContent,
      interviewers: transformedInterviewers,
      feedbackMethod: feedbackMethod,
      jobId: jobDetails?.id
    };

    // Add resume data if available
    if (parsedResumeData) {
      payload.resumeContent = parsedResumeData.content;
      payload.resumeSummary = parsedResumeData.summary;
      payload.resumeFileUrl = parsedResumeData.fileUrl;
      payload.resumeFileName = parsedResumeData.fileName;
      payload.resumeFileExpiresAfter = parsedResumeData.expiresAfter;
    }

    if (feedbackMethod === "template") {
      // Create a wrapper object with the desired structure
      const wrappedTemplate = {
        feedbackTemplates: selectedFeedbackTemplates.map(template => ({
          id: template.id,
          name: template.name,
          fields: template.fields
        }))
      };
      
      // The server expects a List<String>, so we wrap it in an array
      payload.feedbackTemplates = [JSON.stringify(wrappedTemplate)];
      
      // Log what we're sending for debugging
      console.log("Sending templates:", payload.feedbackTemplates);
    } else if (feedbackMethod === "manual") {
      payload.manualFeedbackQuestions =
        values.manualFeedbackQuestions && values.manualFeedbackQuestions.length > 0
          ? values.manualFeedbackQuestions.map((q) => q.question)
          : [];
    } else if (feedbackMethod === "ai" && jobDetails) {
      payload.aiPrompt = jobDetails.description;
    }

    console.log("payload", payload);

    const response = await fetch(`${interviewServiceUrl}/api/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to create interview");
    }
    const data = await response.json();
    console.log("Interview created:", data);
    toast.success("Interview scheduled successfully");
    form.reset();
    setSelectedFeedbackTemplates([]);
    // navigate("/job/interviews/interviews-page");
    setStep(1);
  } catch (error: any) {
    console.error("Error scheduling interview:", error);
    toast.error(error.message || "Failed to schedule interview");
  } finally {
    setIsSubmitting(false);
  }
}

  // Get feedback templates for the selected profession.
  const availableTemplates =
    professions.find((p) => p.profession === selectedProfession)?.feedbackTemplates || [];

  // When the profession changes, clear the previously selected feedback templates.
  useEffect(() => {
    setSelectedFeedbackTemplates([]);
  }, [selectedProfession]);

  // Helper to determine if the feedback selection is valid.
  const feedbackValid =
    feedbackMethod === "template"
      ? selectedFeedbackTemplates.length > 0
      : feedbackMethod === "manual"
      ? watchedManualQuestions &&
        watchedManualQuestions.length > 0 &&
        !watchedManualQuestions.some((q: any) => !q.question.trim())
      : true;

  // Get step title based on current step
  // Get step title based on current step
const getStepTitle = () => {
  switch (step) {
    case 0:
      return "Select Candidate";
    case 1:
      return "Candidate & Resume Details";
    case 2:
      return "Interview Settings";
    case 3:
      return "Feedback Configuration";
    default:
      return "";
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
            <a href="/dashboard/jobs" className="text-[#2E2883] hover:underline text-md">
              View all Jobs
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <TracingBeam>
                <Card className="border-none shadow-lg bg-white backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#2E2883]">Schedule Interview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress Steps */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-full flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 0 ? 'bg-[#2E2883] text-white' : 'bg-gray-200 text-gray-500'}`}>0</div>
                          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-[#2E2883]' : 'bg-gray-200'}`}></div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#2E2883] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-[#2E2883]' : 'bg-gray-200'}`}></div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#2E2883] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                          <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-[#2E2883]' : 'bg-gray-200'}`}></div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#2E2883] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Candidate</span>
                        <span>Details</span>
                        <span>Interview</span>
                        <span>Feedback</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-[#2E2883] text-white">
                          Quick Tips
                        </Badge>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-blue-900">Before scheduling</h3>
                            <ul className="text-sm text-blue-700 mt-2 space-y-2">
                              <li>• Confirm interviewer availability</li>
                              <li>• Check time zone differences</li>
                              <li>• Prepare interview materials</li>
                              <li>• Review candidate prerequisites</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-purple-900">Automated Notifications</h3>
                            <p className="text-sm text-purple-700 mt-1">
                              All participants will receive calendar invites and email confirmations automatically.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileUp className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-green-900">Resume Upload</h3>
                            <p className="text-sm text-green-700 mt-1">
                              Upload the candidate's resume to automatically parse key information and share with interviewers.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TracingBeam>
            </div>

            <div className="lg:col-span-2">
              <Card className="border-none shadow-lg bg-white backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#2E2883] text-3xl pb-5">
                      {getStepTitle()}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    {/* Step 0: Candidate Selection */}
                    {step === 0 && !showAddNewCandidate && (
                      <CandidateSelectionStep />
                    )}

                    {/* Show Step 1 if we're on step 1, OR if we're on step 0 and showAddNewCandidate is true */}
                    {(step === 1 || (step === 0 && showAddNewCandidate)) && (
                      <form className="space-y-6 text-black" onSubmit={(e) => e.preventDefault()}>
                        {/* Add a "Back to candidates" button when coming from Add New Candidate */}
                        {step === 0 && showAddNewCandidate && (
                          <div className="mb-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowAddNewCandidate(false)}
                              className="bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
                            >
                              <ChevronLeft className="mr-2 h-4 w-4" />
                              Back to candidates
                            </Button>
                          </div>
                        )}
                        
                        {/* Job Selection at the top */}
                        <JobSelectionSection />

                        {/* Existing Step 1 content remains the same */}
                        {/* Resume Upload Section */}
                        <div className="mb-6">
                          <FormLabel className="text-gray-700 font-medium text-md">Upload Resume</FormLabel>
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
                                
                                {isParsingResume ? (
                                  <div className="flex items-center text-blue-600">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-xs">Parsing...</span>
                                  </div>
                                ) : parsedResumeData ? (
                                  <Badge className="bg-green-100 text-green-800">Parsed</Badge>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setResumeFile(null);
                                      setParsedResumeData(null);
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
                          
                          {parsedResumeData && parsedResumeData.fileUrl && (
  <div className="mt-3 p-3 bg-green-50 rounded-md">
    <h4 className="font-medium text-green-800 mb-1">Resume Successfully Uploaded</h4>
    <p className="text-xs text-green-700 mb-2">
      Resume content and summary will be included with the interview details.
    </p>
    <div className="bg-white p-2 rounded border border-green-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">Resume Access Link:</span>
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
          Expires in {parsedResumeData.expiresAfter || "21 weeks"}
        </Badge>
      </div>
      <div className="flex items-center">
        <input
          type="text"
          readOnly
          value={parsedResumeData.fileUrl}
          className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded py-1 px-2 flex-1 mr-2"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs text-blue-600 border-blue-200"
          onClick={() => {
            navigator.clipboard.writeText(parsedResumeData.fileUrl || "");
            toast.success("Resume link copied to clipboard");
          }}
        >
          Copy
        </Button>
      </div>
    </div>
  </div>
)}
                        </div>

                        {/* Resume Summary Section */}
                        {parsedResumeData && (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-800">Resume Summary</h3>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-xs flex items-center"
        onClick={async () => {
          
          try {
            setIsParsingResume(true);
            // Clear the summary first to show the streaming effect
            setParsedResumeData({
              ...parsedResumeData,
              summary: "",
              isStreaming: true // Add a flag for streaming state
            });
            
            
            const response = await axios.post(
              `${interviewServiceUrl}/api/documents/summarize`,
              { content: parsedResumeData.content },
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (response.status === 200) {
              // Start the streaming effect with the new summary
              const fullSummary = response.data.summary;
              let currentText = "";
              
              // Simulate streaming effect word by word
              const words = fullSummary.split(" ");
              const streamingInterval = setInterval(() => {
                if (words.length > 0) {
                  currentText += words.shift() + " ";
                  setParsedResumeData(prev => prev ? {
                    content: prev.content,
                    summary: currentText,
                    isStreaming: prev.isStreaming
                  } : null);
                } else {
                  clearInterval(streamingInterval);
                  setParsedResumeData(prev => prev ? {
                    content: prev.content,
                    summary: prev.summary,
                    isStreaming: false
                  } : null);
                  toast.success("Resume summary regenerated");
                }
              }, 50); // Adjust speed - lower is faster
            }
          } catch (error) {
            console.error("Error regenerating summary:", error);
            toast.error("Failed to regenerate summary");
            setParsedResumeData(prev => prev ? {
              content: prev.content,
              summary: prev.summary,
              isStreaming: false
            } : null);
          } finally {
            setIsParsingResume(false);
          }
        }}
        disabled={isParsingResume || parsedResumeData.isStreaming}
      >
        {isParsingResume ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : parsedResumeData.isStreaming ? (
          <>
            <span className="inline-block w-3 h-3 mr-2 bg-indigo-500 rounded-full animate-pulse"></span>
            Streaming...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate Summary with AI
          </>
        )}
      </Button>
    </div>
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="min-h-[100px]">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {parsedResumeData.summary}
            {parsedResumeData.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-gray-700 animate-blink"></span>
            )}
          </p>
        </div>
        <div className="flex justify-end mt-4 border-t border-gray-200 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              // Create a download for the full resume content
              const blob = new Blob([parsedResumeData.content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'resume_content.txt';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            View Full Content
          </Button>
        </div>
      </div>
    </div>
  </div>
)}


                        {/* SWOT Analysis Section */}
                        

                        {/* Candidate Name and Email */}
                        <FormField
                          control={form.control}
                          name="candidateName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium text-md">Candidate Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter candidate name" className="bg-white/90 text-gray-800" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-4">
                          <FormLabel className="text-gray-700 font-medium text-md">Candidate Email</FormLabel>
                          <FormField
                            control={form.control}
                            name="candidateEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="candidate@example.com"
                                    className="bg-white/90 text-gray-800"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end mt-6">
                          <Button
                            type="button"
                            onClick={handleNextFromStep1}
                            className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white font-medium py-2 px-4 rounded-lg flex items-center"
                          >
                            Next Step
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Step 2: Interview Settings */}
                    {step === 2 && (
                      <form className="space-y-6 text-black" onSubmit={(e) => e.preventDefault()}>
                        {/* Interview Settings */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="interviewRound"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium text-md">Interview Round</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white/90 text-gray-600">
                                        <SelectValue placeholder="Select round" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="screening">Initial Screening</SelectItem>
                                      <SelectItem value="technical">Technical</SelectItem>
                                      <SelectItem value="system-design">System Design</SelectItem>
                                      <SelectItem value="behavioral">Behavioral</SelectItem>
                                      <SelectItem value="manager">Manager</SelectItem>
                                      <SelectItem value="hr">HR Final</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="interviewMode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 font-medium text-md">Mode</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white/90 text-gray-600">
                                        <SelectValue placeholder="Select mode" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="VIRTUAL">Virtual</SelectItem>
                                      <SelectItem value="ON_SITE">On-site</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField
    control={form.control}
    name="date"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-gray-700 font-medium text-md">Date</FormLabel>
        <FormControl>
          <div className="relative">
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  field.onChange(date);
                }
              }}
              dateFormat="PPP"
              minDate={new Date()}
              customInput={
                <Button
                  variant="outline"
                  className="w-full bg-white/90 text-gray-600 justify-between"
                >
                  {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              }
            />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  
  <FormField
    control={form.control}
    name="time"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-gray-700 font-medium text-md">Time</FormLabel>
        <FormControl>
          <TimeSelector
            value={field.value}
            onChange={field.onChange}
            className="border border-input"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

                        {/* Interviewers Section */}
                        <div className="space-y-4 pt-7">
                          <FormLabel className="text-gray-700 font-medium text-md">Interviewers</FormLabel>
                          {interviewerFields.map((fieldItem, index) => (
                            <div key={fieldItem.id} className="space-y-4">
                              <div className="flex items-start space-x-2">
                                <FormField
                                  control={form.control}
                                  name={`interviewers.${index}.userId`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <Select
                                        onValueChange={(value) => {
                                          const selectedInterviewer = apiInterviewers.find(i => i.userId.toString() === value);
                                          if (selectedInterviewer) {
                                            // Update both name and email fields
                                            form.setValue(`interviewers.${index}.name`, selectedInterviewer.fullName);
                                            form.setValue(`interviewers.${index}.email`, selectedInterviewer.email);
                                            form.setValue(`interviewers.${index}.userId`, selectedInterviewer.userId.toString());
                                          }
                                        }}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select an interviewer" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {apiInterviewers.map((interviewer) => (
                                            <SelectItem 
                                              key={interviewer.userId} 
                                              value={interviewer.userId.toString()}
                                              className="flex flex-col items-start"
                                            >
                                              <div className="font-medium">{interviewer.fullName}</div>
                                              <div className="text-sm text-gray-500">{interviewer.email}</div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="mt-1 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => remove(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {/* Show name and email after selection */}
                              {form.watch(`interviewers.${index}.name`) && (
                                <div className="grid grid-cols-2 gap-4 pl-4 pr-12">
                                  <div className="text-sm">
                                    <span className="text-gray-500">Name: </span>
                                    <span className="text-gray-900">{form.watch(`interviewers.${index}.name`)}</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-500">Email: </span>
                                    <span className="text-gray-900">{form.watch(`interviewers.${index}.email`)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="flex flex-wrap gap-3 items-center mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => append({ userId: "", name: "", email: "", role: "" })}
                              className="flex items-center space-x-2 bg-white/90 hover:font-bold text-gray-700 border-black"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Interviewer</span>
                            </Button>
                            <Button
                              asChild
                              type="button"
                              variant="outline"
                              className="flex items-center space-x-2 bg-white/90 hover:font-bold text-gray-700 border-black"
                            >
                              <Link to="/dashboard/manage-interviewers">
                              <Plus className="h-4 w-4" />
                              <span>Create Interviewer</span>
                              </Link>
                            </Button>
                          </div>
                          
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          {/* In Step 2 form, update the previous button */}
<Button
  type="button"
  variant="outline" 
  onClick={() => setStep(1)}
  className="bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
>
  <ChevronLeft className="mr-2 h-4 w-4" />
  Previous
</Button>
                          <Button
                            type="button"
                            onClick={handleNextFromStep2}
                            className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white font-medium py-2 px-4 rounded-lg flex items-center"
                          >
                            Next Step
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Step 3: Feedback Configuration */}
                    {step === 3 && (
                      <div className="space-y-6">
                       <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Feedback Method</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div
                            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                              feedbackMethod === "template" 
                                ? "border-indigo-600 bg-indigo-50" 
                                : "border-gray-200 bg-white hover:border-indigo-300"
                            }`}
                            onClick={() => setFeedbackMethod("template")}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                feedbackMethod === "template" 
                                  ? "border-indigo-600 bg-indigo-600" 
                                  : "border-gray-300"
                              }`}>
                                {feedbackMethod === "template" && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white m-[3px]"></div>
                                )}
                              </div>
                              {feedbackMethod === "template" && (
                                <div className="absolute top-2 right-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-center py-3">
                              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                  <line x1="16" y1="13" x2="8" y2="13"></line>
                                  <line x1="16" y1="17" x2="8" y2="17"></line>
                                  <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                              </div>
                              <h4 className={`font-medium text-center ${
                                feedbackMethod === "template" ? "text-indigo-700" : "text-gray-700"
                              }`}>Use Feedback Templates</h4>
                              <p className="text-xs text-gray-500 text-center mt-1">Use pre-defined templates for feedback</p>
                            </div>
                          </div>
                            
                          <div
                            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                              feedbackMethod === "ai" 
                                ? "border-indigo-600 bg-indigo-50" 
                                : "border-gray-200 bg-white hover:border-indigo-300"
                            }`}
                            onClick={() => setFeedbackMethod("ai")}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                feedbackMethod === "ai" 
                                  ? "border-indigo-600 bg-indigo-600" 
                                  : "border-gray-300"
                              }`}>
                                {feedbackMethod === "ai" && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white m-[3px]"></div>
                                )}
                              </div>
                              {feedbackMethod === "ai" && (
                                <div className="absolute top-2 right-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-center py-3">
                              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"></path>
                                  <path d="M12 16a4 4 0 100-8 4 4 0 000 8z"></path>
                                  <path d="M12 2v20"></path>
                                  <path d="M2 12h20"></path>
                                </svg>
                              </div>
                              <h4 className={`font-medium text-center ${
                                feedbackMethod === "ai" ? "text-indigo-700" : "text-gray-700"
                              }`}>Generate with AI</h4>
                              <p className="text-xs text-gray-500 text-center mt-1">AI creates feedback questions automatically</p>
                            </div>
                          </div>
                            
                          <div
                            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                              feedbackMethod === "manual" 
                                ? "border-indigo-600 bg-indigo-50" 
                                : "border-gray-200 bg-white hover:border-indigo-300"
                            }`}
                            onClick={() => setFeedbackMethod("manual")}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                feedbackMethod === "manual" 
                                  ? "border-indigo-600 bg-indigo-600" 
                                  : "border-gray-300"
                              }`}>
                                {feedbackMethod === "manual" && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white m-[3px]"></div>
                                )}
                              </div>
                              {feedbackMethod === "manual" && (
                                <div className="absolute top-2 right-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-center py-3">
                              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </div>
                              <h4 className={`font-medium text-center ${
                                feedbackMethod === "manual" ? "text-indigo-700" : "text-gray-700"
                              }`}>Add Questions Manually</h4>
                              <p className="text-xs text-gray-500 text-center mt-1">Create your own custom questions</p>
                            </div>
                          </div>
                        </div>
                      </div>

                        {/* Section 1: Email Customization */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Customization</h3>
                          <Tabs defaultValue="interviewer" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] p-1 rounded-md">
                              <TabsTrigger value="interviewer" className="text-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm">
                                Interviewer Email
                              </TabsTrigger>
                              <TabsTrigger value="candidate" className="text-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm">
                                Candidate Email
                              </TabsTrigger>
                              </TabsList>
                            <TabsContent value="interviewer" className="mt-4 text-gray-800">
                              <FormField
                                control={form.control}
                                name="interviewerEmailContent"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Email Template</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Enter email content for interviewers"
                                        className="min-h-[180px] bg-white/90 text-gray-800"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TabsContent>
                            <TabsContent value="candidate" className="mt-4 text-gray-800">
                              <FormField
                                control={form.control}
                                name="candidateEmailContent"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Email Template</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Enter email content for candidates"
                                        className="min-h-[180px] bg-white/90 text-gray-800"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                        
                        {/* Section 2: Feedback Option */}
                        {feedbackMethod === "template" && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Feedback Templates</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Choose one or more feedback templates for <strong>{selectedProfession}</strong>.
                            </p>
                            {/* Profession Selector */}
                            <div className="mb-4">
                              <Select onValueChange={setSelectedProfession} defaultValue={selectedProfession}>
                                <FormControl>
                                  <SelectTrigger className="bg-white/90 text-gray-800">
                                    <SelectValue placeholder="Select Profession" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {professions.map((prof) => (
                                    <SelectItem key={prof.profession} value={prof.profession}>
                                      {prof.profession}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {availableTemplates.map((template) => {
                                const isSelected = selectedFeedbackTemplates.some(t => t.id === template.id);
                                return (
                                  <div
                                    key={template.id}
                                    className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                                      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                    }`}
                                    onClick={() => toggleFeedbackTemplate(template)}
                                  >
                                    <div className="flex flex-col h-full justify-between">
                                      <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">{template.name}</h4>
                                        <p className="text-sm text-gray-600">
                                          {template.fields
                                            ? `${template.fields.length} questions`
                                            : "Structured feedback template"}
                                        </p>
                                      </div>
                                      <div className="mt-4 flex justify-between items-center">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="bg-white hover:bg-gray-50 text-[#1e1b4b]"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewTemplate(template);
                                          }}
                                        >
                                          Preview Template
                                        </Button>
                                        {isSelected && (
                                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                            Selected
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {feedbackMethod === "manual" && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Manual Feedback Questions</h3>
                            {manualQuestionFields.map((field, index) => (
                              <div key={field.id} className="flex items-center space-x-2 mb-2">
                                <Input
                                  placeholder={`Question ${index + 1}`}
                                  className="bg-white/90 text-gray-800 flex-1"
                                  {...form.register(`manualFeedbackQuestions.${index}.question`)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeManualQuestion(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => appendManualQuestion({ question: "" })}
                              className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-800"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Question</span>
                            </Button>
                          </div>
                        )}
                        
                        {feedbackMethod === "ai" && (
                          <div>
                            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                              <h3 className="text-lg font-semibold text-indigo-800 mb-2">AI-Generated Feedback</h3>
                              <p className="text-gray-700">
                                The system will automatically generate feedback questions based on the job description and candidate's resume.
                              </p>
                              <div className="mt-4 flex items-start">
                                <div className="bg-indigo-100 rounded-full p-2 mr-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-indigo-800">Job Description Used</h4>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {jobDetails ? 
                                      `Questions will be based on "${jobDetails.title}" position requirements` : 
                                      "No job selected. Please go back to step 1 and select a job."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setStep(2)}
                            className="bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            type="button"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting || !feedbackValid}
                            className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                          >
                            {isSubmitting ? "Scheduling..." : "Schedule Interview"}
                            <Send className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setPreviewTemplate(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {previewTemplate.name}
                  </h3>
                  {previewTemplate.subject && (
                    <p className="mt-2 text-gray-600">
                      <span className="font-medium">Subject:</span> {previewTemplate.subject}
                    </p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
                
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {previewTemplate.fields && previewTemplate.fields.length > 0 ? (
                <div className="space-y-6">
                  {previewTemplate.fields.map((field, index) => (
                    <div 
                      key={field.name}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-[#1e1b4b] text-white">
                          Question {index + 1}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {field.label}
                      </h4>
                      <p className="text-gray-600">
                        {field.placeholder}
                      </p>
                      {field.validation && (
                        <p className="mt-2 text-sm text-gray-500">
                          Required length: {field.validation.minLength} characters
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="prose prose-gray max-w-none">
                  <pre className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap text-gray-800">
                    {previewTemplate.body}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <Button
                  onClick={() => setPreviewTemplate(null)}
                  className="bg-[#1e1b4b] text-white hover:bg-[#2d2a5a]"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

