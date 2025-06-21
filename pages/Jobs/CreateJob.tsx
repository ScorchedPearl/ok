import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner"; // Create this if you don't have it
import { Switch } from "@/components/ui/switch";

interface JobFormData {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  recruiterId: string;
  companyName: string;
  tenantId: number | null;
}

interface JobDescriptionEnhancementResponse {
  enhancedDescription: string;
  overallScore: number;
  improvements: string[];
  strengths: string[];
  missingElements: string[];
  summary: string;
}

const employmentTypes = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
];

export default function CreateJob() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { token, user } = useAuth();
  const accessToken = token?.access_token;

  const [isEnhancing, setIsEnhancing] = useState(false);
const [enhancedResult, setEnhancedResult] = useState<JobDescriptionEnhancementResponse | null>(null);
const [useEnhancement, setUseEnhancement] = useState(false);

  const companyName = user?.tenant?.tenantName || "Your Company";

  console.log("Company name:", companyName);

  const tenantId = user?.tenant?.tenantId;
  
  // State for departments fetched from the API.
  const [departments, setDepartments] = useState<string[]>([]);

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    employmentType: "",
    description: "",
    companyName: companyName,
    recruiterId: "1d3c630f-9087-4d39-8dbe-82c1dea01923",
    tenantId: null,
  });

  // Set tenantId after component mounts and whenever user changes.
  useEffect(() => {
    if (user?.tenant?.tenantId) {
      const tenantIdValue = typeof user.tenant.tenantId === 'string'
        ? parseInt(user.tenant.tenantId, 10)
        : user.tenant.tenantId;
      
      setFormData(prev => ({
        ...prev,
        tenantId: tenantIdValue
      }));
    }
  }, [user]);

  const navigate = useNavigate();

  const handleReturnToJobs = () => {
    navigate("/dashboard/jobs");
  };

  // New back button handler to navigate to /dashboard
  const handleBack = () => {
    navigate("/dashboard/jobs");
  };

  const enhanceJobDescription = async () => {
  

  setIsEnhancing(true);
  
  try {
    const response = await fetch(`${interviewServiceUrl}/api/jobs/enhance-description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": accessToken ? `Bearer ${accessToken}` : ''
      },
      body: JSON.stringify({
        title: formData.title,
        department: formData.department,
        location: formData.location,
        employmentType: formData.employmentType,
        description: formData.description
      }),
    });

    if (response.ok) {
      const result = await response.json() as JobDescriptionEnhancementResponse;
      setEnhancedResult(result);
      toast.success("Job description enhanced successfully!");
      
      // Auto-update the form with enhanced description if toggle is on
      if (useEnhancement) {
        setFormData(prev => ({
          ...prev,
          description: result.enhancedDescription
        }));
      }
    } else {
      toast.error("Failed to enhance job description. Please try again.");
    }
  } catch (error) {
    console.error("Error enhancing job description:", error);
    toast.error("Error enhancing job description. Please check your connection.");
  } finally {
    setIsEnhancing(false);
  }
};

const EnhancementControls = () => (
  <div className="mt-4 space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <h3 className="text-base font-medium">AI Enhancement</h3>
        <p className="text-sm text-gray-500">
          Use AI to improve your job description
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Auto-apply</span>
          <Switch 
            checked={useEnhancement} 
            onCheckedChange={setUseEnhancement} 
            id="auto-enhance"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={enhanceJobDescription}
          disabled={isEnhancing || (!formData.description && !formData.title && !formData.department && !formData.location && !formData.employmentType)}
          className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20"
        >
          {isEnhancing ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Enhancing...
            </>
          ) : (
            "Enhance Description"
          )}
        </Button>
      </div>
    </div>


  </div>
);

  const calculateProgress = () => {
    let filled = 0;
    if (formData.title) filled++;
    if (formData.department) filled++;
    if (formData.location) filled++;
    if (formData.employmentType) filled++;
    if (formData.description) filled++;
    return (filled / 5) * 100;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";
  const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8007";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${interviewServiceUrl}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": accessToken ? `Bearer ${accessToken}` : ''
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Job created successfully!");
        setTimeout(() => {
          navigate(`/dashboard/jobs`);
        }, 1500);
      } else {
        toast.error("Failed to create job. Please try again.");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Error creating job. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (key: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setProgress(calculateProgress());
  };

  // Fetch departments from the API
  const fetchDepartments = useCallback(async () => {
    if (!tenantId) {
      console.error("No tenant ID available");
      return;
    }
  
    try {
      const response = await fetch(`${authServiceUrl}/tenant/${tenantId}/departments`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      if (data && data.departments && Array.isArray(data.departments)) {
        setDepartments(data.departments);
      } else {
        console.error("Unexpected data format:", data);
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Error fetching departments");
    }
  }, [tenantId, token, authServiceUrl]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Toaster />
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gray-200"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        style={{ transformOrigin: "0%" }}
      >
        <div className="h-full bg-indigo-600" />
      </motion.div>

      
      

      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-20 px-4 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-[20] text-black ">
        <Button variant="outline" onClick={handleBack} className="hover:bg-indigo-700">
          Go Back
        </Button>
      </div>
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>
        <div className="container mx-auto max-w-4xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold mb-4">Create Job Opening</h1>
            <p className="text-indigo-200 max-w-2xl text-lg">
              Post a new job opening to find the perfect candidate for your team. Fill in the details below to get started.
            </p>
            <div className="flex gap-2 mt-6">
              {/* <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-1">
                Recruiting Manager
              </Badge> */}
              {/* <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-1">
                Job Posting
              </Badge> */}
              {companyName && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-1">
                  {companyName}
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto max-w-4xl px-4 -mt-10 pb-20">
        <AnimatePresence mode="wait">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-3xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Job Details Section */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-900">Job Details</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label htmlFor="title" className="text-sm font-medium">
                          Job Title
                        </Label>
                        <Input
                          id="title"
                          placeholder="e.g. Senior Software Engineer"
                          value={formData.title}
                          onChange={(e) => updateFormData("title", e.target.value)}
                          required
                          className="transition-all focus:ring-2 focus:ring-indigo-500"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="department">Department</Label>
                        <Select 
                          value={formData.department} 
                          onValueChange={(value) => updateFormData("department", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.length > 0 ? (
                              departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none">
                                No departments available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        <Input
                          id="location"
                          className="pl-10"
                          placeholder="e.g. New York, NY"
                          value={formData.location}
                          onChange={(e) => updateFormData("location", e.target.value)}
                          required
                        />
                      </div>
                    </motion.div>
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="employmentType">Employment Type</Label>
                      <Select
                        value={formData.employmentType}
                        onValueChange={(value) => updateFormData("employmentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {employmentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>
                </div>

                {/* Job Description Section */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900">Job Description</h2>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter the job description..."
                      className="min-h-[200px] transition-all focus:ring-2 focus:ring-indigo-500"
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                <EnhancementControls />

                {/* Submit Button */}
                <motion.div
                  className="flex justify-end gap-4 pt-6 border-t"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReturnToJobs}
                    className="hover:bg-gray-100 transition-all duration-300"
                  >
                    Return to Jobs
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </div>
                    ) : (
                      "Create Job Opening"
                    )}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}