export interface Candidate {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  resumeFileUrl?: string;
  resumeContent?: string;
  resumeSummary?: string;
}

export interface Question {
  id: string;
  text: string;
  jobId: string;
}

export interface CallScheduleRequest {
  candidateId: number | undefined;
  questions: Array<{id: string, text: string}>;
  date: Date;
  time: string;
  jobId: string | undefined;
}

export interface Job {
  id: number;
  title: string;
  department: string;
  description: string;
}