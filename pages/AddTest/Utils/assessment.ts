export interface FormData {
    language: string
    jobRole: string
    workArrangement: string
    location: string
    creationType: string
    selectedTests: string[]
    customQuestions: CustomQuestion[]
  }
  
  export interface CustomQuestion {
    type: "multiple_choice" | "true_false" | "open_ended"
    question: string
    options: string[]
  }
  
  export interface StepProps {
    formData: FormData
    onFormDataChange: (newData: Partial<FormData>) => void
    errors: Record<string, string>
  }
  
  export type ValidationFunction = (formData: FormData) => Record<string, string>
  
  