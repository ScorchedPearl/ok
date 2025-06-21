"use client";

import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  PenTool,
  Library,
  CheckCircle,
  Zap,
  Brain,
  Layers,
  Code,
  Database,
  Network,
  ListChecks,
  BookOpen,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || 'http://localhost:8003';
const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || 'http://88.99.104.97:18004/';

interface AITestParams {
  testName: string;
  stream: string; // This value will be used as the category too.
  aiPrompt: string;
  maxLibraries: number;
  difficultyLevel: string;
  numMCQs: number; // Number of MCQ questions
  numSubjective: number; // Number of subjective questions
  numCoding: number; // Number of coding questions
  questionType: string; // "MCQ", "SUBJECTIVE", "CODE", "MIXED", or "CASE_STUDY"
  jobIDs?: string[]; // Job IDs to associate with the test
  testId?: string | number;
}

interface AITestCreationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  aiParams: AITestParams;
  onSuccess: (testId: number) => void; // Called when the AI creation flow finishes successfully.
}

interface Step {
  icon: React.FC<any>;
  text: string;
  description: string;
  skipIf?: (params: AITestParams) => boolean;
}

const steps: Step[] = [
  {
    icon: Sparkles,
    text: "Initializing AI",
    description: "Booting up advanced neural networks",
  },
  {
    icon: Brain,
    text: "Analyzing prompt",
    description: "Parsing and understanding the given context",
  },
  {
    icon: PenTool,
    text: "Crafting material",
    description: "Generating comprehensive content based on the prompt",
  },
  // Add this step specifically for case study type
  {
    icon: BookOpen,
    text: "Creating case studies",
    description: "Developing realistic business scenarios for assessment",
    skipIf: (params: AITestParams) => params.questionType !== "CASE_STUDY"
  },
  {
    icon: Library,
    text: "Creating libraries",
    description: "Compiling relevant information sources",
  },
  {
    icon: ListChecks,
    text: "Generating MCQs",
    description: "Creating challenging multiple choice questions",
    skipIf: (params: AITestParams) => params.questionType === "SUBJECTIVE" || params.questionType === "CODE" || params.numMCQs === 0
  },
  {
    icon: FileText,
    text: "Creating subjective questions",
    description: "Formulating open-ended and analytical questions",
    skipIf: (params: AITestParams) => params.questionType === "MCQ" || params.questionType === "CODE" || params.numSubjective === 0
  },
  {
    icon: Code,
    text: "Creating coding questions",
    description: "Developing programming challenges and test cases",
    skipIf: (params: AITestParams) => params.questionType === "MCQ" || params.questionType === "SUBJECTIVE" || params.numCoding === 0
  },
  {
    icon: CheckCircle,
    text: "Adding explanations",
    description: "Providing detailed answers and rationales",
  },
  {
    icon: Zap,
    text: "Optimizing difficulty",
    description: "Adjusting complexity to match the specified level",
  },
  {
    icon: Layers,
    text: "Structuring test",
    description: "Organizing questions into a coherent format",
  },
  {
    icon: Code,
    text: "Implementing interactivity",
    description: "Adding dynamic elements to enhance engagement",
  },
  {
    icon: Database,
    text: "Finalizing content",
    description: "Storing and indexing the generated test",
  },
  {
    icon: Network,
    text: "Quality assurance",
    description: "Performing final checks and validations",
  },
];

const insights = [
  "Leveraging state-of-the-art language models",
  "Applying advanced cognitive science principles",
  "Utilizing adaptive learning algorithms",
  "Incorporating expert knowledge bases",
  "Implementing dynamic difficulty adjustment",
];

export const AITestCreationPopup: React.FC<AITestCreationPopupProps> = ({
  isOpen,
  onClose,
  aiParams,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [apiCalled, setApiCalled] = useState(false);
  const navigate = useNavigate();
  const {token,user} = useAuth();

  // Filter steps based on question type
  const filteredSteps = steps.filter(step => 
    !step.skipIf || !step.skipIf(aiParams)
  );

  // Drive the step progression while the popup is open.
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setApiCalled(false);

      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < filteredSteps.length - 1) {
            setProgress((prevProgress) => prevProgress + 100 / filteredSteps.length);
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, filteredSteps.length]);

  // When reaching the final step, call the API flow (only once).
  useEffect(() => {
    if (isOpen && currentStep === filteredSteps.length - 1 && !apiCalled) {
      setApiCalled(true);
      generateAITest();
    }
  }, [isOpen, currentStep, apiCalled, filteredSteps.length]);

  const generateAITest = async () => {
    try {
      // Calculate total number of questions (MCQs + subjective + coding)
      const totalQuestions = aiParams.numMCQs + aiParams.numSubjective + aiParams.numCoding;
  
      // 1. Create the test via the API using the fields from aiParams.
      const createTestResponse = await fetch(`${testServiceUrl}/api/v1/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": "akshayy",
          Authorization: `Bearer ${token?.access_token}`
        },
        body: JSON.stringify({
          testName: aiParams.testName,
          stream: aiParams.stream,
          category: aiParams.stream, // Interpret stream as the category.
          testType: aiParams.questionType,
          timeLimit: 60,
          tenantId: user?.tenant?.tenantId || 158, // This value might come from your context or configuration.
          jobIDs: aiParams.jobIDs || [],
        }),
      });
  
      if (!createTestResponse.ok) {
        const errorData = await createTestResponse.json();
        console.error("Error creating test:", errorData);
        toast.error("Error creating test");
        return;
      }
  
      const createdTest = await createTestResponse.json();
      const testId = createdTest.id;
      console.log("Created test with ID:", testId);

      const numMCQs = Number(aiParams.numMCQs) || 0; // Default to 0 if undefined or NaN
      const numSubjective = Number(aiParams.numSubjective) || 0;
      const numCoding = Number(aiParams.numCoding) || 0;
  
      // 2. Generate libraries for the created test.
      // Only include parameters that are defined in the backend controller
      const url = `${questionBankServiceUrl}/libraries/generate-libraries?tenantUserId=${encodeURIComponent(100)}&difficultyLevel=${encodeURIComponent(
        aiParams.difficultyLevel
      )}&questionType=${encodeURIComponent(
        aiParams.questionType
      )}&numMCQs=${encodeURIComponent(
        numMCQs
      )}&numSubjective=${encodeURIComponent(
        numSubjective
      )}&numCoding=${encodeURIComponent(
        numCoding
      )}&testId=${encodeURIComponent(testId)}`;
  
      const librariesResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": "AIzaSyCcTsDBMal4lRkGCjxy6dIwFcaWGRG4ntU",
          "Authorization": `Bearer ${token?.access_token}`
        },
        body: JSON.stringify({
          prompt: aiParams.aiPrompt,
          maxLibraries: aiParams.maxLibraries,
          difficultyLevel: aiParams.difficultyLevel,
          questionType: aiParams.questionType,
          numMCQs: aiParams.numMCQs,
          numSubjective: aiParams.numSubjective,
          numCoding: aiParams.numCoding,
          testId: testId,
          numQuestions: totalQuestions // Keep this in the body if needed by backend logic
        }),
      });
  
      console.log("librariesResponse", librariesResponse);
  
      if (librariesResponse.ok) {
        toast.success("AI test created successfully");
        // Notify parent of success and pass the new testId.
        onSuccess(testId);
      } else {
        const errorData = await librariesResponse.json();
        console.error("Error creating AI test libraries:", errorData);
        toast.error("Error creating AI test libraries");
      }
    } catch (error) {
      console.error("Error creating AI test:", error);
      toast.error("Error creating AI test");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Creating AI-Powered Test
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          <Progress value={progress} className="w-full h-4 bg-[#e2e8f0]" />
          <div className="mt-8 space-y-8 min-h-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-6"
              >
                {filteredSteps[currentStep].icon &&
                  React.createElement(filteredSteps[currentStep].icon, {
                    className: "h-16 w-16 text-[#4338ca]",
                  })}
                <div>
                  <h3 className="text-3xl font-semibold text-[#2d3748]">
                    {filteredSteps[currentStep].text}
                  </h3>
                  <p className="text-[#718096] text-xl mt-2">
                    {filteredSteps[currentStep].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-600">
              AI Insights
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h4 className="text-lg font-semibold mb-2">Test Parameters</h4>
        
        {aiParams.questionType === "CASE_STUDY" && (
          <div className="mb-3 bg-amber-50 p-3 rounded-md border border-amber-200">
            <h5 className="text-sm font-medium text-amber-800 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Case Study Assessment
            </h5>
            <p className="text-xs text-amber-700 mt-1">
              Each case study includes a business scenario and 5 related questions (3 MCQs, 2 subjective).
            </p>
          </div>
        )}
        
        <div className="space-y-4 text-sm">
          {/* First row - Prompt (full width) */}
          <div>
            <p className="font-medium">Prompt:</p>
            <p className="text-gray-600">{aiParams.aiPrompt}</p>
          </div>
          
          {/* Second row - Difficulty and Max Libraries */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-medium">Difficulty:</p>
              <p className="text-gray-600">{aiParams.difficultyLevel}</p>
            </div>
            <div>
              <p className="font-medium">Max Libraries:</p>
              <p className="text-gray-600">{aiParams.maxLibraries}</p>
            </div>
          </div>
          
          {/* Third row - Question types */}
          <div className="grid grid-cols-3 gap-4">
            {aiParams.numMCQs > 0 && (
              <div>
                <p className="font-medium">MCQ Questions:</p>
                <p className="text-gray-600">
                  {aiParams.questionType === "CASE_STUDY" 
                    ? "3 per case study" 
                    : aiParams.numMCQs}
                </p>
              </div>
            )}
            
            {aiParams.numSubjective > 0 && (
              <div>
                <p className="font-medium">Subjective Questions:</p>
                <p className="text-gray-600">
                  {aiParams.questionType === "CASE_STUDY" 
                    ? "2 per case study" 
                    : aiParams.numSubjective}
                </p>
              </div>
            )}
            
            {aiParams.numCoding > 0 && (
              <div>
                <p className="font-medium">Coding Questions:</p>
                <p className="text-gray-600">{aiParams.numCoding}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
};