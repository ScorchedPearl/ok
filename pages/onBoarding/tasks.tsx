"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Calendar,
  Target,
  TrendingUp,
  ChevronRight,
  Loader2,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

interface OnboardingTask {
  taskId: number;
  tenantId: number;
  candidateId: number;
  jobId: string;
  title: string;
  description: string;
  status: "PENDING" | "COMPLETED" | "IN_PROGRESS" | "OVERDUE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  sequenceOrder: number;
  dueDate?: string;
  assignedBy: number;
  assignedAt: string;
  completedAt?: string;
  completedBy?: number;
  notes?: string;
  isMandatory: boolean;
  isOverdue: boolean;
}

interface TaskSummary {
  candidateId: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  hasPendingMandatoryTasks: boolean;
}

const statusStyles = {
  PENDING: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
};

const priorityStyles = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
  LOW: "bg-green-50 text-green-700 border-green-200",
};

export default function OnboardingTasksPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [completionNotes, setCompletionNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch onboarding tasks for the current candidate
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token || !user?.userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch tasks
        const tasksResponse = await fetch(
          `${interviewServiceUrl}/api/onboarding-tasks/candidate/${user.userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token.access_token}`
            }
          }
        );

        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch onboarding tasks');
        }

        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

        // Fetch summary
        const summaryResponse = await fetch(
          `${interviewServiceUrl}/api/onboarding-tasks/candidate/${user.userId}/summary`,
          {
            headers: {
              'Authorization': `Bearer ${token.access_token}`
            }
          }
        );

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        }

      } catch (err) {
        console.error("Error fetching onboarding tasks:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleCompleteTask = async (taskId: number, notes: string) => {
    if (!token || !user?.userId) return;

    try {
      setIsCompleting(true);
      
      const response = await fetch(
        `${interviewServiceUrl}/api/onboarding-tasks/candidate/${user.userId}/tasks/${taskId}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      // Refresh tasks
      const tasksResponse = await fetch(
        `${interviewServiceUrl}/api/onboarding-tasks/candidate/${user.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`
          }
        }
      );

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }

      // Refresh summary
      const summaryResponse = await fetch(
        `${interviewServiceUrl}/api/onboarding-tasks/candidate/${user.userId}/summary`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`
          }
        }
      );

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }

      setIsDetailOpen(false);
      setCompletionNotes("");

    } catch (err) {
      console.error("Error completing task:", err);
      setError(err instanceof Error ? err.message : "Failed to complete task");
    } finally {
      setIsCompleting(false);
    }
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case "pending":
        return tasks.filter(task => task.status === "PENDING");
      case "completed":
        return tasks.filter(task => task.status === "COMPLETED");
      case "overdue":
        return tasks.filter(task => task.isOverdue);
      default:
        return tasks;
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Render loading skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" className="mr-4" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">My Onboarding Tasks</h1>
          </div>
          
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Tasks Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" className="mr-4" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">My Onboarding Tasks</h1>
          </div>
          
          <Card className="shadow-md text-center py-8">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Error Loading Tasks</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" className="mr-4" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-[#2E2883]">My Onboarding Tasks</h1>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-[#2E2883]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Total Tasks
                </CardTitle>
                <p className="text-2xl font-bold text-[#2E2883]">{summary.totalTasks}</p>
              </CardHeader>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Completed
                </CardTitle>
                <p className="text-2xl font-bold text-green-600">{summary.completedTasks}</p>
              </CardHeader>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Pending
                </CardTitle>
                <p className="text-2xl font-bold text-blue-600">{summary.pendingTasks}</p>
              </CardHeader>
            </Card>
            
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Overdue
                </CardTitle>
                <p className="text-2xl font-bold text-red-600">{summary.overdueTasks}</p>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Progress Bar */}
        {summary && summary.totalTasks > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-[#2E2883]">
                <TrendingUp className="h-5 w-5 mr-2" />
                Onboarding Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(summary.completionRate)}% Complete</span>
                </div>
                <Progress value={summary.completionRate} className="h-3" />
                <p className="text-sm text-gray-600">
                  {summary.completedTasks} of {summary.totalTasks} tasks completed
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="shadow-md text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2 text-[#2E2883]">No Tasks Found</h2>
              <p className="text-gray-600">
                {activeTab === "all" 
                  ? "You don't have any onboarding tasks assigned yet."
                  : `No ${activeTab} tasks found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card 
                key={task.taskId} 
                className={`shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                  task.isOverdue ? 'border-l-4 border-l-red-500' : 
                  task.status === 'COMPLETED' ? 'border-l-4 border-l-green-500' :
                  'border-l-4 border-l-blue-500'
                }`}
                onClick={() => {
                  setSelectedTask(task);
                  setIsDetailOpen(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-[#2E2883] flex items-center">
                        {task.title}
                        {task.isMandatory && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Required
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Badge className={statusStyles[task.status]}>
                        {task.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" className={priorityStyles[task.priority]}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Assigned: {formatDate(task.assignedAt)}
                    </div>
                    {task.dueDate && (
                      <div className={`flex items-center ${task.isOverdue ? 'text-red-600' : ''}`}>
                        <Clock className="h-4 w-4 mr-1" />
                        Due: {formatDate(task.dueDate)}
                      </div>
                    )}
                    {task.completedAt && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Completed: {formatDate(task.completedAt)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Step {task.sequenceOrder}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-[#2E2883] border-[#2E2883] hover:bg-[#2E2883]/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setIsDetailOpen(true);
                      }}
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Task Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedTask && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-xl text-[#2E2883]">
                        {selectedTask.title}
                      </DialogTitle>
                      <DialogDescription className="text-base mt-2">
                        Step {selectedTask.sequenceOrder} of your onboarding process
                      </DialogDescription>
                    </div>
                    <Badge className={statusStyles[selectedTask.status]}>
                      {selectedTask.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </DialogHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Task Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#2E2883] mb-2">Description</h3>
                    <p className="text-gray-700">{selectedTask.description}</p>
                  </div>

                  {/* Task Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#2E2883] mb-3">Task Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Priority</p>
                        <Badge variant="outline" className={priorityStyles[selectedTask.priority]}>
                          {selectedTask.priority}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="font-medium">Required</p>
                        <p className="text-gray-600">
                          {selectedTask.isMandatory ? 'Yes' : 'No'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Assigned</p>
                        <p className="text-gray-600">{formatDate(selectedTask.assignedAt)}</p>
                      </div>
                      
                      {selectedTask.dueDate && (
                        <div>
                          <p className="font-medium">Due Date</p>
                          <p className={selectedTask.isOverdue ? 'text-red-600' : 'text-gray-600'}>
                            {formatDate(selectedTask.dueDate)}
                            {selectedTask.isOverdue && (
                              <span className="ml-1 text-red-600 font-medium">(Overdue)</span>
                            )}
                          </p>
                        </div>
                      )}
                      
                      {selectedTask.completedAt && (
                        <div>
                          <p className="font-medium">Completed</p>
                          <p className="text-green-600">{formatDate(selectedTask.completedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedTask.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#2E2883] mb-2">Notes</h3>
                      <div className="bg-[#2E2883]/5 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Completion Form */}
                  {selectedTask.status === 'PENDING' && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-[#2E2883] mb-3">Mark as Complete</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="completion-notes">
                            Completion Notes (Optional)
                          </Label>
                          <Textarea
                            id="completion-notes"
                            placeholder="Add any notes about completing this task..."
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailOpen(false);
                      setCompletionNotes("");
                    }}
                  >
                    Close
                  </Button>
                  
                  {selectedTask.status === 'PENDING' && (
                    <Button 
                      className="bg-[#2E2883] hover:bg-[#232069]"
                      onClick={() => handleCompleteTask(selectedTask.taskId, completionNotes)}
                      disabled={isCompleting}
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}