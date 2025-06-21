import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { QuestionRenderer } from './QuestionComponents';
import { LibraryResult, SessionResult, QuestionType } from '../../../../utils/QuestionTypeUtils';
import { FileText, ListChecks, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SessionResultQuestionsTabProps {
  result: SessionResult;
}

const SessionResultQuestionsTab: React.FC<SessionResultQuestionsTabProps> = ({ result }) => {
  // Helper function to get section status badge
  const getSectionStatusBadge = (lib: LibraryResult) => {
    const sectionCorrect = lib.adjustedCorrectAnswers !== undefined
      ? lib.adjustedCorrectAnswers
      : lib.correctAnswers;
      
    const sectionTotal = lib.adjustedTotalQuestions !== undefined
      ? lib.adjustedTotalQuestions
      : lib.totalQuestions;
    
    const percentage = sectionTotal > 0 ? (sectionCorrect / sectionTotal) * 100 : 0;
    
    if (percentage >= 85) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-3 py-1">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Excellent
        </Badge>
      );
    } else if (percentage >= 70) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Good
        </Badge>
      );
    } else if (percentage >= 50) {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1">
          <AlertCircle className="mr-1 h-3.5 w-3.5" />
          Average
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 px-3 py-1">
          <AlertCircle className="mr-1 h-3.5 w-3.5" />
          Needs Work
        </Badge>
      );
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center">
            <ListChecks className="mr-2 h-6 w-6 text-gray-700" />
            Questions & Responses
          </CardTitle>
          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 px-3 py-1">
            {result.libraryResults.reduce((acc, lib) => acc + lib.questions.length, 0)} Questions Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        <Accordion type="single" collapsible className="w-full">
          {result.libraryResults.map((lib: LibraryResult) => {
            // Use adjusted values if available
            const sectionCorrect = lib.adjustedCorrectAnswers !== undefined
              ? lib.adjustedCorrectAnswers
              : lib.correctAnswers;
              
            const sectionTotal = lib.adjustedTotalQuestions !== undefined
              ? lib.adjustedTotalQuestions
              : lib.totalQuestions;
              
            // Get subjective question counts
            const totalSubjective = lib.subjectiveQuestions || 0;
            const analyzedSubjective = lib.subjectiveQuestionsAnalyzed || 0;
            const pendingSubjectiveCount = totalSubjective - analyzedSubjective;
            
            // Count all questions by type
            const questionTypeCounts = {
              mcq: lib.questions.filter(q => q.type === QuestionType.MCQ).length,
              subjective: lib.questions.filter(q => q.type === QuestionType.SUBJECTIVE).length,
              passage: lib.hasPassage ? 1 : 0
            };
            
            return (
              <AccordionItem 
                key={lib.libraryId} 
                value={lib.libraryId} 
                className="border-b border-gray-200 overflow-hidden mb-4"
              >
                <AccordionTrigger className="py-5 px-4 text-gray-800 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                  <div className="flex justify-between w-full pr-4">
                    <div className="font-medium flex items-center gap-2">
                      <span className="text-lg">Section {lib.libraryId}</span>
                      {getSectionStatusBadge(lib)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-800 mr-1">{sectionCorrect}/{sectionTotal}</span>
                        <span className="text-sm text-gray-600">correct</span>
                      </div>
                      {lib.hasPassage && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                          <FileText className="mr-1 h-3.5 w-3.5" />
                          Reading Passage
                        </Badge>
                      )}
                      {pendingSubjectiveCount > 0 && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 whitespace-nowrap">
                          <AlertCircle className="mr-1 h-3.5 w-3.5" />
                          {pendingSubjectiveCount} Unanalyzed
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">Section Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-white rounded-md border border-gray-200">
                        <p className="text-sm text-gray-600">Multiple Choice</p>
                        <p className="font-medium text-gray-800">{questionTypeCounts.mcq} Questions</p>
                      </div>
                      {questionTypeCounts.subjective > 0 && (
                        <div className="p-3 bg-white rounded-md border border-gray-200">
                          <p className="text-sm text-gray-600">Subjective</p>
                          <p className="font-medium text-gray-800">{questionTypeCounts.subjective} Questions</p>
                          {analyzedSubjective > 0 && (
                            <p className="text-xs text-green-600">{analyzedSubjective} Analyzed</p>
                          )}
                        </div>
                      )}
                      <div className="p-3 bg-white rounded-md border border-gray-200">
                        <p className="text-sm text-gray-600">Score</p>
                        <p className="font-medium text-gray-800">
                          {sectionTotal > 0 
                            ? `${((sectionCorrect / sectionTotal) * 100).toFixed(1)}%` 
                            : 'N/A'}
                        </p>
                      </div>
                      {lib.hasPassage && (
                        <div className="p-3 bg-white rounded-md border border-gray-200">
                          <p className="text-sm text-gray-600">Passage</p>
                          <p className="font-medium text-gray-800">Included</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6 pt-2 pb-6 px-1">
                    {lib.questions && lib.questions.map((question, index) => (
                      <div 
                        key={question.questionId} 
                        className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                          <span className="font-medium text-gray-700">Question {index + 1}</span>
                          {question.type === QuestionType.SUBJECTIVE ? (
                            question.analysis ? (
                              <Badge className="bg-purple-100 text-purple-800">AI Analyzed</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Not Analyzed</Badge>
                            )
                          ) : question.type === QuestionType.PASSAGE ? (
                            <Badge className="bg-blue-100 text-blue-800">Passage</Badge>
                          ) : (
                            question.isCorrect ? (
                              <Badge className="bg-emerald-100 text-emerald-800">Correct</Badge>
                            ) : (
                              <Badge className="bg-rose-100 text-rose-800">Incorrect</Badge>
                            )
                          )}
                        </div>
                        <div className="p-4 bg-white">
                          <QuestionRenderer
                            question={question}
                            index={index}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default SessionResultQuestionsTab;