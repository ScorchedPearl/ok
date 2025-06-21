import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import RoleDetails from "./Steps/RoleDetails";
import ChooseTests from "./Steps/ChooseTests";
import AddQuestions from "./Steps/AddQuestions";
import { FormData, MCQQuestion, Test } from "./Types/Test";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AIPreview from "./Steps/AIpreview";
import Finalize from "./Steps/Finalize";
import { useAuth } from "@/context/AuthContext";

const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || 'http://localhost:8003';

export default function AssessmentForm() {
  const { user } = useAuth();
  const { step } = useParams();
  const navigate = useNavigate();

  // Initialize currentStep based on URL parameter or default to 1.
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const stepFromUrl = parseInt(step || "1", 10);
    return isNaN(stepFromUrl) ? 1 : Math.min(Math.max(stepFromUrl, 1), 4);
  });

  const [formData, setFormData] = useState<FormData>({
    testName: "",
    stream: "",
    questionType: "",
    location: "",
    creationType: "",
    selectedTests: [] as Test[],
    savedTests: [],
    customQuestions: [] as MCQQuestion[],
    questionLibraries: [],
    testId: 0,
    aiPrompt: "",
    maxLibraries: 0,
    difficultyLevel: "",
    numQuestions: 0,
    useAI: false,
    jobIDs: [],
    numMCQs: 0,
    numSubjective: 0
  });

  // Additional states for API call handling in step 1.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setButtonText] = useState("Next");


  // Update URL when currentStep changes.
  useEffect(() => {
    navigate(`/add-test/${currentStep}`);
  }, [currentStep, navigate]);

  // Update currentStep if URL changes.
  useEffect(() => {
    const stepFromUrl = parseInt(step || "1", 10);
    if (!isNaN(stepFromUrl) && stepFromUrl >= 1 && stepFromUrl <= 4) {
      setCurrentStep(stepFromUrl);
    }
  }, [step]);

  const steps = formData.useAI
    ? [
        { id: 1, name: "Role Details", component: RoleDetails },
        { id: 2, name: "AI Preview", component: AIPreview },
        { id: 3, name: "Finalize", component: Finalize },
      ]
    : [
        { id: 1, name: "Role Details", component: RoleDetails },
        { id: 2, name: "Choose Libraries", component: ChooseTests },
        { id: 3, name: "Add questions", component: AddQuestions },
        { id: 4, name: "Finalize", component: Finalize },
      ];

  // Validate current step data before proceeding.
  const validateStep = (step: number) => {    
    switch (step) {
      case 1:
        return !!(
          formData.testName &&
          formData.stream &&
          formData.questionType &&
          formData.location
        );
      case 2:
        if (!formData.useAI) return formData.questionLibraries.length > 0;
        return true;
      case 3:
        return true; // Additional validation for step 3 if needed.
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Modified handleNext to check if an AI test already exists.
  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      alert("Please fill all required fields before proceeding.");
      return;
    }

    if (currentStep === 1) {
      if (formData.testId !== 0) {
        setCurrentStep((prev) => prev + 1);
        return;
      }
      if (formData.useAI) {
        return;
      }

      const payload = {
        tenantId: user?.tenant?.tenantId || 5,
        testName: formData.testName,
        stream: formData.stream,
        category: "Technical", // Fixed category as per sample payload.
        testType: formData.questionType,
        timeLimit: 60,
        jobIDs: formData.jobIDs,
      };

      try {
        setIsSubmitting(true);
        setButtonText("Submitting...");
        const response = await fetch(`${testServiceUrl}/api/v1/tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": "akshayy",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating test:", errorData);
          toast.error("Error creating test");
          setButtonText("Next");
          return;
        } else {
          const responseData = await response.json();
          console.log("Test created successfully:", responseData);
          toast.success("Test created successfully");
          // Update formData with the returned testId.
          setFormData((prev) => ({ ...prev, testId: responseData.id }));
        }
      } catch (error) {
        console.error("Error creating test:", error);
        toast.error("Error creating test");
        setButtonText("Next");
        return;
      } finally {
        setIsSubmitting(false);
      }

      // Move to the next step after a successful API call.
      setCurrentStep((prev) => prev + 1);
    } else {
      // For all other steps, simply move to the next step.
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Update formData based on child component changes.
  const handleFormDataChange = useCallback((newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);

  const CurrentStepComponent = steps[currentStep - 1].component;
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Create Assessment</h1>
          <Link to="/dashboard/tests">
            <Button
              variant="outline"
              className="bg-white text-white bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] border-gray-300"
            >
              Exit
            </Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 px-4 sm:px-6 lg:px-20">
          <div className="flex flex-col sm:flex-row sm:items-center pl-10 sm:pl-0 justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center mt-2 sm:mt-0">
                <div
                  className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-base ${
                    stepItem.id <= currentStep
                      ? "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white"
                      : "border-2 border-gray-300 text-gray-500"
                  }`}
                >
                  {stepItem.id}
                </div>
                <div
                  className={`ml-2 sm:ml-3 text-xs sm:text-sm ${
                    stepItem.id <= currentStep
                      ? "text-indigo-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {stepItem.name}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 sm:mx-4 h-[1px] sm:h-[2px] w-10 sm:w-36 ${
                      stepItem.id < currentStep ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Render the current step component */}
        <div className="rounded-lg bg-white p-6 sm:p-8 shadow-lg">
          <CurrentStepComponent 
            formData={formData} 
            onFormDataChange={handleFormDataChange}
            onAdvanceStep={currentStep === 1 ? () => {setCurrentStep((prev) => prev + 1);} : () => { handleNext().catch(console.error); }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="bg-white text-gray-900 hover:text-black hover:bg-gray-100 border-gray-300"
            >
              Previous
            </Button>
          )}
          <div className="flex-grow" />
          {currentStep < steps.length && currentStep > 1 ? (
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white hover:from-indigo-700 hover:to-indigo-900"
            >
              Next
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}



