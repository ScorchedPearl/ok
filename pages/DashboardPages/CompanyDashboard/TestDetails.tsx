// Updated TestDetails.tsx with Sessions tab and reporting features
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";
import { saveAs } from 'file-saver'; 

import { 
  Info, 
  Clock, 
  Calendar, 
  User, 
  FileCode, 
  List, 
  Tag, 
  Check, 
  FileQuestion, 
  Briefcase, 
  Star,
  ArrowLeft,
  Eye, 
  X, 
  Plus, 
  Minus,
  FileDown,
  Search,
  Users,
  BarChart,
  Filter,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE;

// Original interfaces
interface Question {
  id: string;
  title: string;
  type: "MULTIPLE_CHOICE" | "CODING" | "ESSAY" | string;
  score: number;
}

interface Test {
  id: number;
  tenantId: string;
  testName: string;
  stream: string;
  category: string;
  testType: string;
  testStatus: string;
  timeLimit: number;
  questionLibraryIds: string[];
  jobIDs: string[];
  createdAt: string;
  updatedAt: string;
  totalScore?: number;
  difficultyLevel?: string;
  createdBy?: string;
  questions?: Question[];
}

interface AuthContextType {
  token: {
    access_token: string;
  } | null;
  user: any;
}

interface MCQQuestion {
  questionId: number;
  questionText: string;
  options: Record<string, string>;
  correctOption: string;
  difficultyLevel: "Easy" | "Medium" | "Hard";
  status: string;
  createdAt: string;
  createdBy: number;
  tenantUserId: number;
  questionType: string;
  explanation?: string;
  tags?: string[];
  libraryId?: string;
}

interface QuestionLibrary {
  id: string;
  libraryName: string;
  description: string;
  questions: MCQQuestion[];
}

interface JobInfo {
  id: string;
  title: string;
}

// New interfaces for sessions and reporting
interface TestSession {
  id: string;
  candidateId: string;
  candidateName: string;
  email?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED' | 'EXPIRED';
  startTime: string;
  endTime?: string;
  score?: number;
  percentage?: number;
  duration?: number;
  violationCounts?: {
    multipleFaceDetectedCount: number;
    noFaceDetectedCount: number;
    differentPersonDetectedCount: number;
    tabSwitchCount: number;
  };
  subjectiveQuestionsAnalyzed?: number;
  averageSubjectiveScore?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  libraryResults?: {
    libraryId: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    hasPassage?: boolean;
    questions?: any[];
  }[];
}

interface SessionFilterState {
  status: string;
  dateRange: string;
  searchTerm: string;
}

interface ComparisonMetric {
  id: string;
  label: string;
  value: (session: TestSession) => number | string;
  format: (value: number | string) => string;
  color: (value: number | string) => string;
}

// Status Badge Component
interface StatusBadgeProps {
  status: Test['testStatus'] | TestSession['status'];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = (): string => {
    switch (status) {
      case "ACTIVE":
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-300";
      case "DRAFT":
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "ABANDONED":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "DELETED":
      case "EXPIRED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`px-2 py-1 font-semibold text-xs rounded ${getStatusStyles()}`}
    >
      {status}
    </Badge>
  );
}

// Difficulty Badge Component
interface DifficultyBadgeProps {
  level: string;
}

function DifficultyBadge({ level }: DifficultyBadgeProps) {
  const getDifficultyStyles = (): string => {
    switch (level) {
      case "BEGINNER":
      case "Easy":
        return "bg-green-100 text-green-800 border-green-300";
      case "INTERMEDIATE":
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "ADVANCED":
      case "Hard":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "EXPERT":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`px-2 py-1 font-semibold text-xs rounded ${getDifficultyStyles()}`}
    >
      {level}
    </Badge>
  );
}

// Score Badge Component
function ScoreBadge({ score }: { score: number }) {
  const getScoreStyles = (): string => {
    if (score >= 85) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 70) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 50) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  return (
    <Badge 
      variant="outline" 
      className={`px-2 py-1 font-semibold text-xs rounded ${getScoreStyles()}`}
    >
      {score.toFixed(1)}%
    </Badge>
  );
}

// Question Card Component
interface QuestionCardProps {
  question: Question;
  index: number;
}

function QuestionCard({ question, index }: QuestionCardProps) {
  const getQuestionTypeStyles = (): string => {
    switch (question.type) {
      case "MULTIPLE_CHOICE":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "CODING":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "ESSAY":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="border border-gray-200 hover:border-[#4338ca] bg-gradient-to-br from-white to-[#4338ca]/5 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#1e1b4b]">
              Question {index + 1}: {question.title}
            </CardTitle>
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2 py-1 rounded ${getQuestionTypeStyles()}`}
            >
              {question.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">{question.score} points</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Session report configuration component
function ReportConfigDialog({ 
  isOpen,
  onClose,
  selectedSessions,
  onGenerateReport
}: { 
  isOpen: boolean;
  onClose: () => void;
  selectedSessions: TestSession[];
  onGenerateReport: (config: any) => void;
}) {
  const [reportConfig, setReportConfig] = useState({
    includeDetails: true,
    includeViolations: true,
    includeSubjectiveAnalysis: true,
    includeSectionBreakdown: true,
    includeComparison: true,
    format: 'PDF'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Candidate Report</DialogTitle>
          <DialogDescription>
            Configure the report for {selectedSessions.length} selected candidate{selectedSessions.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-details" 
                checked={reportConfig.includeDetails}
                onCheckedChange={(checked) => 
                  setReportConfig({...reportConfig, includeDetails: !!checked})
                }
              />
              <label htmlFor="include-details" className="text-sm font-medium">
                Include detailed candidate information
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-violations" 
                checked={reportConfig.includeViolations}
                onCheckedChange={(checked) => 
                  setReportConfig({...reportConfig, includeViolations: !!checked})
                }
              />
              <label htmlFor="include-violations" className="text-sm font-medium">
                Include violation details
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-subjective" 
                checked={reportConfig.includeSubjectiveAnalysis}
                onCheckedChange={(checked) => 
                  setReportConfig({...reportConfig, includeSubjectiveAnalysis: !!checked})
                }
              />
              <label htmlFor="include-subjective" className="text-sm font-medium">
                Include AI analysis of subjective answers
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-sections" 
                checked={reportConfig.includeSectionBreakdown}
                onCheckedChange={(checked) => 
                  setReportConfig({...reportConfig, includeSectionBreakdown: !!checked})
                }
              />
              <label htmlFor="include-sections" className="text-sm font-medium">
                Include section-by-section breakdown
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-comparison" 
                checked={reportConfig.includeComparison}
                onCheckedChange={(checked) => 
                  setReportConfig({...reportConfig, includeComparison: !!checked})
                }
              />
              <label htmlFor="include-comparison" className="text-sm font-medium">
                Include comparative analysis (for multiple candidates)
              </label>
            </div>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="format" className="text-sm font-medium">
              Format
            </label>
            <Select 
              value={reportConfig.format} 
              onValueChange={(value) => setReportConfig({...reportConfig, format: value})}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF Document</SelectItem>
                <SelectItem value="EXCEL">Excel Spreadsheet</SelectItem>
                <SelectItem value="CSV">CSV File</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-[#4338ca] hover:bg-[#1e1b4b]"
            onClick={() => onGenerateReport(reportConfig)}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Sessions Tab Component
function TestSessionsTab({ testId, testName }: { testId: number, testName: string }) {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SessionFilterState>({
    status: "ALL",
    dateRange: "ALL",
    searchTerm: ""
  });
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showComparisonDialog, setShowComparisonDialog] = useState<boolean>(false);
  const [showReportDialog, setShowReportDialog] = useState<boolean>(false);
  const [comparisonTab, setComparisonTab] = useState<string>("overview");
  
  const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8005";
  const { token } = useAuth() as AuthContextType;

  // Define metrics for comparison
  const comparisonMetrics: ComparisonMetric[] = [
    {
      id: 'score',
      label: 'Score',
      value: (session) => session.percentage || 0,
      format: (value) => `${typeof value === 'number' ? value.toFixed(1) : value}%`,
      color: (value) => {
        const numValue = typeof value === 'number' ? value : 0;
        if (numValue >= 85) return 'text-emerald-600';
        if (numValue >= 70) return 'text-blue-600';
        if (numValue >= 50) return 'text-amber-600';
        return 'text-red-600';
      }
    },
    {
      id: 'time',
      label: 'Time Spent',
      value: (session) => session.duration || 0,
      format: (value) => formatDuration(typeof value === 'number' ? value : 0),
      color: () => 'text-indigo-600'
    },
    {
      id: 'violations',
      label: 'Violations',
      value: (session) => {
        if (!session.violationCounts) return 0;
        return (
          session.violationCounts.multipleFaceDetectedCount +
          session.violationCounts.noFaceDetectedCount +
          session.violationCounts.differentPersonDetectedCount +
          session.violationCounts.tabSwitchCount
        );
      },
      format: (value) => `${value}`,
      color: (value) => {
        const numValue = typeof value === 'number' ? value : 0;
        if (numValue === 0) return 'text-green-600';
        if (numValue < 5) return 'text-amber-600';
        return 'text-red-600';
      }
    },
    {
      id: 'subjective',
      label: 'Subjective Score',
      value: (session) => session.averageSubjectiveScore || 0,
      format: (value) => `${typeof value === 'number' ? value.toFixed(1) : value}%`,
      color: (value) => {
        const numValue = typeof value === 'number' ? value : 0;
        if (numValue >= 85) return 'text-emerald-600';
        if (numValue >= 70) return 'text-blue-600';
        if (numValue >= 50) return 'text-amber-600';
        return 'text-red-600';
      }
    }
  ];

  useEffect(() => {
    const fetchTestSessions = async () => {
      setLoading(true);
      setError(null);

      if (!token?.access_token) {
        setError("Authentication token is missing");
        setLoading(false);
        return;
      }

      try {
        // Replace with actual API endpoint for test sessions
        const response = await fetch(`${testServiceUrl}/api/v1/test/sessions/test/${testId}/detailed`, {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch test sessions: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSessions(data);
        setFilteredSessions(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching test sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestSessions();
  }, [testId, testServiceUrl, token]);

  useEffect(() => {
    // Apply filters
    let filtered = [...sessions];
    
    // Apply status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(session => session.status === filters.status);
    }
    
    // Apply date filter
    if (filters.dateRange === 'TODAY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(session => new Date(session.startTime) >= today);
    } else if (filters.dateRange === 'THIS_WEEK') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      filtered = filtered.filter(session => new Date(session.startTime) >= weekStart);
    } else if (filters.dateRange === 'THIS_MONTH') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      filtered = filtered.filter(session => new Date(session.startTime) >= monthStart);
    }
    
    // Apply search term
    if (filters.searchTerm.trim() !== '') {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(session => 
        (session.candidateId && session.candidateId.toLowerCase().includes(term)) || 
        (session.candidateName && session.candidateName.toLowerCase().includes(term)) ||
        (session.email && session.email.toLowerCase().includes(term))
      );
    }
    
    setFilteredSessions(filtered);
  }, [sessions, filters]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId) 
        : [...prev, sessionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(filteredSessions.map(session => session.id));
    }
  };

  const viewSessionDetails = (sessionId: string) => {
    // Navigate to session details page
    window.location.href = `/dashboard/results/${sessionId}`;
  };


const generateReport = (config: any) => {
  // Show a loading toast
  const loadingToastId = toast.loading("Generating report...");
  
  try {
    // Get the selected session objects
    const selectedSessionObjects = sessions.filter(s => selectedSessions.includes(s.id));
    if (!selectedSessionObjects || selectedSessionObjects.length === 0) {
      throw new Error("No sessions selected");
    }
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.setTextColor(67, 56, 202); // #4338ca color
    doc.text(`Test Report: ${testName}`, 20, 20);
    
    // Add generated date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    // Add report configuration details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Report Details:", 20, 40);
    doc.setFontSize(10);
    doc.text(`Number of candidates: ${selectedSessionObjects.length}`, 25, 50);
    
    let yPos = 60;
    
    // Include candidate details if configured
    if (config.includeDetails) {
      doc.setFontSize(14);
      doc.setTextColor(30, 27, 75); // #1e1b4b color
      doc.text("Candidate Information", 20, yPos);
      yPos += 10;
      
      // Create table headers and data for candidates
      const headers = [["Name", "Email", "Status", "Score", "Duration"]];
      const data = selectedSessionObjects.map(session => [
        session.candidateName || session.candidateId || "Unknown",
        session.email || "N/A",
        session.status || "Unknown",
        session.percentage ? `${session.percentage.toFixed(1)}%` : "N/A",
        session.duration ? formatDuration(session.duration) : "N/A"
      ]);
      
      // Use the autoTable plugin correctly
      autoTable(doc, {
        startY: yPos,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255] },
        margin: { top: 20 },
      });
      
      // Update position after table
      yPos = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Include violations if configured
    if (config.includeViolations) {
      try {
        // Check if we need to add a new page for violations
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(30, 27, 75); // #1e1b4b color
        doc.text("Violation Details", 20, yPos);
        yPos += 10;
      
      // Create table for violations
      const violationsHeaders = [["Candidate", "Multiple Faces", "No Face", "Different Person", "Tab Switches", "Total"]];
      const violationsData = selectedSessionObjects.map(session => {
        const violations = session.violationCounts || {
          multipleFaceDetectedCount: 0,
          noFaceDetectedCount: 0,
          differentPersonDetectedCount: 0,
          tabSwitchCount: 0
        };
        
        const multipleFaceDetectedCount = violations.multipleFaceDetectedCount || 0;
        const noFaceDetectedCount = violations.noFaceDetectedCount || 0;
        const differentPersonDetectedCount = violations.differentPersonDetectedCount || 0;
        const tabSwitchCount = violations.tabSwitchCount || 0;
        
        const totalViolations = 
          multipleFaceDetectedCount +
          noFaceDetectedCount +
          differentPersonDetectedCount +
          tabSwitchCount;
        
        return [
          session.candidateName || session.candidateId || "Unknown",
          String(multipleFaceDetectedCount),
          String(noFaceDetectedCount),
          String(differentPersonDetectedCount),
          String(tabSwitchCount),
          String(totalViolations)
        ];
      });
      
      // Add the violations table to the PDF
      autoTable(doc, {
        startY: yPos,
        head: violationsHeaders,
        body: violationsData,
        theme: 'grid',
        headStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255] },
        margin: { top: 20 },
      });
      
      // Update position after table
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } catch (error) {
      console.error("Error generating violations table:", error);
      // Add error text instead of table
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0);
      doc.text("Error generating violations table", 20, yPos + 10);
      yPos += 20;
    }
  }
    
    // Include section breakdown if configured
    if (config.includeSectionBreakdown && selectedSessionObjects.some(s => s.libraryResults)) {
      try {
        // Add a new page for section breakdown
        doc.addPage();
        yPos = 20;
        
        doc.setFontSize(14);
        doc.setTextColor(30, 27, 75); // #1e1b4b color
        doc.text("Section-by-Section Breakdown", 20, yPos);
        yPos += 10;
      
      // Get all library IDs across all sessions
      const allLibraryIds = new Set<string>();
      selectedSessionObjects.forEach(session => {
        if (session.libraryResults) {
          session.libraryResults.forEach(result => {
            allLibraryIds.add(result.libraryId);
          });
        }
      });
      
      // Create headers with all library IDs
      const sectionHeaders = [["Candidate", ...Array.from(allLibraryIds).map(id => `Section ${id}`)]];
      
      // Create data rows
      const sectionData = selectedSessionObjects.map(session => {
        const row = [session.candidateName || session.candidateId || "Unknown"];
        
        // Add score for each library
        Array.from(allLibraryIds).forEach(libId => {
          const libResult = session.libraryResults?.find(r => r.libraryId === libId);
          row.push(libResult && libResult.percentage !== undefined ? `${libResult.percentage.toFixed(1)}%` : "N/A");
        });
        
        return row;
      });
      
      // Add the section breakdown table to the PDF
      autoTable(doc, {
        startY: yPos,
        head: sectionHeaders,
        body: sectionData,
        theme: 'grid',
        headStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255] },
        margin: { top: 20 },
      });
    } catch (error) {
      console.error("Error generating section breakdown table:", error);
      // Add error text instead of table
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0);
      doc.text("Error generating section breakdown table", 20, yPos + 10);
    }
  }
    
    // Include comparison if configured and multiple candidates selected
    if (config.includeComparison && selectedSessionObjects.length > 1) {
      // Add a new page for comparison
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(14);
      doc.setTextColor(30, 27, 75);
      doc.text("Comparative Analysis", 20, yPos);
      yPos += 10;
      
      // Add average metrics
      doc.setFontSize(12);
      doc.text("Performance Averages:", 20, yPos += 10);
      doc.setFontSize(10);
      doc.text(`Average Score: ${calculateAverageMetric('score').toFixed(1)}%`, 25, yPos += 10);
      doc.text(`Average Time Spent: ${formatDuration(calculateAverageMetric('time'))}`, 25, yPos += 10);
      doc.text(`Average Subjective Score: ${calculateAverageMetric('subjective').toFixed(1)}%`, 25, yPos += 10);
      doc.text(`Average Violations: ${calculateAverageMetric('violations').toFixed(1)}`, 25, yPos += 10);
      
      // Add key insights
      yPos += 10;
      doc.setFontSize(12);
      doc.text("Key Insights:", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      
      const highScorers = selectedSessionObjects.filter(s => (s.percentage || 0) >= 80).length;
      doc.text(`• ${highScorers} candidates scored 80% or higher`, 25, yPos += 10);
      
      const noViolations = selectedSessionObjects.filter(s => 
        s.violationCounts && 
        Object.values({
          multipleFaceDetectedCount: s.violationCounts.multipleFaceDetectedCount || 0,
          noFaceDetectedCount: s.violationCounts.noFaceDetectedCount || 0,
          differentPersonDetectedCount: s.violationCounts.differentPersonDetectedCount || 0,
          tabSwitchCount: s.violationCounts.tabSwitchCount || 0
        }).reduce((a, b) => a + b, 0) === 0
      ).length;
      doc.text(`• ${noViolations} candidates had no violations`, 25, yPos += 10);
      
      const incomplete = selectedSessionObjects.filter(s => 
        s.status === 'ABANDONED' || s.status === 'EXPIRED'
      ).length;
      doc.text(`• ${incomplete} candidates did not complete the test`, 25, yPos += 10);
      
      const avgTime = Math.round(calculateAverageMetric('time') / 60);
      doc.text(`• Average completion time is ${formatDuration(calculateAverageMetric('time'))} (${avgTime}% of allocated time)`, 25, yPos += 10);
    }
    
    // Generate a filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testName.replace(/\s+/g, '_')}_Report_${timestamp}.pdf`;
    
    // Save the PDF
    const pdfBlob = doc.output('blob');
    saveAs(pdfBlob, filename);
    
    // Show success toast
    toast.dismiss(loadingToastId);
    toast.success(`Report for ${selectedSessions.length} candidates generated and downloaded!`);
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.dismiss(loadingToastId);
    toast.error("Failed to generate report. Please try again.");
  }
  
  // Close the dialog
  setShowReportDialog(false);
};

  const calculateAverageMetric = (metricId: string): number => {
    if (selectedSessions.length === 0) return 0;
    
    const metric = comparisonMetrics.find(m => m.id === metricId);
    if (!metric) return 0;
    
    const selectedSessionObjects = sessions.filter(s => selectedSessions.includes(s.id));
    const sum = selectedSessionObjects.reduce((acc, session) => {
      const value = metric.value(session);
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
    
    return sum / selectedSessionObjects.length;
  };

  // Sample data for demonstration purposes - you would replace this with actual API data
  const sampleSessions: TestSession[] = [
    {
      id: "1",
      candidateId: "CAND001",
      candidateName: "Alex Johnson",
      email: "alex.j@example.com",
      status: "COMPLETED",
      startTime: "2025-05-12T09:30:00Z",
      endTime: "2025-05-12T10:45:00Z",
      score: 85,
      percentage: 85,
      duration: 4500,
      correctAnswers: 17,
      totalQuestions: 20,
      violationCounts: {
        multipleFaceDetectedCount: 0,
        noFaceDetectedCount: 1,
        differentPersonDetectedCount: 0,
        tabSwitchCount: 2
      },
      subjectiveQuestionsAnalyzed: 3,
      averageSubjectiveScore: 78,
      libraryResults: [
        {
          libraryId: "LIB-001",
          correctAnswers: 9,
          totalQuestions: 10,
          percentage: 90,
          hasPassage: false,
        },
        {
          libraryId: "LIB-002",
          correctAnswers: 8,
          totalQuestions: 10,
          percentage: 80,
          hasPassage: true,
        }
      ]
    },
    {
      id: "2",
      candidateId: "CAND002",
      candidateName: "Sarah Miller",
      email: "sarah.m@example.com",
      status: "COMPLETED",
      startTime: "2025-05-12T11:00:00Z",
      endTime: "2025-05-12T12:00:00Z",
      score: 92,
      percentage: 92,
      duration: 3600,
      correctAnswers: 18,
      totalQuestions: 20,
      violationCounts: {
        multipleFaceDetectedCount: 0,
        noFaceDetectedCount: 0,
        differentPersonDetectedCount: 0,
        tabSwitchCount: 0
      },
      subjectiveQuestionsAnalyzed: 3,
      averageSubjectiveScore: 95,
      libraryResults: [
        {
          libraryId: "LIB-001",
          correctAnswers: 10,
          totalQuestions: 10,
          percentage: 100,
          hasPassage: false,
        },
        {
          libraryId: "LIB-002",
          correctAnswers: 8,
          totalQuestions: 10,
          percentage: 80,
          hasPassage: true,
        }
      ]
    },
    {
      id: "3",
      candidateId: "CAND003",
      candidateName: "John Davis",
      email: "john.d@example.com",
      status: "ABANDONED",
      startTime: "2025-05-12T14:15:00Z",
      endTime: "2025-05-12T14:30:00Z",
      score: 25,
      percentage: 25,
      duration: 900,
      correctAnswers: 5,
      totalQuestions: 20,
      violationCounts: {
        multipleFaceDetectedCount: 2,
        noFaceDetectedCount: 3,
        differentPersonDetectedCount: 1,
        tabSwitchCount: 5
      },
      subjectiveQuestionsAnalyzed: 1,
      averageSubjectiveScore: 30,
      libraryResults: [
        {
          libraryId: "LIB-001",
          correctAnswers: 3,
          totalQuestions: 10,
          percentage: 30,
          hasPassage: false,
        },
        {
          libraryId: "LIB-002",
          correctAnswers: 2,
          totalQuestions: 10,
          percentage: 20,
          hasPassage: true,
        }
      ]
    },
    {
      id: "4",
      candidateId: "CAND004",
      candidateName: "Emily Wilson",
      email: "emily.w@example.com",
      status: "IN_PROGRESS",
      startTime: "2025-05-13T09:00:00Z",
      duration: 1800,
      violationCounts: {
        multipleFaceDetectedCount: 0,
        noFaceDetectedCount: 0,
        differentPersonDetectedCount: 0,
        tabSwitchCount: 1
      }
    },
    {
      id: "5",
      candidateId: "CAND005",
      candidateName: "Michael Brown",
      email: "michael.b@example.com",
      status: "COMPLETED",
      startTime: "2025-05-13T10:00:00Z",
      endTime: "2025-05-13T11:15:00Z",
      score: 75,
      percentage: 75,
      duration: 4500,
      correctAnswers: 15,
      totalQuestions: 20,
      violationCounts: {
        multipleFaceDetectedCount: 1,
        noFaceDetectedCount: 0,
        differentPersonDetectedCount: 0,
        tabSwitchCount: 3
      },
      subjectiveQuestionsAnalyzed: 3,
      averageSubjectiveScore: 68,
      libraryResults: [
        {
          libraryId: "LIB-001",
          correctAnswers: 8,
          totalQuestions: 10,
          percentage: 80,
          hasPassage: false,
        },
        {
          libraryId: "LIB-002",
          correctAnswers: 7,
          totalQuestions: 10,
          percentage: 70,
          hasPassage: true,
        }
      ]
    }
  ];

  // Use sample data for now but easily swap with real data when available
  const displaySessions = filteredSessions.length > 0 && !loading ? filteredSessions : sampleSessions;

  if (loading) {
    return (
      <div className="space-y-4 p-8">
        <div className="h-12 w-full bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 w-full bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load test sessions: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="sessions-tab"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Report Configuration Dialog */}
        <ReportConfigDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          selectedSessions={sessions.filter(s => selectedSessions.includes(s.id))}
          onGenerateReport={generateReport}
        />

        {/* Comparison Dialog */}
        <Dialog 
          open={showComparisonDialog} 
          onOpenChange={setShowComparisonDialog}
        >
          <DialogContent className="max-w-5xl h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Candidate Comparison</DialogTitle>
              <DialogDescription>
                Comparing {selectedSessions.length} candidates for {testName}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs 
              value={comparisonTab} 
              onValueChange={setComparisonTab} 
              className="mt-4"
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="scores">Scores</TabsTrigger>
                <TabsTrigger value="time">Time Analysis</TabsTrigger>
                <TabsTrigger value="violations">Violations</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(80vh-180px)]">
                <TabsContent value="overview" className="p-4">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Comprehensive Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Candidate</TableHead>
                              {comparisonMetrics.map(metric => (
                                <TableHead key={metric.id}>{metric.label}</TableHead>
                              ))}
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sessions.filter(s => selectedSessions.includes(s.id)).map(session => (
                              <TableRow key={session.id}>
                                <TableCell className="font-medium">
                                  {session.candidateName || session.candidateId}
                                </TableCell>
                                {comparisonMetrics.map(metric => (
                                  <TableCell key={`${session.id}-${metric.id}`}>
                                    <span className={metric.color(metric.value(session))}>
                                      {metric.format(metric.value(session))}
                                    </span>
                                  </TableCell>
                                ))}
                                <TableCell>
                                  <StatusBadge status={session.status} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Average Score:</span>
                              <span className={`font-medium ${
                                calculateAverageMetric('score') >= 70 ? 'text-green-600' :
                                calculateAverageMetric('score') >= 50 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {calculateAverageMetric('score').toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Average Time Spent:</span>
                              <span className="font-medium text-indigo-600">
                                {formatDuration(calculateAverageMetric('time'))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Average Subjective Score:</span>
                              <span className={`font-medium ${
                                calculateAverageMetric('subjective') >= 70 ? 'text-green-600' :
                                calculateAverageMetric('subjective') >= 50 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {calculateAverageMetric('subjective').toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Average Violations:</span>
                              <span className={`font-medium ${
                                calculateAverageMetric('violations') === 0 ? 'text-green-600' :
                                calculateAverageMetric('violations') < 5 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {calculateAverageMetric('violations').toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Key Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>
                                {sessions.filter(s => 
                                  selectedSessions.includes(s.id) && (s.percentage || 0) >= 80
                                ).length} candidates scored 80% or higher
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>
                                {sessions.filter(s => 
                                  selectedSessions.includes(s.id) && 
                                  s.violationCounts && 
                                  Object.values(s.violationCounts).reduce((a, b) => a + b, 0) === 0
                                ).length} candidates had no violations
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-amber-500" />
                              <span>
                                {sessions.filter(s => 
                                  selectedSessions.includes(s.id) && (s.status === 'ABANDONED' || s.status === 'EXPIRED')
                                ).length} candidates did not complete the test
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Info className="h-5 w-5 text-blue-500" />
                              <span>
                                Average completion time is {
                                  formatDuration(calculateAverageMetric('time'))
                                } ({Math.round(calculateAverageMetric('time') / 60)}% of allocated time)
                              </span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scores" className="p-4">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Score Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                          <div className="text-gray-500">
                            Bar chart showing score comparison would be rendered here
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          {sessions.filter(s => selectedSessions.includes(s.id)).map(session => (
                            <div key={session.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">
                                  {session.candidateName || session.candidateId}
                                </span>
                                <span className={`font-medium ${
                                  (session.percentage || 0) >= 70 ? 'text-green-600' :
                                  (session.percentage || 0) >= 50 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {session.percentage?.toFixed(1) || 0}%
                                </span>
                              </div>
                              <Progress 
                                value={session.percentage} 
                                className="h-2"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{session.correctAnswers || 0} correct answers</span>
                                <span>Total: {session.totalQuestions || 0} questions</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Section-wise Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Candidate</TableHead>
                              {sampleSessions[0].libraryResults?.map(lib => (
                                <TableHead key={lib.libraryId}>
                                  Section {lib.libraryId}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sessions.filter(s => 
                              selectedSessions.includes(s.id) && s.libraryResults
                            ).map(session => (
                              <TableRow key={session.id}>
                                <TableCell className="font-medium">
                                  {session.candidateName || session.candidateId}
                                </TableCell>
                                {session.libraryResults?.map(lib => (
                                  <TableCell 
                                    key={`${session.id}-${lib.libraryId}`}
                                    className={
                                      lib.percentage >= 70 ? 'text-green-600' :
                                      lib.percentage >= 50 ? 'text-amber-600' : 'text-red-600'
                                    }
                                  >
                                    {lib.percentage.toFixed(1)}%
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="time" className="p-4">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Time Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                          <div className="text-gray-500">
                            Bar chart showing time comparison would be rendered here
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          {sessions.filter(s => selectedSessions.includes(s.id)).map(session => (
                            <div key={session.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">
                                  {session.candidateName || session.candidateId}
                                </span>
                                <span className="font-medium text-indigo-600">
                                  {formatDuration(session.duration || 0)}
                                </span>
                              </div>
                              <Progress 
                                value={(session.duration || 0) / 6000 * 100} 
                                className="h-2 bg-indigo-100"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Time Efficiency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Candidate</TableHead>
                              <TableHead>Time Spent</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Efficiency Ratio</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sessions.filter(s => 
                              selectedSessions.includes(s.id) && s.duration && s.percentage
                            ).map(session => (
                              <TableRow key={session.id}>
                                <TableCell className="font-medium">
                                  {session.candidateName || session.candidateId}
                                </TableCell>
                                <TableCell>
                                  {formatDuration(session.duration || 0)}
                                </TableCell>
                                <TableCell>
                                  {session.percentage?.toFixed(1) || 0}%
                                </TableCell>
                                <TableCell className="font-medium">
                                  {session.percentage && session.duration 
                                    ? ((session.percentage / (session.duration / 60)) * 100).toFixed(2)
                                    : 'N/A'
                                  }
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="violations" className="p-4">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Violations Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                          <div className="text-gray-500">
                            Bar chart showing violations comparison would be rendered here
                          </div>
                        </div>

                        <div className="mt-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Multiple Faces</TableHead>
                                <TableHead>No Face</TableHead>
                                <TableHead>Different Person</TableHead>
                                <TableHead>Tab Switches</TableHead>
                                <TableHead>Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sessions.filter(s => 
                                selectedSessions.includes(s.id) && s.violationCounts
                              ).map(session => {
                                const violations = session.violationCounts || {
                                  multipleFaceDetectedCount: 0,
                                  noFaceDetectedCount: 0,
                                  differentPersonDetectedCount: 0,
                                  tabSwitchCount: 0
                                };
                                
                                const totalViolations = 
                                  violations.multipleFaceDetectedCount +
                                  violations.noFaceDetectedCount +
                                  violations.differentPersonDetectedCount +
                                  violations.tabSwitchCount;
                                
                                return (
                                  <TableRow key={session.id}>
                                    <TableCell className="font-medium">
                                      {session.candidateName || session.candidateId}
                                    </TableCell>
                                    <TableCell>
                                      {violations.multipleFaceDetectedCount}
                                    </TableCell>
                                    <TableCell>
                                      {violations.noFaceDetectedCount}
                                    </TableCell>
                                    <TableCell>
                                      {violations.differentPersonDetectedCount}
                                    </TableCell>
                                    <TableCell>
                                      {violations.tabSwitchCount}
                                    </TableCell>
                                    <TableCell className={
                                      totalViolations === 0 ? 'text-green-600 font-medium' :
                                      totalViolations < 5 ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'
                                    }>
                                      {totalViolations}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Test Integrity Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {sessions.filter(s => selectedSessions.includes(s.id)).map(session => {
                            const violations = session.violationCounts || {
                              multipleFaceDetectedCount: 0,
                              noFaceDetectedCount: 0,
                              differentPersonDetectedCount: 0,
                              tabSwitchCount: 0
                            };
                            
                            const totalViolations = 
                              violations.multipleFaceDetectedCount +
                              violations.noFaceDetectedCount +
                              violations.differentPersonDetectedCount +
                              violations.tabSwitchCount;
                            
                            let integrityRating;
                            let integrityIcon;
                            
                            if (totalViolations === 0) {
                              integrityRating = "Excellent";
                              integrityIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
                            } else if (totalViolations < 3) {
                              integrityRating = "Good";
                              integrityIcon = <CheckCircle className="h-5 w-5 text-blue-500" />;
                            } else if (totalViolations < 10) {
                              integrityRating = "Questionable";
                              integrityIcon = <AlertCircle className="h-5 w-5 text-amber-500" />;
                            } else {
                              integrityRating = "Poor";
                              integrityIcon = <XCircle className="h-5 w-5 text-red-500" />;
                            }
                            
                            return (
                              <div 
                                key={session.id}
                                className="p-4 border rounded-lg flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-700" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">
                                      {session.candidateName || session.candidateId}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                      {session.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {integrityIcon}
                                  <span className={
                                    integrityRating === "Excellent" ? "text-green-600 font-medium" :
                                    integrityRating === "Good" ? "text-blue-600 font-medium" :
                                    integrityRating === "Questionable" ? "text-amber-600 font-medium" :
                                    "text-red-600 font-medium"
                                  }>
                                    {integrityRating} Integrity
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowComparisonDialog(false)}>
                Close
              </Button>
              <Button 
                className="bg-[#4338ca] hover:bg-[#1e1b4b]"
                onClick={() => {
                  setShowComparisonDialog(false);
                  setShowReportDialog(true);
                }}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border-[#4338ca]/20 bg-white">
          <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                Test Sessions
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white text-[#4338ca] hover:bg-white/90 border-white"
                  onClick={() => {
                    if (selectedSessions.length === 0) {
                      toast.error("Please select at least one session to compare");
                      return;
                    }
                    setShowComparisonDialog(true);
                  }}
                  disabled={selectedSessions.length === 0}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Compare Selected
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white text-[#4338ca] hover:bg-white/90 border-white"
                  onClick={() => {
                    if (selectedSessions.length === 0) {
                      toast.error("Please select at least one session to generate a report");
                      return;
                    }
                    setShowReportDialog(true);
                  }}
                  disabled={selectedSessions.length === 0}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Search and filter controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by candidate name or ID..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters({...filters, status: value})}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="ABANDONED">Abandoned</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value) => setFilters({...filters, dateRange: value})}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by date" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Dates</SelectItem>
                    <SelectItem value="TODAY">Today</SelectItem>
                    <SelectItem value="THIS_WEEK">This Week</SelectItem>
                    <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Sessions table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[50px] text-center">
                      <Checkbox 
                        checked={selectedSessions.length === displaySessions.length && displaySessions.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all sessions"
                      />
                    </TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Violations</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displaySessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                        No sessions found for this test
                      </TableCell>
                    </TableRow>
                  ) : (
                    displaySessions.map((session) => {
                      // Calculate total violations if available
                      const violations = session.violationCounts || {
                        multipleFaceDetectedCount: 0,
                        noFaceDetectedCount: 0,
                        differentPersonDetectedCount: 0,
                        tabSwitchCount: 0
                      };
                      
                      const totalViolations = 
                        violations.multipleFaceDetectedCount +
                        violations.noFaceDetectedCount +
                        violations.differentPersonDetectedCount +
                        violations.tabSwitchCount;
                      
                      return (
                        <TableRow key={session.id} className="hover:bg-gray-50">
                          <TableCell className="text-center">
                            <Checkbox 
                              checked={selectedSessions.includes(session.id)}
                              onCheckedChange={() => handleSessionSelection(session.id)}
                              aria-label={`Select ${session.candidateName || session.candidateId}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">
                                {session.candidateName || 'Unnamed Candidate'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {session.candidateId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={session.status} />
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {formatDate(session.startTime)}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {session.duration ? formatDuration(session.duration) : 'In progress'}
                          </TableCell>
                          <TableCell>
                            {session.percentage !== undefined ? (
                              <ScoreBadge score={session.percentage} />
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {session.violationCounts !== undefined ? (
                              <Badge 
                                variant="outline" 
                                className={
                                  totalViolations === 0 ? "bg-green-50 text-green-700 border-green-300" :
                                  totalViolations < 5 ? "bg-amber-50 text-amber-700 border-amber-300" :
                                  "bg-red-50 text-red-700 border-red-300"
                                }
                              >
                                {totalViolations}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {session.status === 'COMPLETED' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-[#4338ca] hover:text-[#1e1b4b] hover:bg-[#4338ca]/10"
                                onClick={() => viewSessionDetails(session.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-gradient-to-br from-white to-[#4338ca]/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#1e1b4b]">
                      Completion Rate
                    </h3>
                                          <div className="h-12 w-12 rounded-full bg-[#4338ca]/10 flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-[#4338ca]" />
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Completed:</span>
                      <span className="font-medium text-[#4338ca]">
                        {displaySessions.filter(s => s.status === 'COMPLETED').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">In Progress:</span>
                      <span className="font-medium text-blue-600">
                        {displaySessions.filter(s => s.status === 'IN_PROGRESS').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Abandoned/Expired:</span>
                      <span className="font-medium text-red-600">
                        {displaySessions.filter(s => 
                          s.status === 'ABANDONED' || s.status === 'EXPIRED'
                        ).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white to-[#4338ca]/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#1e1b4b]">
                      Performance Overview
                    </h3>
                    <div className="h-12 w-12 rounded-full bg-[#4338ca]/10 flex items-center justify-center">
                      <BarChart className="h-6 w-6 text-[#4338ca]" />
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Excellent (≥85%):</span>
                      <span className="font-medium text-emerald-600">
                        {displaySessions.filter(s => (s.percentage || 0) >= 85).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Good (70-84%):</span>
                      <span className="font-medium text-blue-600">
                        {displaySessions.filter(s => 
                          (s.percentage || 0) >= 70 && (s.percentage || 0) < 85
                        ).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Average (50-69%):</span>
                      <span className="font-medium text-amber-600">
                        {displaySessions.filter(s => 
                          (s.percentage || 0) >= 50 && (s.percentage || 0) < 70
                        ).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Poor (50%):</span>
                      <span className="font-medium text-red-600">
                        {displaySessions.filter(s => 
                          (s.percentage || 0) < 50 && s.percentage !== undefined
                        ).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white to-[#4338ca]/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#1e1b4b]">
                      Violations Summary
                    </h3>
                    <div className="h-12 w-12 rounded-full bg-[#4338ca]/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-[#4338ca]" />
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">No Violations:</span>
                      <span className="font-medium text-green-600">
                        {displaySessions.filter(s => s.violationCounts && 
                          Object.values(s.violationCounts).reduce((a, b) => a + b, 0) === 0
                        ).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Low (1-4):</span>
                      <span className="font-medium text-amber-600">
                        {displaySessions.filter(s => s.violationCounts && 
                          Object.values(s.violationCounts).reduce((a, b) => a + b, 0) > 0 &&
                          Object.values(s.violationCounts).reduce((a, b) => a + b, 0) < 5
                        ).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">High (≥5):</span>
                      <span className="font-medium text-red-600">
                        {displaySessions.filter(s => s.violationCounts && 
                          Object.values(s.violationCounts).reduce((a, b) => a + b, 0) >= 5
                        ).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Main TestDetails Component
export default function TestDetails() {
  const { id } = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "jobs" | "sessions">("overview");
  const [jobsInfo, setJobsInfo] = useState<JobInfo[]>([]);

  const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8005";
  const jobServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL|| "http://localhost:8007";
  
  const { token, user } = useAuth() as AuthContextType;

  useEffect(() => {
    const fetchTestDetails = async () => {
      setLoading(true);
      setError(null);

      if (!token?.access_token) {
        setError("Authentication token is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${testServiceUrl}/api/v1/tests/${id}`, {
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch test details: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Fetched test data:", data);
        setTest(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching test details:", err);
        toast.error(`Failed to load test: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTestDetails();
    }
  }, [id, testServiceUrl, token]);

  useEffect(() => {
    const fetchJobTitles = async () => {
      if (!test?.jobIDs?.length || !token?.access_token) {
        return;
      }
      
      try {
        const jobsWithTitles = await Promise.all(
          test.jobIDs.map(async (jobId) => {
            try {
              const response = await fetch(`${jobServiceUrl}/api/v1/jobs/${jobId}/title`, {
                headers: {
                  Authorization: `Bearer ${token.access_token}`,
                },
              });
              
              if (!response.ok) {
                console.error(`Failed to fetch title for job ID ${jobId}: ${response.statusText}`);
                return { id: jobId, title: "Title unavailable" };
              }
              
              const title = await response.text();
              return { id: jobId, title };
            } catch (err) {
              console.error(`Error fetching job title for ID ${jobId}:`, err);
              return { id: jobId, title: "Title unavailable" };
            }
          })
        );
        
        setJobsInfo(jobsWithTitles);
      } catch (err) {
        console.error("Error fetching job titles:", err);
      }
    };

    fetchJobTitles();
  }, [test?.jobIDs, jobServiceUrl, token]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-br from-white to-[#4338ca]/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4338ca]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-br from-white to-[#4338ca]/5">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Test</h2>
          <p className="text-gray-700">{error}</p>
          <Button 
            className="mt-4 bg-[#4338ca] hover:bg-[#1e1b4b]"
            onClick={() => window.location.href = "/dashboard/tests"}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-br from-white to-[#4338ca]/5">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-yellow-200">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Test Not Found</h2>
          <p className="text-gray-700">The requested test could not be found.</p>
          <Button 
            className="mt-4 bg-[#4338ca] hover:bg-[#1e1b4b]"
            onClick={() => window.location.href = "/dashboard/tests"}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto p-6 bg-gradient-to-br from-white to-[#4338ca]/5">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button 
          variant="ghost" 
          className="gap-2 text-[#4338ca] hover:text-[#1e1b4b] hover:bg-[#4338ca]/10"
          onClick={() => window.location.href = "/dashboard/tests"}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tests
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1e1b4b]">{test.testName}</h1>
            <p className="text-gray-600 mt-2">{test.category} - {test.stream}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={test.testStatus} />
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
              {test.testType}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#4338ca]/20 bg-white">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-[#4338ca]/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#4338ca]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-semibold text-[#1e1b4b]">{test.timeLimit} minutes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#4338ca]/20 bg-white">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-[#4338ca]/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-[#4338ca]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Score</p>
                <p className="font-semibold text-[#1e1b4b]">{test.totalScore} points</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#4338ca]/20 bg-white">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-[#4338ca]/10 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-[#4338ca]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Libraries</p>
                <p className="font-semibold text-[#1e1b4b]">{test.questionLibraryIds?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#4338ca]/20 bg-white">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-[#4338ca]/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#4338ca]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-semibold text-[#1e1b4b]">{formatDate(test.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "overview" | "questions" | "jobs" | "sessions")} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] max-w-xl mx-auto rounded-lg shadow-md mb-8">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#4338ca] data-[state=active]:text-white bg-transparent text-white hover:bg-[#4338ca]/50"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="data-[state=active]:bg-[#4338ca] data-[state=active]:text-white bg-transparent text-white hover:bg-[#4338ca]/50"
          >
            Questions
          </TabsTrigger>
          <TabsTrigger
            value="jobs"
            className="data-[state=active]:bg-[#4338ca] data-[state=active]:text-white bg-transparent text-white hover:bg-[#4338ca]/50"
          >
            Jobs
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="data-[state=active]:bg-[#4338ca] data-[state=active]:text-white bg-transparent text-white hover:bg-[#4338ca]/50"
          >
            Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AnimatePresence mode="wait">
            <motion.div
              key="overview-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card className="border-[#4338ca]/20 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#1e1b4b]">Test Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-[#4338ca]" />
                        <span className="font-semibold text-[#1e1b4b]">Created By:</span>
                        <span className="text-gray-600">{test.createdBy}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-[#4338ca]" />
                        <span className="font-semibold text-[#1e1b4b]">Tenant ID:</span>
                        <span className="text-gray-600">{test.tenantId}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#4338ca]" />
                        <span className="font-semibold text-[#1e1b4b]">Updated At:</span>
                        <span className="text-gray-600">{formatDate(test.updatedAt)}</span>
                      </div>

                      {test.difficultyLevel && (
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-[#4338ca]" />
                          <span className="font-semibold text-[#1e1b4b]">Difficulty:</span>
                          <DifficultyBadge level={test.difficultyLevel} />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-md font-semibold text-[#1e1b4b] flex items-center gap-2">
                          <FileCode className="h-5 w-5 text-[#4338ca]" />
                          Libraries
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {test.questionLibraryIds && test.questionLibraryIds.length > 0 ? (
                            test.questionLibraryIds.map((libId, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-[#4338ca]/10 text-[#1e1b4b] border-[#4338ca]"
                              >
                                Library {libId}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-500">No libraries associated</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Alert className="bg-blue-50 border-[#4338ca] shadow-sm">
                <Info className="h-4 w-4 text-[#4338ca]" />
                <AlertDescription className="text-[#1e1b4b] pl-2">
                  This {test.testType} test has {test.questionLibraryIds?.length || 0} libraries and is associated with {test.jobIDs?.length || 0} jobs.
                  Time allowed: {test.timeLimit} minutes.
                </AlertDescription>
              </Alert>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        
        <TabsContent value="questions">
          <LibraryQuestionsViewer libraryIds={test.questionLibraryIds || []} testId={test.id} />
        </TabsContent>
        
        <TabsContent value="jobs">
          <AnimatePresence mode="wait">
            <motion.div
              key="jobs-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card className="border-[#4338ca]/20 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#1e1b4b]">
                    Associated Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {test.jobIDs?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {test.jobIDs.map((jobId, index) => {
                          // Find the job info for this ID
                          const jobInfo = jobsInfo.find(job => job.id === jobId);
                          
                          return (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card 
                                className="border border-gray-200 hover:border-[#4338ca] bg-gradient-to-br from-white to-[#4338ca]/5 transition-all duration-300 hover:shadow-lg"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#4338ca]/10 flex items-center justify-center">
                                      <Briefcase className="h-5 w-5 text-[#4338ca]" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-[#1e1b4b] truncate">
                                        {jobInfo?.title || "Loading title..."}
                                      </h3>
                                      <p className="text-xs text-gray-500 mt-1">
                                        ID: {jobId}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No jobs associated with this test.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="sessions">
          <TestSessionsTab testId={Number(id)} testName={test.testName} />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-end gap-4 mt-8"
      >
        <Button 
          className="bg-[#4338ca] hover:bg-[#1e1b4b]"
        >
          Assign Test
        </Button>
      </motion.div>
    </div>
  );
}

// Keep the original LibraryQuestionsViewer component
function LibraryQuestionsViewer({ libraryIds, testId }: { libraryIds: string[], testId: number }) {
  const [libraries, setLibraries] = useState<QuestionLibrary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showQuestionPreview, setShowQuestionPreview] = useState<boolean>(false);
  const [previewQuestion, setPreviewQuestion] = useState<MCQQuestion | null>(null);
  const [allQuestions, setAllQuestions] = useState<MCQQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<"libraries" | "preview">("libraries");
  
  const testServiceUrl = import.meta.env.VITE_TEST_SERVICE || "http://localhost:8005";
  const { token } = useAuth() as AuthContextType;

  useEffect(() => {
    const fetchLibraries = async () => {
      if (!libraryIds.length) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchPromises = libraryIds.map(async (id) => {
          const response = await fetch(`${questionBankServiceUrl}/libraries/${id}`, {
            headers: {
              Authorization: `Bearer ${token?.access_token}`,
            },
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch library ${id}: ${response.statusText}`);
          }
          
          return await response.json();
        });

        const fetchedLibraries = await Promise.all(fetchPromises);
        setLibraries(fetchedLibraries);
        
        // Combine all questions from all libraries with their library IDs
        const questions = fetchedLibraries.reduce((acc: MCQQuestion[], lib: QuestionLibrary) => {
          const libraryQuestions = lib.questions.map(q => ({ ...q, libraryId: lib.id }));
          return acc.concat(libraryQuestions);
        }, []);
        console.log("questions fetched: ", questions)
        setAllQuestions(questions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching libraries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraries();
  }, [libraryIds, testServiceUrl, token]);

  const renderPreviewTest = () => (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-full sm:max-w-4xl bg-white h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1e1b4b]">Test Preview</DialogTitle>
          <DialogDescription className="text-[#4338ca]">
            Previewing {allQuestions.length} question{allQuestions.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-8">
            {allQuestions.map((question, index) => (
              <Card
                key={question.questionId}
                className="border-2 border-[#4338ca]/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
                  <CardTitle className="flex justify-between items-center">
                    <span>Question {index + 1}</span>
                    <Badge variant="secondary" className="bg-white text-[#1e1b4b] hover:bg-white">
                      {question.difficultyLevel}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-lg font-medium text-[#1e1b4b] mb-4">{question.questionText}</p>
                  <div className="space-y-2">
                    {question.options ? (
                      Object.entries(question.options).map(([key, value]) => (
                        <div
                          key={key}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            key === question.correctOption
                              ? "border-green-500 bg-green-50"
                              : "border-[#4338ca]/20 hover:border-[#4338ca]"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-2">
                              {key === question.correctOption ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <X className="h-5 w-5 text-[#4338ca]" />
                              )}
                            </div>
                            <p className="text-[#1e1b4b]">
                              <span className="font-semibold">{key}:</span> {value}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-lg border-2 border-yellow-300 bg-yellow-50">
                        <p className="text-yellow-700">Options data format is invalid</p>
                      </div>
                    )}
                  </div>
                  {question.explanation && (
                    <div className="mt-4 p-3 bg-[#4338ca]/5 rounded-lg">
                      <p className="text-sm text-[#1e1b4b]">
                        <span className="font-semibold">Explanation:</span> {question.explanation}
                      </p>
                    </div>
                  )}
                  {question.tags && question.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {question.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="bg-[#4338ca]/10 text-[#4338ca] border-[#4338ca]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  const renderQuestionPreview = () => (
    <Dialog open={showQuestionPreview} onOpenChange={setShowQuestionPreview}>
      <DialogContent className="max-w-3xl bg-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1e1b4b]">Question Preview</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {previewQuestion && (
            <Card className="border-2 border-[#4338ca]/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
                <CardTitle className="flex justify-between items-center">
                  <span>Question</span>
                  <Badge variant="secondary" className="bg-white text-[#1e1b4b] hover:bg-white">
                    {previewQuestion.difficultyLevel}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg font-medium text-[#1e1b4b] mb-4">{previewQuestion.questionText}</p>
                <div className="space-y-2">
                  {previewQuestion && previewQuestion.options ? (
                    Object.entries(previewQuestion.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          key === previewQuestion.correctOption
                            ? "border-green-500 bg-green-50"
                            : "border-[#4338ca]/20"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            {key === previewQuestion.correctOption ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <X className="h-5 w-5 text-[#4338ca]" />
                            )}
                          </div>
                          <p className="text-[#1e1b4b]">
                            <span className="font-semibold">{key}:</span> {value}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border-2 border-yellow-300 bg-yellow-50">
                      <p className="text-yellow-700">Options data format is invalid</p>
                    </div>
                  )}
                </div>
                {previewQuestion.explanation && (
                  <div className="mt-4 p-3 bg-[#4338ca]/5 rounded-lg">
                    <p className="text-sm text-[#1e1b4b]">
                      <span className="font-semibold">Explanation:</span> {previewQuestion.explanation}
                    </p>
                  </div>
                )}
                {previewQuestion.tags && previewQuestion.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {previewQuestion.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="outline"
                        className="bg-[#4338ca]/10 text-[#4338ca] border-[#4338ca]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setShowQuestionPreview(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4338ca]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load library questions: {error}</AlertDescription>
      </Alert>
    );
  }

  if (libraries.length === 0) {
    return (
      <Card className="border-[#4338ca]/20 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#1e1b4b]">Test Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No questions are associated with this test. Please add question libraries to this test.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="questions-tab"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "libraries" | "preview")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] max-w-md mx-auto rounded-lg shadow-md mb-4">
            <TabsTrigger
              value="libraries"
              className="data-[state=active]:bg-[#4338ca] data-[state=active]:text-white bg-transparent text-white hover:bg-[#4338ca]/50"
            >
              Libraries
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-[#4338ca] data-[state=active]:text-white bg-transparent text-white hover:bg-[#4338ca]/50"
            >
              All Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="libraries">
            <Card className="border-[#4338ca]/20 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#1e1b4b]">
                  Question Libraries ({libraries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {libraries.map((library) => (
                    <motion.div
                      key={library.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="mb-4 border border-[#4338ca]/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] rounded-t-lg">
                          <div className="flex flex-row justify-between items-center">
                            <div>
                              <CardTitle className="text-lg font-semibold text-white">{library.libraryName}</CardTitle>
                              
                            </div>
                            <Badge variant="secondary" className="bg-white text-[#4338ca]">
                              {library.questions.length} questions
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 bg-white rounded-b-lg">
                          <div className="space-y-2">
                            {library.questions.map((question, index) => (
                              <div
                                key={question.questionId}
                                className="flex justify-between items-center py-2 border-b border-[#4338ca]/10"
                              >
                                <span className="text-sm text-[#1e1b4b]">
                                  <span className="font-medium text-[#4338ca]">{index + 1}.</span>{" "}
                                  {question.questionText ? 
                                    `${question.questionText.substring(0, 50)}${question.questionText.length > 50 ? "..." : ""}` : 
                                    "No question text available"
                                  }
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#4338ca] text-[#4338ca] hover:bg-[#4338ca]/10"
                                  onClick={() => {
                                    setPreviewQuestion(question);
                                    setShowQuestionPreview(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="border-[#4338ca]/20 bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-[#1e1b4b]">
                  All Questions ({allQuestions.length})
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreview(true)}
                  className="border-[#4338ca] text-[#4338ca] hover:bg-[#4338ca]/10"
                >
                  <Eye className="h-4 w-4 mr-2" /> Full Preview
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[50vh] pr-4">
                  <div className="space-y-4">
                    {allQuestions.map((question, index) => (
                      <motion.div
                        key={question.questionId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex justify-between items-center p-4 rounded-lg hover:bg-[#4338ca]/5 border border-[#4338ca]/10 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[#4338ca]">Q{index + 1}:</span>
                            <span className="font-medium text-[#1e1b4b]">
                              {question.questionText ? 
                                `${question.questionText.substring(0, 80)}${question.questionText.length > 80 ? "..." : ""}` : 
                                "No question text available"
                              }
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center text-xs">
                            <Badge variant="outline" className="bg-[#4338ca]/5 text-[#4338ca]">
                              {question.difficultyLevel}
                            </Badge>
                            {question.tags && question.tags.map((tag, tIndex) => (
                              <Badge key={tIndex} variant="outline" className="bg-gray-100 text-gray-700">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 border-[#4338ca] text-[#4338ca] hover:bg-[#4338ca]/10"
                          onClick={() => {
                            setPreviewQuestion(question);
                            setShowQuestionPreview(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {renderPreviewTest()}
        {renderQuestionPreview()}
      </motion.div>
    </AnimatePresence>
  );
}