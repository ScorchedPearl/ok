export const jobRoles = [
    { value: "developer", label: "Developer" },
    { value: "designer", label: "Designer" },
    { value: "manager", label: "Manager" },
    { value: "analyst", label: "Data Analyst" },
    { value: "marketer", label: "Digital Marketer" },
  ]
  
  export const questionType = [
    { value: "mcq", label: "MCQ" },
  ]
  
  export const locations = [
    { value: "in", label: "India" },
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "eu", label: "Europe" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
  ]
  
  export const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "zh", label: "Chinese" },
  ]
  
  export const testTypes = [
    { value: "technical", label: "Technical Skills" },
    { value: "soft", label: "Soft Skills" },
    { value: "language", label: "Language Proficiency" },
    { value: "personality", label: "Personality Assessment" },
  ]
  
  export const questions = [
    {
      id: 1,
      type: "multiple_choice",
      question: "What is the primary purpose of version control systems?",
      options: [
        "To track changes in code over time",
        "To compile code faster",
        "To automatically fix bugs",
        "To deploy applications",
      ],
    },
    {
      id: 2,
      type: "coding",
      question: "Write a function that reverses a string in JavaScript.",
      language: "javascript",
    },
    {
      id: 3,
      type: "true_false",
      question: "RESTful APIs typically use JSON for data exchange.",
    },
  ]

  // Utils/rawData.ts

// For example, your sample data coming from the backend might have properties "id" and "name".
export const sampleQuestionLibraries = [
  {
    id: "1",
    name: "CodeCraft", // Note: property is "name" here.
    questions: [
      {
        id: "16",
        question: "Sample question from CodeCraft",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 2,
        explanation: "",
        difficulty: "Hard",
        tags: [],
      },
      
    ],
  }
];
