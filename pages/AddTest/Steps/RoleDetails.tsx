import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HelpCircle,
  Sparkles,
  Zap,
  Book,
  Brain,
  Wand2,
  FileText,
  ListChecks,
  Lock,
  AlertCircle,
  LightbulbIcon,
  BadgeInfo,
  Code
} from "lucide-react";
import toast from "react-hot-toast";
import { AITestCreationPopup } from "./ai-test-creation-popup";
import { useAuth } from "@/context/AuthContext";
import TestRecommendations from "./TestRecommendation";

const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || 'http://localhost:8003';
const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || 'http://localhost:8004'

interface RoleDetailsProps {
  formData: {
    testName: string;
    stream: string;
    questionType: string; // Only used in AI flow
    creationType: string;
    aiPrompt: string;
    maxLibraries: number;
    difficultyLevel: string;
    numMCQs: number; // New field for MCQs
    numSubjective: number; // New field for subjective questions
    numCoding: number; // New field for coding questions
    useAI: boolean;
    testId: number;
    jobIDs: string[];
  };
  onFormDataChange: (data: { [key: string]: string | number | boolean | string[] }) => void;
  onAdvanceStep: () => void;
}

interface Job {
  id: string;
  title: string;
  department: string;
  companyName: string;
  location: string;
  employmentType: string;
  description: string;
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
  testId: string | null;
}

const EnhancedRoleDetails: React.FC<RoleDetailsProps> = ({
  formData,
  onFormDataChange,
  onAdvanceStep,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [buttonText, setButtonText] = useState("Next");
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Determine which question inputs should be enabled based on question type
  const [isMCQEnabled, setIsMCQEnabled] = useState(false);
  const [isSubjectiveEnabled, setIsSubjectiveEnabled] = useState(false);
  const [isCodingEnabled, setIsCodingEnabled] = useState(false);

  const { user, token } = useAuth();
  const tenantId = user?.tenant?.tenantId || 5;
  const accessToken = token?.access_token;

  useEffect(() => {
    validateForm();
  }, [
    formData.testName,
    formData.stream,
    // formData.useAI,
    // formData.aiPrompt,
  ]);
  
  // Update enabled states whenever question type changes
  useEffect(() => {
    if (formData.questionType === "MCQ") {
      setIsMCQEnabled(true);
      setIsSubjectiveEnabled(false);
      setIsCodingEnabled(false);
      // Reset other questions to 0
      onFormDataChange({ numSubjective: 0, numCoding: 0 });
    } else if (formData.questionType === "SUBJECTIVE") {
      setIsMCQEnabled(false);
      setIsSubjectiveEnabled(true);
      setIsCodingEnabled(false);
      // Reset other questions to 0
      onFormDataChange({ numMCQs: 0, numCoding: 0 });
    } else if (formData.questionType === "CODE") {
      setIsMCQEnabled(false);
      setIsSubjectiveEnabled(false);
      setIsCodingEnabled(true);
      // Reset other questions to 0
      onFormDataChange({ numMCQs: 0, numSubjective: 0 });
    } else if (formData.questionType === "MIXED") {
      setIsMCQEnabled(true);
      setIsSubjectiveEnabled(true);
      setIsCodingEnabled(true);
      // Set default values if they're at 0
      if (formData.numMCQs === 0) onFormDataChange({ numMCQs: 5 });
      if (formData.numSubjective === 0) onFormDataChange({ numSubjective: 3 });
      if (formData.numCoding === 0) onFormDataChange({ numCoding: 2 });
    } else if (formData.questionType === "CASE_STUDY") {
      // For case study, we fix the values
      setIsMCQEnabled(true);
      setIsSubjectiveEnabled(true);
      setIsCodingEnabled(false);
      // Set and lock the values for case study
      onFormDataChange({ numMCQs: 3, numSubjective: 2, numCoding: 0 });
    } else {
      // For any other type, disable all
      setIsMCQEnabled(false);
      setIsSubjectiveEnabled(false);
      setIsCodingEnabled(false);
      // Reset all to 0
      onFormDataChange({ numMCQs: 0, numSubjective: 0, numCoding: 0 });
    }
  }, [formData.questionType]);

  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

  // Fetch all jobs from the API for the dropdown menu
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${interviewServiceUrl}/api/jobs/tenant/${tenantId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        } else {
          toast.error("Failed to load jobs");
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Error fetching jobs");
      }
    };
    fetchJobs();
  }, [token, tenantId]);

  // Update selected job when job ID changes
  useEffect(() => {
    if (formData.jobIDs && formData.jobIDs.length > 0 && jobs.length > 0) {
      const selectedJobId = formData.jobIDs[0];
      const job = jobs.find(j => j.id === selectedJobId);
      setSelectedJob(job || null);
    } else {
      setSelectedJob(null);
    }
  }, [formData.jobIDs, jobs]);

  const validateForm = () => {
    console.log("formData",formData);
    const newErrors: Record<string, string> = {};
    if (!formData.testName) newErrors.testName = "Test name is required";
    // if (!formData.stream) newErrors.stream = "Stream is required";
    
    if (formData.useAI && !formData.aiPrompt) newErrors.aiPrompt = "AI prompt is required when using AI";
    
    // Validate question type specific requirements
    if (formData.useAI) {
      if (!formData.questionType) newErrors.questionType = "Question type is required";
      
      if (formData.questionType === "MIXED" && 
          formData.numMCQs === 0 && 
          formData.numSubjective === 0 && 
          formData.numCoding === 0) {
        newErrors.numQuestions = "At least one question type must be selected for mixed questions";
      }
      
      if (formData.questionType === "MCQ" && formData.numMCQs === 0) {
        newErrors.numMCQs = "At least one MCQ question must be selected";
      }
      
      if (formData.questionType === "SUBJECTIVE" && formData.numSubjective === 0) {
        newErrors.numSubjective = "At least one subjective question must be selected";
      }
      
      if (formData.questionType === "CODE" && formData.numCoding === 0) {
        newErrors.numCoding = "At least one coding question must be selected";
      }
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const validateSubmit = () => {
    const validationErrors = validateForm();
    return Object.keys(validationErrors).length === 0;
  }

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[]
  ) => {
    onFormDataChange({ [field]: value });
  };

  const handleNextClick = async () => {
    if (!validateSubmit()) {
      toast.error("Please fill all required fields before proceeding.");
      return;
    }

    const payload = {
      tenantId: user?.tenant?.tenantId || 5,
      testName: formData.testName,
      stream: "Default",
      category: formData.stream, // Fixed category as per sample payload.
      testType: formData.useAI ? formData.questionType : "CODE", // Default to CODE in manual flow
      timeLimit: 60,
      jobIDs: formData.jobIDs,
    };

    setIsSubmitting(true);
    setButtonText("Submitting...");

    if (formData.useAI) {
      setIsAIPopupOpen(true);
    } else {
      try {
        const response = await fetch(`${testServiceUrl}/api/v1/tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating test:", errorData);
          toast.error("Error creating test");
        } else {
          const responseData = await response.json();
          toast.success("Test created successfully");
          onFormDataChange({ testId: responseData.id });
          setIsCreated(true);
        }
        
      } catch (error) {
        console.error("Error creating test:", error);
        toast.error("Error creating test");
      } finally {
        setIsSubmitting(false);
        setButtonText("Next");
      }
      onAdvanceStep();
    }
  };

  const handlePopupSuccess = (createdTestId: number) => {
    onFormDataChange({ testId: createdTestId });
    setIsAIPopupOpen(false);
    onAdvanceStep();
  };
  
  // Function to get appropriate question slider class based on enabled state
  const getSliderClass = (isEnabled: boolean) => {
    return `py-4 ${isEnabled ? "" : "opacity-50"}`;
  };

  // This function is called when a recommendation is selected
  const handleRecommendationSelect = (recommendationData: any) => {
    onFormDataChange({
      ...recommendationData,
      useAI: true // Ensure AI is enabled when a recommendation is selected
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Role Details</h2>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Switch
            id="use-ai"
            checked={formData.useAI}
            onCheckedChange={(checked) => handleInputChange("useAI", checked)}
            className="data-[state=checked]:bg-gradient-to-r from-purple-600 to-indigo-600"
          />
          <label
            htmlFor="use-ai"
            className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2"
          >
            <Wand2 className="h-5 w-5 text-purple-600" />
            Enable AI Magic
          </label>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mt-8">
        {/* Job Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Select Job
            <HelpCircle className="h-4 w-4 text-gray-400" />
          </label>
          <Select
            value={formData.jobIDs && formData.jobIDs.length > 0 ? formData.jobIDs[0] : ""}
            onValueChange={(value) =>
              handleInputChange("jobIDs", [value])
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title} - {job.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Test Name <span className="text-red-500">*</span>
            <HelpCircle className="h-4 w-4 text-gray-400" />
          </label>
          <Input
            placeholder="Enter test name"
            value={formData.testName}
            onChange={(e) => handleInputChange("testName", e.target.value)}
            className="bg-white"
          />
          {errors.testName && (
            <p className="text-sm text-red-500">{errors.testName}</p>
          )}
        </div>     
      </div>

      {/* AI Test Recommendations Section - only show when a job is selected and AI is enabled */}
      {formData.useAI && formData.jobIDs && formData.jobIDs.length > 0 && (
        <div className="mt-4 mb-2">
          <TestRecommendations
            jobId={formData.jobIDs[0]}
            onSelectRecommendation={handleRecommendationSelect}
            selectedJobDescription={selectedJob?.description}
          />
        </div>
      )}

      {formData.useAI && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI-Powered Test Creation
                </CardTitle>
                {formData.questionType === "CASE_STUDY" && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">About Case Study Assessments</h4>
                        <p className="text-xs text-amber-700 mt-1">
                          Each case study will include a business scenario passage followed by 3 MCQ and 2 subjective 
                          questions related to the scenario. This format tests analytical thinking and application of 
                          knowledge in realistic contexts.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <CardDescription className="text-gray-600 mt-1">
                  Let our advanced AI create the perfect test for your needs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    AI Prompt <span className="text-red-500">*</span>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </label>
                  <textarea
                    placeholder="E.g., Create an advanced Java programming test focusing on Spring Boot"
                    value={formData.aiPrompt}
                    onChange={(e) => handleInputChange("aiPrompt", e.target.value)}
                    className="w-full p-3 border text-gray-800 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded resize-y min-h-[80px] max-h-[200px] transition-all duration-300"
                  />
                  {errors.aiPrompt && (
                    <p className="text-sm text-red-500">{errors.aiPrompt}</p>
                  )}
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Difficulty Level
                    <Brain className="h-4 w-4 text-purple-500" />
                  </label>
                  <Select
                    value={formData.difficultyLevel}
                    onValueChange={(value) =>
                      handleInputChange("difficultyLevel", value)
                    }
                  >
                    <SelectTrigger className="border-purple-200 text-gray-800">
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Question Type <span className="text-red-500">*</span>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </label>
                  <Select
                    value={formData.questionType}
                    onValueChange={(value) => handleInputChange("questionType", value)}
                  >
                    <SelectTrigger className="bg-white text-gray-800">
                      <SelectValue placeholder="Select Questions Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MCQ">Multiple Choice Questions</SelectItem>
                        <SelectItem value="CODE">Coding Questions</SelectItem>
                        <SelectItem value="SUBJECTIVE">Subjective Questions</SelectItem>
                        <SelectItem value="MIXED">Mixed (MCQ + Subjective + Coding)</SelectItem>
                        <SelectItem value="CASE_STUDY">Case Study Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.questionType && (
                    <p className="text-sm text-red-500">{errors.questionType}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
              <div className={`p-4 bg-white rounded-lg shadow-sm space-y-2 ${!isMCQEnabled ? "relative" : ""}`}>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                MCQ Questions
                <ListChecks className="h-4 w-4 text-purple-500" />
                {!isMCQEnabled && <Lock className="h-4 w-4 text-gray-400 ml-1" />}
                {formData.questionType === "CASE_STUDY" && <Lock className="h-4 w-4 text-amber-500 ml-1" />}
              </label>
              {!isMCQEnabled && (
                <div className="absolute inset-0 bg-gray-50/80 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center p-3">
                    <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Select "MCQ" or "Mixed" question type to enable</p>
                  </div>
                </div>
              )}
              <Slider
                value={[formData.numMCQs]}
                onValueChange={([value]: [number]) =>
                  handleInputChange("numMCQs", value)
                }
                max={15}
                step={1}
                className={getSliderClass(isMCQEnabled)}
                disabled={!isMCQEnabled || formData.questionType === "CASE_STUDY"}
              />
              <p className="text-sm text-gray-500 flex justify-between">
                <span>MCQ Questions: {isMCQEnabled ? formData.numMCQs : 0}</span>
                <span className="text-purple-600">Max: 15</span>
              </p>
              {errors.numMCQs && (
                <p className="text-sm text-red-500">{errors.numMCQs}</p>
              )}
            </div>

                <div className={`p-4 bg-white rounded-lg shadow-sm space-y-2 ${!isSubjectiveEnabled ? "relative" : ""}`}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Subjective Questions
                    <FileText className="h-4 w-4 text-purple-500" />
                    {!isSubjectiveEnabled && <Lock className="h-4 w-4 text-gray-400 ml-1" />}
                    {formData.questionType === "CASE_STUDY" && <Lock className="h-4 w-4 text-amber-500 ml-1" />}
                  </label>
                  {!isSubjectiveEnabled && (
                    <div className="absolute inset-0 bg-gray-50/80 rounded-lg flex items-center justify-center z-10">
                      <div className="text-center p-3">
                        <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Select "Subjective" or "Mixed" question type to enable</p>
                      </div>
                    </div>
                  )}
                  <Slider
                    value={[formData.numSubjective]}
                    onValueChange={([value]: [number]) =>
                      handleInputChange("numSubjective", value)
                    }
                    max={10}
                    step={1}
                    className={getSliderClass(isSubjectiveEnabled)}
                    disabled={!isSubjectiveEnabled || formData.questionType === "CASE_STUDY"}
                  />
                  <p className="text-sm text-gray-500 flex justify-between">
                    <span>Subjective Questions: {isSubjectiveEnabled ? formData.numSubjective : 0}</span>
                    <span className="text-purple-600">Max: 10</span>
                  </p>
                  {errors.numSubjective && (
                    <p className="text-sm text-red-500">{errors.numSubjective}</p>
                  )}
                </div>

                <div className={`p-4 bg-white rounded-lg shadow-sm space-y-2 ${!isCodingEnabled ? "relative" : ""}`}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Coding Questions
                    <Code className="h-4 w-4 text-purple-500" />
                    {!isCodingEnabled && <Lock className="h-4 w-4 text-gray-400 ml-1" />}
                  </label>
                  {!isCodingEnabled && (
                    <div className="absolute inset-0 bg-gray-50/80 rounded-lg flex items-center justify-center z-10">
                      <div className="text-center p-3">
                        <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Select "Code" or "Mixed" question type to enable</p>
                      </div>
                    </div>
                  )}
                  <Slider
                    value={[formData.numCoding]}
                    onValueChange={([value]: [number]) =>
                      handleInputChange("numCoding", value)
                    }
                    max={5}
                    step={1}
                    className={getSliderClass(isCodingEnabled)}
                    disabled={!isCodingEnabled}
                  />
                  <p className="text-sm text-gray-500 flex justify-between">
                    <span>Coding Questions: {isCodingEnabled ? formData.numCoding : 0}</span>
                    <span className="text-purple-600">Max: 5</span>
                  </p>
                  {errors.numCoding && (
                    <p className="text-sm text-red-500">{errors.numCoding}</p>
                  )}
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Max Libraries
                    <Book className="h-4 w-4 text-purple-500" />
                  </label>
                  <Slider
                    value={[formData.maxLibraries]}
                    onValueChange={([value]: [number]) =>
                      handleInputChange("maxLibraries", value)
                    }
                    max={5}
                    step={1}
                    className="py-4"
                  />
                  <p className="text-sm text-gray-500 flex justify-between">
                    <span>Libraries: {formData.maxLibraries}</span>
                    <span className="text-purple-600">Max: 5</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* General error message for mixed question type */}
            {errors.numQuestions && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p>{errors.numQuestions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleNextClick}
          disabled={isSubmitting || isCreated}
          className={`px-6 py-3 text-lg font-medium text-white transition-all duration-300 transform hover:scale-105 ${
            isSubmitting || isCreated
              ? "bg-gray-500"
              : formData.useAI
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              : "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white hover:from-indigo-700 hover:to-indigo-900"
          }`}
        >
          {formData.useAI ? (
            <>
              Generate with AI <Sparkles className="ml-2 h-5 w-5 animate-pulse" />
            </>
          ) : (
            buttonText
          )}
        </Button>
      </div>

      <AITestCreationPopup
        isOpen={isAIPopupOpen}
        onClose={() => setIsAIPopupOpen(false)}
        aiParams={formData}
        onSuccess={handlePopupSuccess}
      />
    </div>
  );
};

export default EnhancedRoleDetails;