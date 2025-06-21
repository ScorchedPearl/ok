"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Info, Check, Eye, List, Clock} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import type { QuestionLibrary, MCQQuestion } from "../Types/Test";

const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || "http://localhost:8004";

// ----------------------------
// Raw types from backend
// ----------------------------
interface RawMCQQuestion {
  questionId: number;
  questionType: string;
  questionText: string;
  options: { [key: string]: string };
  correctOption: string;
  difficultyLevel: string;
  createdBy: number;
  createdAt: string;
  tenantUserId: number;
  status: string;
}

interface RawLibrary {
  libraryId: number;
  libraryName: string;
  description: string;
  createdAt: string;
  tenantUserId: number;
  timeRequired: number;
  tags: string[];
  questions: RawMCQQuestion[];
}

// ----------------------------
// Local props for this component
// ----------------------------
interface FormDataProps {
  questionLibraries: QuestionLibrary[];
}

interface ChooseLibrariesProps {
  formData: FormDataProps;
  onFormDataChange: (updatedData: Partial<FormDataProps>) => void;
}

const defaultFormData: FormDataProps = {
  questionLibraries: [],
};

const categories = ["All", "MCQ", "Programming", "Algorithm", "Data Structures"];

// ----------------------------
// Transformation functions
// ----------------------------
const transformQuestion = (raw: RawMCQQuestion): MCQQuestion => {
  const optionKeys = Object.keys(raw.options).sort();
  const optionsArray = optionKeys.map((key) => raw.options[key]);
  const correctAnswerIndex = optionKeys.indexOf(raw.correctOption);
  return {
    id: String(raw.questionId),
    question: raw.questionText,
    options: optionsArray,
    correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
    explanation: "",
    difficulty:
      raw.difficultyLevel === "Hard"
        ? "Hard"
        : raw.difficultyLevel === "Medium"
        ? "Medium"
        : "Easy",
    tags: [],
  };
};

const transformLibrary = (raw: RawLibrary): QuestionLibrary => ({
  id: String(raw.libraryId),
  libraryName: raw.libraryName,
  description: raw.description,
  questions: raw.questions.map(transformQuestion),
  tags: raw.tags,
  timeRequired: raw.timeRequired,
});

// ----------------------------
// Library Preview Modal Component
// ----------------------------
interface LibraryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  libraryId: string | null;
}

function LibraryPreviewModal({ isOpen, onClose, libraryId }: LibraryPreviewModalProps) {
  const [library, setLibrary] = useState<QuestionLibrary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && libraryId) {
      const fetchLibraryDetails = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(`${questionBankServiceUrl}/${libraryId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch library details: ${response.statusText}`);
          }
          const data: RawLibrary = await response.json();
          console.log("Fetched library data:", data);
          setLibrary(transformLibrary(data));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
          setError(errorMessage);
          console.error("Error fetching library details:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchLibraryDetails();
    }
  }, [isOpen, libraryId]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#1e1b4b]">
              {loading ? "Loading library details..." : library?.libraryName}
            </DialogTitle>
            <DialogClose className="cursor-pointer" />
          </div>
          {library && (
            <DialogDescription className="text-gray-600 mt-2">
              {library.description}
            </DialogDescription>
          )}
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4338ca]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">{error}</div>
        ) : library ? (
          <div className="space-y-6 mt-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 font-semibold text-[#1e1b4b] bg-[#4338ca]/10 px-3 py-1 rounded-full">
                <List className="w-4 h-4" />
                {library.questions.length} {library.questions.length === 1 ? "question" : "questions"}
              </div>
              <div className="flex items-center gap-1 font-semibold text-[#1e1b4b] bg-[#4338ca]/10 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                {library.timeRequired} min
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {library.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white text-xs rounded-full border border-[#4338ca]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-bold text-[#1e1b4b] border-b pb-2">Questions</h3>
            <div className="space-y-6">
              {library.questions.map((question, index) => (
                <Card
                  key={question.id}
                  className="border-[#4338ca]/20 hover:border-[#4338ca]/50 transition-colors duration-300"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-[#1e1b4b]">
                        Question {index + 1}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold px-2 py-1 rounded bg-[#4338ca]/10 text-[#1e1b4b] border-[#4338ca]"
                      >
                        {question.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-black font-semibold">{question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded-md border ${
                            optionIndex === question.correctAnswer
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start text-black">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4338ca] text-white mr-2">
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <div>{option}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">No library data available</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------
// Library Card Component
// ----------------------------
interface LibraryCardProps {
  library: QuestionLibrary;
  onToggle: (id: string) => void;
  isSaved: boolean;
  onPreview: (id: string) => void;
}

function LibraryCard({ library, onToggle, isSaved, onPreview }: LibraryCardProps) {
  const [showAllTags, setShowAllTags] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="cursor-pointer border border-gray-200 hover:border-[#4338ca] bg-gradient-to-br from-white to-[#4338ca]/5 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-2 flex justify-between items-start">
          <CardTitle className="text-2xl font-semibold text-[#1e1b4b]">
            {library.libraryName}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            disabled={library.questions.length === 0}
            onClick={(e) => {
              e.stopPropagation();
              if (library.questions.length === 0) {
                toast.error("Library with no questions cannot be selected");
                return;
              }
              onToggle(library.id);
            }}
            className="h-8 w-8 text-[#4338ca] hover:text-[#1e1b4b] hover:bg-[#4338ca]/10"
          >
            {isSaved ? (
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-[#4338ca]">
                <Check className="h-4 w-4 text-white" />
              </div>
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </Button>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {library.description || "No description available."}
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {(showAllTags ? library.tags : library.tags.slice(0, 4)).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white text-xs rounded-full border border-[#4338ca]"
              >
                {tag}
              </span>
            ))}
            {library.tags.length > 4 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllTags(!showAllTags);
                }}
                className="px-2 py-0.5 bg-[#4338ca]/10 text-[#1e1b4b] text-xs rounded-full border border-[#4338ca] hover:bg-[#4338ca]/20 transition-colors duration-200 cursor-pointer"
              >
                {showAllTags ? "Show less" : `+${library.tags.length - 4}`}
              </motion.button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-[#1e1b4b] justify-between pt-3">
            <div className="flex items-center gap-1 font-semibold">
              <List className="w-4 h-4" />
              {library.questions.length} {library.questions.length === 1 ? "question" : "questions"}
            </div>
            <div className="flex items-center gap-1 font-semibold">
              <Clock className="w-4 h-4" />
              {library.timeRequired} min
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-200">
          <Badge
            variant="outline"
            className="text-xs font-semibold px-2 py-1 rounded bg-[#4338ca]/10 text-[#1e1b4b] border-[#4338ca]"
          >
            Library
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-[#4338ca] hover:text-[#1e1b4b] hover:bg-[#4338ca]/10"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(library.id);
            }}
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// ----------------------------
// Main Component: ChooseLibraries
// ----------------------------
export default function ChooseLibraries({ formData = defaultFormData, onFormDataChange }: ChooseLibrariesProps) {
  const [libraries, setLibraries] = useState<QuestionLibrary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"all" | "selected">("all");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);

  // Handle preview button click
  const handlePreview = (libraryId: string) => {
    setSelectedLibraryId(libraryId);
    setIsPreviewModalOpen(true);
  };

  // Close preview modal
  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setSelectedLibraryId(null);
  };

  // Validate that at least one library is selected.
  useEffect(() => {
    const newErrors: { [key: string]: string } = {};
    if (formData.questionLibraries.length === 0) {
      newErrors.questionLibraries = "Please select at least one library";
    }
    setErrors(newErrors);
  }, [formData.questionLibraries]);

  // Check if selected libraries have at least one question.
  useEffect(() => {
    const totalQuestions = formData.questionLibraries.reduce((sum, lib) => sum + lib.questions.length, 0);
    if (formData.questionLibraries.length > 0 && totalQuestions === 0) {
      toast.error("Select libraries with at least 1 question");
    }
  }, [formData.questionLibraries]);

  // Toggle selection for a library (add or remove from formData)
  const toggleSaveLibrary = (libraryId: string) => {
    const isSelected = formData.questionLibraries.some((lib) => lib.id === libraryId);
    if (isSelected) {
      onFormDataChange({
        questionLibraries: formData.questionLibraries.filter((lib) => lib.id !== libraryId),
      });
    } else {
      const libraryToAdd = libraries.find((lib) => lib.id === libraryId);
      if (libraryToAdd) {
        if (libraryToAdd.questions.length === 0) {
          toast.error("Library with no questions cannot be selected");
          return;
        }
        onFormDataChange({
          questionLibraries: [...formData.questionLibraries, libraryToAdd],
        });
      }
    }
  };

  // Fetch libraries from the backend.
  useEffect(() => {
    const fetchLibraries = async () => {
      console.log("Fetching libraries...");
      setLoading(true);
      try {
        const response = await fetch(`${questionBankServiceUrl}/libraries`);
        if (!response.ok) {
          throw new Error(`Failed to fetch libraries: ${response.statusText}`);
        }
        const data: RawLibrary[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format: expected an array");
        }

        const validatedData = data.map((library) => {
          if (!Array.isArray(library.tags)) {
            return { ...library, tags: [] };
          }
          return library;
        });
        console.log("Fetched libraries data:", validatedData);
        setLibraries(validatedData.map(transformLibrary));
        console.log("Transformed librassies data:", libraries);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching libraries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraries();
  }, []);

  // Filter libraries based on search, category, and tab.
  const filteredLibraries = useMemo(() => {
    return libraries.filter((library) => {
      const matchesSearch = library.libraryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "selected" && formData.questionLibraries.some((lib) => lib.id === library.id));
      const matchesCategory = selectedCategory === "All"; // Extend if needed.
      return matchesSearch && matchesTab && matchesCategory;
    });
  }, [libraries, searchQuery, activeTab, selectedCategory, formData.questionLibraries]);

  if (loading)
    return <div className="text-center py-12">Loading libraries...</div>;
  if (error)
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;

  return (
    <div className="h-screen overflow-y-auto space-y-6 p-4 bg-gradient-to-br from-white to-[#4338ca]/5">
      {/* Preview Modal */}
      <LibraryPreviewModal isOpen={isPreviewModalOpen} onClose={closePreviewModal} libraryId={selectedLibraryId} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <h2 className="text-3xl font-bold text-[#1e1b4b]">Choose Libraries</h2>
        <Button
          variant="outline"
          className="gap-2 bg-white border-[#4338ca] text-[#4338ca] hover:bg-[#4338ca]/10"
          onClick={() => setActiveTab("selected")}
        >
          Selected Libraries ({formData.questionLibraries.length})
        </Button>
      </motion.div>

      {/* Common Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <Input
          placeholder="Search libraries"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-[#4338ca] focus:border-[#1e1b4b] focus:ring-[#1e1b4b] bg-white"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 border-[#4338ca] bg-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Information Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Alert className="bg-blue-50 border-[#4338ca] shadow-sm">
          <Info className="h-4 w-4 text-[#4338ca]" />
          <AlertDescription className="text-[#1e1b4b] pl-2">
            Click the icon on a library card to select/deselect it.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Tabs for All/Selected libraries */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "selected")} className="w-full">
        <TabsList className="grid grid-cols-2 text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] max-w-md mx-auto rounded-lg shadow-md">
          <TabsTrigger
            value="all"
            className={`transition-colors duration-300 ease-in-out cursor-pointer ${
              activeTab === "all" ? "bg-[#4338ca] text-white" : "bg-transparent text-white hover:bg-[#4338ca]/50"
            }`}
          >
            All Libraries
          </TabsTrigger>
          <TabsTrigger
            value="selected"
            className={`transition-colors duration-300 ease-in-out cursor-pointer ${
              activeTab === "selected" ? "bg-[#4338ca] text-white" : "bg-transparent text-white hover:bg-[#4338ca]/50"
            }`}
          >
            Selected Libraries
          </TabsTrigger>
        </TabsList>

        <AnimatePresence>
  {/* ALL LIBRARIES TAB */}
  {activeTab === "all" && (
    <TabsContent value="all" key="all-libraries" asChild>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.5 }}
      >
        {filteredLibraries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No libraries found. Try adjusting your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredLibraries.map((library) => (
              <LibraryCard
                key={library.id}
                library={library}
                onToggle={toggleSaveLibrary}
                isSaved={formData.questionLibraries.some((lib) => lib.id === library.id)}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </motion.div>
    </TabsContent>
  )}
  {/* SELECTED LIBRARIES TAB */}
  {activeTab === "selected" && (
    <TabsContent value="selected" key="selected-libraries" asChild>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {formData.questionLibraries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No libraries selected. Go to the All Libraries tab to select libraries.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {formData.questionLibraries.map((library) => (
              <LibraryCard
                key={library.id}
                library={library}
                onToggle={toggleSaveLibrary}
                isSaved={true}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </motion.div>
    </TabsContent>
  )}
</AnimatePresence>

      </Tabs>

      {errors.questionLibraries && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-red-500"
        >
          {errors.questionLibraries}
        </motion.p>
      )}
    </div>
  );
}
