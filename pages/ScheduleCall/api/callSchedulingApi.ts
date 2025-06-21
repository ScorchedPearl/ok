import { Candidate, Question, CallScheduleRequest } from "../types/ScheduleCallTypes";

// These functions are placeholders and would be replaced with actual API calls

export async function fetchCandidatesForJob(jobId: string | undefined): Promise<Candidate[]> {
  // Placeholder - in a real implementation, this would call your backend API
  console.log(`Fetching candidates for job: ${jobId}`);
  
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return [
    { id: 1, fullName: "Jane Smith", email: "jane.smith@example.com", phoneNumber: "+1234567890", resumeFileUrl: "https://example.com/resume/jane" },
    { id: 2, fullName: "John Doe", email: "john.doe@example.com", phoneNumber: "+9876543210" },
    { id: 3, fullName: "Emily Johnson", email: "emily.j@example.com", resumeFileUrl: "https://example.com/resume/emily" }
  ];
}

export async function addNewCandidate(candidateData: Partial<Candidate>): Promise<Candidate> {
  // Placeholder - in a real implementation, this would call your backend API
  console.log('Adding new candidate:', candidateData);
  
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock response
  return {
    id: Math.floor(Math.random() * 10000) + 100,
    fullName: candidateData.fullName || "",
    email: candidateData.email || "",
    phoneNumber: candidateData.phoneNumber,
  };
}

export async function fetchQuestionsForJob(jobId: string | undefined): Promise<Question[]> {
  // Placeholder - in a real implementation, this would call your backend API
  console.log(`Fetching questions for job: ${jobId}`);
  
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return [
    { id: "q1", text: "Tell me about your experience with React?", jobId: jobId || "1" },
    { id: "q2", text: "How do you handle state management in large applications?", jobId: jobId || "1" },
    { id: "q3", text: "What testing frameworks have you worked with?", jobId: jobId || "1" },
    { id: "q4", text: "Describe your approach to responsive design", jobId: jobId || "1" },
    { id: "q5", text: "How do you stay updated with the latest technologies?", jobId: jobId || "1" }
  ];
}

export async function addQuestionToJob(questionData: { text: string, jobId: string | undefined }): Promise<Question> {
  // Placeholder - in a real implementation, this would call your backend API
  console.log('Adding new question:', questionData);
  
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock response
  return {
    id: `q${Math.floor(Math.random() * 10000)}`,
    text: questionData.text,
    jobId: questionData.jobId || "1"
  };
}

export async function deleteQuestion(questionId: string): Promise<void> {
  // Placeholder - in a real implementation, this would call your backend API
  console.log(`Deleting question with ID: ${questionId}`);
  
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // No return value needed for a delete operation
}

export async function scheduleCall(callData: CallScheduleRequest): Promise<{ id: string, scheduledTime: string }> {
  // Placeholder - in a real implementation, this would call your backend API
  console.log('Scheduling call with data:', callData);
  
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock response
  return {
    id: `call-${Math.floor(Math.random() * 10000)}`,
    scheduledTime: `${callData.date.toISOString().split('T')[0]} ${callData.time}`
  };
}