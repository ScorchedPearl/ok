"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  Plus,
  Users,
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Calendar,
  Target,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Zap,
  Briefcase,
  Code,
  DollarSign,
  Megaphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  candidateName?: string;
  jobTitle?: string;
}

interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  tasks: TaskTemplateItem[];
}

interface TaskTemplateItem {
  title: string;
  description: string;
  priority: string;
  sequenceOrder: number;
  dueDateOffsetDays?: number;
  isMandatory: boolean;
}

interface CreateTaskForm {
  candidateId: string;
  jobId: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  sequenceOrder: number;
  dueDateOffsetDays?: number;
  isMandatory: boolean;
}

interface AssignTemplateForm {
  candidateId: string;
  jobId: string;
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

const categoryIcons = {
  ENGINEERING: Code,
  HR: Users,
  SALES: DollarSign,
  MARKETING: Megaphone,
};

export default function OnboardingManagementPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [isTemplateDetailOpen, setIsTemplateDetailOpen] = useState<boolean>(false);
  const [isAssignTemplateOpen, setIsAssignTemplateOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("tasks");

  const [createTaskForm, setCreateTaskForm] = useState<CreateTaskForm>({
    candidateId: "",
    jobId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    sequenceOrder: 1,
    dueDateOffsetDays: 7,
    isMandatory: true,
  });

  const [assignTemplateForm, setAssignTemplateForm] = useState<AssignTemplateForm>({
    candidateId: "",
    jobId: "",
  });

  // Fetch onboarding tasks and templates
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user?.userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch tasks for tenant
        const tasksResponse = await fetch(
          `${interviewServiceUrl}/api/onboarding-tasks/tenant/${user.userId}`,
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

        // Fetch templates
        const templatesResponse = await fetch(
          `${interviewServiceUrl}/api/onboarding-tasks/templates`,
          {
            headers: {
              'Authorization': `Bearer ${token.access_token}`
            }
          }
        );

        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          setTemplates(templatesData);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleCreateTask = async () => {
    if (!token || !user?.userId || !user?.userId) return;

    try {
      setIsSubmitting(true);
      
      let dueDate: string | undefined = undefined;
      if (createTaskForm.dueDateOffsetDays && !isNaN(createTaskForm.dueDateOffsetDays)) {
        const now = new Date();
        now.setDate(now.getDate() + createTaskForm.dueDateOffsetDays);
        dueDate = now.toISOString();
      }

      const requestBody = {
        candidateId: parseInt(createTaskForm.candidateId),
        jobId: createTaskForm.jobId ? createTaskForm.jobId.trim() : undefined,
        title: createTaskForm.title,
        description: createTaskForm.description,
        priority: createTaskForm.priority,
        sequenceOrder: createTaskForm.sequenceOrder,
        dueDate,
        isMandatory: createTaskForm.isMandatory,
      };

      const response = await fetch(
        `${interviewServiceUrl}/api/onboarding-tasks/tenant/${user.userId}?assignedByUserId=${user.userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      // Refresh tasks
      const tasksResponse = await fetch(
        `${interviewServiceUrl}/api/onboarding-tasks/tenant/${user.userId}`,
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

      setIsCreateTaskOpen(false);
      resetCreateTaskForm();

    } catch (err) {
      console.error("Error creating task:", err);
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTemplate = async () => {
    if (!token || !user?.userId || !user?.userId || !selectedTemplate) return;

    try {
      setIsSubmitting(true);
      
      const requestBody = {
        candidateId: parseInt(assignTemplateForm.candidateId),
        jobId: assignTemplateForm.jobId,
      };

      const response = await fetch(
        `${interviewServiceUrl}/api/onboarding-tasks/templates/${selectedTemplate.id}/assign/tenant/${user.userId}?assignedByUserId=${user.userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to assign template');
      }

      // Refresh tasks
      const tasksResponse = await fetch(
        `${interviewServiceUrl}/api/onboarding-tasks/tenant/${user.userId}`,
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

      setIsAssignTemplateOpen(false);
      setSelectedTemplate(null);
      resetAssignTemplateForm();

    } catch (err) {
      console.error("Error assigning template:", err);
      setError(err instanceof Error ? err.message : "Failed to assign template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateTaskForm = () => {
    setCreateTaskForm({
      candidateId: "",
      jobId: "",
      title: "",
      description: "",
      priority: "MEDIUM",
      sequenceOrder: 1,
      dueDateOffsetDays: 7,
      isMandatory: true,
    });
  };

  const resetAssignTemplateForm = () => {
    setAssignTemplateForm({
      candidateId: "",
      jobId: "",
    });
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    return filtered;
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "COMPLETED").length;
    const pending = tasks.filter(t => t.status === "PENDING").length;
    const overdue = tasks.filter(t => t.isOverdue).length;

    return { total, completed, pending, overdue };
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
            <h1 className="text-3xl font-bold text-primary">Onboarding Management</h1>
          </div>
          
          {/* Stats Skeleton */}
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

          {/* Content Skeleton */}
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
            <h1 className="text-3xl font-bold text-primary">Onboarding Management</h1>
          </div>
          
          <Card className="shadow-md text-center py-8">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Error Loading Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();
  const stats = getTaskStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" className="mr-4" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-[#2E2883]">Onboarding Management</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCreateTaskOpen(true)}
              className="bg-[#2E2883] hover:bg-[#232069]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-[#2E2883]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Total Tasks
              </CardTitle>
              <p className="text-2xl font-bold text-[#2E2883]">{stats.total}</p>
            </CardHeader>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Completed
              </CardTitle>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </CardHeader>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </CardTitle>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            </CardHeader>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Overdue
              </CardTitle>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">Tasks Management</TabsTrigger>
            <TabsTrigger value="templates">Task Templates</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#2E2883]">Filter Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="search"
                        placeholder="Search by title, candidate, or job..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="min-w-[150px]">
                    <Label htmlFor="status-filter" className="text-black">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="text-black">
                        <SelectValue placeholder="All Statuses" className="text-black"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="min-w-[150px]">
                    <Label htmlFor="priority-filter" className="text-black">Priority</Label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="text-black">
                        <SelectValue placeholder="All Priorities"  className="text-black"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
              <Card className="shadow-md text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-medium mb-2  text-[#2E2883]">No Tasks Found</h2>
                  <p className="text-gray-600 mb-4">
                    {tasks.length === 0 
                      ? "No onboarding tasks have been created yet."
                      : "No tasks match your current filters."
                    }
                  </p>
                  <Button 
                    onClick={() => setIsCreateTaskOpen(true)}
                    className="bg-[#2E2883] hover:bg-[#232069]"
                  >
                    Create First Task
                  </Button>
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
                          <p className="text-gray-600 mt-1">
                            {task.candidateName && `Assigned to: ${task.candidateName}`}
                            {task.jobTitle && ` • ${task.jobTitle}`}
                          </p>
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
                          Created: {formatDate(task.assignedAt)}
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
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Templates</CardTitle>
                <p className="text-gray-600">
                  Use predefined templates to quickly assign multiple onboarding tasks to candidates.
                </p>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const IconComponent = categoryIcons[template.category as keyof typeof categoryIcons] || Briefcase;
                
                return (
                  <Card 
                    key={template.id} 
                    className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsTemplateDetailOpen(true);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-[#2E2883]/10 rounded-lg mr-3">
                            <IconComponent className="h-6 w-6 text-[#2E2883]" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-[#2E2883]">
                              {template.name}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{template.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {template.tasks.length} tasks
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-[#2E2883] border-[#2E2883] hover:bg-[#2E2883]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                            setIsAssignTemplateOpen(true);
                          }}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

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
                        {selectedTask.candidateName && `Assigned to: ${selectedTask.candidateName}`}
                        {selectedTask.jobTitle && ` • ${selectedTask.jobTitle}`}
                      </DialogDescription>
                    </div>
                    <Badge className={statusStyles[selectedTask.status]}>
                      {selectedTask.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </DialogHeader>
                
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2E2883] mb-2">Description</h3>
                    <p className="text-gray-700">{selectedTask.description}</p>
                  </div>

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
                        <p className="font-medium">Created</p>
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
                    </div>
                  </div>

                  {selectedTask.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#2E2883] mb-2">Notes</h3>
                      <div className="bg-[#2E2883]/5 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    Close
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Template Detail Modal */}
        <Dialog open={isTemplateDetailOpen} onOpenChange={setIsTemplateDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedTemplate && (
              <>
                <DialogHeader>
                  <div className="flex items-center">
                    <div className="p-2 bg-[#2E2883]/10 rounded-lg mr-3">
                      {(() => {
                        const IconComponent = categoryIcons[selectedTemplate.category as keyof typeof categoryIcons] || Briefcase;
                        return <IconComponent className="h-6 w-6 text-[#2E2883]" />;
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl text-[#2E2883]">
                        {selectedTemplate.name}
                      </DialogTitle>
                      <DialogDescription className="text-base mt-1">
                        {selectedTemplate.description}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-[#2E2883] mb-4">
                    Tasks in this template ({selectedTemplate.tasks.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedTemplate.tasks.map((task, index) => (
                      <Card key={index} className="border-l-4 border-l-[#2E2883]">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-[#2E2883]">{task.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className={priorityStyles[task.priority as keyof typeof priorityStyles]}>
                                  {task.priority}
                                </Badge>
                                {task.isMandatory && (
                                  <Badge variant="outline">Required</Badge>
                                )}
                                {task.dueDateOffsetDays && (
                                  <Badge variant="outline">
                                    Due in {task.dueDateOffsetDays} days
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 ml-4">
                              Step {task.sequenceOrder}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <DialogFooter className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsTemplateDetailOpen(false)}
                  >
                    Close
                  </Button>
                  
                  <Button 
                    className="bg-[#2E2883] hover:bg-[#232069]"
                    onClick={() => {
                      setIsTemplateDetailOpen(false);
                      setIsAssignTemplateOpen(true);
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Assign to Candidate
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Task Modal */}
        <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#2E2883]">Create New Task</DialogTitle>
              <DialogDescription>
                Create a custom onboarding task for a specific candidate.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidateId">Candidate ID</Label>
                  <Input
                    id="candidateId"
                    type="number"
                    value={createTaskForm.candidateId}
                    onChange={(e) => setCreateTaskForm({...createTaskForm, candidateId: e.target.value})}
                    placeholder="Enter candidate ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobId">Job ID</Label>
                  <Input
                    id="jobId"
                    value={createTaskForm.jobId}
                    onChange={(e) => setCreateTaskForm({...createTaskForm, jobId: e.target.value})}
                    placeholder="Enter job ID"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={createTaskForm.title}
                  onChange={(e) => setCreateTaskForm({...createTaskForm, title: e.target.value})}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createTaskForm.description}
                  onChange={(e) => setCreateTaskForm({...createTaskForm, description: e.target.value})}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={createTaskForm.priority} 
                    onValueChange={(value) => setCreateTaskForm({...createTaskForm, priority: value as "HIGH" | "MEDIUM" | "LOW"})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sequenceOrder">Sequence Order</Label>
                  <Input
                    id="sequenceOrder"
                    type="number"
                    min="1"
                    value={createTaskForm.sequenceOrder}
                    onChange={(e) => setCreateTaskForm({...createTaskForm, sequenceOrder: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dueDateOffset">Due in Days</Label>
                  <Input
                    id="dueDateOffset"
                    type="number"
                    min="1"
                    value={createTaskForm.dueDateOffsetDays}
                    onChange={(e) => setCreateTaskForm({...createTaskForm, dueDateOffsetDays: parseInt(e.target.value) || undefined})}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={createTaskForm.isMandatory}
                  onChange={(e) => setCreateTaskForm({...createTaskForm, isMandatory: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="mandatory">This task is mandatory</Label>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateTaskOpen(false);
                  resetCreateTaskForm();
                }}
              >
                Cancel
              </Button>
              
              <Button 
                className="bg-[#2E2883] hover:bg-[#232069]"
                onClick={handleCreateTask}
                disabled={isSubmitting || !createTaskForm.candidateId || !createTaskForm.jobId || !createTaskForm.title}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Template Modal */}
        <Dialog open={isAssignTemplateOpen} onOpenChange={setIsAssignTemplateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#2E2883]">Assign Template</DialogTitle>
              <DialogDescription>
                {selectedTemplate && `Assign "${selectedTemplate.name}" template to a candidate.`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="assign-candidateId">Candidate ID</Label>
                <Input
                  id="assign-candidateId"
                  type="number"
                  value={assignTemplateForm.candidateId}
                  onChange={(e) => setAssignTemplateForm({...assignTemplateForm, candidateId: e.target.value})}
                  placeholder="Enter candidate ID"
                />
              </div>
              
              <div>
                <Label htmlFor="assign-jobId">Job ID</Label>
                <Input
                  id="assign-jobId"
                  value={assignTemplateForm.jobId}
                  onChange={(e) => setAssignTemplateForm({...assignTemplateForm, jobId: e.target.value})}
                  placeholder="Enter job ID"
                />
              </div>

              {selectedTemplate && (
                <div className="bg-[#2E2883]/5 rounded-lg p-4">
                  <h4 className="font-medium text-[#2E2883] mb-2">Template Preview</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedTemplate.description}</p>
                  <p className="text-sm text-gray-500">
                    This will create {selectedTemplate.tasks.length} tasks for the candidate.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignTemplateOpen(false);
                  setSelectedTemplate(null);
                  resetAssignTemplateForm();
                }}
              >
                Cancel
              </Button>
              
              <Button 
                className="bg-[#2E2883] hover:bg-[#232069]"
                onClick={handleAssignTemplate}
                disabled={isSubmitting || !assignTemplateForm.candidateId || !assignTemplateForm.jobId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Assign Template
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}