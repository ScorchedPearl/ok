import type { Test, Tag } from "../Types/Test"

export const tags: Tag[] = [
  { id: "1", name: "Technical", color: "bg-blue-100 text-blue-800" },
  { id: "2", name: "Soft Skills", color: "bg-green-100 text-green-800" },
  { id: "3", name: "Leadership", color: "bg-purple-100 text-purple-800" },
  { id: "4", name: "Analytics", color: "bg-yellow-100 text-yellow-800" },
  { id: "5", name: "Core", color: "bg-red-100 text-red-800" },
]

export const availableTests: Test[] = [
  {
    id: "1",
    title: "Problem Solving",
    description:
      "A comprehensive assessment to evaluate analytical thinking, logical reasoning, and creative problem-solving abilities in various scenarios.",
    type: "Cognitive",
    duration: "45 minutes",
    questions: 25,
    category: "Essential Skills",
    tags: [tags[0], tags[3]],
    difficulty: "Intermediate",
    savedBy: [],
    previewContent: {
      overview:
        "This test evaluates your ability to analyze complex situations, identify patterns, and develop effective solutions.",
      sampleQuestions: [
        "How would you optimize a process that currently takes 2 hours to complete?",
        "Given a set of conflicting requirements, how would you prioritize them?",
      ],
      skills: ["Analytical Thinking", "Decision Making", "Critical Analysis"],
    },
  },
  {
    id: "2",
    title: "Time Management",
    description: "Evaluate organizational and planning skills",
    type: "Behavioral",
    duration: "30 minutes",
    questions: 20,
    category: "Essential Skills",
    tags: [tags[1]],
    difficulty: "Advanced",
    savedBy: [],
    previewContent: {
      overview: "This test assesses your ability to manage your time effectively.",
      sampleQuestions: [
        "How do you prioritize tasks when you have multiple deadlines?",
        "How do you plan your day to ensure you complete all your tasks?",
      ],
      skills: ["Prioritization", "Planning", "Organization"],
    },
  },
  {
    id: "3",
    title: "Big 5 (OCEAN)",
    description: "Personality assessment based on five key dimensions",
    type: "Personality",
    duration: "25 minutes",
    questions: 50,
    category: "Personality",
    tags: [tags[4]],
    difficulty: "Advanced",
    savedBy: [],
    previewContent: {
      overview: "This test identifies your personality traits based on the Big Five personality dimensions.",
      sampleQuestions: [
        "How would you describe your typical behavior in social situations?",
        "How do you typically respond to stress or challenging situations?",
      ],
      skills: ["Self-Awareness", "Personality Insights"],
    },
  },
  {
    id: "4",
    title: "Communication",
    description: "Assess verbal and written communication skills",
    type: "Language",
    duration: "40 minutes",
    questions: 30,
    category: "Essential Skills",
    tags: [tags[1]],
    difficulty: "Intermediate",
    savedBy: [],
    previewContent: {
      overview: "This test evaluates your ability to communicate effectively in both written and verbal formats.",
      sampleQuestions: [
        "How would you explain a complex technical concept to a non-technical audience?",
        "How would you write a persuasive email to a potential client?",
      ],
      skills: ["Written Communication", "Verbal Communication", "Active Listening"],
    },
  },
  {
    id: "5",
    title: "Motivation",
    description: "Evaluate drive and work preferences",
    type: "Behavioral",
    duration: "20 minutes",
    questions: 15,
    category: "Personality",
    tags: [tags[4]],
    difficulty: "Advanced",
    savedBy: [],
    previewContent: {
      overview: "This test assesses your level of motivation and your preferred work styles.",
      sampleQuestions: ["What motivates you to achieve your goals?", "What type of work environment do you prefer?"],
      skills: ["Goal Setting", "Work Ethic", "Self-Motivation"],
    },
  },
]

export const categories = ["All", "Essential Skills", "Personality", "Cognitive", "Behavioral", "Language"]

