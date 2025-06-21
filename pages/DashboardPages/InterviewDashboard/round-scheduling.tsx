import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { axioss } from "@/utils/axios";
import TimeSelector from "./TimeSelector";
import toast from "react-hot-toast";

// UI Components
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

// Icons
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  Send,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Visual components
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TracingBeam } from "@/components/ui/tracing-beam";

// Date picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Feedback templates data
import feedbackData from "./data.json";

// ----------------- Type Definitions -----------------

interface CandidateJob {
  id: number;
  candidate: {
    id: number;
    fullName: string;
    email: string;
    resumeContent: string;
    resumeSummary: string;
  };
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
  };
  currentRound: number;
  status: string;
}

interface ApiInterviewer {
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

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

// Props interface
interface RoundSchedulerProps {
  candidateData?: CandidateJob | null;
}

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

Best regards,
HR Team,`,
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

// ----------------- Form Schema -----------------
const formSchema = z.object({
  interviewRound: z.string().min(1, { message: "Please select an interview round." }),
  interviewers: z
    .array(
      z.object({
        userId: z.string().min(1, { message: "Please select an interviewer." }),
        name: z.string().min(2, { message: "Interviewer name is required." }),
        email: z.string().email({ message: "Please enter a valid email address." }),
        role: z.string().optional(),
      })
    )
    .min(1, { message: "Please add at least one interviewer." }),
  date: z.date({ required_error: "Please select a date." }),
  time: z.string().min(1, { message: "Please select a time." }),
  interviewMode: z.string().min(1, { message: "Please select an interview mode." }),
  interviewerEmailContent: z.string().min(1, { message: "Please enter email content for interviewers." }),
  candidateEmailContent: z.string().min(1, { message: "Please enter email content for the candidate." }),
  manualFeedbackQuestions: z
    .array(z.object({ question: z.string().min(1, { message: "Question cannot be empty" }) }))
    .optional(),
});

// ----------------- Main Component -----------------
export default function RoundScheduler({ candidateData }: RoundSchedulerProps) {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // Service URLs
  const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8005';
  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";
  
  // Professions data
  const professions: ProfessionFeedback[] = feedbackData.professions;
  
  // Component state
  const [step, setStep] = useState(1);
  const [selectedFeedbackTemplates, setSelectedFeedbackTemplates] = useState<FeedbackTemplate[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<string>(
    professions.length > 0 ? professions[0].profession : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<FeedbackTemplate | null>(null);
  const [feedbackMethod, setFeedbackMethod] = useState<"template" | "ai" | "manual">("template");
  const [apiInterviewers, setApiInterviewers] = useState<ApiInterviewer[]>([]);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewRound: "",
      interviewers: [{ userId: "", name: "", email: "", role: "" }],
      date: new Date(),
      time: "",
      interviewMode: "",
      interviewerEmailContent: defaultEmailTemplates.interviewer,
      candidateEmailContent: defaultEmailTemplates.candidate,
      manualFeedbackQuestions: [],
    },
  });

  // Field arrays for dynamic fields
  const { fields: interviewerFields, append, remove } = useFieldArray({
    control: form.control,
    name: "interviewers",
  });

  const { fields: manualQuestionFields, append: appendManualQuestion, remove: removeManualQuestion } = useFieldArray({
    control: form.control,
    name: "manualFeedbackQuestions",
  });

  // Watch form fields for dynamic updates
  const watchedRound = useWatch({ control: form.control, name: "interviewRound" });
  const watchedDate = useWatch({ control: form.control, name: "date" });
  const watchedTime = useWatch({ control: form.control, name: "time" });
  const watchedMode = useWatch({ control: form.control, name: "interviewMode" });
  const watchedManualQuestions = useWatch({ control: form.control, name: "manualFeedbackQuestions" });
  
  // Fetch interviewers
  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const response = await axioss.get(`${authServiceUrl}/tenant/users/role/INTERVIEWER`, {
          headers: {
            Authorization: `Bearer ${token?.access_token}`
          }
        });
        
        setApiInterviewers(response.data);
      } catch (error) {
        console.error('Error fetching interviewers:', error);
        toast.error('Failed to fetch interviewers');
      }
    };

    fetchInterviewers();
  }, [authServiceUrl, token]);

  // Update email templates when form values change
  useEffect(() => {
    const candidateName = candidateData?.candidate?.fullName || "{candidate}";
    const position = candidateData?.job?.title || "{position}";

    const newInterviewerContent = defaultEmailTemplates.interviewer
      .replace("{candidate}", candidateName)
      .replace("{position}", position)
      .replace("{round}", watchedRound || "{round}")
      .replace("{date}", watchedDate ? format(watchedDate, "PPP") : "{date}")
      .replace("{time}", watchedTime || "{time}")
      .replace("{mode}", watchedMode || "{mode}");
    form.setValue("interviewerEmailContent", newInterviewerContent);

    const newCandidateContent = defaultEmailTemplates.candidate
      .replace("{candidate}", candidateName)
      .replace("{position}", position)
      .replace("{round}", watchedRound || "{round}")
      .replace("{date}", watchedDate ? format(watchedDate, "PPP") : "{date}")
      .replace("{time}", watchedTime || "{time}")
      .replace("{mode}", watchedMode || "{mode}");
    form.setValue("candidateEmailContent", newCandidateContent);
  }, [watchedRound, watchedDate, watchedTime, watchedMode, form, candidateData]);

  // Reset selected templates when profession changes
  useEffect(() => {
    setSelectedFeedbackTemplates([]);
  }, [selectedProfession]);

  // Helper function to convert interview round to a number
  function convertRound(round: string): number {
    switch (round.toLowerCase()) {
      case "screening": return 1;
      case "technical": return 2;
      case "system-design": return 3;
      case "behavioral": return 4;
      case "manager": return 5;
      case "hr": return 6;
      default: return 1;
    }
  }

  // Validate step 1 fields before proceeding
  async function handleNextFromStep1() {
    const valid = await form.trigger([
      "interviewRound",
      "interviewMode",
      "date",
      "time",
      "interviewers",
    ]);
    
    if (valid) {
      setStep(2);
    } else {
      toast.error("Please complete all required fields before proceeding.");
    }
  }

  // Toggle feedback template selection
  function toggleFeedbackTemplate(template: FeedbackTemplate) {
    setSelectedFeedbackTemplates((current) => {
      if (current.some((t) => t.id === template.id)) {
        return current.filter((t) => t.id !== template.id);
      } else {
        return [...current, template];
      }
    });
  }

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>): Promise<void> {
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
  
      // Build payload based on the selected feedback method
      const payload: any = {
        candidateEmail: candidateData?.candidate.email,
        position: candidateData?.job.title,
        interviewDate: interviewDate.toISOString(),
        mode: values.interviewMode.toUpperCase(),
        meetingLink: "",
        interviewerEmailContent: values.interviewerEmailContent,
        candidateEmailContent: values.candidateEmailContent,
        interviewers: transformedInterviewers,
        feedbackMethod: feedbackMethod,
        jobId: candidateData?.job.id
      };
  
      // Add feedback method specific data
      if (feedbackMethod === "template") {
        const wrappedTemplate = {
          feedbackTemplates: selectedFeedbackTemplates.map(template => ({
            id: template.id,
            name: template.name,
            fields: template.fields
          }))
        };
        
        payload.feedbackTemplates = [JSON.stringify(wrappedTemplate)];
      } else if (feedbackMethod === "manual") {
        payload.manualFeedbackQuestions =
          values.manualFeedbackQuestions && values.manualFeedbackQuestions.length > 0
            ? values.manualFeedbackQuestions.map((q) => q.question)
            : [];
      } else if (feedbackMethod === "ai" && candidateData?.job) {
        payload.aiPrompt = candidateData.job.department;
      }
  
      const response = await fetch(`${interviewServiceUrl}/api/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error("Failed to create interview");
      }
      
      const data = await response.json();
      toast.success("Interview scheduled successfully");
      form.reset();
      setSelectedFeedbackTemplates([]);
      navigate("/job/interviews/interviews-page");
    } catch (error: any) {
      console.error("Error scheduling interview:", error);
      toast.error(error.message || "Failed to schedule interview");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Get feedback templates for the selected profession
  const availableTemplates =
    professions.find((p) => p.profession === selectedProfession)?.feedbackTemplates || [];

  // Determine if the feedback selection is valid
  const feedbackValid =
    feedbackMethod === "template"
      ? selectedFeedbackTemplates.length > 0
      : feedbackMethod === "manual"
      ? watchedManualQuestions &&
        watchedManualQuestions.length > 0 &&
        !watchedManualQuestions.some((q: any) => !q.question.trim())
      : true;

  // Get step title based on current step
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Interview Settings";
      case 2:
        return "Feedback Configuration";
      default:
        return "";
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white">
      <BackgroundBeams />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Candidate Info Display */}
          {candidateData && (
            <Card className="border-none shadow-lg bg-white backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#2E2883]">Candidate Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-primary">{candidateData.candidate.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-primary">{candidateData.candidate.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium text-primary">{candidateData.job.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-primary">{candidateData.job.department}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <TracingBeam>
                <Card className="border-none shadow-lg bg-white backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#2E2883]">Schedule Interview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress Steps - Two steps */}
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
                        <span>Interview</span>
                        <span>Feedback</span>
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
                    {/* Step 1: Interview Settings */}
                    {step === 1 && (
                      <form className="space-y-6 text-black" onSubmit={(e) => e.preventDefault()}>
                        {/* Interview Round and Mode */}
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

                        {/* Date and Time */}
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
                                            form.setValue(`interviewers.${index}.name`, selectedInterviewer.fullName);
                                            form.setValue(`interviewers.${index}.email`, selectedInterviewer.email);
                                            form.setValue(`interviewers.${index}.userId`, selectedInterviewer.userId.toString());
                                            form.setValue(`interviewers.${index}.role`, selectedInterviewer.role);
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
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ userId: "", name: "", email: "", role: "" })}
                            className="flex items-center space-x-2 bg-white/90 hover:bg-gray-100 text-gray-600"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Interviewer</span>
                          </Button>
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

                    {/* Step 2: Feedback Configuration */}
                    {step === 2 && (
                      <div className="space-y-6">
                        {/* Feedback Method Selection */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Feedback Method</h3>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center text-gray-800">
                              <input 
                                type="radio" 
                                name="feedbackMethod" 
                                value="template" 
                                checked={feedbackMethod === "template"}
                                onChange={() => setFeedbackMethod("template")}
                                className="mr-2 "
                              />
                              Use Feedback Templates
                            </label>
                            <label className="flex items-center text-gray-800">
                              <input 
                                type="radio" 
                                name="feedbackMethod" 
                                value="ai" 
                                checked={feedbackMethod === "ai"}
                                onChange={() => setFeedbackMethod("ai")}
                                className="mr-2"
                              />
                              Generate with AI
                            </label>
                            <label className="flex items-center text-gray-800">
                              <input 
                                type="radio" 
                                name="feedbackMethod" 
                                value="manual" 
                                checked={feedbackMethod === "manual"}
                                onChange={() => setFeedbackMethod("manual")}
                                className="mr-2"
                              />
                              Add Questions Manually
                            </label>
                          </div>
                        </div>

                        {/* Email Customization */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Customization</h3>
                          <Tabs defaultValue="interviewer" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] p-1 rounded-md">
                              <TabsTrigger value="interviewer" className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm">
                                Interviewer Email
                              </TabsTrigger>
                              <TabsTrigger value="candidate" className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm">
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
                        
                        {/* Feedback Method: Template Selection */}
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
                                          Preview
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
                        )}
                        
                        {/* Feedback Method: Manual Questions */}
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
                        
                        {/* Feedback Method: AI Generated */}
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
                                  <h4 className="text-sm font-medium text-indigo-800">Job Information Used</h4>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {candidateData?.job ? 
                                      `Questions will be based on "${candidateData.job.title}" position requirements` : 
                                      "No job information available."}
                                  </p>
                                </div>
                              </div>
                            </div>
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
                                  {candidateData?.job ? 
                                      `Questions will be based on "${candidateData.job.title}" position requirements` : 
                                      "No job information available."}
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
