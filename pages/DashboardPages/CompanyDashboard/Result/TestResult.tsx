import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import useProcessedResults from '../../../../utils/useProcessedResults';
import SessionResultOverviewTab from './SessionResultOverviewTab';
import SessionResultSectionsTab from './SessionResultSectionsTab';
import SessionResultQuestionsTab from './SessionResultQuestionsTab';
import { SessionResult as SessionResultType } from '../../../../utils/QuestionTypeUtils';

export default function SessionResult() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  const {
    processedResult,
    isLoading,
    error,
    downloadPdf
  } = useProcessedResults({
    sessionId: id || ''
  });

  if (isLoading) return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>
  );
  
  if (error) return (
    <Alert variant="destructive" className="max-w-[1200px] mx-auto mt-6">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
  
  if (!processedResult) return (
    <div className="p-8 text-center text-gray-800">
      No result found
    </div>
  );
  
  // Count pending subjective analyses
  const pendingSubjectiveAnalyses = processedResult.subjectiveQuestions && processedResult.subjectiveQuestionsAnalyzed
    ? processedResult.subjectiveQuestions - processedResult.subjectiveQuestionsAnalyzed
    : 0;
  
  // Count analyzed subjective questions
  const analyzedSubjectiveCount = processedResult.subjectiveQuestionsAnalyzed || 0;

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Test Results</h1>
        <Button 
          onClick={downloadPdf}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF Report
        </Button>
      </div>
      
      {analyzedSubjectiveCount > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            {analyzedSubjectiveCount} subjective {analyzedSubjectiveCount === 1 ? 'answer has' : 'answers have'} been 
            analyzed by AI and {analyzedSubjectiveCount === 1 ? 'its score is' : 'their scores are'} included in the 
            overall score.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-gray-100">
          <TabsTrigger value="overview" className="text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Overview
          </TabsTrigger>
          <TabsTrigger value="sections" className="text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Sections
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Questions & Answers
            {pendingSubjectiveAnalyses > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {pendingSubjectiveAnalyses}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <SessionResultOverviewTab result={processedResult} />
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <SessionResultSectionsTab result={processedResult} />
        </TabsContent>

        {/* Questions & Answers Tab */}
        <TabsContent value="questions">
          <SessionResultQuestionsTab result={processedResult} />
        </TabsContent>
      </Tabs>
    </div>
  );
}