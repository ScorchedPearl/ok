import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Sparkles,
  Brain,
  Clock,
  Code,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || 'http://localhost:8003';
const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || 'http://localhost:8004';

// Define the recommendation type
interface TestRecommendation {
  id: string;
  title: string;
  description: string;
  testType: string;
  difficulty: number;
  skills: string[];
  estimatedTime: number;
  hasCodeQuestions: boolean;
  suggestedMCQCount: number;
  suggestedSubjectiveCount: number;
  suggestedCodingCount: number; // Added field for coding questions
}

interface TestRecommendationProps {
  jobId: string;
  onSelectRecommendation: (data: any) => void;
  selectedJobDescription?: string;
}

const TestRecommendations = ({ 
  jobId, 
  onSelectRecommendation,
  selectedJobDescription 
}: TestRecommendationProps) => {
  const [recommendations, setRecommendations] = useState<TestRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded for better visibility
  
  const { user, token } = useAuth();
  const accessToken = token?.access_token;
  const tenantId = user?.tenant?.tenantId || 5;

  // Fetch test recommendations when component mounts or jobId changes
  useEffect(() => {
    if (!jobId) return;
    
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `${questionBankServiceUrl}/api/v1/test-recommendations/job/${jobId}`,
          {
            method: 'POST',
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "X-Tenant-ID": tenantId.toString()
            },
            body: JSON.stringify({
              jobId: jobId,
              maxRecommendations: 5,
              tenantId: tenantId
            })
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }
        
        const data = await response.json();
        setRecommendations(data);
      } catch (err: any) {
        console.error("Error fetching test recommendations:", err);
        setError(err.message);
        // Don't show error toast as this is just an enhancement to the existing flow
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [jobId, accessToken, tenantId]);
  
  // Handle recommendation selection
  const handleSelectRecommendation = (recommendation: TestRecommendation) => {
    setSelectedId(recommendation.id);
    
    // Transform recommendation to formData format
    const formData = {
      testName: recommendation.title,
      stream: recommendation.skills[0] || "General",
      questionType: recommendation.testType,
      aiPrompt: `${recommendation.description} Skills: ${recommendation.skills.join(", ")}`,
      difficultyLevel: getDifficultyLabel(recommendation.difficulty),
      numMCQs: recommendation.suggestedMCQCount,
      numSubjective: recommendation.suggestedSubjectiveCount,
      numCoding: recommendation.suggestedCodingCount || 0, // Include coding count with fallback
      maxLibraries: 5,
      useAI: true,
      jobIDs: [jobId]
    };
    
    onSelectRecommendation(formData);
    toast.success("Test recommendation applied!", {
      icon: "✨",
      style: {
        borderRadius: '10px',
        background: '#4c1d95',
        color: '#fff',
      },
    });
  };
  
  // Helper to get difficulty label from number
  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "Easy";
      case 2: return "Easy";
      case 3: return "Medium";
      case 4: return "Hard";
      case 5: return "Hard";
      default: return "Medium";
    }
  };

  // Helper to get appropriate icon for test type
  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case "MCQ": return <CheckCircle className="h-5 w-5" />;
      case "CODE": return <Code className="h-5 w-5" />;
      case "SUBJECTIVE": return <FileText className="h-5 w-5" />;
      case "MIXED": return <Brain className="h-5 w-5" />;
      case "CASE_STUDY": return <FileText className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  // If no job ID is selected, provide a prompt
  if (!jobId) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-indigo-500" />
          <p className="text-indigo-700 font-medium">Select a job to get AI-powered test recommendations</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg mb-6 shadow-sm">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            <Sparkles className="h-4 w-4 text-indigo-500 absolute top-0 right-0 animate-pulse" />
          </div>
          <p className="text-purple-800 font-medium mt-3">Generating smart test recommendations...</p>
          <p className="text-purple-600 text-sm mt-1">Analyzing job requirements and skills</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return null; // Don't show error message, just silently fail
  }

  // No recommendations
  if (recommendations.length === 0) {
    return null; // Don't show anything if no recommendations
  }

  // Render recommendations in a collapsible panel
  return (
    <div className="mb-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 rounded-xl p-4 shadow-md border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-purple-900">AI-Powered Test Recommendations</h3>
            <p className="text-sm text-purple-700">Smart suggestions based on job requirements</p>
          </div>
        </div>
        <Button 
          variant="ghost"
          size="sm"
          className="hover:bg-purple-200 text-purple-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <div className="flex items-center gap-1">
              <span>Hide</span>
              <ChevronUp className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span>Show</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 transition-all duration-300">
          {recommendations.map((recommendation, index) => (
            <Card 
              key={recommendation.id}
              className={`relative overflow-hidden border-2 transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                selectedId === recommendation.id 
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
              onClick={() => handleSelectRecommendation(recommendation)}
            >
              {index === 0 && !selectedId && (
                <div className="absolute -right-12 -top-3 rotate-45 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs py-1 px-12 shadow-sm">
                  Recommended
                </div>
              )}
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className={`text-xl group-hover:text-purple-800 transition-colors ${
                    selectedId === recommendation.id ? 'text-purple-800' : 'text-gray-800'
                  }`}>
                    {recommendation.title}
                  </CardTitle>
                  <Badge 
                    className={`
                      p-1 px-2 shadow-sm
                      ${recommendation.testType === 'MCQ' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                      ${recommendation.testType === 'CODE' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                      ${recommendation.testType === 'SUBJECTIVE' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                      ${recommendation.testType === 'MIXED' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                      ${recommendation.testType === 'CASE_STUDY' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : ''}
                    `}
                  >
                    <span className="flex items-center gap-1 font-medium">
                      {getTestTypeIcon(recommendation.testType)}
                      {recommendation.testType}
                    </span>
                  </Badge>
                </div>
                <CardDescription className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {recommendation.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.skills.slice(0, 3).map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-white border-purple-200 text-purple-800 shadow-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {recommendation.skills.length > 3 && (
                      <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                        +{recommendation.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-md border border-purple-100">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">{recommendation.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-md border border-indigo-100">
                      <Award className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-800">
                        {getDifficultyLabel(recommendation.difficulty)}
                      </span>
                    </div>
                  </div>
                  
                  {(recommendation.suggestedMCQCount > 0 || 
                    recommendation.suggestedSubjectiveCount > 0 || 
                    (recommendation.suggestedCodingCount && recommendation.suggestedCodingCount > 0)) && (
                    <div className="text-sm text-gray-600 flex flex-col gap-1 pt-2 mt-2 border-t border-gray-100">
                      {recommendation.suggestedMCQCount > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Multiple Choice:</span>
                          </div>
                          <span className="font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full">
                            {recommendation.suggestedMCQCount}
                          </span>
                        </div>
                      )}
                      {recommendation.suggestedSubjectiveCount > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-orange-600" />
                            <span>Subjective:</span>
                          </div>
                          <span className="font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full">
                            {recommendation.suggestedSubjectiveCount}
                          </span>
                        </div>
                      )}
                      {recommendation.suggestedCodingCount > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Code className="h-4 w-4 text-blue-600" />
                            <span>Coding:</span>
                          </div>
                          <span className="font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full">
                            {recommendation.suggestedCodingCount}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className={`w-full transition-all duration-300 ${
                    selectedId === recommendation.id 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md' 
                      : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300'
                  }`}
                  variant={selectedId === recommendation.id ? 'default' : 'outline'}
                >
                  <div className="flex items-center gap-2">
                    {selectedId === recommendation.id ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Use This Template</span>
                      </>
                    )}
                  </div>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestRecommendations;