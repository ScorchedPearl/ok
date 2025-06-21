import { addDays, addHours, subDays, subHours, addMinutes } from "date-fns";

// Get current date as base for relative dates
const now = new Date();

export interface Question {
  questionId: string;
  questionText: string;
}

export interface ScheduledCall {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobTitle: string;
  jobId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  questions: Question[];
  createdBy: string;
  tenantId: string;
  notes?: string;
  jobDescription?: string;
  callUrl?: string;
}

// Common questions for reuse
const commonQuestions: Question[] = [
  {
    questionId: "q1",
    questionText: "What is your experience with React.js?",
  },
  {
    questionId: "q2",
    questionText: "Can you describe a challenging project you worked on recently?",
  },
  {
    questionId: "q3",
    questionText: "How do you approach debugging a complex issue?",
  },
  {
    questionId: "q4",
    questionText: "What are your strengths and weaknesses as a developer?",
  },
  {
    questionId: "q5",
    questionText: "Where do you see yourself in 5 years?",
  },
];

// Create mock data
export const mockScheduledCalls: ScheduledCall[] = [
  {
    id: "call-1",
    candidateName: "Alex Johnson",
    candidateEmail: "alex.johnson@example.com",
    candidatePhone: "+1 (555) 123-4567",
    jobTitle: "Senior Frontend Developer",
    jobId: "job-frontend-123",
    scheduledAt: addDays(now, 2).toISOString(),
    durationMinutes: 45,
    status: "SCHEDULED",
    questions: commonQuestions.slice(0, 3),
    createdBy: "Sarah Manager",
    tenantId: "tenant-1",
    notes: "Alex has 5 years of experience with React and Next.js. Currently working at Tech Solutions Inc.",
    jobDescription: "We're looking for a senior frontend developer with expertise in React, TypeScript, and modern frontend frameworks.",
    callUrl: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "call-2",
    candidateName: "Maria Garcia",
    candidateEmail: "maria.garcia@example.com",
    candidatePhone: "+1 (555) 987-6543",
    jobTitle: "Full Stack Developer",
    jobId: "job-fullstack-456",
    scheduledAt: addHours(now, 4).toISOString(),
    durationMinutes: 60,
    status: "PENDING",
    questions: commonQuestions.slice(1, 4),
    createdBy: "John Recruiter",
    tenantId: "tenant-1",
    notes: "Maria recently completed a bootcamp and has 1 year of professional experience.",
  },
  {
    id: "call-3",
    candidateName: "James Wilson",
    candidateEmail: "james.wilson@example.com",
    candidatePhone: "+1 (555) 333-2222",
    jobTitle: "Senior Backend Developer",
    jobId: "job-backend-789",
    scheduledAt: subDays(now, 3).toISOString(),
    durationMinutes: 30,
    status: "COMPLETED",
    questions: commonQuestions.slice(0, 4),
    createdBy: "Sarah Manager",
    tenantId: "tenant-1",
    notes: "James has strong experience with Java and Spring Boot. Worked at Enterprise Tech for 7 years.",
    callUrl: "https://meet.google.com/jkl-mnop-qrs",
  },
  {
    id: "call-4",
    candidateName: "Emily Chen",
    candidateEmail: "emily.chen@example.com",
    candidatePhone: "+1 (555) 444-5555",
    jobTitle: "UX/UI Designer",
    jobId: "job-design-101",
    scheduledAt: addDays(now, 1).toISOString(),
    durationMinutes: 45,
    status: "SCHEDULED",
    questions: [
      {
        questionId: "q6",
        questionText: "Can you walk me through your design process?",
      },
      {
        questionId: "q7",
        questionText: "What design tools are you most comfortable with?",
      },
      {
        questionId: "q8",
        questionText: "How do you incorporate user feedback into your designs?",
      },
    ],
    createdBy: "John Recruiter",
    tenantId: "tenant-1",
    jobDescription: "Looking for a skilled UX/UI designer with experience in creating intuitive and engaging user interfaces.",
    callUrl: "https://meet.google.com/tuv-wxyz-123",
  },
  {
    id: "call-5",
    candidateName: "Michael Brown",
    candidateEmail: "michael.brown@example.com",
    candidatePhone: "+1 (555) 777-8888",
    jobTitle: "DevOps Engineer",
    jobId: "job-devops-202",
    scheduledAt: subHours(now, 48).toISOString(),
    durationMinutes: 60,
    status: "CANCELLED",
    questions: commonQuestions.slice(1, 3),
    createdBy: "Sarah Manager",
    tenantId: "tenant-1",
    notes: "Candidate requested to reschedule due to personal emergency.",
  },
  {
    id: "call-6",
    candidateName: "Sophia Rodriguez",
    candidateEmail: "sophia.rodriguez@example.com",
    candidatePhone: "+1 (555) 111-9999",
    jobTitle: "Product Manager",
    jobId: "job-pm-303",
    scheduledAt: addDays(addHours(now, 2), 3).toISOString(),
    durationMinutes: 45,
    status: "SCHEDULED",
    questions: [
      {
        questionId: "q9",
        questionText: "How do you prioritize features in a product roadmap?",
      },
      {
        questionId: "q10",
        questionText: "Can you describe how you collaborate with engineering teams?",
      },
      {
        questionId: "q11",
        questionText: "How do you measure the success of a product?",
      },
    ],
    createdBy: "John Recruiter",
    tenantId: "tenant-1",
    jobDescription: "We're seeking an experienced product manager to lead our product development efforts and work closely with engineering and design teams.",
    callUrl: "https://meet.google.com/456-789-abc",
  },
  {
    id: "call-7",
    candidateName: "Daniel Kim",
    candidateEmail: "daniel.kim@example.com",
    candidatePhone: "+1 (555) 222-3333",
    jobTitle: "Data Scientist",
    jobId: "job-data-404",
    scheduledAt: addMinutes(now, 30).toISOString(),
    durationMinutes: 60,
    status: "PENDING",
    questions: [
      {
        questionId: "q12",
        questionText: "What machine learning models have you worked with?",
      },
      {
        questionId: "q13",
        questionText: "How do you approach data cleaning and preprocessing?",
      },
      {
        questionId: "q14",
        questionText: "Can you describe a data project that had significant business impact?",
      },
    ],
    createdBy: "Sarah Manager",
    tenantId: "tenant-1",
    jobDescription: "Looking for a data scientist with strong statistics background and experience with ML models and data visualization.",
  },
  {
    id: "call-8",
    candidateName: "Olivia Taylor",
    candidateEmail: "olivia.taylor@example.com",
    candidatePhone: "+1 (555) 666-7777",
    jobTitle: "QA Engineer",
    jobId: "job-qa-505",
    scheduledAt: subDays(now, 1).toISOString(),
    durationMinutes: 30,
    status: "COMPLETED",
    questions: [
      {
        questionId: "q15",
        questionText: "What testing methodologies are you familiar with?",
      },
      {
        questionId: "q16",
        questionText: "How do you approach test automation?",
      },
      {
        questionId: "q17",
        questionText: "How do you prioritize test cases?",
      },
    ],
    createdBy: "John Recruiter",
    tenantId: "tenant-1",
    notes: "Olivia has experience with Selenium and Cypress. Previously worked at Quality Tech Inc.",
    callUrl: "https://meet.google.com/def-ghi-jkl",
  },
];

// Function to get call by ID
export const getCallById = (id: string): ScheduledCall | undefined => {
  return mockScheduledCalls.find(call => call.id === id);
};

// Function to get calls by job ID
export const getCallsByJobId = (jobId: string): ScheduledCall[] => {
  return mockScheduledCalls.filter(call => call.jobId === jobId);
};