import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit2, 
  Clock, 
  Loader2,
  ArrowLeft,
  BookOpen,
  Tag,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Filter,
  Search
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { UserProfile } from "@/context/types";

const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || 'http://localhost:8004';
const partnerServiceUrl = import.meta.env.VITE_PARTNER_SERVICE_URL || 'http://localhost:8008';

interface Question {
  id?: number;
  questionType: string;
  questionText: string;
  options: Record<string, string>;
  correctOption: string;
  difficultyLevel: string;
  createdBy?: number;
  tenantUserId?: string;
  createdAt?: string;
}

interface Library {
  libraryId: number;
  libraryName: string;
  description: string;
  createdAt: string;
  createdBy: string;
  tenantUserId: number;
  timeRequired: number;
  tags: string[];
  questions: Question[];
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: Question) => Promise<void>;
  editQuestion?: Question;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  editQuestion 
}) => {
  const [formData, setFormData] = useState<Question>({
    questionType: editQuestion?.questionType || "MCQ",
    questionText: editQuestion?.questionText || "",
    options: editQuestion?.options || { A: "", B: "", C: "", D: "" },
    correctOption: editQuestion?.correctOption || "A",
    difficultyLevel: editQuestion?.difficultyLevel || "Medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when editQuestion changes
  useEffect(() => {
    if (editQuestion) {
      setFormData({
        ...editQuestion,
        options: editQuestion.options || { A: "", B: "", C: "", D: "" }
      });
    } else {
      setFormData({
        questionType: "MCQ",
        questionText: "",
        options: { A: "", B: "", C: "", D: "" },
        correctOption: "A",
        difficultyLevel: "Medium"
      });
    }
  }, [editQuestion, isOpen]);

  const handleSubmit = async () => {
    if (!formData.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="bg-gradient-to-r from-[#2E2883] to-[#5D56E0] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {editQuestion ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              {editQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700">Question Type</Label>
              <Select
                value={formData.questionType}
                onValueChange={(value) => setFormData({...formData, questionType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice</SelectItem>
                  <SelectItem value="TF">True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700">Difficulty Level</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) => setFormData({...formData, difficultyLevel: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Question Text</Label>
            <Textarea
              value={formData.questionText}
              onChange={(e) => setFormData({...formData, questionText: e.target.value})}
              className="min-h-[100px] text-gray-900"
              placeholder="Enter your question here..."
            />
          </div>

          <div className="space-y-4">
            <Label className="text-gray-700">Options</Label>
            {Object.keys(formData.options).map((key) => (
              <div key={key} className="flex gap-4 items-center">
                <div className="w-12">
                  <Label className="text-gray-700">{key}</Label>
                </div>
                <Input
                  value={formData.options[key]}
                  onChange={(e) => setFormData({
                    ...formData,
                    options: {...formData.options, [key]: e.target.value}
                  })}
                  className="text-gray-900"
                  placeholder={`Option ${key}`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Correct Option</Label>
            <Select
              value={formData.correctOption}
              onValueChange={(value) => setFormData({...formData, correctOption: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(formData.options).map((key) => (
                  <SelectItem key={key} value={key}>{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#2E2883] to-[#5D56E0] hover:opacity-90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Question'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LibraryDetails: React.FC = () => {
  const params = useParams<{ libraryId: string }>();
  const libraryId = params.libraryId;
  const { token } = useAuth();
  
  const [library, setLibrary] = useState<Library | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch partner profile first
  useEffect(() => {
    async function fetchPartnerProfile() {
      if (!token) return;
      
      try {
        const profile = await api.auth.getPartnerProfile(token);
        console.log("Fetched partner profile:", profile);
        setPartnerProfile(profile);
      } catch (error) {
        console.error("Error fetching partner profile:", error);
        toast.error("Error loading profile data");
      } finally {
        setProfileLoading(false);
      }
    }
    
    fetchPartnerProfile();
  }, [token]);

  const fetchLibraryDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${questionBankServiceUrl}/libraries/${libraryId}`);
      if (!response.ok) throw new Error('Failed to fetch library details');
      const data = await response.json();
      console.log("Raw API response:", data);
      setLibrary(data);
    } catch (error) {
      console.error("Error fetching library details", error);
      toast.error("Failed to load library details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryDetails();
  }, [libraryId]);

// In handleAddQuestion function
const handleAddQuestion = async (question: Question) => {
  if (!partnerProfile) {
    toast.error("Partner profile not loaded. Please try again.");
    return;
  }

  let Body = JSON.stringify({
    question_type: question.questionType,
    question_text: question.questionText,
    options: question.options,
    correct_option: question.correctOption,
    difficulty_level: question.difficultyLevel,
    created_by: partnerProfile.userId,
    tenant_user_id: partnerProfile.userId,
    created_at: new Date().toISOString()
  });
  
  console.log("Request Body:", Body);
  try {
    const response = await fetch(`${questionBankServiceUrl}/libraries/${libraryId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: Body
    });

    if (!response.ok) throw new Error('Failed to add question');

    // Determine points based on difficulty
    let pointsAwarded = 1; // Default for easy
    if (question.difficultyLevel === "Medium") {
      pointsAwarded = 2;
    } else if (question.difficultyLevel === "Hard") {
      pointsAwarded = 3;
    }
    
    // Record activity for question creation
    await fetch(`${partnerServiceUrl}/api/activities/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: new Date().toISOString(),
        type: "Contribution",
        description: `Added ${question.difficultyLevel.toLowerCase()} question to library`,
        points: pointsAwarded,
        partnerId: partnerProfile.userId 
      })
    });

    toast.success(`Question added successfully! Earned ${pointsAwarded} points.`);
    fetchLibraryDetails();
  } catch (error) {
    console.error('Error adding question:', error);
    toast.error('Failed to add question');
  }
};

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsQuestionModalOpen(true);
  };

  // Filter questions based on difficulty and search term
  const filteredQuestions = library?.questions.filter(question => {
    const matchesFilter = filter === "all" || question.difficultyLevel === filter;
    const matchesSearch = searchTerm === "" || 
      question.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#F3F4FF] to-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#2E2883] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-[#2E2883] font-medium">Loading library details...</p>
        </div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#F3F4FF] to-white">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Library Not Found</h2>
        <p className="text-gray-600 mb-6">The library you're looking for doesn't exist or has been removed.</p>
        <Link to="/partner-dashboard">
          <Button className="bg-gradient-to-r from-[#2E2883] to-[#5D56E0] text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4FF] to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Link to="/partner-dashboard">
            <Button 
              variant="outline" 
              className="text-[#2E2883] hover:bg-[#2E2883]/10 border-[#2E2883]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#2E2883] to-[#5D56E0] text-white rounded-xl overflow-hidden mb-6 shadow-lg"
        >
          <div className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-white/90" />
                    <h1 className="text-2xl md:text-3xl font-bold">{library.libraryName}</h1>
                  </div>
                  <p className="text-white/90 text-lg">{library.description}</p>
                </div>
                <Button 
                  onClick={() => {
                    setEditingQuestion(undefined);
                    setIsQuestionModalOpen(true);
                  }}
                  className="bg-white text-[#2E2883] hover:bg-white/90 shadow-lg self-start"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>{library.timeRequired} minutes</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                  <Tag className="w-4 h-4" />
                  <span>Tags:</span>
                </div>
                {library.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-white/20 px-3 py-1.5 rounded-lg text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter & Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-xl shadow-md mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#2E2883]" />
              <Label className="font-medium text-gray-700">Filter by Difficulty:</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Questions Count */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <Badge variant="outline" className="text-[#2E2883] border-[#2E2883]/30 text-sm py-1">
            {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'} {filter !== "all" ? `(${filter} difficulty)` : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </Badge>
        </motion.div>

        {/* Questions Section */}
        <AnimatePresence mode="wait">
          {filteredQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm"
            >
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Questions Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 
                  "No questions match your search criteria." : 
                  filter !== "all" ? 
                    `No questions with ${filter} difficulty in this library.` : 
                    "This library doesn't have any questions yet."}
              </p>
              <Button 
                onClick={() => {
                  setEditingQuestion(undefined);
                  setIsQuestionModalOpen(true);
                }}
                className="bg-gradient-to-r from-[#2E2883] to-[#5D56E0] text-white hover:opacity-90"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Question
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4 bg-inherit"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {filteredQuestions.map((question, index) => (
                <motion.div
                  key={question.id || index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#2E2883]/10 text-[#2E2883] px-3 py-1.5 rounded-lg text-sm font-medium">
                        {question.questionType}
                      </span>
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        question.difficultyLevel === 'Easy'
                          ? 'bg-green-100 text-green-800' 
                          : question.difficultyLevel === 'Medium' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {question.difficultyLevel}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-300 hover:border-[#2E2883] hover:text-white hover:bg-[#2E2883]"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-300 hover:border-red-700 hover:text-red-700 hover:bg-white"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-900 text-base leading-relaxed mb-6 font-medium">
                    {question.questionText}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(question.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border ${
                          key === question.correctOption
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-gray-200 text-gray-700'
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-2">
                          {key === question.correctOption && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          <span className="font-semibold text-gray-900 mr-2">{key}:</span> 
                          <span className="text-gray-700">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(undefined);
        }}
        onSubmit={handleAddQuestion}
        editQuestion={editingQuestion}
      />
    </div>
  );
};

export default LibraryDetails;