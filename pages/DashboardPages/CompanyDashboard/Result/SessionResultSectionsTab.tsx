// SessionResultSectionsTab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SessionResult } from '../../../../utils/QuestionTypeUtils';

interface SessionResultSectionsTabProps {
  result: SessionResult;
}

const SessionResultSectionsTab: React.FC<SessionResultSectionsTabProps> = ({ result }) => {

  return (
    <Card className="bg-white rounded-xl shadow-md border border-gray-200">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800">Section-wise Performance</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-6">
          {result.libraryResults.map((lib) => {
            // Use adjusted values if available
            const sectionPercentage = lib.adjustedPercentage !== undefined 
              ? lib.adjustedPercentage 
              : lib.percentage;
            
            const sectionCorrect = lib.adjustedCorrectAnswers !== undefined
              ? lib.adjustedCorrectAnswers
              : lib.correctAnswers;
            
            const sectionTotal = lib.adjustedTotalQuestions !== undefined
              ? lib.adjustedTotalQuestions
              : lib.totalQuestions;
              
            return (
              <div key={lib.libraryId} className="space-y-2">
                <div className="flex justify-between items-center text-gray-800">
                  <div className="font-medium flex items-center gap-2">
                    <span>Section {lib.libraryId}</span>
                    {lib.hasPassage && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Contains Passage
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{sectionPercentage.toFixed(1)}%</span>
                    {/* If backend percentage is different from adjusted, show info badge */}
                    {lib.adjustedPercentage !== undefined && 
                     Math.abs(lib.percentage - lib.adjustedPercentage) > 1 && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Adjusted Score
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={sectionPercentage} className="h-2 flex-grow bg-gray-200" />
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {sectionCorrect}/{sectionTotal} correct
                  </span>
                </div>
                
                {/* Show section details */}
                <div className="text-sm text-gray-600 pl-2 pt-1">
                  {lib.hasPassage && (
                    <div>Contains reading passage(s) - not counted in score</div>
                  )}
                  {lib.questions.some(q => q.type === 'subjective') && (
                    <div>Contains subjective question(s) - AI analyzed</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionResultSectionsTab;