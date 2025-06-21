import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, Info, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRef } from 'react';
import { useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Get the API URL from environment variables
const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

interface JobDescriptionEnhancerProps {
  initialDescription?: string;
  title?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  onDescriptionChange?: (description: string) => void;
  token?: string | null;
}

interface EnhancementResponse {
  enhancedDescription: string;
  overallScore: number;
  improvements: string[];
  strengths: string[];
  missingElements: string[];
  summary: string;
}

const JobDescriptionEnhancer: React.FC<JobDescriptionEnhancerProps> = ({ 
  initialDescription = '', 
  title = '', 
  department = '', 
  location = '', 
  employmentType = '',
  onDescriptionChange,
  token
}) => {
  const [description, setDescription] = useState<string>(initialDescription);
  const [enhancementDetails, setEnhancementDetails] = useState<EnhancementResponse | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Simple prompt for generating job description from scratch
  const [generationPrompt, setGenerationPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showPromptInput, setShowPromptInput] = useState<boolean>(false);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      // Reset height temporarily to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to match the content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [description]);

  // Function to enhance the job description
  const enhanceDescription = async (): Promise<void> => {
    if (!description.trim()) {
      setError("Please enter a job description to enhance");
      return;
    }

    try {
      setIsEnhancing(true);
      setError(null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${interviewServiceUrl}/api/jobs/enhance-description`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          department,
          location,
          employmentType,
          description
        }),
      });

      if (!response.ok) {
        throw new Error(`Error enhancing job description: ${response.statusText}`);
      }

      const data = await response.json() as EnhancementResponse;
      
      // Update state with enhancement data
      setDescription(data.enhancedDescription);
      setEnhancementDetails(data);
      
      // Show success indicator briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Call parent's onChange handler if provided
      if (onDescriptionChange) {
        onDescriptionChange(data.enhancedDescription);
      }
      
    } catch (err) {
      console.error('Error enhancing job description:', err);
      setError(err instanceof Error ? err.message : 'Failed to enhance job description. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Function to generate a job description from scratch
  const generateJobDescription = async (): Promise<void> => {
    if (!generationPrompt.trim()) {
      setError("Please enter a brief description of the job");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${interviewServiceUrl}/api/jobs/enhance-description`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          department,
          location,
          employmentType,
          description: `Generate a professional job description for a ${title || 'position'} ${department ? `in the ${department} department` : ''} ${location ? `located in ${location}` : ''} ${employmentType ? `for ${employmentType} employment` : ''}. Additional details: ${generationPrompt}`
        }),
      });

      if (!response.ok) {
        throw new Error(`Error generating job description: ${response.statusText}`);
      }

      const data = await response.json() as EnhancementResponse;
      
      // Update description with the generated content
      setDescription(data.enhancedDescription);
      setEnhancementDetails(data);
      
      // Call parent's onChange handler if provided
      if (onDescriptionChange) {
        onDescriptionChange(data.enhancedDescription);
      }
      
      // Hide the prompt input
      setShowPromptInput(false);
      setGenerationPrompt("");
      
      // Show success indicator briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error generating job description:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate job description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to handle description changes
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    
    // Call parent's onChange handler if provided
    if (onDescriptionChange) {
      onDescriptionChange(newDescription);
    }
  };

  // Handle prompt input change
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setGenerationPrompt(e.target.value);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Job Description</h2>
        
        <div className="flex items-center gap-2">
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Updated successfully!</span>
            </motion.div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="description">Description</Label>
          <div className="flex gap-2">
            <Popover open={showPromptInput} onOpenChange={setShowPromptInput}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-indigo-600 border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Generate with AI
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Generate Job Description</h4>
                    <p className="text-xs text-gray-500">
                      Provide a brief summary of the job responsibilities and requirements.
                    </p>
                  </div>
                  <Textarea
                    id="description"
                    ref={textareaRef}
                    placeholder="Enter the job description or use AI to generate one..."
                    className="min-h-[200px] transition-all focus:ring-2 focus:ring-indigo-500"
                    value={description}
                    onChange={handleDescriptionChange}
                    />
                  <div className="flex justify-end">
                    <Button 
                      onClick={generateJobDescription} 
                      disabled={isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {description.trim().length > 20 && (
              <Button 
                onClick={enhanceDescription} 
                disabled={isEnhancing}
                variant="outline"
                size="sm"
                className="text-indigo-600 border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50"
              >
                {isEnhancing ? (
                  <>
                    <Clock className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  'Enhance Description'
                )}
              </Button>
            )}
          </div>
        </div>
        
        <Textarea
          id="description"
          placeholder="Enter the job description or use AI to generate one..."
          className="min-h-[200px] transition-all focus:ring-2 focus:ring-indigo-500"
          value={description}
          onChange={handleDescriptionChange}
        />
      </div>
    </motion.div>
  );
};

export default JobDescriptionEnhancer;