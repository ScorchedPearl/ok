// "use client";

// import React, { useState, useContext, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import ReactMarkdown from 'react-markdown';
// import { Info, CheckCircle, ArrowRight } from "lucide-react";
// import { AssessmentContext } from "@/context/AssessmentContext";
// import ExamHeader from "./ExamHeader";
// import { Textarea } from "@/components/ui/textarea";
// // Import the FaceMonitoring component
// import FaceMonitoring from "@/components/FaceMonitoring";

// // Local state interface for tracking question status
// interface LocalQuestion {
//   id: number;
//   questionText: string;
//   options: string[];
//   type: string | null;
//   selectedAnswer: string | null;
//   subjectiveAnswer?: string;
//   isAnswered: boolean;
// }

// export default function AssessmentQuestion() {
//   const navigate = useNavigate();
  
//   // Context values
//   const {
//     libraries,
//     librariesinfo,
//     totalLibrary,
//     currentLibraryIndex,
//     sessionToken,
//     answerQuestion,
//     loadNextLibrary,
//     endTest,
//     // These are needed for the warning modals
//     showWarningModal,
//     warningMessage,
//     dismissWarning
//   } = useContext(AssessmentContext);

//   console.log(libraries,"libraries");

//   // Local state
//   const [questions, setQuestions] = useState<LocalQuestion[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [subjectiveAnswer, setSubjectiveAnswer] = useState("");

//   // Initialize questions when library changes
//   useEffect(() => {
//     if (libraries?.[0]?.questions) {
//       const initializedQuestions = libraries[0].questions.map(q => {
//         // Set default answer for passage (type null) questions
//         if (q.type === null) {
//           return {
//             ...q,
//             selectedAnswer: null,
//             subjectiveAnswer: "This is a passage question",
//             isAnswered: true // Mark passage as answered by default
//           };
//         }
//         return {
//           ...q,
//           selectedAnswer: null,
//           subjectiveAnswer: "",
//           isAnswered: false
//         };
//       });
//       setQuestions(initializedQuestions);
//       setCurrentQuestionIndex(0);
//       setSubjectiveAnswer("");
      
//       // Auto-submit answer for passage question
//       if (initializedQuestions.length > 0 && initializedQuestions[0].type === null) {
//         answerQuestion(
//           initializedQuestions[0].id,
//           libraries[0].libraryId,
//           "This is a passage question"
//         ).catch(err => {
//           console.error("Failed to auto-submit passage answer:", err);
//         });
//       }
//     }
//   }, [libraries]);

//   // Get current library info
//   const currentLibrary = libraries?.[0];
//   const currentLibraryInfo = librariesinfo?.find(
//     lib => lib.libraryId.toString() === currentLibrary?.libraryId
//   );

//   // Check if first question is a passage (type NULL)
//   const hasPassage = questions.length > 0 && questions[0].type === null;
  
//   // Get the actual question index accounting for passage
//   const actualQuestionIndex = hasPassage ? currentQuestionIndex + 1 : currentQuestionIndex;
//   const displayedQuestionIndex = hasPassage && currentQuestionIndex > 0 ? currentQuestionIndex : currentQuestionIndex;
  
//   // Get the current question based on index
//   const currentQuestion = questions[displayedQuestionIndex];
  
//   // Get the active question for display (when passage exists, this is different from currentQuestion when on passage)
//   const activeQuestion = hasPassage && currentQuestionIndex > 0 ? questions[currentQuestionIndex] : currentQuestion;

//   // Handle answer selection for MCQ questions
//   const handleAnswerSelection = async (answerText: string, answerIndex: number) => {
//     try {
//       const letterAnswer = ['A', 'B', 'C', 'D'][answerIndex];
//       const questionIndex = hasPassage && currentQuestionIndex > 0 ? currentQuestionIndex : displayedQuestionIndex;
      
//       // Update local state
//       const updatedQuestions = [...questions];
//       updatedQuestions[questionIndex] = {
//         ...questions[questionIndex],
//         selectedAnswer: letterAnswer,
//         isAnswered: true
//       };
//       setQuestions(updatedQuestions);

//       // Submit to backend
//       await answerQuestion(
//         questions[questionIndex].id,
//         currentLibrary.libraryId,
//         letterAnswer
//       );
//     } catch (err) {
//       setError('Failed to submit answer. Please try again.');
//       setTimeout(() => setError(null), 5000);
//     }
//   };

//   // Handle subjective answer input
//   const handleSubjectiveInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const newAnswer = e.target.value;
//     setSubjectiveAnswer(newAnswer);
    
//     // Update local state
//     const updatedQuestions = [...questions];
//     const questionIndex = hasPassage && currentQuestionIndex > 0 ? currentQuestionIndex : displayedQuestionIndex;
    
//     updatedQuestions[questionIndex] = {
//       ...questions[questionIndex],
//       subjectiveAnswer: newAnswer,
//       isAnswered: newAnswer.trim().length > 0
//     };
//     setQuestions(updatedQuestions);
//   };

//   // Handle navigation to next question or library
//   const handleNext = async () => {
//     // Determine the correct question index
//     const questionIndex = hasPassage && currentQuestionIndex > 0 ? currentQuestionIndex : displayedQuestionIndex;
//     const currentActiveQuestion = questions[questionIndex];
    
//     // If current question is subjective, submit the answer
//     if (currentActiveQuestion.type === "SUBJECTIVE") {
//       // Use the stored answer from the question state, not just the subjectiveAnswer state
//       const answerToSubmit = currentActiveQuestion.subjectiveAnswer || "";
      
//       if (!answerToSubmit || answerToSubmit.trim() === '') {
//         setError('Please provide an answer before proceeding.');
//         setTimeout(() => setError(null), 5000);
//         return;
//       }
      
//       try {
//         await answerQuestion(
//           currentActiveQuestion.id,
//           currentLibrary.libraryId,
//           answerToSubmit
//         );
//       } catch (err) {
//         setError('Failed to submit answer. Please try again.');
//         setTimeout(() => setError(null), 5000);
//         return;
//       }
//     }

//     // If there are more questions in current library
//     if (displayedQuestionIndex < questions.length - 1) {
//       // If there's a passage, and this is the passage, go to actual first question
//       if (hasPassage && displayedQuestionIndex === 0) {
//         setCurrentQuestionIndex(1);
//       } else {
//         setCurrentQuestionIndex(displayedQuestionIndex + 1);
//       }
//       setSubjectiveAnswer("");
//       return;
//     }

//     // Make sure all questions are answered before proceeding
//     const unansweredQuestions = questions.filter(q => !q.isAnswered);
//     if (unansweredQuestions.length > 0) {
//       setError(`There are ${unansweredQuestions.length} unanswered questions in this section. Please complete all questions before proceeding.`);
//       setTimeout(() => setError(null), 5000);
//       return;
//     }

//     // If we're at the last question of the current library
//     setIsLoading(true);
//     try {
//       // Attempt to load next library
//       const success = await loadNextLibrary();
      
//       if (success) {
//         // Next library loaded successfully
//         setError(null);
//       } else {
//         // No more libraries - complete the test
//         await endTest();
//         navigate('/assessment/feedback');
//       }
//     } catch (err) {
//       setError('Failed to load next section. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//             className="w-8 h-8 border-2 border-[#2E2883] border-t-transparent rounded-full mx-auto"
//           />
//           <p className="text-lg text-[#2E2883]">Loading next section...</p>
//         </div>
//       </div>
//     );
//   }

//   // No questions loaded
//   if (!questions.length) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <p className="text-lg text-gray-600">No questions available</p>
//       </div>
//     );
//   }

//   // Calculate progress percentage correctly, accounting for passage
//   const totalDisplayedQuestions = hasPassage ? questions.length - 1 : questions.length;
//   const displayedQuestionProgress = hasPassage ? currentQuestionIndex - (currentQuestionIndex > 0 ? 1 : 0) : currentQuestionIndex;
//   const progressPercentage = totalDisplayedQuestions > 0 
//     ? (displayedQuestionProgress / totalDisplayedQuestions) * 100 
//     : 0;

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Include the FaceMonitoring component */}
//       <FaceMonitoring />
      
//       <ExamHeader/>
//       <div className="flex min-h-screen">
//         {/* Left Panel - Question Information */}
//         <div className="w-1/2 bg-[#F8FAFC] p-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
//           <div className="max-w-2xl mx-auto space-y-6">
//             {/* Progress Information */}
//             <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="inline-flex items-center gap-2 text-[#2E2883]">
//                   <span className="font-medium">Section Progress:</span>
//                   <span>{currentLibraryIndex + 1} of {totalLibrary}</span>
//                 </div>
//                 <div className="inline-flex items-center gap-2 text-[#2E2883]">
//                   <span className="font-medium">Question:</span>
//                   <span>
//                     {hasPassage && currentQuestionIndex > 0 
//                       ? currentQuestionIndex 
//                       : hasPassage ? "Passage" : currentQuestionIndex + 1} 
//                     of {hasPassage ? questions.length - 1 : questions.length}
//                   </span>
//                 </div>
//               </div>
              
//               {/* Progress Bar */}
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div 
//                   className="bg-[#2E2883] h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${progressPercentage}%` }}
//                 />
//               </div>
//             </div>

//             {/* Passage (if first question type is NULL) - Always visible when exists */}
//             {hasPassage && (
//               <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//                 <div className="flex items-center gap-2 text-[#2E2883] mb-4">
//                   <h2 className="text-xl font-semibold">
//                     Passage
//                   </h2>
//                   {currentQuestionIndex > 0 && (
//                     <span className="text-sm bg-[#E8F5E9] text-[#4CAF50] px-2 py-1 rounded-full">
//                       Reference
//                     </span>
//                   )}
//                 </div>
//                 <div className="prose max-w-none text-gray-800 border-l-4 border-[#2E2883]/20 pl-4">
//                 <ReactMarkdown
//                   components={{
//                     p: ({node, ...props}) => <p className="prose prose-slate" {...props} />
//                   }}
//                 >
//                   {questions[0].questionText}
//                 </ReactMarkdown>
//               </div>
//               </div>
//             )}

//             {/* Library Information */}
//             <Card className="border-none shadow-sm">
//               <CardContent className="p-6 space-y-4">
//                 <div className="flex items-center gap-2 text-[#2E2883]">
//                   <Info className="w-5 h-5" />
//                   <h3 className="font-medium">{currentLibraryInfo?.libraryName}</h3>
//                 </div>
//                 {currentLibraryInfo?.description && (
//                   <p className="text-sm text-gray-600">
//                     {currentLibraryInfo.description}
//                   </p>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Right Panel - Answer Options */}
//         <div className="w-1/2 bg-white p-8 overflow-y-auto">
//           <div className="max-w-2xl mx-auto space-y-8">
//             {/* If showing the passage view (first question & type NULL) */}
//              {/* Question */}
//              {(!hasPassage || currentQuestionIndex > 0) && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h2 className="text-xl font-semibold text-[#2E2883] mb-4">
//                   {hasPassage && currentQuestionIndex > 0 
//                     ? questions[currentQuestionIndex].questionText
//                     : currentQuestion.questionText}
//                 </h2>
//               </div>
//             )}
//             {hasPassage && currentQuestionIndex === 0 ? (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-medium text-[#2E2883]">
//                     Read the passage
//                   </h3>
//                 </div>
//                 <div className="bg-[#F0F7FF] border-l-4 border-[#2E2883] p-4 rounded-r-lg">
//                   <p className="text-gray-700">
//                     Please read the passage carefully. The questions will be based on this content.
//                     The passage will remain visible for reference while you answer the questions.
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               /* Normal question view */
//               <>
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-medium text-[#2E2883]">
//                     {activeQuestion.type === "SUBJECTIVE" 
//                       ? "Write your answer" 
//                       : "Select your answer"}
//                   </h3>
//                   <span className="text-sm text-gray-500">Required</span>
//                 </div>

//                 {/* MCQ Answer Options */}
//                 {activeQuestion.type !== "SUBJECTIVE" && activeQuestion.options && (
//                   <div className="space-y-4">
//                     {activeQuestion.options.map((option, index) => (
//                       <motion.div
//                         key={index}
//                         whileHover={{ scale: 1.01 }}
//                         transition={{ duration: 0.2 }}
//                         onClick={() => handleAnswerSelection(option, index)}
//                         className={`
//                           relative rounded-xl border-2 p-6 cursor-pointer 
//                           transition-all duration-200
//                           ${
//                             activeQuestion.selectedAnswer === ['A', 'B', 'C', 'D'][index]
//                               ? 'border-[#4CAF50] bg-[#F1F8E9]' 
//                               : 'border-gray-200 hover:border-[#2E2883]/30 hover:bg-[#F8FAFC]'
//                           }
//                         `}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             {/* Radio Button */}
//                             <div className={`
//                               w-5 h-5 rounded-full border-2 flex items-center justify-center
//                               ${
//                                 activeQuestion.selectedAnswer === ['A', 'B', 'C', 'D'][index]
//                                   ? 'border-[#4CAF50] bg-white'
//                                   : 'border-gray-300'
//                               }
//                             `}>
//                               {activeQuestion.selectedAnswer === ['A', 'B', 'C', 'D'][index] && (
//                                 <motion.div
//                                   initial={{ scale: 0 }}
//                                   animate={{ scale: 1 }}
//                                   className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"
//                                 />
//                               )}
//                             </div>
                            
//                             {/* Option Text */}
//                             <span className="text-lg text-gray-700">{option}</span>
//                           </div>

//                           {/* Checkmark for selected answer */}
//                           {activeQuestion.selectedAnswer === ['A', 'B', 'C', 'D'][index] && (
//                             <motion.div
//                               initial={{ opacity: 0, scale: 0.5 }}
//                               animate={{ opacity: 1, scale: 1 }}
//                             >
//                               <CheckCircle className="w-5 h-5 text-[#4CAF50]" />
//                             </motion.div>
//                           )}
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Subjective Answer Input */}
//                 {activeQuestion.type === "SUBJECTIVE" && (
//                   <div className="space-y-4">
//                     <Textarea
//                       placeholder="Type your answer here..."
//                       className="min-h-[200px] p-4 text-base resize-y"
//                       value={activeQuestion.subjectiveAnswer || subjectiveAnswer}
//                       onChange={handleSubjectiveInput}
//                     />
//                     <p className="text-sm text-gray-500">
//                       {(activeQuestion.subjectiveAnswer || subjectiveAnswer).length} characters
//                     </p>
//                   </div>
//                 )}
//               </>
//             )}

//             {/* Navigation Button */}
//             <div className="fixed bottom-8 right-8">
//               <Button
//                 size="lg"
//                 onClick={handleNext}
//                 disabled={
//                   !(hasPassage && currentQuestionIndex === 0) && 
//                   !activeQuestion.isAnswered
//                 }
//                 className={`
//                   px-8 py-6 rounded-xl text-lg transition-all duration-200 group
//                   ${
//                     (hasPassage && currentQuestionIndex === 0) || activeQuestion.isAnswered
//                       ? 'bg-[#2E2883] hover:bg-[#2E2883]/90 text-white shadow-lg' 
//                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   }
//                 `}
//               >
//                 {hasPassage && currentQuestionIndex === 0 
//                   ? "Start Questions" 
//                   : displayedQuestionIndex === questions.length - 1 
//                     ? currentLibraryIndex === totalLibrary - 1 
//                       ? 'Complete Test'
//                       : 'Next Section'
//                     : 'Next Question'}
//                 <ArrowRight className={`
//                   ml-2 w-5 h-5 transition-transform duration-200
//                   ${(hasPassage && currentQuestionIndex === 0) || activeQuestion.isAnswered 
//                     ? 'group-hover:translate-x-1' 
//                     : ''}
//                 `} />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Error Toast */}
//       {error && (
//         <motion.div
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: 50 }}
//           className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg"
//         >
//           <strong className="font-bold">Error:</strong>
//           <span className="block sm:inline ml-1">{error}</span>
//         </motion.div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { Info, CheckCircle, ArrowRight, Code } from "lucide-react";
import { AssessmentContext } from "@/context/AssessmentContext";
import ExamHeader from "./ExamHeader";
import { Textarea } from "@/components/ui/textarea";
// Import the FaceMonitoring component
import FaceMonitoring from "@/components/FaceMonitoring";
import controlledClipboard from "@/services/controlledClipboard";
import Editor from "@monaco-editor/react";
import { 
  Select, 
  SelectContent,  
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Languages for code editor
const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "php", label: "PHP" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "rust", label: "Rust" },
];

// Local state interface for tracking question status
interface LocalQuestion {
  id: number;
  questionText: string;
  options: string[];
  type: string | null;
  selectedAnswer: string | null;
  subjectiveAnswer?: string;
  codeAnswer?: string;
  codeLanguage?: string;
  isAnswered: boolean;
}

export default function AssessmentQuestion() {
  const navigate = useNavigate();

  // Context values
  const {
    libraries,
    librariesinfo,
    totalLibrary,
    currentLibraryIndex,
    sessionToken,
    answerQuestion,
    loadNextLibrary,
    endTest,
    // These are needed for the warning modals
    showWarningModal,
    warningMessage,
    dismissWarning,
  } = useContext(AssessmentContext);

  console.log(libraries, "libraries");

  // Local state
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjectiveAnswer, setSubjectiveAnswer] = useState("");
  const [codeAnswer, setCodeAnswer] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");

  // Initialize questions when library changes
  useEffect(() => {
    if (libraries?.[0]?.questions) {
      const initializedQuestions = libraries[0].questions.map((q) => {
        // Set default answer for passage (type null) questions
        if (q.type === null) {
          return {
            ...q,
            selectedAnswer: null,
            subjectiveAnswer: "This is a passage question",
            isAnswered: true, // Mark passage as answered by default
          };
        }
        return {
          ...q,
          selectedAnswer: null,
          subjectiveAnswer: "",
          codeAnswer: "",
          codeLanguage: "javascript",
          isAnswered: false
        };
      });
      setQuestions(initializedQuestions);
      setCurrentQuestionIndex(0);
      setSubjectiveAnswer("");
      setCodeAnswer("");
      setCodeLanguage("javascript");
      
      // Auto-submit answer for passage question
      if (
        initializedQuestions.length > 0 &&
        initializedQuestions[0].type === null
      ) {
        answerQuestion(
          initializedQuestions[0].id,
          libraries[0].libraryId,
          "This is a passage question"
        ).catch((err) => {
          console.error("Failed to auto-submit passage answer:", err);
        });
      }
    }
  }, [libraries]);

  useEffect(() => {
	  // Activate the controlled clipboard when test begins
	  controlledClipboard.startTest();
  
	  return () => {
		// Clean up when component unmounts
		controlledClipboard.endTest();
	  };
	}, []);
	
  // Get current library info
  const currentLibrary = libraries?.[0];
  const currentLibraryInfo = librariesinfo?.find(
    (lib) => lib.libraryId.toString() === currentLibrary?.libraryId
  );

  // Check if first question is a passage (type NULL)
  const hasPassage = questions.length > 0 && questions[0].type === null;

  // Get the actual question index accounting for passage
  const actualQuestionIndex = hasPassage
    ? currentQuestionIndex + 1
    : currentQuestionIndex;
  const displayedQuestionIndex =
    hasPassage && currentQuestionIndex > 0
      ? currentQuestionIndex
      : currentQuestionIndex;

  // Get the current question based on index
  const currentQuestion = questions[displayedQuestionIndex];

  // Get the active question for display (when passage exists, this is different from currentQuestion when on passage)
  const activeQuestion =
    hasPassage && currentQuestionIndex > 0
      ? questions[currentQuestionIndex]
      : currentQuestion;

  // Handle answer selection for MCQ questions
  const handleAnswerSelection = async (
    answerText: string,
    answerIndex: number
  ) => {
    try {
      const letterAnswer = ["A", "B", "C", "D"][answerIndex];
      const questionIndex =
        hasPassage && currentQuestionIndex > 0
          ? currentQuestionIndex
          : displayedQuestionIndex;

      // Update local state
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex] = {
        ...questions[questionIndex],
        selectedAnswer: letterAnswer,
        isAnswered: true,
      };
      setQuestions(updatedQuestions);

      // Submit to backend
      await answerQuestion(
        questions[questionIndex].id,
        currentLibrary.libraryId,
        letterAnswer
      );
    } catch (err) {
      setError("Failed to submit answer. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle subjective answer input
  const handleSubjectiveInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setSubjectiveAnswer(newAnswer);
    
    // Update local state
    const updatedQuestions = [...questions];
    const questionIndex = hasPassage && currentQuestionIndex > 0 ? currentQuestionIndex : displayedQuestionIndex;
    
    updatedQuestions[questionIndex] = {
      ...questions[questionIndex],
      subjectiveAnswer: newAnswer,
      isAnswered: newAnswer.trim().length > 0
    };
    setQuestions(updatedQuestions);
  };

  // Handle code answer input
  const handleCodeInput = (value: string | undefined) => {
    const newCode = value || "";
    setCodeAnswer(newCode);
    
    // Update local state
    const updatedQuestions = [...questions];
    const questionIndex = hasPassage && currentQuestionIndex > 0 ? currentQuestionIndex : displayedQuestionIndex;
    
    updatedQuestions[questionIndex] = {
      ...questions[questionIndex],
      codeAnswer: newCode,
      isAnswered: newCode.trim().length > 0
    };
    setQuestions(updatedQuestions);
  };

  // Handle code language change
  const handleLanguageChange = (language: string) => {
    setCodeLanguage(language);
    
    // Update local state
    const updatedQuestions = [...questions];
    const questionIndex = hasPassage && currentQuestionIndex > 0 ? currentQuestionIndex : displayedQuestionIndex;
    
    updatedQuestions[questionIndex] = {
      ...questions[questionIndex],
      codeLanguage: language
    };
    setQuestions(updatedQuestions);
  };

  // Handle navigation to next question or library
  const handleNext = async () => {
    // Determine the correct question index
    const questionIndex =
      hasPassage && currentQuestionIndex > 0
        ? currentQuestionIndex
        : displayedQuestionIndex;
    const currentActiveQuestion = questions[questionIndex];

    // If current question is subjective, submit the answer
    if (currentActiveQuestion.type === "SUBJECTIVE") {
      // Use the stored answer from the question state, not just the subjectiveAnswer state
      const answerToSubmit = currentActiveQuestion.subjectiveAnswer || "";

      if (!answerToSubmit || answerToSubmit.trim() === "") {
        setError("Please provide an answer before proceeding.");
        setTimeout(() => setError(null), 5000);
        return;
      }

      try {
        await answerQuestion(
          currentActiveQuestion.id,
          currentLibrary.libraryId,
          answerToSubmit
        );
      } catch (err) {
        setError('Failed to submit answer. Please try again.');
        setTimeout(() => setError(null), 5000);
        return;
      }
    }
    
    // If current question is code, submit the answer
    if (currentActiveQuestion.type === "CODE") {
      // Use the stored answer from the question state
      const codeToSubmit = currentActiveQuestion.codeAnswer || "";
      const languageUsed = currentActiveQuestion.codeLanguage || "javascript";
      
      if (!codeToSubmit || codeToSubmit.trim() === '') {
        setError('Please provide code before proceeding.');
        setTimeout(() => setError(null), 5000);
        return;
      }
      
      try {
        // Format the answer to include both code and language
        const formattedAnswer = codeToSubmit
        
        await answerQuestion(
          currentActiveQuestion.id,
          currentLibrary.libraryId,
          formattedAnswer
        );
      } catch (err) {
        setError('Failed to submit code. Please try again.');
        setTimeout(() => setError(null), 5000);
        return;
      }
    }

    // If there are more questions in current library
    if (displayedQuestionIndex < questions.length - 1) {
      // If there's a passage, and this is the passage, go to actual first question
      if (hasPassage && displayedQuestionIndex === 0) {
        setCurrentQuestionIndex(1);
      } else {
        setCurrentQuestionIndex(displayedQuestionIndex + 1);
      }
      setSubjectiveAnswer("");
      setCodeAnswer("");
      setCodeLanguage("javascript");
      return;
    }

    // Make sure all questions are answered before proceeding
    const unansweredQuestions = questions.filter((q) => !q.isAnswered);
    if (unansweredQuestions.length > 0) {
      setError(
        `There are ${unansweredQuestions.length} unanswered questions in this section. Please complete all questions before proceeding.`
      );
      setTimeout(() => setError(null), 5000);
      return;
    }

    // If we're at the last question of the current library
    setIsLoading(true);
    try {
      // Attempt to load next library
      const success = await loadNextLibrary();

      if (success) {
        // Next library loaded successfully
        setError(null);
      } else {
        // No more libraries - complete the test
        await endTest();
        navigate("/assessment/feedback");
      }
    } catch (err) {
      setError("Failed to load next section. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#2E2883] border-t-transparent rounded-full mx-auto"
          />
          <p className="text-lg text-[#2E2883]">Loading next section...</p>
        </div>
      </div>
    );
  }

  // No questions loaded
  if (!questions.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">No questions available</p>
      </div>
    );
  }

  // Calculate progress percentage correctly, accounting for passage
  const totalDisplayedQuestions = hasPassage
    ? questions.length - 1
    : questions.length;
  const displayedQuestionProgress = hasPassage
    ? currentQuestionIndex - (currentQuestionIndex > 0 ? 1 : 0)
    : currentQuestionIndex;
  const progressPercentage =
    totalDisplayedQuestions > 0
      ? (displayedQuestionProgress / totalDisplayedQuestions) * 100
      : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Include the FaceMonitoring component */}
      <FaceMonitoring />

      <ExamHeader />
      <div className="flex min-h-screen">
        {/* Left Panel - Question Information */}
        <div
          className="w-1/2 bg-[#F8FAFC] p-8 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 80px)" }}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-[#2E2883]">
                  <span className="font-medium">Section Progress:</span>
                  <span>
                    {currentLibraryIndex + 1} of {totalLibrary}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 text-[#2E2883]">
                  <span className="font-medium">Question:</span>
                  <span>
                    {hasPassage && currentQuestionIndex > 0
                      ? currentQuestionIndex
                      : hasPassage
                        ? "Passage"
                        : currentQuestionIndex + 1}
                    of {hasPassage ? questions.length - 1 : questions.length}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#2E2883] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Passage (if first question type is NULL) - Always visible when exists */}
            {hasPassage && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-2 text-[#2E2883] mb-4">
                  <h2 className="text-xl font-semibold">Passage</h2>
                  {currentQuestionIndex > 0 && (
                    <span className="text-sm bg-[#E8F5E9] text-[#4CAF50] px-2 py-1 rounded-full">
                      Reference
                    </span>
                  )}
                </div>
                <div className="prose max-w-none text-gray-800 border-l-4 border-[#2E2883]/20 pl-4">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="prose prose-slate" {...props} />
                      ),
                    }}
                  >
                    {questions[0].questionText}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Library Information */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#2E2883]">
                  <Info className="w-5 h-5" />
                  <h3 className="font-medium">
                    {currentLibraryInfo?.libraryName}
                  </h3>
                </div>
                {currentLibraryInfo?.description && (
                  <p className="text-sm text-gray-600">
                    {currentLibraryInfo.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Answer Options */}
        <div className="w-1/2 bg-white p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* If showing the passage view (first question & type NULL) */}
            {/* Question */}
            {(!hasPassage || currentQuestionIndex > 0) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2E2883] mb-0">
                    {hasPassage && currentQuestionIndex > 0 
                      ? questions[currentQuestionIndex].questionText
                      : currentQuestion.questionText}
                  </h2>
                  
                  {/* Question type badge */}
                  {activeQuestion && activeQuestion.type === "CODE" && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                      <Code className="h-3 w-3 mr-1" />
                      Coding
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {hasPassage && currentQuestionIndex === 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#2E2883]">
                    Read the passage
                  </h3>
                </div>
                <div className="bg-[#F0F7FF] border-l-4 border-[#2E2883] p-4 rounded-r-lg">
                  <p className="text-gray-700">
                    Please read the passage carefully. The questions will be
                    based on this content. The passage will remain visible for
                    reference while you answer the questions.
                  </p>
                </div>
              </div>
            ) : (
              /* Normal question view */
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#2E2883]">
                    {activeQuestion.type === "SUBJECTIVE" 
                      ? "Write your answer" 
                      : activeQuestion.type === "CODE"
                      ? "Write your code"
                      : "Select your answer"}
                  </h3>
                  <span className="text-sm text-gray-500">Required</span>
                </div>

                {/* MCQ Answer Options */}
                {activeQuestion.type !== "SUBJECTIVE" && 
                 activeQuestion.type !== "CODE" && 
                 activeQuestion.options && (
                  <div className="space-y-4">
                    {activeQuestion.options.map((option, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleAnswerSelection(option, index)}
                        className={`
                          relative rounded-xl border-2 p-6 cursor-pointer 
                          transition-all duration-200
                          ${
                            activeQuestion.selectedAnswer ===
                            ["A", "B", "C", "D"][index]
                              ? "border-[#4CAF50] bg-[#F1F8E9]"
                              : "border-gray-200 hover:border-[#2E2883]/30 hover:bg-[#F8FAFC]"
                          }
                        `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Radio Button */}
                              <div
                                className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${
                                activeQuestion.selectedAnswer ===
                                ["A", "B", "C", "D"][index]
                                  ? "border-[#4CAF50] bg-white"
                                  : "border-gray-300"
                              }
                            `}
                              >
                                {activeQuestion.selectedAnswer ===
                                  ["A", "B", "C", "D"][index] && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"
                                  />
                                )}
                              </div>

                              {/* Option Text */}
                              <span className="text-lg text-gray-700">
                                {option}
                              </span>
                            </div>

                            {/* Checkmark for selected answer */}
                            {activeQuestion.selectedAnswer ===
                              ["A", "B", "C", "D"][index] && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <CheckCircle className="w-5 h-5 text-[#4CAF50]" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                {/* Subjective Answer Input */}
                {activeQuestion.type === "SUBJECTIVE" && (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your answer here..."
                      className="min-h-[200px] p-4 text-base resize-y"
                      value={activeQuestion.subjectiveAnswer || subjectiveAnswer}
                      onChange={handleSubjectiveInput}
                    />
                    <p className="text-sm text-gray-500">
                      {(activeQuestion.subjectiveAnswer || subjectiveAnswer).length} characters
                    </p>
                  </div>
                )}

                {/* Code Answer Input */}
                {activeQuestion.type === "CODE" && (
                  <div className="space-y-4">
                    {/* Language Selector */}
                    <div className="flex justify-end">
                      <Select
                        value={activeQuestion.codeLanguage || codeLanguage}
                        onValueChange={handleLanguageChange}
                      >
                        <SelectTrigger className="w-40 h-9 text-sm">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Code Editor */}
                    <div className="border-2 border-blue-300 hover:border-blue-500 rounded-lg overflow-hidden transition-all duration-200">
                      <div className="bg-gray-800 p-3 text-white flex justify-between items-center">
                        <span className="font-medium">Solution</span>
                        <Badge className="bg-blue-700 text-white">
                          {languages.find(l => l.value === (activeQuestion.codeLanguage || codeLanguage))?.label || "JavaScript"}
                        </Badge>
                      </div>
                      <Editor
                        height="300px"
                        language={activeQuestion.codeLanguage || codeLanguage}
                        value={activeQuestion.codeAnswer || codeAnswer}
                        onChange={handleCodeInput}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: 14,
                        }}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1">
                      Write your code solution above. You can change the language using the dropdown.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Navigation Button */}
            <div className="fixed bottom-8 right-8">
              <Button
                size="lg"
                onClick={handleNext}
                disabled={
                  !(hasPassage && currentQuestionIndex === 0) &&
                  !activeQuestion.isAnswered
                }
                className={`
                  px-8 py-6 rounded-xl text-lg transition-all duration-200 group
                  ${
                    (hasPassage && currentQuestionIndex === 0) ||
                    activeQuestion.isAnswered
                      ? "bg-[#2E2883] hover:bg-[#2E2883]/90 text-white shadow-lg"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                {hasPassage && currentQuestionIndex === 0
                  ? "Start Questions"
                  : displayedQuestionIndex === questions.length - 1
                    ? currentLibraryIndex === totalLibrary - 1
                      ? "Complete Test"
                      : "Next Section"
                    : "Next Question"}
                <ArrowRight
                  className={`
                  ml-2 w-5 h-5 transition-transform duration-200
                  ${
                    (hasPassage && currentQuestionIndex === 0) ||
                    activeQuestion.isAnswered
                      ? "group-hover:translate-x-1"
                      : ""
                  }
                `}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-1">{error}</span>
        </motion.div>
      )}
    </div>
  );
}
