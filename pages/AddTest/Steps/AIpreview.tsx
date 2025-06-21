// import { useState, useEffect } from "react"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import DOMPurify from 'dompurify'
// import { marked } from 'marked'
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Loader2, ChevronDown, ChevronUp, Check, FileText, Send , BookOpen, InfoIcon} from "lucide-react"
// import toast from "react-hot-toast"
// import { useAuth } from "@/context/AuthContext";

// interface Question {
//   questionId: number
//   questionType: string  // "MCQ" or "SUBJECTIVE"
//   questionText: string
//   // For MCQ questions, the keys are letters ("A", "B", "C", "D"), and the values are the option text.
//   options?: Record<string, string>
//   // For MCQ questions, e.g., "A", "B", "C", or "D"
//   correctOption?: string
//   // For subjective questions
//   modelAnswer?: string
//   difficultyLevel: string
//   createdBy: number
//   createdAt: string
//   tenantUserId: number
//   status: string
// }

// interface Library {
//   libraryId: number
//   libraryName: string
//   description: string
//   createdAt: string
//   tenantUserId: number
//   timeRequired: number
//   tags: string[]
//   questions: Question[]
// }

// interface FormData {
//   testId: number | null
// }

// interface AIPreviewProps {
//   formData: FormData
//   onAdvanceStep?: () => void
// }

// const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8003"
// const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || "http://localhost:8004"

// export default function AIPreview({ formData, onAdvanceStep }: AIPreviewProps) {
//   console.log("formData",formData);
//   const [loading, setLoading] = useState(false)
//   const [libraries, setLibraries] = useState<Library[]>([])
//   const {token,user} = useAuth();

//   useEffect(() => {
//     if (!formData.testId) return

//     const fetchLibraries = async () => {
//       setLoading(true)
//       try {
//         const idResponse = await fetch(`${testServiceUrl}/api/v1/tests/${formData.testId}/libraries`,{
//           headers: {
//             Authorization: `Bearer ${token?.access_token}`,
//           }
//         });
//         if (!idResponse.ok) {
//           throw new Error("Failed to fetch library IDs.")
//         }
//         const libraryIds: string[] = await idResponse.json()

//         const fetchPromises = libraryIds.map(async (id) => {
//           const res = await fetch(`${questionBankServiceUrl}/libraries/${id}`)
//           if (!res.ok) {
//             throw new Error(`Failed to fetch library with ID: ${id}`)
//           }
//           return (await res.json()) as Library
//         })

//         const libraryData = await Promise.all(fetchPromises)
//         console.log("libraryData", libraryData)
//         setLibraries(libraryData)
//         toast.success("Fetched libraries successfully!")
//       } catch (error) {
//         console.error(error)
//         toast.error("Failed to fetch libraries. Please try again.")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchLibraries()
//   }, [formData.testId])

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//         <p className="mt-4 text-lg text-gray-600">Loading libraries...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-[#1e1b4b]">Libraries Preview</h2>

//       <ScrollArea className="h-[calc(100vh-180px)] pr-4 rounded-lg border-0">
//         {libraries.length === 0 ? (
//           <p className="text-gray-500 p-4">No libraries found for this test.</p>
//         ) : (
//           <div className="space-y-8 p-4">
//             {libraries.map((library) => (
//               <LibraryCard key={library.libraryId} library={library} />
//             ))}
//           </div>
//         )}
//       </ScrollArea>

//       {onAdvanceStep && (
//         <div className="flex justify-end mt-4">
//           <Button onClick={onAdvanceStep} className="bg-indigo-600 text-white hover:bg-indigo-700">
//             Confirm and Continue
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// function LibraryCard({ library }: { library: Library }) {
//   const [isExpanded, setIsExpanded] = useState(false)

//   return (
//     <Card className="border-2 border-[#4338ca]/20 shadow-lg hover:shadow-xl  transition-all duration-300">
//       <CardHeader
//         className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white cursor-pointer"
//         onClick={() => setIsExpanded(!isExpanded)}
//       >
//         <CardTitle className="flex justify-between items-center">
//           <span>{library.libraryName}</span>
//           <div className="flex items-center space-x-2">
//             <Badge variant="secondary" className="bg-white text-[#1e1b4b]">
//               {library.questions.length} Question{library.questions.length !== 1 ? "s" : ""}
//             </Badge>
//             {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
//           </div>
//         </CardTitle>
//       </CardHeader>

//       <CardContent className={`pt-6 ${isExpanded ? "" : "hidden"}`}>

//         {library.tags && library.tags.length > 0 && (
//           <div className="flex flex-wrap gap-2 mb-4">
//             {library.tags.map((tag, idx) => (
//               <Badge key={idx} variant="outline" className="bg-[#4338ca]/10 text-[#4338ca] border-[#4338ca]">
//                 {tag}
//               </Badge>
//             ))}
//           </div>
//         )}

//         <ScrollArea className="h-[1200px] pr-4 rounded-lg border-0">
//           <div className="space-y-6">
//             {library.questions.map((question, index) => (
//               <QuestionCard key={question.questionId} question={question} index={index} />
//             ))}
//           </div>
//         </ScrollArea>
//       </CardContent>
//     </Card>
//   )
// }

// // In QuestionCard.tsx or the component that displays questions (from your AIPreview.tsx file)
// // Add handling for the PASSAGE type questions

// function QuestionCard({ question, index }: { question: Question; index: number }) {
//   // Determine if this is a subjective or passage question
//   const isSubjective = question.questionType === "SUBJECTIVE";
//   const isPassage = question.questionType === "PASSAGE";
  
//   // State for MCQ selected answer
//   const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
//   // State for subjective answer
//   const [subjectiveAnswer, setSubjectiveAnswer] = useState("");
  
//   // State to track if answer has been submitted
//   const [answerSubmitted, setAnswerSubmitted] = useState(false);
  
//   // State to show/hide model answer
//   const [showModelAnswer, setShowModelAnswer] = useState(false);
  
//   // Track text area height for auto-resize
//   const [textareaHeight, setTextareaHeight] = useState("120px");
  
//   // Handle text area auto-resize
//   const handleTextAreaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setSubjectiveAnswer(e.target.value);
//     // Reset height to auto first to get the correct scrollHeight
//     e.target.style.height = "auto";
//     // Set height based on scrollHeight (min 120px)
//     const newHeight = Math.max(120, e.target.scrollHeight);
//     e.target.style.height = `${newHeight}px`;
//     setTextareaHeight(`${newHeight}px`);
//   };
  
//   // Handle submitting an answer
//   const handleSubmitAnswer = () => {
//     if (isSubjective && !subjectiveAnswer.trim()) {
//       toast.error("Please enter an answer before submitting");
//       return;
//     }
    
//     if (!isSubjective && !isPassage && !selectedOption) {
//       toast.error("Please select an option before submitting");
//       return;
//     }
    
//     setAnswerSubmitted(true);
//     setShowModelAnswer(true);
//     toast.success("Answer submitted successfully!");
//   };
  
//   // Reset the form
//   const handleReset = () => {
//     setSelectedOption(null);
//     setSubjectiveAnswer("");
//     setAnswerSubmitted(false);
//     setShowModelAnswer(false);
//     setTextareaHeight("120px");
//   };
  
//   // Special rendering for passage type questions
//   if (isPassage) {
//     return (
//       <Card className="border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
//         <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white">
//           <CardTitle className="flex justify-between items-center">
//             <div className="flex items-center gap-2">
//               <BookOpen className="h-5 w-5" />
//               <span>Case Study</span>
//             </div>
//             <Badge variant="outline" className="bg-white text-indigo-800 border-indigo-300">
//               {question.difficultyLevel || "Medium"}
//             </Badge>
//           </CardTitle>
//         </CardHeader>

//         <CardContent className="pt-6">
//           <div className="prose prose-indigo max-w-none">
//             {/* Render formatted passage content with markdown support */}
//             <div 
//                 className="p-6 bg-white text-gray-800 rounded-lg border border-indigo-100 shadow-sm prose prose-indigo max-w-none" 
//                 dangerouslySetInnerHTML={{ 
//                   __html: DOMPurify.sanitize(marked.parse(question.questionText, { async: false }))
//                 }} 
//               />

//             <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
//               <div className="flex items-start gap-2">
//                 <InfoIcon className="h-5 w-5 text-indigo-700 mt-0.5" />
//                 <div>
//                   <p className="text-sm font-medium text-indigo-900">
//                     Read the case study carefully
//                   </p>
//                   <p className="text-xs text-indigo-700 mt-1">
//                     The following questions will be based on this scenario. You may refer back to this passage while answering them.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="border-2 border-[#4338ca]/20 shadow-md hover:shadow-lg transition-all duration-300">
//       <CardHeader className="bg-[#4338ca]/10">
//         <CardTitle className="flex justify-between items-center text-[#1e1b4b]">
//           <div className="flex items-center gap-2">
//             <span>Question {index + 1}</span>
//             {isSubjective && (
//               <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-300">
//                 <FileText className="h-3 w-3 mr-1" />
//                 Subjective
//               </Badge>
//             )}
//           </div>
//           <Badge variant="outline" className="bg-white text-[#1e1b4b] border-[#4338ca]">
//             {question.difficultyLevel || "Medium"}
//           </Badge>
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="pt-4">
//         <p className="text-base font-medium text-[#1e1b4b] mb-4">{question.questionText}</p>

//         {/* For Multiple Choice Questions */}
//         {!isSubjective && question.options && (
//           <div className="space-y-2">
//             {Object.entries(question.options).map(([optionKey, optionVal]) => {
//               const isCorrect = optionKey === question.correctOption;
//               const isSelected = optionKey === selectedOption;
              
//               return (
//                 <div
//                   key={optionKey}
//                   className={`p-3 rounded-lg border-2 transition-all duration-200 ${
//                     answerSubmitted && isCorrect
//                       ? "border-green-500 bg-green-50"
//                       : answerSubmitted && isSelected && !isCorrect
//                       ? "border-red-500 bg-red-50"
//                       : isSelected
//                       ? "border-indigo-500 bg-indigo-50"
//                       : "border-[#4338ca]/20 hover:border-[#4338ca] hover:bg-[#4338ca]/5"
//                   } ${!answerSubmitted ? "cursor-pointer" : ""}`}
//                   onClick={() => !answerSubmitted && setSelectedOption(optionKey)}
//                 >
//                   <div className="flex items-center">
//                     {/* Show check icon for correct answer after submission */}
//                     {answerSubmitted && isCorrect && (
//                       <div className="flex-shrink-0 mr-2">
//                         <Check className="h-5 w-5 text-green-500" />
//                       </div>
//                     )}
//                     <p className="text-[#1e1b4b]">
//                       <span className="font-semibold mr-1">{optionKey}.</span>
//                       {optionVal}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* For Subjective Questions */}
//         {isSubjective && (
//           <div className="space-y-4">
//             {/* Answer input area with improved styling */}
//             <div className={`border-2 ${
//               answerSubmitted 
//                 ? "border-gray-300" 
//                 : "border-indigo-300 hover:border-indigo-500"
//               } rounded-lg p-4 transition-all duration-200 ${
//                 answerSubmitted ? "bg-gray-50" : "bg-white"
//               }`}
//             >
//               <div className="flex justify-between items-center mb-2">
//                 <p className="text-gray-700 font-medium">Your Answer</p>
//                 {!answerSubmitted && (
//                   <p className="text-xs text-gray-500">
//                     {subjectiveAnswer.length > 0 
//                       ? `${subjectiveAnswer.length} characters` 
//                       : "Start typing..."}
//                   </p>
//                 )}
//               </div>
              
//               <div className={`rounded-md ${answerSubmitted ? "bg-gray-100" : "bg-white"}`}>
//                 <textarea 
//                   disabled={answerSubmitted}
//                   value={subjectiveAnswer}
//                   onChange={handleTextAreaInput}
//                   placeholder="Type your answer here..." 
//                   style={{ height: textareaHeight }}
//                   className={`w-full min-h-32 ${
//                     answerSubmitted 
//                       ? "text-gray-500 bg-gray-100" 
//                       : "text-gray-800 bg-white focus:ring-2 focus:ring-indigo-200"
//                   } resize-none p-3 rounded-md border border-gray-200 outline-none transition-all duration-200`}
//                 ></textarea>
//               </div>
              
//               {!answerSubmitted && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   The text area will expand as you type. Press Tab to indent.
//                 </p>
//               )}
//             </div>
            
//             {/* Model answer if available and submitted */}
//             {showModelAnswer && question.modelAnswer && (
//               <div className="mt-4 animate-fadeIn border-2 border-green-200 rounded-lg p-4">
//                 <h4 className="text-sm font-medium text-green-800 mb-2">Model Answer:</h4>
//                 <div className="p-3 bg-green-50 rounded-lg">
//                   <p className="text-gray-800 whitespace-pre-wrap">{question.modelAnswer}</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
        
//         {/* Action buttons - Only show for non-passage questions */}
//         {!isPassage && (
//           <div className="mt-6 flex justify-end space-x-3">
//             {answerSubmitted ? (
//               <Button
//                 onClick={handleReset}
//                 variant="outline"
//                 className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
//               >
//                 Try Again
//               </Button>
//             ) : (
//               <Button
//                 onClick={handleSubmitAnswer}
//                 className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center"
//                 disabled={isSubjective ? subjectiveAnswer.trim() === "" : !selectedOption}
//               >
//                 Submit Answer
//                 <Send className="ml-2 h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, ChevronDown, ChevronUp, Check, FileText, Send, BookOpen, InfoIcon, Code } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import Editor from "@monaco-editor/react";
import { 
  Select, 
  SelectContent,  
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Question {
  questionId: number
  questionType: string  // "MCQ", "SUBJECTIVE", "CODE", or "PASSAGE"
  questionText: string
  // For MCQ questions, the keys are letters ("A", "B", "C", "D"), and the values are the option text.
  options?: Record<string, string>
  // For MCQ questions, e.g., "A", "B", "C", or "D"
  correctOption?: string
  // For subjective and coding questions
  modelAnswer?: string
  difficultyLevel: string
  createdBy: number
  createdAt: string
  tenantUserId: number
  status: string
}

interface Library {
  libraryId: number
  libraryName: string
  description: string
  createdAt: string
  tenantUserId: number
  timeRequired: number
  tags: string[]
  questions: Question[]
}

interface FormData {
  testId: number | null
}

interface AIPreviewProps {
  formData: FormData
  onAdvanceStep?: () => void
}

const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8003"
const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || "http://localhost:8004"

export default function AIPreview({ formData, onAdvanceStep }: AIPreviewProps) {
  const [loading, setLoading] = useState(false)
  const [libraries, setLibraries] = useState<Library[]>([])
  const {token, user} = useAuth();

  useEffect(() => {
    if (!formData.testId) return

    const fetchLibraries = async () => {
      setLoading(true)
      try {
        const idResponse = await fetch(`${testServiceUrl}/api/v1/tests/${formData.testId}/libraries`,{
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
          }
        });
        if (!idResponse.ok) {
          throw new Error("Failed to fetch library IDs.")
        }
        const libraryIds: string[] = await idResponse.json()

        const fetchPromises = libraryIds.map(async (id) => {
          const res = await fetch(`${questionBankServiceUrl}/libraries/${id}`, {
            headers: {
              Authorization: `Bearer ${token?.access_token}`,
            }
          })
          if (!res.ok) {
            throw new Error(`Failed to fetch library with ID: ${id}`)
          }
          return (await res.json()) as Library
        })

        const libraryData = await Promise.all(fetchPromises)
        console.log("libraryData", libraryData)
        setLibraries(libraryData)
        toast.success("Fetched libraries successfully!")
      } catch (error) {
        console.error(error)
        toast.error("Failed to fetch libraries. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchLibraries()
  }, [formData.testId, token])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-4 text-lg text-gray-600">Loading libraries...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1e1b4b]">Libraries Preview (Admin View)</h2>

      <ScrollArea className="h-[calc(100vh-180px)] pr-4 rounded-lg border-0">
        {libraries.length === 0 ? (
          <p className="text-gray-500 p-4">No libraries found for this test.</p>
        ) : (
          <div className="space-y-8 p-4">
            {libraries.map((library) => (
              <LibraryCard key={library.libraryId} library={library} />
            ))}
          </div>
        )}
      </ScrollArea>

      {onAdvanceStep && (
        <div className="flex justify-end mt-4">
          <Button onClick={onAdvanceStep} className="bg-indigo-600 text-white hover:bg-indigo-700">
            Confirm and Continue
          </Button>
        </div>
      )}
    </div>
  )
}

function LibraryCard({ library }: { library: Library }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="border-2 border-[#4338ca]/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader
        className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex justify-between items-center">
          <span>{library.libraryName}</span>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white text-[#1e1b4b]">
              {library.questions.length} Question{library.questions.length !== 1 ? "s" : ""}
            </Badge>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className={`pt-6 ${isExpanded ? "" : "hidden"}`}>
        {library.tags && library.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {library.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="bg-[#4338ca]/10 text-[#4338ca] border-[#4338ca]">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <ScrollArea className="h-[1200px] pr-4 rounded-lg border-0">
          <div className="space-y-6">
            {library.questions.map((question, index) => (
              <QuestionCard key={question.questionId} question={question} index={index} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
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
function QuestionCard({ question, index }: { question: Question; index: number }) {
  // Determine question type
  const isSubjective = question.questionType === "SUBJECTIVE";
  const isPassage = question.questionType === "PASSAGE";
  const isCoding = question.questionType === "CODE";

  //State for Coding specific fields
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  // State for MCQ selected answer
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // State for subjective answer
  const [subjectiveAnswer, setSubjectiveAnswer] = useState("");
  
  // State for coding specific fields
  const [codeAnswer, setCodeAnswer] = useState("");
  const [testCases, setTestCases] = useState("");
  const [codingAnswer, setCodingAnswer] = useState(""); // Added answer field for coding questions
  
  // State to track if answer has been submitted
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  
  // State to show/hide model answer
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  
  // Track text area height for auto-resize
  const [textareaHeight, setTextareaHeight] = useState("120px");
  
  // Handle text area auto-resize
  const handleTextAreaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSubjectiveAnswer(e.target.value);
    // Reset height to auto first to get the correct scrollHeight
    e.target.style.height = "auto";
    // Set height based on scrollHeight (min 120px)
    const newHeight = Math.max(120, e.target.scrollHeight);
    e.target.style.height = `${newHeight}px`;
    setTextareaHeight(`${newHeight}px`);
  };

  // Handle coding answer auto-resize
  const handleCodingAnswerInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCodingAnswer(e.target.value);
    // Reset height to auto first to get the correct scrollHeight
    e.target.style.height = "auto";
    // Set height based on scrollHeight (min 120px)
    const newHeight = Math.max(120, e.target.scrollHeight);
    e.target.style.height = `${newHeight}px`;
  };
  
  // Handle submitting an answer
  const handleSubmitAnswer = () => {
    if (isSubjective && !subjectiveAnswer.trim()) {
      toast.error("Please enter an answer before submitting");
      return;
    }
    
    if (isCoding && !codeAnswer.trim()) {
      toast.error("Please write code before submitting");
      return;
    }
    
    if (!isSubjective && !isPassage && !isCoding && !selectedOption) {
      toast.error("Please select an option before submitting");
      return;
    }
    
    setAnswerSubmitted(true);
    setShowModelAnswer(true);
    toast.success("Answer submitted successfully!");
  };
  
  // Reset the form
  const handleReset = () => {
    setSelectedOption(null);
    setSubjectiveAnswer("");
    setCodeAnswer("");
    setTestCases("");
    setCodingAnswer("");
    setAnswerSubmitted(false);
    setShowModelAnswer(false);
    setTextareaHeight("120px");
  };
  
  // Special rendering for passage type questions
  if (isPassage) {
    return (
      <Card className="border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white">
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>Case Study</span>
            </div>
            <Badge variant="outline" className="bg-white text-indigo-800 border-indigo-300">
              {question.difficultyLevel || "Medium"}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="prose prose-indigo max-w-none">
            {/* Render formatted passage content with markdown support */}
            <div 
              className="p-6 bg-white text-gray-800 rounded-lg border border-indigo-100 shadow-sm prose prose-indigo max-w-none" 
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(marked.parse(question.questionText, { async: false }))
              }} 
            />

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                <InfoIcon className="h-5 w-5 text-indigo-700 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">
                    This is a reading passage for the following questions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#4338ca]/20 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-[#4338ca]/10">
        <CardTitle className="flex justify-between items-center text-[#1e1b4b]">
          <div className="flex items-center gap-2">
            <span>Question {index + 1}</span>
            {isSubjective && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-300">
                <FileText className="h-3 w-3 mr-1" />
                Subjective
              </Badge>
            )}
            {isCoding && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                <Code className="h-3 w-3 mr-1" />
                Coding
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="bg-white text-[#1e1b4b] border-[#4338ca]">
            {question.difficultyLevel || "Medium"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <p className="text-base font-medium text-[#1e1b4b] mb-4">{question.questionText}</p>

        {/* For Multiple Choice Questions */}
        {!isSubjective && !isCoding && question.options && (
          <div className="space-y-2">
            {Object.entries(question.options).map(([optionKey, optionVal]) => {
              const isCorrect = optionKey === question.correctOption;
              
              return (
                <div
                  key={optionKey}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-[#4338ca]/20"
                  }`}
                >
                  <div className="flex items-center">
                    {/* Show check icon for correct answer */}
                    {isCorrect && (
                      <div className="flex-shrink-0 mr-2">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                    <p className={`${isCorrect ? "font-medium" : ""} text-[#1e1b4b]`}>
                      <span className="font-semibold mr-1">{optionKey}.</span>
                      {optionVal}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* For Subjective Questions */}
        {isSubjective && (
          <div className="space-y-4">
            {/* Answer input area with improved styling */}
            <div className={`border-2 ${
              answerSubmitted 
                ? "border-gray-300" 
                : "border-indigo-300 hover:border-indigo-500"
              } rounded-lg p-4 transition-all duration-200 ${
                answerSubmitted ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-medium">Your Answer</p>
                {!answerSubmitted && (
                  <p className="text-xs text-gray-500">
                    {subjectiveAnswer.length > 0 
                      ? `${subjectiveAnswer.length} characters` 
                      : "Start typing..."}
                  </p>
                )}
              </div>
              
              <div className={`rounded-md ${answerSubmitted ? "bg-gray-100" : "bg-white"}`}>
                <textarea 
                  disabled={answerSubmitted}
                  value={subjectiveAnswer}
                  onChange={handleTextAreaInput}
                  placeholder="Type your answer here..." 
                  style={{ height: textareaHeight }}
                  className={`w-full min-h-32 ${
                    answerSubmitted 
                      ? "text-gray-500 bg-gray-100" 
                      : "text-gray-800 bg-white focus:ring-2 focus:ring-indigo-200"
                  } resize-none p-3 rounded-md border border-gray-200 outline-none transition-all duration-200`}
                ></textarea>
              </div>
              
              {!answerSubmitted && (
                <p className="text-xs text-gray-500 mt-1">
                  The text area will expand as you type. Press Tab to indent.
                </p>
              )}
            </div>
            
            {/* Model answer if available and submitted */}
            {showModelAnswer && question.modelAnswer && (
              <div className="mt-4 animate-fadeIn border-2 border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Model Answer:</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{question.modelAnswer}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* For Coding Questions */}
        {isCoding && (
          <div className="space-y-6">
            {/* Code Editor using Monaco */}
            <div className={`border-2 ${
              answerSubmitted 
                ? "border-gray-300" 
                : "border-blue-300 hover:border-blue-500"
              } rounded-lg overflow-hidden transition-all duration-200`}
            >
              <div className="flex justify-between items-center p-3 bg-gray-800 text-white">
                <p className="font-medium">Code Solution</p>
                <div className="flex items-center gap-2">
                  {!answerSubmitted ? (
                    <Select
                      value={codeLanguage}
                      onValueChange={setCodeLanguage}
                      disabled={answerSubmitted}
                    >
                      <SelectTrigger className="h-8 w-40 text-xs bg-gray-700 border-gray-600 text-white">
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
                  ) : (
                    <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">
                      {languages.find(l => l.value === codeLanguage)?.label || "JavaScript"}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Editor
                height="200px"
                defaultLanguage="javascript"
                language={codeLanguage}
                defaultValue="// Write your code here"
                theme="vs-dark"
                value={codeAnswer}
                onChange={(value) => setCodeAnswer(value || "")}
                options={{
                  readOnly: answerSubmitted,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                }}
              />
            </div>
            
            {/* Test Cases */}
            <div className={`border-2 ${
              answerSubmitted 
                ? "border-gray-300" 
                : "border-amber-300 hover:border-amber-500"
              } rounded-lg overflow-hidden transition-all duration-200`}
            >
              <div className="flex justify-between items-center p-3 bg-gray-800 text-white">
                <p className="font-medium">Test Cases</p>
                <Badge variant="outline" className="bg-gray-700 text-amber-300 border-amber-600">
                  Input/Output
                </Badge>
              </div>
              
              <Editor
                height="150px"
                defaultLanguage="javascript"
                defaultValue="// Enter test cases here"
                theme="vs-dark"
                value={testCases}
                onChange={(value) => setTestCases(value || "")}
                options={{
                  readOnly: answerSubmitted,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                }}
              />
            </div>

            {/* Answer explanation for coding questions */}
            <div className={`border-2 ${
              answerSubmitted 
                ? "border-gray-300" 
                : "border-indigo-300 hover:border-indigo-500"
              } rounded-lg p-4 transition-all duration-200 ${
                answerSubmitted ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-medium">Explain Your Solution</p>
                {!answerSubmitted && (
                  <p className="text-xs text-gray-500">
                    {codingAnswer.length > 0 
                      ? `${codingAnswer.length} characters` 
                      : "Start typing..."}
                  </p>
                )}
              </div>
              
              <div className={`rounded-md ${answerSubmitted ? "bg-gray-100" : "bg-white"}`}>
                <textarea 
                  disabled={answerSubmitted}
                  value={codingAnswer}
                  onChange={handleCodingAnswerInput}
                  placeholder="Explain your approach and solution here..." 
                  className={`w-full min-h-32 ${
                    answerSubmitted 
                      ? "text-gray-500 bg-gray-100" 
                      : "text-gray-800 bg-white focus:ring-2 focus:ring-indigo-200"
                  } resize-none p-3 rounded-md border border-gray-200 outline-none transition-all duration-200`}
                ></textarea>
              </div>
              
              {!answerSubmitted && (
                <p className="text-xs text-gray-500 mt-1">
                  Explain your algorithm, complexity, and any assumptions you made.
                </p>
              )}
            </div>
            
            {/* Model answer if available and submitted */}
            {showModelAnswer && question.modelAnswer && (
              <div className="mt-4 animate-fadeIn border-2 border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Model Solution:</h4>
                <div className="p-3 bg-gray-900 rounded-lg">
                  <pre className="text-green-100 font-mono text-sm whitespace-pre-wrap overflow-x-auto">{question.modelAnswer}</pre>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Action buttons - Only show for non-passage questions */}
        {!isPassage && (
          <div className="mt-6 flex justify-end space-x-3">
            {answerSubmitted ? (
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                Try Again
              </Button>
            ) : (
              <Button
                onClick={handleSubmitAnswer}
                className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center"
                disabled={(isSubjective && subjectiveAnswer.trim() === "") || 
                         (isCoding && codeAnswer.trim() === "") || 
                         (!isSubjective && !isCoding && !selectedOption)}
              >
                Submit Answer
                <Send className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}