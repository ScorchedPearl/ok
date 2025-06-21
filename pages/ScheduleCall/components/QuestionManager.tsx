import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Check,
  Search,
  Trash2,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Question } from "../types/ScheduleCallTypes";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

interface CallQuestionDTO {
  id: string; // UUID comes as string from API
  text: string;
  jobId: string; // UUID comes as string from API
  source?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  tenantId?: number;
}

interface QuestionRequestDTO {
  text: string;
  jobId: string;
  tenantId?: number;
}

interface QuestionManagerProps {
  jobId: string | undefined;
  candidateId: number | undefined;
  onQuestionsSelected: (questions: Array<{id: string, text: string}>) => void;
  onBack: () => void;
  jobTitle?: string; // Added for getOrGenerateQuestions API
  jobDescription?: string; // Added for getOrGenerateQuestions API
}

export default function QuestionManager({ 
  jobId, 
  candidateId, 
  onQuestionsSelected, 
  onBack,
  jobTitle = "", // Default to empty string if not provided
  jobDescription = "" // Default to empty string if not provided
}: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  const { user, token } = useAuth();
  const tenantId = user?.tenant?.tenantId;
  const questionServiceUrl = import.meta.env.VITE_QB_SERVICE || "http://localhost:8004"; // Use the actual service URL

  // Fetch questions for the job using the getOrGenerateQuestions API endpoint
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        
        if (!jobId) {
          // If no jobId is provided, use mock data
          useMockQuestions();
          return;
        }
        
        try {
          // Use the getOrGenerateQuestions endpoint instead of the regular GET endpoint
            const response = await axios.post(
            `${questionServiceUrl}/api/v1/questions/job/${jobId}/get-or-generate`, 
            {
              jobTitle: jobTitle || "Software Developer", // Fallback title if not provided
              jobDescription: jobDescription || "Role for a software developer with experience in web technologies" // Fallback description if not provided
            },
            {
              headers: {
              Authorization: `Bearer ${token?.access_token}`,
              'X-Username': user?.email || 'system' // Add required X-Username header
              }
            }
            );
          
          console.log("API response from get-or-generate:", response.data);
          
          // Transform API response to match our Question type
          const transformedQuestions = response.data.map((q: CallQuestionDTO) => ({
            id: q.id,
            text: q.text,
            jobId: q.jobId
          }));
          
          setQuestions(transformedQuestions);
          setFilteredQuestions(transformedQuestions);
          
          // Show a success toast if questions were generated
          if (response.data.length > 0 && response.data[0].source === 'AI_GENERATED') {
            toast.success("Generated questions for this job");
          }
        } catch (apiError) {
          console.error("API Error:", apiError);
          toast.error("Couldn't load or generate questions, using sample data");
          useMockQuestions();
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to fetch questions, using sample data");
        useMockQuestions();
      } finally {
        setIsLoading(false);
      }
    };
    
    const useMockQuestions = () => {
      const mockQuestions = [
        { id: "q1", text: "Tell me about your experience with React?", jobId: jobId || "1" },
        { id: "q2", text: "How do you handle state management in large applications?", jobId: jobId || "1" },
        { id: "q3", text: "What testing frameworks have you worked with?", jobId: jobId || "1" },
        { id: "q4", text: "Describe your approach to responsive design", jobId: jobId || "1" },
        { id: "q5", text: "How do you stay updated with the latest technologies?", jobId: jobId || "1" }
      ];
      
      setQuestions(mockQuestions);
      setFilteredQuestions(mockQuestions);
    };

    loadQuestions();
  }, [jobId, jobTitle, jobDescription, token, user]);

  // Function to manually trigger question generation
  const handleGenerateQuestions = async () => {
    if (!jobId) {
      toast.error("Job ID is required to generate questions");
      return;
    }

    try {
      setIsGeneratingQuestions(true);
      
      const response = await axios.get(
        `${questionServiceUrl}/api/v1/questions/job/${jobId}/get-or-generate`, 
        {
          params: {
            jobTitle: jobTitle || "Software Developer",
            jobDescription: jobDescription || "Role for a software developer with experience in web technologies",
            forceRegenerate: true // Add a parameter to force regeneration
          },
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
            'X-Username': user?.email || 'system'
          }
        }
      );
      
      console.log("Generated questions response:", response.data);
      
      // Transform API response to match our Question type
      const transformedQuestions = response.data.map((q: CallQuestionDTO) => ({
        id: q.id,
        text: q.text,
        jobId: q.jobId
      }));
      
      setQuestions(transformedQuestions);
      setFilteredQuestions(transformedQuestions);
      
      toast.success("Successfully generated new questions");
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Filter questions based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredQuestions(questions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = questions.filter(
        question => question.text.toLowerCase().includes(query)
      );
      setFilteredQuestions(filtered);
    }
  }, [searchQuery, questions]);

  // Handle adding a new question using the API
  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error("Question text cannot be empty");
      return;
    }

    if (!jobId) {
      toast.error("Job ID is required to add a question");
      return;
    }

    try {
      setIsAddingQuestion(true);
      
      const questionRequest: QuestionRequestDTO = {
        text: newQuestion,
        jobId: jobId,
        tenantId: tenantId
      };
      
      try {
        const response = await axios.post(
          `${questionServiceUrl}/api/v1/questions`,
          questionRequest,
          {
            headers: {
              Authorization: `Bearer ${token?.access_token}`,
              'X-Username': user?.email || 'system',
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log("Create question response:", response.data);
        
        // Transform API response to match our Question type
        const newQuestionObj: Question = {
          id: response.data.id,
          text: response.data.text,
          jobId: response.data.jobId
        };
        
        setQuestions([...questions, newQuestionObj]);
        setFilteredQuestions([...questions, newQuestionObj]);
        
        toast.success("Question added successfully");
      } catch (apiError) {
        console.error("API Error creating question:", apiError);
        
        // Fallback to mock response if API fails
        const newQuestionObj = {
          id: `q${Math.floor(Math.random() * 10000)}`,
          text: newQuestion,
          jobId: jobId
        };
        
        setQuestions([...questions, newQuestionObj]);
        setFilteredQuestions([...questions, newQuestionObj]);
        
        toast.success("Question added (mock)");
      }
      
      setNewQuestion("");
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    } finally {
      setIsAddingQuestion(false);
    }
  };

  // Handle deleting a question using the API
  const handleDeleteQuestion = async (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection of the question when clicking delete
    
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        // Call the delete API
        try {
          await axios.delete(
            `${questionServiceUrl}/api/v1/questions/${questionId}`,
            {
              headers: {
                Authorization: `Bearer ${token?.access_token}`
              }
            }
          );
          
          console.log("Question deleted from API");
          
          // Update local state after successful API call
          const updatedQuestions = questions.filter(q => q.id !== questionId);
          setQuestions(updatedQuestions);
          setFilteredQuestions(updatedQuestions);
          
          // Remove from selected if it was selected
          setSelectedQuestions(prev => prev.filter(q => q.id !== questionId));
          
          toast.success("Question deleted successfully");
        } catch (apiError) {
          console.error("API Error deleting question:", apiError);
          
          // Update local state even if the API fails (optimistic updates)
          const updatedQuestions = questions.filter(q => q.id !== questionId);
          setQuestions(updatedQuestions);
          setFilteredQuestions(updatedQuestions);
          
          // Remove from selected if it was selected
          setSelectedQuestions(prev => prev.filter(q => q.id !== questionId));
          
          toast.success("Question removed (API failed)");
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question");
      }
    }
  };

  // Toggle question selection
  const toggleQuestionSelection = (question: Question) => {
    if (selectedQuestions.some(q => q.id === question.id)) {
      setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  // Proceed to next step
  const handleNext = () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }
    
    // Pass just the id and text to parent component
    const simplifiedQuestions = selectedQuestions.map(({ id, text }) => ({ id, text }));
    onQuestionsSelected(simplifiedQuestions);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: Question selection */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Available Questions</h3>
              <div className="flex items-center gap-2">
                {/* <Button
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={isGeneratingQuestions || !jobId}
                  className="bg-gradient-to-b from-purple-600 to-indigo-700 text-white text-sm"
                  size="sm"
                >
                  {isGeneratingQuestions ? "Generating..." : "Generate Questions"}
                  <Sparkles size={14} className="ml-1" />
                </Button> */}
                <div className="relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions..."
                    className="pr-10 bg-white/90 text-gray-800 w-56"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => {
                  const isSelected = selectedQuestions.some(q => q.id === question.id);
                  
                  return (
                    <div 
                      key={question.id}
                      onClick={() => toggleQuestionSelection(question)}
                      className={`p-4 border rounded-lg transition-all cursor-pointer flex justify-between items-start ${
                        isSelected 
                          ? 'border-indigo-400 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <p className="text-gray-800">{question.text}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteQuestion(question.id, e)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-gray-600 font-medium">No questions found</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Try generating questions or add a new question from the sidebar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right side: Add Question + Selected questions */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Add Question Box */}
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm border-indigo-100">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-indigo-800 mb-2">Add New Question</h3>
                <div className="space-y-3">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Type a new question here..."
                    className="bg-white/90 text-gray-800 border-indigo-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isAddingQuestion && newQuestion.trim()) handleAddQuestion();
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      disabled={isAddingQuestion || !newQuestion.trim()}
                      className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white text-sm"
                    >
                      {isAddingQuestion ? "Adding..." : "Add Question"}
                      <Plus size={14} className="ml-1" />
                    </Button>
                  </div>
                  <p className="text-xs text-indigo-700 mt-1">
                    Click on questions in the list to select them for your call
                  </p>
                </div>
              </div>
            </Card>

            <h3 className="text-lg font-semibold text-gray-800 mb-1">Selected Questions ({selectedQuestions.length})</h3>
            <Card className="bg-gray-50 shadow-sm border-gray-200">
              <div className="p-4">
                {selectedQuestions.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {selectedQuestions.map((question, index) => (
                      <div key={question.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-800 mr-2">{index + 1}.</span>
                          <p className="text-sm text-gray-800 flex-1">{question.text}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id))}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No questions selected yet</p>
                    <p className="text-gray-400 text-xs mt-1">Click on questions to select them</p>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">
                  {selectedQuestions.length === 0 ? "Select at least one question to proceed" : "Review your selected questions before proceeding"}
                </p>
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                  {selectedQuestions.length} Question{selectedQuestions.length !== 1 ? 's' : ''} Selected
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          className="bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={selectedQuestions.length === 0}
          className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white font-medium py-2 px-4 rounded-lg flex items-center"
        >
          Next Step
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}