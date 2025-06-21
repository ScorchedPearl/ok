// QuestionComponents.tsx (Updated for backend-based analysis)
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, HelpCircle, BookOpen, Menu, Sparkles, ChevronRight } from 'lucide-react';
import { QuestionAnswer, QuestionType } from '../../../../utils/QuestionTypeUtils';

interface PassageQuestionProps {
  question: QuestionAnswer;
  index: number;
}

export const PassageQuestion: React.FC<PassageQuestionProps> = ({ question, index }) => {
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="bg-blue-50 p-5 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <BookOpen className="text-blue-700 h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-blue-800 text-lg">Reading Passage</h3>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                Not Scored
              </Badge>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {question.passageText || question.questionText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SubjectiveQuestionProps {
  question: QuestionAnswer;
  index: number;
}

export const SubjectiveQuestion: React.FC<SubjectiveQuestionProps> = ({ 
  question, 
  index
}) => {
  // Function to extract and clean up analysis text that might contain JSON formatting
  const cleanAnalysisText = (analysisText: string | undefined): string => {
    if (!analysisText) return "No analysis available";
    
    // Remove any JSON formatting, code blocks, etc.
    let cleanedText = analysisText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    // If it looks like JSON, try to parse it
    if (cleanedText.startsWith('{') && cleanedText.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanedText);
        if (parsed.analysis) {
          return parsed.analysis;
        }
      } catch (e) {
        // If parsing fails, continue with the raw text
        console.warn("Failed to parse analysis JSON", e);
      }
    }
    
    return cleanedText;
  };

  // Get the actual analysis text to display
  const analysisText = cleanAnalysisText(question.analysis);
  
  // Determine the score value
  const scoreValue = question.score !== undefined ? question.score : 0;
  // Format score for display
  const formattedScore = scoreValue.toFixed(1);
  
  // Determine question status badge
  const getScoreBadge = () => {
    if (!question.analysis) return null;
    
    if (scoreValue >= 90) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1">
          Excellent ({formattedScore}%)
        </Badge>
      );
    } else if (scoreValue >= 70) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
          Good ({formattedScore}%)
        </Badge>
      );
    } else if (scoreValue >= 50) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1">
          Needs Improvement ({formattedScore}%)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-200 px-3 py-1">
          Insufficient ({formattedScore}%)
        </Badge>
      );
    }
  };
  
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${
            question.analysis ? 
              (question.isCorrect ? 'bg-green-100' : 'bg-amber-100') : 
              'bg-gray-100'
          }`}>
            {question.analysis ? 
              (question.isCorrect ? 
                <CheckCircle className="text-green-600 h-5 w-5" /> : 
                <HelpCircle className="text-amber-600 h-5 w-5" />
              ) : 
              <HelpCircle className="text-gray-500 h-5 w-5" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-gray-800">{question.questionText}</h3>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1">
                Written Response
              </Badge>
              {getScoreBadge()}
            </div>
            
            <div className="mb-4 space-y-3">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-indigo-100 rounded-full p-1 mr-2">
                    <Menu className="h-4 w-4 text-indigo-700" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Your Response</p>
                </div>
                <div className="pl-2 border-l-2 border-indigo-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {question.candidateAnswer || "No answer provided"}
                  </p>
                </div>
              </div>
            </div>
            
            {question.analysis && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-purple-100 rounded-full p-1 mr-2">
                    <Sparkles className="h-4 w-4 text-purple-700" />
                  </div>
                  <p className="text-sm font-medium text-purple-900">AI Analysis</p>
                </div>
                <div className="pl-3 border-l-2 border-purple-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {analysisText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MultipleChoiceQuestionProps {
  question: QuestionAnswer;
  index: number;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ question, index }) => {
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${
            question.isCorrect ? 'bg-green-100' : 'bg-rose-100'
          }`}>
            {question.isCorrect ? 
              <CheckCircle className="text-green-600 h-5 w-5" /> : 
              <XCircle className="text-rose-600 h-5 w-5" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-gray-800">{question.questionText}</h3>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                Multiple Choice
              </Badge>
              {question.isCorrect ? (
                <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                  Correct
                </Badge>
              ) : (
                <Badge className="bg-rose-100 text-rose-800 border-rose-200 px-3 py-1">
                  Incorrect
                </Badge>
              )}
            </div>
            
            {question.options && question.options.length > 0 && (
              <div className="mb-4 space-y-2">
                {question.options.map((option, i) => {
                  const isCorrectOption = option === question.correctAnswer;
                  const isSelectedOption = option === question.candidateAnswer;
                  const isIncorrectSelection = isSelectedOption && !isCorrectOption;
                  
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center p-3 rounded-lg border ${
                        isCorrectOption 
                          ? 'bg-green-50 border-green-300'
                          : isIncorrectSelection
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`mr-3 w-6 h-6 flex items-center justify-center rounded-full border ${
                        isCorrectOption 
                          ? 'border-green-500 bg-green-100'
                          : isIncorrectSelection
                            ? 'border-rose-500 bg-rose-100'
                            : 'border-gray-300 bg-gray-50'
                      }`}>
                        {isCorrectOption && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {isIncorrectSelection && <XCircle className="h-4 w-4 text-rose-600" />}
                        {!isCorrectOption && !isSelectedOption && (
                          <span className="text-gray-500 text-sm">{String.fromCharCode(65 + i)}</span>
                        )}
                      </div>
                      <span className={`${
                        isCorrectOption 
                          ? 'text-green-800 font-medium'
                          : isIncorrectSelection
                            ? 'text-rose-800 font-medium'
                            : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                      {isSelectedOption && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                          Your Selection
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center mb-1">
                <ChevronRight className="text-gray-500 h-4 w-4 mr-1" />
                <p className="text-sm font-medium text-gray-700">Answer Summary</p>
              </div>
              <div className="pl-5 text-sm space-y-1">
                <p className="text-gray-700">
                  Your answer: <span className={`font-medium ${question.isCorrect ? 'text-green-600' : 'text-rose-600'}`}>
                    {question.candidateAnswer}
                  </span>
                </p>
                {!question.isCorrect && (
                  <p className="text-gray-700">
                    Correct answer: <span className="font-medium text-green-600">{question.correctAnswer}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuestionRendererProps {
  question: QuestionAnswer;
  index: number;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ 
  question, 
  index
}) => {
  switch (question.type) {
    case QuestionType.PASSAGE:
      return <PassageQuestion question={question} index={index} />;
    case QuestionType.SUBJECTIVE:
      return <SubjectiveQuestion question={question} index={index} />;
    case QuestionType.MCQ:
    default:
      return <MultipleChoiceQuestion question={question} index={index} />;
  }
};