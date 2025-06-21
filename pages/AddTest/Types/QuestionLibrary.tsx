import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { QuestionLibrary, MCQQuestion } from "./Test"
import { cn } from "@/lib/utils"

interface QuestionLibraryProps {
  libraries: QuestionLibrary[]
  selectedQuestions: MCQQuestion[]
  onSelectQuestions: (questions: MCQQuestion[]) => void
  onDeselectQuestion?: (question: MCQQuestion) => void
}

export function QuestionLibrary({
  libraries,
  selectedQuestions,
  onSelectQuestions,
  onDeselectQuestion,
}: QuestionLibraryProps) {
  const [selectedLibrary, setSelectedLibrary] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())
  const [previewQuestion, setPreviewQuestion] = useState<MCQQuestion | null>(null)

  useEffect(() => {
    const defaultSelectedIds = new Set(selectedQuestions.map((q) => q.id))
    const defaultSelectedQuestions = selectedLibrary === "all"
      ? libraries.flatMap((lib) => lib.questions)
      : libraries.find((lib) => lib.id === selectedLibrary)?.questions || []
    defaultSelectedQuestions.forEach((q) => defaultSelectedIds.add(q.id))
    setSelectedQuestionIds(defaultSelectedIds)
    onSelectQuestions(Array.from(defaultSelectedIds).map(id => defaultSelectedQuestions.find(q => q.id === id)!).filter(Boolean))
  }, [selectedLibrary, libraries, onSelectQuestions])

  const filteredQuestions = useMemo(() => {
    let questions =
      selectedLibrary === "all"
        ? libraries.flatMap((lib) => lib.questions)
        : libraries.find((lib) => lib.id === selectedLibrary)?.questions || []

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase()
      questions = questions.filter(
        (q) =>
          q.question.toLowerCase().includes(lowercasedTerm) ||
          q.tags.some((tag) => tag.toLowerCase().includes(lowercasedTerm)),
      )
    }

    if (difficultyFilter && difficultyFilter !== "all") {
      questions = questions.filter((q) => q.difficulty === difficultyFilter)
    }
    console.log(questions);
    return questions
  }, [libraries, selectedLibrary, searchTerm, difficultyFilter])

  const handleSelectQuestion = (question: MCQQuestion) => {
    const newSelectedIds = new Set(selectedQuestionIds)
    if (newSelectedIds.has(question.id)) {
      newSelectedIds.delete(question.id)
      onDeselectQuestion?.(question)
    } else {
      newSelectedIds.add(question.id)
      onSelectQuestions([...selectedQuestions, question])
    }
    setSelectedQuestionIds(newSelectedIds)
  }

  function handleBatchSelect(selectAll: boolean): void {
    const newSelectedIds = new Set<string>()
    if (selectAll) {
      filteredQuestions.forEach((question) => newSelectedIds.add(question.id))
      onSelectQuestions(filteredQuestions)
    } else {
      onSelectQuestions([])
    }
    setSelectedQuestionIds(newSelectedIds)
  }

  return (
    <div className="space-y-4 bg-gray-50 text-gray-900 p-4 sm:p-6 rounded-lg transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Select onValueChange={(value) => setSelectedLibrary(value)} defaultValue="all">
          <SelectTrigger className="w-full sm:w-[200px] transition-all duration-300 ease-in-out">
            <SelectValue placeholder="Select Library" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Libraries</SelectItem>
            {libraries.map((lib) => (
              <SelectItem key={lib.id} value={lib.id}>
                {lib.libraryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="border-gray-300 focus:border-blue-400 focus:ring-blue-400 w-full transition-all duration-300 ease-in-out"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <p className="text-sm text-gray-600">{filteredQuestions.length} questions found</p>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="text-white border-blue-200 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] transition-all duration-300 ease-in-out"
            onClick={() => handleBatchSelect(true)}
          >
            Select All
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-white border-blue-200 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] transition-all duration-300 ease-in-out"
            onClick={() => handleBatchSelect(false)}
          >
            Deselect All
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {filteredQuestions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "p-4 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out",
                selectedQuestionIds.has(question.id) ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100",
              )}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedQuestionIds.has(question.id)}
                  onCheckedChange={() => handleSelectQuestion(question)}
                  className={selectedQuestionIds.has(question.id) ? "border-blue-400" : "border-gray-300"}
                />
                <p className={cn("font-medium", selectedQuestionIds.has(question.id) ? "text-blue-700" : "text-gray-800")}>
                  {question.question}
                </p>
                <div className="flex items-center space-x-2">
                  <span
                    className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      question.difficulty === "Easy"
                        ? "bg-green-100 text-green-800"
                        : question.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800",
                    )}
                  >
                    {question.difficulty}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewQuestion(question)}
                        className={
                          selectedQuestionIds.has(question.id)
                            ? "text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                            : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white max-h-[80vh] overflow-y-auto sm:max-w-lg">
                      <DialogHeader className="border-b-2 border-blue-100 pb-2">
                        <DialogTitle className="text-xl sm:text-2xl font-semibold text-blue-800">
                          Question Preview
                        </DialogTitle>
                      </DialogHeader>
                      {previewQuestion && (
                        <div className="space-y-4 p-4">
                          <p className="font-medium text-base sm:text-lg text-gray-800">{previewQuestion.question}</p>
                          <ul className="space-y-2">
                            {previewQuestion.options.map((option, index) => (
                              <li
                                key={index}
                                className={cn(
                                  "p-2 rounded text-sm sm:text-base",
                                  index === previewQuestion.correctAnswer
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800",
                                )}
                              >
                                {option}
                              </li>
                            ))}
                          </ul>
                          <p className="text-sm text-gray-600">Explanation: {previewQuestion.explanation}</p>
                          <div className="flex flex-wrap gap-2">
                            {previewQuestion.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}