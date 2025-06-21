import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { BarChart, PieChart, Users, UserX, User, Layers, AlertCircle, ArrowRight } from 'lucide-react';
import { SessionResult, ViolationType } from '../../../../utils/QuestionTypeUtils';
import ViolationImagesDialog from '@/components/violationImagesDialog';

interface SessionResultOverviewTabProps {
  result: SessionResult;
}

const SessionResultOverviewTab: React.FC<SessionResultOverviewTabProps> = ({ result }) => {
  console.log("SessionResultOverviewTab", result);
  
  // State to control the violations dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedViolationType, setSelectedViolationType] = useState<ViolationType | null>(null);
  const [violationTitle, setViolationTitle] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const timeDifference = () => {
    const start = new Date(result.startTime);
    const end = new Date(result.endTime);
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000); // in seconds
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Handle opening the violations dialog
  const handleOpenViolations = (type: ViolationType, title: string) => {
    setSelectedViolationType(type);
    setViolationTitle(title);
    setIsDialogOpen(true);
  };

  // State for calculated values
  const [totalQuestions, setTotalQuestions] = useState(result.adjustedTotalQuestions || result.totalQuestions);
  const [correctAnswers, setCorrectAnswers] = useState(result.adjustedCorrectAnswers || result.correctAnswers);
  const [overallPercentage, setOverallPercentage] = useState(result.percentage !== undefined ? result.percentage : 0);
  const [hasPassages, setHasPassages] = useState(result.libraryResults.some(lib => lib.hasPassage));
  const [hasSubjective, setHasSubjective] = useState(result.libraryResults.some(lib => 
    lib.questions.some(q => q.type === 'subjective')
  ));
  const [subjectiveQuestionsAnalyzed, setSubjectiveQuestionsAnalyzed] = useState(result.subjectiveQuestionsAnalyzed || 0);
  const [averageSubjectiveScore, setAverageSubjectiveScore] = useState(result.averageSubjectiveScore || 0);
  const [totalSubjectiveQuestions, setTotalSubjectiveQuestions] = useState(
    result.libraryResults.reduce(
      (count, lib) => count + lib.questions.filter(q => q.type === 'subjective').length, 
      0
    )
  );
  const [hasViolations, setHasViolations] = useState(result.violationCounts !== undefined);
  const [totalViolations, setTotalViolations] = useState(
    result.violationCounts !== undefined ? (
      (result.violationCounts?.multipleFaceDetectedCount || 0) +
      (result.violationCounts?.noFaceDetectedCount || 0) +
      (result.violationCounts?.differentPersonDetectedCount || 0) +
      (result.violationCounts?.tabSwitchCount || 0)
    ) : 0
  );

  // Update state if result changes
  React.useEffect(() => {
    setTotalQuestions(result.adjustedTotalQuestions || result.totalQuestions);
    setCorrectAnswers(result.adjustedCorrectAnswers || result.correctAnswers);
    setOverallPercentage(result.percentage !== undefined ? result.percentage : 0);
    setHasPassages(result.libraryResults.some(lib => lib.hasPassage));
    setHasSubjective(result.libraryResults.some(lib => 
      lib.questions.some(q => q.type === 'subjective')
    ));
    setSubjectiveQuestionsAnalyzed(result.subjectiveQuestionsAnalyzed || 0);
    setAverageSubjectiveScore(result.averageSubjectiveScore || 0);
    setTotalSubjectiveQuestions(
      result.libraryResults.reduce(
        (count, lib) => count + lib.questions.filter(q => q.type === 'subjective').length, 
        0
      )
    );
    setHasViolations(result.violationCounts !== undefined);
    setTotalViolations(
      result.violationCounts !== undefined ? (
        (result.violationCounts?.multipleFaceDetectedCount || 0) +
        (result.violationCounts?.noFaceDetectedCount || 0) +
        (result.violationCounts?.differentPersonDetectedCount || 0) +
        (result.violationCounts?.tabSwitchCount || 0)
      ) : 0
    );
  }, [result]);

  // Determine score color based on overall percentage
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  // Determine score background color based on overall percentage
  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };
  // Determine violation severity based on total count
  const getViolationSeverity = (total: number) => {
    if (total === 0) return { 
      text: 'No Violations', 
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200' 
    };
    if (total < 5) return { 
      text: 'Low Violations', 
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200' 
    };
    if (total < 15) return { 
      text: 'Moderate Violations', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200' 
    };
    return { 
      text: 'High Violations', 
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-200' 
    };
  };
  
  const violationSeverity = getViolationSeverity(totalViolations);

  return (
    <div className="space-y-8">
      {/* Violation Images Dialog */}
      <ViolationImagesDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        sessionToken={result.sessionToken}
        violationType={selectedViolationType}
        violationTitle={violationTitle}
      />
    
      {/* Primary Overview Card */}
      <Card className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Performance Summary
            </CardTitle>
            {result.adjustedPercentage !== undefined && 
             Math.abs(result.percentage - result.adjustedPercentage) > 1 && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1">
                AI-Adjusted Results
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className={`flex flex-col items-center p-6 rounded-xl border ${getScoreBgColor(result.adjustedPercentage || result.percentage)}`}>
              <div className={`text-5xl font-bold ${getScoreColor(result.adjustedPercentage || result.percentage)}`}>
                {result.adjustedPercentage||result.percentage.toFixed(1)}%
              </div>
              <div className="mt-2 text-gray-700 font-medium">Overall Score</div>
              {result.adjustedPercentage !== undefined && 
               Math.abs(result.percentage - result.adjustedPercentage) > 1 && (
                <Badge variant="outline" className="mt-3 bg-blue-50 text-blue-700 border-blue-200">
                  AI-Enhanced Evaluation
                </Badge>
              )}
            </div>
            
            {/* Time Card */}
            <div className="flex flex-col items-center p-6 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="text-5xl font-bold text-indigo-700">
                {timeDifference()}
              </div>
              <div className="mt-2 text-indigo-900 font-medium">Completion Time</div>
            </div>
            
            {/* Sections Card */}
            <div className="flex flex-col items-center p-6 bg-violet-50 rounded-xl border border-violet-200">
              <div className="text-5xl font-bold text-violet-700">
                {result.libraryResults.length}
              </div>
              <div className="mt-2 text-violet-900 font-medium">Sections Completed</div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Questions Performance */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center mb-3">
                <BarChart className="w-5 h-5 text-slate-700 mr-2" />
                <h3 className="font-semibold text-slate-800">Question Performance</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xl font-semibold text-slate-800">{result.adjustedCorrectAnswers} / {result.adjustedTotalQuestions}</span>
                  <span className="text-sm text-slate-600">Correct Answers</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-semibold text-slate-800">
                    {(
                      result.adjustedTotalQuestions && result.adjustedTotalQuestions > 0
                        ? ((result.adjustedCorrectAnswers ?? 0) / (result.adjustedTotalQuestions ?? 1)) * 100
                        : 0
                    ).toFixed(1)}%
                  </span>
                  <span className="text-sm text-slate-600">Accuracy Rate</span>
                </div>
              </div>
            </div>
            
            {/* Session Info */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center mb-3">
                <PieChart className="w-5 h-5 text-slate-700 mr-2" />
                <h3 className="font-semibold text-slate-800">Session Info</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-600">Start Time</span>
                  <span className="text-slate-800">{formatDate(result.startTime)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-600">End Time</span>
                  <span className="text-slate-800">{formatDate(result.endTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proctoring Violations Section - Only show if violations exist */}
          {hasViolations && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Proctoring Violations</h3>
                <Badge variant="outline" className={`${violationSeverity.color} border bg-opacity-10 border-opacity-50`}>
                  {violationSeverity.text}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Multiple Face Violations */}
                <div className="flex flex-col p-4 rounded-xl border bg-indigo-50 border-indigo-200">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-medium text-indigo-700">Multiple Faces</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-indigo-800">
                      {result.violationCounts?.multipleFaceDetectedCount || 0}
                    </span>
                    
                    {/* Only show link if there are violations */}
                    {(result.violationCounts?.multipleFaceDetectedCount || 0) > 0 && (
                      <button 
                        className="text-xs text-indigo-700 hover:text-indigo-900 flex items-center font-medium"
                        onClick={() => handleOpenViolations(ViolationType.MULTIPLE_FACE, "Multiple Faces")}
                      >
                        See violations <ArrowRight className="ml-1 h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* No Face Violations */}
                <div className="flex flex-col p-4 rounded-xl border bg-red-50 border-red-200">
                  <div className="flex items-center mb-2">
                    <UserX className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-700">No Face</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-800">
                      {result.violationCounts?.noFaceDetectedCount || 0}
                    </span>
                    
                    {/* Only show link if there are violations */}
                    {(result.violationCounts?.noFaceDetectedCount || 0) > 0 && (
                      <button 
                        className="text-xs text-red-700 hover:text-red-900 flex items-center font-medium"
                        onClick={() => handleOpenViolations(ViolationType.NO_FACE, "No Face")}
                      >
                        See violations <ArrowRight className="ml-1 h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Different Person Violations */}
                <div className="flex flex-col p-4 rounded-xl border bg-amber-50 border-amber-200">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="text-sm font-medium text-amber-700">Different Person</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-amber-800">
                      {result.violationCounts?.differentPersonDetectedCount || 0}
                    </span>
                    
                    {/* Only show link if there are violations */}
                    {(result.violationCounts?.differentPersonDetectedCount || 0) > 0 && (
                      <button 
                        className="text-xs text-amber-700 hover:text-amber-900 flex items-center font-medium"
                        onClick={() => handleOpenViolations(ViolationType.DIFFERENT_PERSON, "Different Person")}
                      >
                        See violations <ArrowRight className="ml-1 h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab Switch Violations */}
                <div className="flex flex-col p-4 rounded-xl border bg-purple-50 border-purple-200">
                  <div className="flex items-center mb-2">
                    <Layers className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-700">Tab Switches</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-800">
                    {result.violationCounts?.tabSwitchCount || 0}
                  </span>
                  {/* No images for tab switches */}
                </div>
              </div>
              
              {totalViolations > 10 && (
                <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center">
                  <AlertCircle className="w-5 h-5 text-rose-600 mr-2" />
                  <p className="text-sm text-rose-700">
                    High violation count detected. This may indicate potential issues with test integrity.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Analysis Summary - only show if there are subjective questions */}
          {hasSubjective && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">AI Analysis Summary</h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  AI-Powered Evaluation
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col p-5 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-700">
                    {totalSubjectiveQuestions}
                  </div>
                  <div className="mt-1 text-purple-800 font-medium">Total Subjective Questions</div>
                </div>
                <div className="flex flex-col p-5 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-700">
                    {subjectiveQuestionsAnalyzed}
                  </div>
                  <div className="mt-1 text-purple-800 font-medium">Questions Analyzed by AI</div>
                  {totalSubjectiveQuestions > subjectiveQuestionsAnalyzed && (
                    <Badge variant="outline" className="mt-3 self-start bg-yellow-50 text-yellow-700 border-yellow-200">
                      {totalSubjectiveQuestions - subjectiveQuestionsAnalyzed} Pending Analysis
                    </Badge>
                  )}
                </div>
                {subjectiveQuestionsAnalyzed > 0 && (
                  <div className="flex flex-col p-5 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-700">
                      {averageSubjectiveScore.toFixed(1)}%
                    </div>
                    <div className="mt-1 text-purple-800 font-medium">Average Subjective Score</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assessment details */}
          {(hasPassages || hasSubjective) && (
            <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-3">Assessment Methodology</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
                {hasPassages && (
                  <li>
                    This assessment contains reading passages that are not counted in the scoring
                  </li>
                )}
                {hasSubjective && (
                  <li>
                    Subjective answers are analyzed using AI to determine correctness
                  </li>
                )}
                {subjectiveQuestionsAnalyzed > 0 && (
                  <li>
                    AI has analyzed {subjectiveQuestionsAnalyzed} of {totalSubjectiveQuestions} subjective answers
                  </li>
                )}
                {result.adjustedPercentage !== undefined && 
                 Math.abs(result.percentage - result.adjustedPercentage) > 1 && (
                  <li>
                    The score has been adjusted to include AI-analyzed subjective answers and exclude passage questions
                  </li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Details */}
      <Card className="bg-white rounded-xl shadow-md border border-gray-100">
        <CardHeader className="bg-gray-50 border-b border-gray-200 pb-5">
          <CardTitle className="text-xl font-semibold text-gray-800">Session Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Session Token</p>
              <p className="font-medium text-gray-800 break-all">{result.sessionToken}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Candidate ID</p>
              <p className="font-medium text-gray-800">{result.candidateId || 'Not Provided'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Start Time</p>
              <p className="font-medium text-gray-800">{formatDate(result.startTime)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">End Time</p>
              <p className="font-medium text-gray-800">{formatDate(result.endTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionResultOverviewTab;