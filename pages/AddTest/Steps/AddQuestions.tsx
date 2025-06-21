// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Plus, Minus, Eye, Check, X } from "lucide-react"
// import type { FormData, MCQQuestion, QuestionLibrary } from "../Types/Test"
// import { cn } from "@/lib/utils"
// import toast from "react-hot-toast"
// import { useAuth } from "@/context/AuthContext"

// interface AddQuestionsProps {
//   formData: FormData
//   onFormDataChange: (newData: Partial<FormData>) => void
// }

// const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || 'http://localhost:8003';

// export default function AddQuestions({ formData, onFormDataChange }: AddQuestionsProps) {
//   console.log("formData",formData);
//   const [questions, setQuestions] = useState<MCQQuestion[]>(formData.customQuestions || [])
//   const [currentQuestion, setCurrentQuestion] = useState<MCQQuestion>({
//     id: "",
//     question: "",
//     options: ["", "", "", ""],
//     correctAnswer: 0,
//     explanation: "",
//     difficulty: "Medium",
//     tags: [],
//   })
//   const [showPreview, setShowPreview] = useState(false)
//   const [showQuestionPreview, setShowQuestionPreview] = useState(false)
//   const [previewQuestion, setPreviewQuestion] = useState<MCQQuestion | null>(null)
//   const [editingIndex, setEditingIndex] = useState<number | null>(null)
//   const [selectedLibraries, setSelectedLibraries] = useState<string[]>([])
//   const [activeTab, setActiveTab] = useState<"libraries" | "custom" | "preview">("libraries")

//   const {token} = useAuth();
//   const accessToken = token?.access_token ;

//   // Update custom questions on changes to questions state
//   useEffect(() => {
//     onFormDataChange({ customQuestions: questions.filter((q) => !q.libraryId) })
//   }, [questions, onFormDataChange])

//   // Automatically select all libraries from formData.questionLibraries on mount/update
//   useEffect(() => {
//     if (formData.questionLibraries && formData.questionLibraries.length > 0) {
//       // Get all library IDs
//       const allLibraryIds = formData.questionLibraries.map((lib: QuestionLibrary) => lib.id)
//       setSelectedLibraries(allLibraryIds)
      
//       // Automatically add all library questions (with libraryId attached)
//       const allLibraryQuestions = formData.questionLibraries.reduce((acc: MCQQuestion[], lib: QuestionLibrary) => {
//         const libraryQuestions = lib.questions.map((q: MCQQuestion) => ({ ...q, libraryId: lib.id }))
//         return acc.concat(libraryQuestions)
//       }, [])
//       setQuestions(allLibraryQuestions)
//     }
//   }, [formData.questionLibraries])

//   // Auto-save libraries whenever selectedLibraries changes
//   useEffect(() => {
//     const autoSaveLibraries = async () => {
//       if (selectedLibraries.length > 0) {
//         if (!formData.testId) {
//           toast.error("No test ID found. Cannot add libraries.")
//           return
//         }
//         try {
//           const response = await fetch(`${testServiceUrl}/api/v1/tests/${formData.testId}/addlibraries`, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               "Authorization": `Bearer ${accessToken}`
//             },
//             body: JSON.stringify(selectedLibraries),
//           })
//           if (!response.ok) {
//             toast.error("Failed to add libraries to the test.")
//           } else {
//             toast.success("Libraries added to the test successfully.")
//           }
//         } catch (error) {
//           console.error("Error adding libraries:", error)
//           toast.error("An error occurred while adding libraries.")
//         }
//       }
//     }
//     autoSaveLibraries()
//   }, [selectedLibraries, formData.testId, accessToken])

//   const handleAddQuestion = () => {
//     if (currentQuestion.question && currentQuestion.options.every((option) => option !== "")) {
//       if (editingIndex !== null) {
//         const updatedQuestions = [...questions]
//         updatedQuestions[editingIndex] = { ...currentQuestion, id: questions[editingIndex].id }
//         setQuestions(updatedQuestions)
//         setEditingIndex(null)
//       } else {
//         setQuestions([...questions, { ...currentQuestion, id: Date.now().toString() }])
//       }
//       setCurrentQuestion({
//         id: "",
//         question: "",
//         options: ["", "", "", ""],
//         correctAnswer: 0,
//         explanation: "",
//         difficulty: "Medium",
//         tags: [],
//       })
//     } else {
//       toast.error("Please fill in all fields for the question.")
//     }
//   }

//   // (Optional) You may keep the toggle if you want to let users remove/add libraries.
//   const isLibrarySelected = (library: QuestionLibrary) => {
//     return selectedLibraries.includes(library.id)
//   }

//   const toggleLibrarySelection = (library: QuestionLibrary) => {
//     if (isLibrarySelected(library)) {
//       setSelectedLibraries(selectedLibraries.filter((id) => id !== library.id))
//       setQuestions(questions.filter((q) => q.libraryId !== library.id))
//     } else {
//       setSelectedLibraries([...selectedLibraries, library.id])
//       const libraryQuestions = library.questions.map((q) => ({ ...q, libraryId: library.id }))
//       setQuestions([...questions, ...libraryQuestions])
//     }
//   }

//   const renderPreviewTest = () => (
//     <Dialog open={showPreview} onOpenChange={setShowPreview}>
//       <DialogContent className="max-w-full sm:max-w-4xl bg-white h-[90vh] overflow-hidden">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold text-[#1e1b4b]">Test Preview</DialogTitle>
//           <DialogDescription className="text-[#4338ca]">
//             Previewing {questions.length} question{questions.length !== 1 ? "s" : ""}
//           </DialogDescription>
//         </DialogHeader>
//         <ScrollArea className="h-[calc(90vh-120px)] pr-4">
//           <div className="space-y-8">
//             {questions.map((question, index) => (
//               <Card
//                 key={question.id}
//                 className="border-2 border-[#4338ca]/20 shadow-lg hover:shadow-xl transition-all duration-300"
//               >
//                 <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
//                   <CardTitle className="flex justify-between items-center">
//                     <span>Question {index + 1}</span>
//                     <Badge variant="secondary" className="bg-white text-[#1e1b4b] hover:bg-white">
//                       {question.difficulty}
//                     </Badge>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="pt-6">
//                   <p className="text-lg font-medium text-[#1e1b4b] mb-4">{question.question}</p>
//                   <div className="space-y-2">
//                     {question.options.map((option, optionIndex) => (
//                       <div
//                         key={optionIndex}
//                         className={cn(
//                           "p-3 rounded-lg border-2 transition-all duration-200",
//                           optionIndex === question.correctAnswer
//                             ? "border-green-500 bg-green-50"
//                             : "border-[#4338ca]/20 hover:border-[#4338ca]",
//                         )}
//                       >
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 mr-2">
//                             {optionIndex === question.correctAnswer ? (
//                               <Check className="h-5 w-5 text-green-500" />
//                             ) : (
//                               <X className="h-5 w-5 text-[#4338ca]" />
//                             )}
//                           </div>
//                           <p className="text-[#1e1b4b]">{option}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   {question.explanation && (
//                     <div className="mt-4 p-3 bg-[#4338ca]/5 rounded-lg">
//                       <p className="text-sm text-[#1e1b4b]">
//                         <span className="font-semibold">Explanation:</span> {question.explanation}
//                       </p>
//                     </div>
//                   )}
//                   {question.tags && question.tags.length > 0 && (
//                     <div className="mt-4 flex flex-wrap gap-2">
//                       {question.tags.map((tag, tagIndex) => (
//                         <Badge
//                           key={tagIndex}
//                           variant="outline"
//                           className="bg-[#4338ca]/10 text-[#4338ca] border-[#4338ca]"
//                         >
//                           {tag}
//                         </Badge>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </ScrollArea>
//       </DialogContent>
//     </Dialog>
//   )

//   const renderQuestionPreview = () => (
//     <Dialog open={showQuestionPreview} onOpenChange={setShowQuestionPreview}>
//       <DialogContent className="max-w-3xl bg-white overflow-hidden">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold text-[#1e1b4b]">Question Preview</DialogTitle>
//         </DialogHeader>
//         <div className="py-4">
//           {previewQuestion && (
//             <Card className="border-2 border-[#4338ca]/20 shadow-lg hover:shadow-xl transition-all duration-300">
//               <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
//                 <CardTitle className="flex justify-between items-center">
//                   <span>Question</span>
//                   <Badge variant="secondary" className="bg-white text-[#1e1b4b] hover:bg-white">
//                     {previewQuestion.difficulty}
//                   </Badge>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-6">
//                 <p className="text-lg font-medium text-[#1e1b4b] mb-4">{previewQuestion.question}</p>
//                 <div className="space-y-2">
//                   {previewQuestion.options.map((option, optionIndex) => (
//                     <div
//                       key={optionIndex}
//                       className={cn(
//                         "p-3 rounded-lg border-2 transition-all duration-200",
//                         optionIndex === previewQuestion.correctAnswer
//                           ? "border-green-500 bg-green-50"
//                           : "border-[#4338ca]/20 ",
//                       )}
//                     >
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0 mr-2">
//                           {optionIndex === previewQuestion.correctAnswer ? (
//                             <Check className="h-5 w-5 text-green-500" />
//                           ) : (
//                             <X className="h-5 w-5 text-[#4338ca]" />
//                           )}
//                         </div>
//                         <p className="text-[#1e1b4b]">{option}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 {previewQuestion.explanation && (
//                   <div className="mt-4 p-3 bg-[#4338ca]/5 rounded-lg">
//                     <p className="text-sm text-[#1e1b4b]">
//                       <span className="font-semibold">Explanation:</span> {previewQuestion.explanation}
//                     </p>
//                   </div>
//                 )}
//                 {previewQuestion.tags && previewQuestion.tags.length > 0 && (
//                   <div className="mt-4 flex flex-wrap gap-2">
//                     {previewQuestion.tags.map((tag, tagIndex) => (
//                       <Badge
//                         key={tagIndex}
//                         variant="outline"
//                         className="bg-[#4338ca]/10 text-[#4338ca] border-[#4338ca]"
//                       >
//                         {tag}
//                       </Badge>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           )}
//         </div>
//         <DialogFooter>
//           <Button onClick={() => setShowQuestionPreview(false)}>Close</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )

//   const handleSaveQuestions = async () => {
//     onFormDataChange({ customQuestions: questions.filter((q) => !q.libraryId) })

//     if (selectedLibraries.length > 0) {
//       if (!formData.testId) {
//         toast.error("No test ID found. Cannot add libraries.")
//         return
//       }
//       try {
//         const response = await fetch(`${testServiceUrl}/api/v1/tests/${formData.testId}/addlibraries`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${accessToken}`
//           },
//           body: JSON.stringify(selectedLibraries),
//         })
//         if (!response.ok) {
//           toast.error("Failed to add libraries to the test.")
//         } else {
//           toast.success("Libraries added to the test successfully.")
//         }
//       } catch (error) {
//         console.error("Error adding libraries:", error)
//         toast.error("An error occurred while adding libraries.")
//       }
//     }
//   }

//   return (
//     <div className="space-y-8 text-[#1e1b4b] sm:p-6 rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-br from-white to-[#4338ca]/5">
//       <motion.h2
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="text-2xl sm:text-3xl font-bold text-[#1e1b4b]"
//       >
//         Add Questions
//       </motion.h2>

//       <Tabs
//         value={activeTab}
//         onValueChange={(value) => setActiveTab(value as "libraries" | "custom" | "preview")}
//         className="w-full"
//       >
//         <TabsList className="grid grid-cols-2 text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] max-w-md mx-auto rounded-lg shadow-md">
//           <TabsTrigger
//             value="libraries"
//             className={`transition-colors duration-300 ease-in-out cursor-pointer ${
//               activeTab === "libraries" ? "bg-[#4338ca] text-white" : "bg-transparent text-white hover:bg-[#4338ca]/50"
//             }`}
//           >
//             Libraries
//           </TabsTrigger>
//           <TabsTrigger
//             value="preview"
//             className={`transition-colors duration-300 ease-in-out cursor-pointer ${
//               activeTab === "preview" ? "bg-[#4338ca] text-white" : "bg-transparent text-white hover:bg-[#4338ca]/50"
//             }`}
//           >
//             Preview
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="libraries">
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h3 className="text-xl font-semibold text-[#1e1b4b] mb-4">Library Questions</h3>
//             {formData.questionLibraries.length === 0 ? (
//               <p className="text-[#4338ca]">No libraries selected.</p>
//             ) : (
//               formData.questionLibraries.map((library) => (
//                 <motion.div
//                   key={library.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <Card className="mb-4 border border-[#4338ca]/20 shadow-sm hover:shadow-md transition-all duration-300">
//                     <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] rounded-t-lg">
//                       <div className="flex flex-row justify-between items-center">
//                         <div>
//                           <CardTitle className="text-lg font-semibold text-white">{library.libraryName}</CardTitle>
//                           <CardDescription className="text-sm text-white/80">{library.description}</CardDescription>
//                         </div>
//                         {/* You can still allow manual toggling if desired */}
//                         {/* <Button
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             toggleLibrarySelection(library)
//                           }}
//                           className={`transition-all duration-300 ${
//                             isLibrarySelected(library)
//                               ? "bg-white text-[#4338ca] hover:bg-gray-100"
//                               : "bg-[#4338ca]/10 text-white hover:bg-white hover:text-[#4338ca]"
//                           }`}
//                         >
//                           {isLibrarySelected(library) ? (
//                             <Minus className="mr-2 h-4 w-4" />
//                           ) : (
//                             <Plus className="mr-2 h-4 w-4" />
//                           )}
//                           {isLibrarySelected(library) ? "Remove" : "Add"}
//                         </Button> */}
//                       </div>
//                     </CardHeader>
//                     <CardContent className="p-4 bg-white rounded-b-lg">
//                       <div className="space-y-2">
//                         {library.questions.map((question: MCQQuestion, index: number) => (
//                           <div
//                             key={question.id}
//                             className="flex justify-between items-center py-2 border-b border-[#4338ca]/10"
//                           >
//                             <span className="text-sm text-[#1e1b4b]">
//                               <span className="font-medium text-[#4338ca]">{index + 1}.</span> {question.question}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               ))
//             )}
//           </motion.div>
//         </TabsContent>

//         <TabsContent value="custom">
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h3 className="text-xl font-semibold text-[#1e1b4b] mb-4">Custom Questions</h3>
//             <Card className="shadow-md border-0 bg-white transition-all duration-300 ease-in-out p-4">
//               <CardHeader>
//                 <CardTitle className="text-lg sm:text-xl text-[#1e1b4b]">Add New Question</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <form
//                   onSubmit={(e) => {
//                     e.preventDefault()
//                     handleAddQuestion()
//                   }}
//                   className="space-y-4"
//                 >
//                   <div>
//                     <Label htmlFor="question">Question</Label>
//                     <Textarea
//                       id="question"
//                       value={currentQuestion.question}
//                       onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
//                       className="mt-1"
//                     />
//                   </div>
//                   {currentQuestion.options.map((option, index) => (
//                     <div key={index}>
//                       <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
//                       <Input
//                         id={`option-${index}`}
//                         value={option}
//                         onChange={(e) => {
//                           const newOptions = [...currentQuestion.options]
//                           newOptions[index] = e.target.value
//                           setCurrentQuestion({ ...currentQuestion, options: newOptions })
//                         }}
//                         className="mt-1"
//                       />
//                     </div>
//                   ))}
//                   <div>
//                     <Label htmlFor="correctAnswer">Correct Answer</Label>
//                     <Select
//                       value={currentQuestion.correctAnswer.toString()}
//                       onValueChange={(value) =>
//                         setCurrentQuestion({ ...currentQuestion, correctAnswer: Number.parseInt(value) })
//                       }
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select correct answer" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {currentQuestion.options.map((_, index) => (
//                           <SelectItem key={index} value={index.toString()}>
//                             Option {index + 1}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label htmlFor="explanation">Explanation</Label>
//                     <Textarea
//                       id="explanation"
//                       value={currentQuestion.explanation}
//                       onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
//                       className="mt-1"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="difficulty">Difficulty</Label>
//                     <Select
//                       value={currentQuestion.difficulty}
//                       onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, difficulty: value as "Easy" | "Medium" | "Hard" })}
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select difficulty" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Easy">Easy</SelectItem>
//                         <SelectItem value="Medium">Medium</SelectItem>
//                         <SelectItem value="Hard">Hard</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <Button type="submit" className="w-full bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
//                     {editingIndex !== null ? "Update Question" : "Add Question"}
//                   </Button>
//                 </form>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </TabsContent>

//         <TabsContent value="preview">
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h3 className="text-xl font-semibold text-[#1e1b4b] mb-4">Test Preview</h3>
//             <Card className="shadow-md border-0 bg-white transition-all duration-300 ease-in-out p-4">
//               <CardHeader>
//                 <CardTitle className="text-lg sm:text-xl text-[#1e1b4b]">
//                   Added Questions ({questions.length})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ul className="space-y-4">
//                   {questions.map((q, index) => (
//                     <motion.li
//                       key={q.id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.3 }}
//                       className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#4338ca]/5 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 ease-in-out border border-[#4338ca]/20"
//                     >
//                       <span className="font-medium text-[#1e1b4b] mb-2 sm:mb-0">
//                         Question {index + 1}: {q.question.substring(0, 50)}...
//                       </span>
//                       <div className="space-x-2 mt-2 sm:mt-0">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="border-[#4338ca] text-[#4338ca] hover:bg-[#4338ca]/10 transition-all duration-300 ease-in-out"
//                           onClick={() => {
//                             setPreviewQuestion(q)
//                             setShowQuestionPreview(true)
//                           }}
//                         >
//                           <Eye className="mr-2 h-4 w-4" />
//                           Preview
//                         </Button>
//                       </div>
//                     </motion.li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </TabsContent>
//       </Tabs>

//       {/* Navigation Buttons */}
//       <motion.div
//         className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <Button
//           variant="outline"
//           onClick={() => setShowPreview(true)}
//           className="border-[#4338ca] bg-white text-[#4338ca] hover:text-[#4338ca]  hover:bg-[#4338ca]/10 transition-all duration-300 ease-in-out w-full sm:w-auto"
//         >
//           <Eye className="mr-2 h-4 w-4" />
//           Preview Test
//         </Button>
//         {/* Removed manual "Save Questions" button */}
//       </motion.div>

//       {renderPreviewTest()}
//       {renderQuestionPreview()}
//     </div>
//   )
// }

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, Eye, Check, X } from "lucide-react"
import type { FormData, MCQQuestion, QuestionLibrary } from "../Types/Test"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

interface AddQuestionsProps {
  formData: FormData
  onFormDataChange: (newData: Partial<FormData>) => void
}

const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || 'http://localhost:8003';

export default function AddQuestions({ formData, onFormDataChange }: AddQuestionsProps) {
  console.log("formData",formData);
  const [questions, setQuestions] = useState<MCQQuestion[]>(formData.customQuestions || [])
  const [currentQuestion, setCurrentQuestion] = useState<MCQQuestion>({
    id: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    difficulty: "Medium",
    tags: [],
  })
  const [showPreview, setShowPreview] = useState(false)
  const [showQuestionPreview, setShowQuestionPreview] = useState(false)
  const [previewQuestion, setPreviewQuestion] = useState<MCQQuestion | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"libraries" | "custom" | "preview">("libraries")
  const [totalTimeRequired, setTotalTimeRequired] = useState<number>(0)

  const {token} = useAuth();
  const accessToken = token?.access_token ;

  // Update custom questions on changes to questions state
  useEffect(() => {
    onFormDataChange({ customQuestions: questions.filter((q) => !q.libraryId) })
  }, [questions, onFormDataChange])

  // Calculate total time from selected libraries
  const calculateTotalTime = (libraries: QuestionLibrary[]) => {
    return libraries.reduce((total, lib) => {
      return total + (lib.timeRequired || 0)
    }, 0)
  }

  // Automatically select all libraries from formData.questionLibraries on mount/update
  useEffect(() => {
    if (formData.questionLibraries && formData.questionLibraries.length > 0) {
      // Get all library IDs
      const allLibraryIds = formData.questionLibraries.map((lib: QuestionLibrary) => lib.id)
      setSelectedLibraries(allLibraryIds)
      
      // Calculate total time required
      const newTotalTime = calculateTotalTime(formData.questionLibraries)
      setTotalTimeRequired(newTotalTime)
      
      // Update the timeLimit in formData
      onFormDataChange({ timeLimit: newTotalTime })
      
      // Automatically add all library questions (with libraryId attached)
      const allLibraryQuestions = formData.questionLibraries.reduce((acc: MCQQuestion[], lib: QuestionLibrary) => {
        const libraryQuestions = lib.questions.map((q: MCQQuestion) => ({ ...q, libraryId: lib.id }))
        return acc.concat(libraryQuestions)
      }, [])
      setQuestions(allLibraryQuestions)
    }
  }, [formData.questionLibraries, onFormDataChange])

  // Auto-save libraries whenever selectedLibraries changes
  useEffect(() => {
    const autoSaveLibraries = async () => {
      if (selectedLibraries.length > 0) {
        if (!formData.testId) {
          toast.error("No test ID found. Cannot add libraries.")
          return
        }
        try {
          const response = await fetch(`${testServiceUrl}/api/v1/tests/${formData.testId}/addlibraries`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(selectedLibraries),
          })
          if (!response.ok) {
            toast.error("Failed to add libraries to the test.")
          } else {
            toast.success("Libraries added to the test successfully.")
            
            // After successful API call, update the timeLimit
            if (formData.questionLibraries) {
              const selectedLibs = formData.questionLibraries.filter(lib => 
                selectedLibraries.includes(lib.id)
              )
              const newTotalTime = calculateTotalTime(selectedLibs)
              setTotalTimeRequired(newTotalTime)
              
              // Update the test's timeLimit via API
              await updateTestTimeLimit(formData.testId, newTotalTime)
            }
          }
        } catch (error) {
          console.error("Error adding libraries:", error)
          toast.error("An error occurred while adding libraries.")
        }
      }
    }
    autoSaveLibraries()
  }, [selectedLibraries, formData.testId, accessToken, formData.questionLibraries])
  
  // Function to update test's timeLimit via API
  const updateTestTimeLimit = async (testId: number, timeLimit: number) => {
    try {
      const response = await fetch(`${testServiceUrl}/api/v1/tests/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "X-User-Id": "system" // Using a system user ID for automatic updates
        },
        body: JSON.stringify({
          timeLimit: timeLimit
        }),
      })
      
      if (!response.ok) {
        console.error("Failed to update test time limit")
      } else {
        console.log("Test time limit updated successfully to", timeLimit)
        // Update the local formData state as well
        onFormDataChange({ timeLimit: timeLimit })
      }
    } catch (error) {
      console.error("Error updating test time limit:", error)
    }
  }

  const handleAddQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every((option) => option !== "")) {
      if (editingIndex !== null) {
        const updatedQuestions = [...questions]
        updatedQuestions[editingIndex] = { ...currentQuestion, id: questions[editingIndex].id }
        setQuestions(updatedQuestions)
        setEditingIndex(null)
      } else {
        setQuestions([...questions, { ...currentQuestion, id: Date.now().toString() }])
      }
      setCurrentQuestion({
        id: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        difficulty: "Medium",
        tags: [],
      })
    } else {
      toast.error("Please fill in all fields for the question.")
    }
  }

  // Toggle library selection with time updates
  const toggleLibrarySelection = (library: QuestionLibrary) => {
    if (isLibrarySelected(library)) {
      // Remove library
      setSelectedLibraries(selectedLibraries.filter((id) => id !== library.id))
      setQuestions(questions.filter((q) => q.libraryId !== library.id))
      
      // Decrease total time
      setTotalTimeRequired(prev => prev - (library.timeRequired || 0))
    } else {
      // Add library
      setSelectedLibraries([...selectedLibraries, library.id])
      const libraryQuestions = library.questions.map((q) => ({ ...q, libraryId: library.id }))
      setQuestions([...questions, ...libraryQuestions])
      
      // Increase total time
      setTotalTimeRequired(prev => prev + (library.timeRequired || 0))
    }
  }

  // Check if a library is selected
  const isLibrarySelected = (library: QuestionLibrary) => {
    return selectedLibraries.includes(library.id)
  }

  const renderPreviewTest = () => (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-full sm:max-w-4xl bg-white h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1e1b4b]">Test Preview</DialogTitle>
          <DialogDescription className="text-[#4338ca]">
            Previewing {questions.length} question{questions.length !== 1 ? "s" : ""} 
            {totalTimeRequired > 0 && ` - Time Required: ${totalTimeRequired} minutes`}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-8">
            {questions.map((question, index) => (
              <Card
                key={question.id}
                className="border-2 border-[#4338ca]/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
                  <CardTitle className="flex justify-between items-center">
                    <span>Question {index + 1}</span>
                    <Badge variant="secondary" className="bg-white text-[#1e1b4b] hover:bg-white">
                      {question.difficulty}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-lg font-medium text-[#1e1b4b] mb-4">{question.question}</p>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all duration-200",
                          optionIndex === question.correctAnswer
                            ? "border-green-500 bg-green-50"
                            : "border-[#4338ca]/20 hover:border-[#4338ca]",
                        )}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            {optionIndex === question.correctAnswer ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <X className="h-5 w-5 text-[#4338ca]" />
                            )}
                          </div>
                          <p className="text-[#1e1b4b]">{option}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="mt-4 p-3 bg-[#4338ca]/5 rounded-lg">
                      <p className="text-sm text-[#1e1b4b]">
                        <span className="font-semibold">Explanation:</span> {question.explanation}
                      </p>
                    </div>
                  )}
                  {question.tags && question.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {question.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="bg-[#4338ca]/10 text-[#4338ca] border-[#4338ca]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )

  const renderQuestionPreview = () => (
    <Dialog open={showQuestionPreview} onOpenChange={setShowQuestionPreview}>
      <DialogContent className="max-w-3xl bg-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1e1b4b]">Question Preview</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {previewQuestion && (
            <Card className="border-2 border-[#4338ca]/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
                <CardTitle className="flex justify-between items-center">
                  <span>Question</span>
                  <Badge variant="secondary" className="bg-white text-[#1e1b4b] hover:bg-white">
                    {previewQuestion.difficulty}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg font-medium text-[#1e1b4b] mb-4">{previewQuestion.question}</p>
                <div className="space-y-2">
                  {previewQuestion.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all duration-200",
                        optionIndex === previewQuestion.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : "border-[#4338ca]/20 ",
                      )}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-2">
                          {optionIndex === previewQuestion.correctAnswer ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-[#4338ca]" />
                          )}
                        </div>
                        <p className="text-[#1e1b4b]">{option}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {previewQuestion.explanation && (
                  <div className="mt-4 p-3 bg-[#4338ca]/5 rounded-lg">
                    <p className="text-sm text-[#1e1b4b]">
                      <span className="font-semibold">Explanation:</span> {previewQuestion.explanation}
                    </p>
                  </div>
                )}
                {previewQuestion.tags && previewQuestion.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {previewQuestion.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="outline"
                        className="bg-[#4338ca]/10 text-[#4338ca] border-[#4338ca]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setShowQuestionPreview(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const handleSaveQuestions = async () => {
    onFormDataChange({ customQuestions: questions.filter((q) => !q.libraryId) })

    if (selectedLibraries.length > 0) {
      if (!formData.testId) {
        toast.error("No test ID found. Cannot add libraries.")
        return
      }
      try {
        const response = await fetch(`${testServiceUrl}/api/v1/tests/${formData.testId}/addlibraries`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(selectedLibraries),
        })
        if (!response.ok) {
          toast.error("Failed to add libraries to the test.")
        } else {
          toast.success("Libraries added to the test successfully.")
          
          // After successful API call, update the timeLimit
          await updateTestTimeLimit(formData.testId, totalTimeRequired)
        }
      } catch (error) {
        console.error("Error adding libraries:", error)
        toast.error("An error occurred while adding libraries.")
      }
    }
  }

  return (
    <div className="space-y-8 text-[#1e1b4b] sm:p-6 rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-br from-white to-[#4338ca]/5">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl sm:text-3xl font-bold text-[#1e1b4b]"
      >
        Add Questions
      </motion.h2>

      {/* Time Information Banner */}
      {totalTimeRequired > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#4338ca]/10 rounded-lg border border-[#4338ca]/20 mb-4"
        >
          <p className="text-[#1e1b4b] font-medium">
            Total Time Required: {totalTimeRequired} minutes
            {formData.timeLimit !== totalTimeRequired ? 
              ` (Updating test time limit from ${formData.timeLimit || 0} minutes)` : 
              " (Test time limit is set accordingly)"}
          </p>
        </motion.div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "libraries" | "custom" | "preview")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] max-w-md mx-auto rounded-lg shadow-md">
          <TabsTrigger
            value="libraries"
            className={`transition-colors duration-300 ease-in-out cursor-pointer ${
              activeTab === "libraries" ? "bg-[#4338ca] text-white" : "bg-transparent text-white hover:bg-[#4338ca]/50"
            }`}
          >
            Libraries
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className={`transition-colors duration-300 ease-in-out cursor-pointer ${
              activeTab === "preview" ? "bg-[#4338ca] text-white" : "bg-transparent text-white hover:bg-[#4338ca]/50"
            }`}
          >
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="libraries">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-[#1e1b4b] mb-4">Library Questions</h3>
            {formData.questionLibraries.length === 0 ? (
              <p className="text-[#4338ca]">No libraries selected.</p>
            ) : (
              formData.questionLibraries.map((library) => (
                <motion.div
                  key={library.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="mb-4 border border-[#4338ca]/20 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] rounded-t-lg">
                      <div className="flex flex-row justify-between items-center">
                        <div>
                          <CardTitle className="text-lg font-semibold text-white">
                            {library.libraryName}
                            {library.timeRequired && 
                              <span className="text-sm font-normal ml-2">
                                ({library.timeRequired} min)
                              </span>
                            }
                          </CardTitle>
                          <CardDescription className="text-sm text-white/80">{library.description}</CardDescription>
                        </div>
                        {/* <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLibrarySelection(library)
                          }}
                          className={`transition-all duration-300 ${
                            isLibrarySelected(library)
                              ? "bg-white text-[#4338ca] hover:bg-gray-100"
                              : "bg-[#4338ca]/10 text-white hover:bg-white hover:text-[#4338ca]"
                          }`}
                        >
                          {isLibrarySelected(library) ? (
                            <Minus className="mr-2 h-4 w-4" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          {isLibrarySelected(library) ? "Remove" : "Add"}
                        </Button> */}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 bg-white rounded-b-lg">
                      <div className="space-y-2">
                        {library.questions.map((question: MCQQuestion, index: number) => (
                          <div
                            key={question.id}
                            className="flex justify-between items-center py-2 border-b border-[#4338ca]/10"
                          >
                            <span className="text-sm text-[#1e1b4b]">
                              <span className="font-medium text-[#4338ca]">{index + 1}.</span> {question.question}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="custom">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-[#1e1b4b] mb-4">Custom Questions</h3>
            <Card className="shadow-md border-0 bg-white transition-all duration-300 ease-in-out p-4">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-[#1e1b4b]">Add New Question</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAddQuestion()
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index}>
                      <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                      <Input
                        id={`option-${index}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options]
                          newOptions[index] = e.target.value
                          setCurrentQuestion({ ...currentQuestion, options: newOptions })
                        }}
                        className="mt-1"
                      />
                    </div>
                  ))}
                  <div>
                    <Label htmlFor="correctAnswer">Correct Answer</Label>
                    <Select
                      value={currentQuestion.correctAnswer.toString()}
                      onValueChange={(value) =>
                        setCurrentQuestion({ ...currentQuestion, correctAnswer: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentQuestion.options.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Option {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="explanation">Explanation</Label>
                    <Textarea
                      id="explanation"
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={currentQuestion.difficulty}
                      onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, difficulty: value as "Easy" | "Medium" | "Hard" })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
                    {editingIndex !== null ? "Update Question" : "Add Question"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="preview">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-[#1e1b4b] mb-4">Test Preview</h3>
            <Card className="shadow-md border-0 bg-white transition-all duration-300 ease-in-out p-4">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-[#1e1b4b]">
                  Added Questions ({questions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {questions.map((q, index) => (
                    <motion.li
                      key={q.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#4338ca]/5 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 ease-in-out border border-[#4338ca]/20"
                    >
                      <span className="font-medium text-[#1e1b4b] mb-2 sm:mb-0">
                        Question {index + 1}: {q.question.substring(0, 50)}...
                      </span>
                      <div className="space-x-2 mt-2 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#4338ca] text-[#4338ca] hover:bg-[#4338ca]/10 transition-all duration-300 ease-in-out"
                          onClick={() => {
                            setPreviewQuestion(q)
                            setShowQuestionPreview(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="outline"
          onClick={() => setShowPreview(true)}
          className="border-[#4338ca] bg-white text-[#4338ca] hover:text-[#4338ca]  hover:bg-[#4338ca]/10 transition-all duration-300 ease-in-out w-full sm:w-auto">
          <Eye className="mr-2 h-4 w-4" />
          Preview Test
        </Button>
      </motion.div>

      {renderPreviewTest()}
      {renderQuestionPreview()}
    </div>
  )
}