export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  libraryId?: string
}

export interface Test {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  questions: number;
  category: string;
  tags: Tag[];
  previewContent: {
    overview: string;
    sampleQuestions: string[];
    skills: string[];
  };
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  savedBy: string[];
}



export interface QuestionLibrary {

  id: string;

  libraryName: string;

  description: string;

  questions: MCQQuestion[];

  tags: string[];

  timeRequired: number;

}




export interface FormData {

  testName: string;

  stream: string;

  questionType: string;

  location: string;

  creationType: string;

  selectedTests: Test[];

  savedTests: Test[];

  customQuestions: MCQQuestion[];

  questionLibraries: any[];

  testId: number;

  aiPrompt: string;

  maxLibraries: number;

  difficultyLevel: string;

  numQuestions: number;

  useAI: boolean;
  jobIDs: string[];
  numMCQs: number; 
  numSubjective: number;

}
