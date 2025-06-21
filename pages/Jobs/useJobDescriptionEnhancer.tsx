import { useState, useCallback } from 'react';

// Get the API URL from environment variables
const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

interface JobDetails {
  title: string;
  description: string;
  department?: string;
  location?: string;
  employmentType?: string;
}

interface EnhancementResult {
  enhancedDescription: string;
  overallScore: number;
  improvements: string[];
  strengths: string[];
  missingElements: string[];
  summary: string;
}

interface JobDescriptionEnhancerHook {
  enhanceDescription: (jobDetails: JobDetails) => Promise<EnhancementResult>;
  isEnhancing: boolean;
  enhancementResult: EnhancementResult | null;
  error: Error | null;
  reset: () => void;
}

/**
 * A hook for enhancing job descriptions using the JobDescriptionService API
 * 
 * @returns {JobDescriptionEnhancerHook} - Methods and state for job description enhancement
 */
const useJobDescriptionEnhancer = (): JobDescriptionEnhancerHook => {
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Enhance a job description using the JobDescriptionService
   * 
   * @param {JobDetails} jobDetails - The job details to enhance
   * @returns {Promise<EnhancementResult>} - The enhancement results
   */
  const enhanceDescription = useCallback(async (jobDetails: JobDetails): Promise<EnhancementResult> => {
    const { title, description, department, location, employmentType } = jobDetails;
    
    if (!title || !description) {
      const err = new Error('Job title and description are required');
      setError(err);
      return Promise.reject(err);
    }

    setIsEnhancing(true);
    setError(null);
    
    try {
      const response = await fetch(`${interviewServiceUrl}/api/jobs/enhance-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          department,
          location,
          employmentType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error enhancing job description: ${response.statusText}`);
      }

      const data = await response.json() as EnhancementResult;
      setEnhancementResult(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsEnhancing(false);
    }
  }, []);

  /**
   * Reset the enhancement state
   */
  const reset = useCallback((): void => {
    setEnhancementResult(null);
    setError(null);
    setIsEnhancing(false);
  }, []);

  return {
    enhanceDescription,
    isEnhancing,
    enhancementResult,
    error,
    reset
  };
};

export default useJobDescriptionEnhancer;