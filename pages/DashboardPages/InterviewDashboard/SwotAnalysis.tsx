import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface SwotAnalysisProps {
  resumeContent: string;
  candidateName: string;
  position: string;
}

interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  summary: string;
}

const SwotAnalysis: React.FC<SwotAnalysisProps> = ({ 
  resumeContent, 
  candidateName, 
  position 
}) => {
  const [swotData, setSwotData] = useState<SwotData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

  const generateSwotAnalysis = async (): Promise<void> => {
    if (!resumeContent) {
      setError("Resume content is required to generate SWOT analysis");
      toast.error("Resume content is required to generate SWOT analysis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<SwotData>(`${interviewServiceUrl}/api/candidates/swot-analysis`, {
        resumeContent,
        candidateName: candidateName || 'Candidate',
        position: position || 'Applied Position'
      });

      setSwotData(response.data);
      toast.success("SWOT analysis generated successfully");
    } catch (err) {
      console.error('Error generating SWOT analysis:', err);
      setError('Failed to generate SWOT analysis. Please try again.');
      toast.error('Failed to generate SWOT analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6 border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Candidate SWOT Analysis
          </CardTitle>
          {!swotData && !loading && (
            <Button 
              onClick={generateSwotAnalysis}
              className="bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white"
              disabled={loading || !resumeContent}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate SWOT Analysis'
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm text-gray-600">
              Analyzing candidate's resume and generating SWOT analysis...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-md flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {swotData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="font-medium text-green-800 mb-2 flex items-center">
                  <span className="inline-block w-2 h-6 bg-green-500 mr-2 rounded"></span>
                  Strengths
                </h3>
                <ul className="space-y-2 text-sm text-green-700">
                  {swotData.strengths.map((item, index) => (
                    <li key={`strength-${index}`} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="font-medium text-red-800 mb-2 flex items-center">
                  <span className="inline-block w-2 h-6 bg-red-500 mr-2 rounded"></span>
                  Weaknesses
                </h3>
                <ul className="space-y-2 text-sm text-red-700">
                  {swotData.weaknesses.map((item, index) => (
                    <li key={`weakness-${index}`} className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <span className="inline-block w-2 h-6 bg-blue-500 mr-2 rounded"></span>
                  Opportunities
                </h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  {swotData.opportunities.map((item, index) => (
                    <li key={`opportunity-${index}`} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h3 className="font-medium text-orange-800 mb-2 flex items-center">
                  <span className="inline-block w-2 h-6 bg-orange-500 mr-2 rounded"></span>
                  Threats
                </h3>
                <ul className="space-y-2 text-sm text-orange-700">
                  {swotData.threats.map((item, index) => (
                    <li key={`threat-${index}`} className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={generateSwotAnalysis}
                variant="outline"
                className="text-indigo-700 border-indigo-300 hover:bg-indigo-50"
                disabled={loading}
              >
                Regenerate Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SwotAnalysis;