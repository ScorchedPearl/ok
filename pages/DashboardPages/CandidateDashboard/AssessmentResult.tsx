"use client"

import { useState } from 'react';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BackgroundGradient, CardHoverEffect, SparklesCore } from "@/components/ui/aceternity"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown, ChevronUp, Info, ArrowLeft, Clock, CheckCircle2, Brain,
  Target, MessageSquare, Award, TrendingUp, LineChart, Users, Zap,
  BookOpen, Trophy, Download, Share2, FileText
} from "lucide-react"

interface TestDetail {
  task: string;
  answered: string;
  score: number;
}

interface Test {
  name: string;
  icon: any;
  timeTaken: string;
  totalTime: string;
  score: number;
  percentile: number;
  details: TestDetail[];
  strengths: string[];
  improvements: string[];
  completedDate: string;
}

interface Certification {
  name: string;
  icon: any;
  level: string;
  issueDate: string;
  expiryDate: string;
}

const tests: Test[] = [
  {
    name: "Problem Solving",
    icon: Brain,
    timeTaken: "00:25",
    totalTime: "13:30",
    score: 92,
    percentile: 95,
    completedDate: "2025-01-21",
    details: [
      { task: "Analytical Reasoning", answered: "15/15", score: 100 },
      { task: "Critical Thinking", answered: "12/15", score: 80 },
      { task: "Data Interpretation", answered: "14/15", score: 93 },
      { task: "Logical Deduction", answered: "13/15", score: 87 }
    ],
    strengths: ["Pattern Recognition", "Quantitative Analysis", "Strategic Planning"],
    improvements: ["Time Management", "Creative Solutions"]
  },
  {
    name: "Technical Skills",
    icon: LineChart,
    timeTaken: "00:35",
    totalTime: "15:00",
    score: 88,
    percentile: 85,
    completedDate: "2025-01-21",
    details: [
      { task: "Programming Concepts", answered: "18/20", score: 90 },
      { task: "Database Management", answered: "16/20", score: 80 },
      { task: "System Architecture", answered: "19/20", score: 95 }
    ],
    strengths: ["Code Quality", "Problem Resolution", "Technical Documentation"],
    improvements: ["Modern Frameworks", "Cloud Technologies"]
  },
  {
    name: "Communication",
    icon: MessageSquare,
    timeTaken: "00:40",
    totalTime: "12:00",
    score: 85,
    percentile: 82,
    completedDate: "2025-01-21",
    details: [
      { task: "Written Communication", answered: "9/10", score: 90 },
      { task: "Verbal Reasoning", answered: "8/10", score: 80 },
      { task: "Business Communication", answered: "9/10", score: 90 }
    ],
    strengths: ["Clear Expression", "Professional Writing", "Active Listening"],
    improvements: ["Public Speaking", "Technical Documentation"]
  }
];

const certifications: Certification[] = [
  {
    name: "Advanced Problem Solver",
    icon: Trophy,
    level: "Expert",
    issueDate: "2025-01-21",
    expiryDate: "2026-01-21"
  },
  {
    name: "Technical Excellence",
    icon: Award,
    level: "Advanced",
    issueDate: "2025-01-21",
    expiryDate: "2026-01-21"
  },
  {
    name: "Communication Master",
    icon: MessageSquare,
    level: "Professional",
    issueDate: "2025-01-21",
    expiryDate: "2026-01-21"
  }
];

export default function AssessmentPage() {
    const [expandedTest, setExpandedTest] = useState<string | null>("Problem Solving");
  const [activeTab, setActiveTab] = useState("overview");
  const [progress] = useState(88);

  const calculateOverallPercentile = () => {
    return Math.round(tests.reduce((acc, test) => acc + test.percentile, 0) / tests.length);
  };

  const renderTestCard = (test: Test) => (
    <motion.div key={test.name} initial={false} className="p-6 hover:bg-gray-50/80 transition-colors">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpandedTest(expandedTest === test.name ? null : test.name)}
      >
        <div className="flex items-center gap-4">
          <test.icon className="w-5 h-5 text-[#2E2883]" />
          <div>
            <span className="font-medium text-gray-900">{test.name}</span>
            <div className="text-sm text-gray-500 mt-1">
              Score: {test.score}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-sm text-gray-600 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {test.timeTaken} / {test.totalTime}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <BackgroundGradient className="px-4 py-2 rounded-full">
                  <div className="inline-flex items-center text-[#2E2883]">
                    <span className="font-bold text-lg">{test.percentile}</span>
                    <sup className="text-xs">th</sup>
                    <span className="ml-1 font-medium">percentile</span>
                  </div>
                </BackgroundGradient>
              </TooltipTrigger>
              <TooltipContent>
                <p>Top {100 - test.percentile}% of test takers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {expandedTest === test.name ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expandedTest === test.name && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pl-9 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 border-none p-4">
                  <h4 className="font-medium text-green-800 mb-2">Key Strengths</h4>
                  <ul className="space-y-2">
                    {test.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-center text-green-700">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="bg-blue-50 border-none p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Areas for Growth</h4>
                  <ul className="space-y-2">
                    {test.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-center text-blue-700">
                        <Zap className="w-4 h-4 mr-2" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
              <div className="space-y-3">
                {test.details.map((detail, index) => (
                  <Card key={index} className="bg-white border shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">{detail.task}</span>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-[#2E2883]/10 text-[#2E2883]">
                          {detail.answered}
                        </Badge>
                        <Progress value={detail.score} className="w-24 h-2" />
                        <span className="text-sm text-gray-600">{detail.score}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E2883]/5 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
            <a href='/candidate/home'>
            <Button variant="ghost" className="text-[#2E2883] ">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            </a>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-[#2E2883]">
              {/* <Download className="mr-2 h-4 w-4" /> */}
              Download Report
            </Button>
            <Button variant="outline" className="">
              {/* <Share2 className="mr-2 h-4 w-4" /> */}
              Share Results
            </Button>
          </div>
        </div>

        <Card className="p-6 bg-white/50 backdrop-blur-sm border-none shadow-lg mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-[#2E2883]">Assessment Results</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              </div>
              <div className="mt-2 text-gray-600 flex items-center gap-6">
                <span className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Senior Software Engineer
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  TechCorp Inc.
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  January 21, 2025
                </span>
              </div>
            </div>
            <CardHoverEffect className="w-32 h-32">
              <div className="relative w-full h-full">
                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={100}
                  className="w-full h-full"
                  particleColor="#2E2883"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#2E2883]">{calculateOverallPercentile()}%</div>
                    <div className="text-sm text-gray-600">Overall</div>
                  </div>
                </div>
              </div>
            </CardHoverEffect>
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-200 mb-8">
          <CardContent className="flex items-start gap-3 p-4">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <p className="text-sm text-blue-900">
              Your assessment results are valid for 12 months. They can be shared with potential employers
              through your profile or downloadable report.
            </p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Test Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-green-50 p-4 border-none">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-green-600" />
                      <div>
                        <div className="text-lg font-semibold text-green-800">
                          Top {100 - calculateOverallPercentile()}%
                        </div>
                        <div className="text-sm text-green-600">Overall Ranking</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-blue-50 p-4 border-none">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <div className="text-lg font-semibold text-blue-800">{tests.length}/3</div>
                        <div className="text-sm text-blue-600">Tests Completed</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-purple-50 p-4 border-none">
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8 text-purple-600" /><div>
                        <div className="text-lg font-semibold text-purple-800">Expert</div>
                        <div className="text-sm text-purple-600">Skill Level</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg text-[#2E2883] font-semibold mb-4">Performance Summary</h3>
                <div className="space-y-4">
                  {tests.map(test => (
                    <div key={test.name} className="flex items-center gap-4">
                      <test.icon className="w-5 h-5 text-[#2E2883]" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-black">{test.name}</span>
                          <span className="text-gray-600">{test.score}%</span>
                        </div>
                        <Progress value={test.score} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-[#2E2883]">Key Recommendations</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-[#2E2883] mt-1" />
                    <div>
                      <h4 className="font-medium mb-1 text-[#2E2883]">Skill Development</h4>
                      <p className="text-gray-600">Focus on improving technical documentation skills and modern framework knowledge through practical projects and online courses.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-[#2E2883] mt-1" />
                    <div>
                      <h4 className="font-medium mb-1 text-[#2E2883]">Practice Areas</h4>
                      <p className="text-gray-600">Dedicate time to strengthening public speaking abilities and creative problem-solving techniques.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-lg">
              <CardContent className="p-0">
                <div className="p-6 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#2E2883]" />
                    <h2 className="text-xl font-semibold text-[#2E2883]">Detailed Results</h2>
                  </div>
                  <Button variant="link" className="text-[#E535AB] hover:text-[#E535AB]/80">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Scoring Guide
                  </Button>
                </div>
                <div className="divide-y">
                  {tests.map(test => renderTestCard(test))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
        </Tabs>
      </main>
    </div>
  );
}