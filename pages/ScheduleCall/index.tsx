import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { toast } from "react-hot-toast";
import CandidateSelector from "./components/CandidateSelector";
import QuestionManager from "./components/QuestionManager";
import CallDetails from "./components/CallDetails";
import { Candidate } from "./types/ScheduleCallTypes";
import { Job } from "../Jobs/types/jobs";

export default function ScheduleCallPage() {
  const { jobId: urlJobId } = useParams();
	const location = useLocation();

  // Access the passed job object
  const job: Job | null = location.state?.job || null;
  const navigate = useNavigate();
  
  // Step state: 1 (Select Candidate), 2 (Manage Questions), 3 (Call Details)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Array<{id: string, text: string}>>([]);
  const [callDateTime, setCallDateTime] = useState<{date: Date, time: string}>({ date: new Date(), time: "" });

  // Navigate through steps
  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Get step title based on current step
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Select Candidate";
      case 2:
        return "Manage Questions";
      case 3:
        return "Schedule Call";
      default:
        return "";
    }
  };

  // Handle candidate selection
  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    nextStep();
  };

  // Handle questions update
  const handleQuestionsUpdate = (questions: Array<{id: string, text: string}>) => {
    setSelectedQuestions(questions);
    nextStep();
  };

  // Handle final submission
  const handleScheduleCall = async (dateTime: {date: Date, time: string}) => {
    setIsSubmitting(true);
    setCallDateTime(dateTime);
    
    try {
  
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Call scheduled successfully");
      navigate("/job/interviews/interviews-page");
    } catch (error) {
      console.error("Error scheduling call:", error);
      toast.error("Failed to schedule call");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <BackgroundBeams />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="relative z-10 flex items-center space-x-2">
            <ChevronLeft className="w-4 h-4 text-[#2E2883]" />
            <a href="/dashboard/jobs" className="text-[#2E2883] hover:underline text-md">
              Back to Jobs
            </a>
          </div>

          {/* Header with Title and Tips */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Title and Progress Indicator */}
            <div className="md:col-span-3">
              <Card className="border-none shadow-lg bg-white backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#2E2883] text-3xl">
                      Schedule Call: {getStepTitle()}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Steps */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-full flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#2E2883] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-[#2E2883]' : 'bg-gray-200'}`}></div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#2E2883] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-[#2E2883]' : 'bg-gray-200'}`}></div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#2E2883] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Select Candidate</span>
                      <span>Manage Questions</span>
                      <span>Schedule Details</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tips Section - smaller and to the right */}
            <div className="md:col-span-1">
              <Card className="border-none shadow-lg bg-white backdrop-blur-sm h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md text-[#2E2883]">Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <ul className="text-xs text-blue-700 space-y-2">
                      <li>• Select appropriate questions</li>
                      <li>• Check time zones</li>
                      <li>• Review candidate background</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content - Full Width */}
          <Card className="border-none shadow-lg bg-white backdrop-blur-sm">
            <CardContent className="pt-6">
              {/* Step 1: Candidate Selection */}
              {step === 1 && (
                <CandidateSelector jobId={urlJobId} onCandidateSelect={handleCandidateSelect} />
              )}

              {/* Step 2: Question Management */}
              {step === 2 && (
                <QuestionManager 
                  jobId={urlJobId}
				  jobTitle={job?.title}
				  jobDescription={job?.description}
                  candidateId={selectedCandidate?.id}
                  onQuestionsSelected={handleQuestionsUpdate}
                  onBack={prevStep}
                />
              )}

              {/* Step 3: Call Details */}
              {step === 3 && (
                <CallDetails 
                  candidate={selectedCandidate}
                  questions={selectedQuestions}
                  onSubmit={handleScheduleCall}
                  onBack={prevStep}
                  isSubmitting={isSubmitting}
                  jobId={urlJobId} 
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}