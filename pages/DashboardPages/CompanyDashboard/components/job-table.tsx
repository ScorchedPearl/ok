import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  FileTextIcon,
  MoreHorizontal,
  Download,
  Edit,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { printJobDescription } from "@/utils/pdfGenerator"; 
import { Badge } from "@/components/ui/badge"; // Make sure this component exists in your UI library

// Updated Job interface to include isDisable
interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  recruiterId: string;
  testId: number;
  tenantId: number; 
  company: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  disable: boolean; // Added this property
}

interface JobsTableProps {
  jobs: Job[];
  actionCell?: (job: Job) => React.ReactNode;
}

export default function JobsTable({ jobs, actionCell }: JobsTableProps) {
  const filteredJobs = jobs;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
  
  const navigateToJobDetails = (jobId: string) => {
    window.location.href = `/jobs/${jobId}`;
  };

  const handleDownloadPDF = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    printJobDescription(job);
  };

  // Default action cell with dropdown menu - updated to handle disable state
  const defaultActionCell = (job: Job) => {
    if (!job) return null;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white"
            size="sm"
          >
            Actions <MoreHorizontal className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => {
              console.log("Edit job:", job.id);
            }}
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </DropdownMenuItem>
          
          {/* Toggle Enable/Disable option - this will be replaced by the actionCell from parent */}
          <DropdownMenuItem 
            onClick={() => {
              console.log(job.disable ? "Enable" : "Disable", "job:", job.id);
            }}
            className="cursor-pointer"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {job.disable ? "Enable Job" : "Disable Job"}
          </DropdownMenuItem>
          
          {/* Only show these options for enabled jobs */}
          {!job.disable && (
            <>
              <DropdownMenuItem 
                onClick={() => window.location.href = `/job/interviews/scheduling/${job.id}`}
                className="cursor-pointer"
              >
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.location.href = `/job-applications/${job.id}`}
                className="cursor-pointer"
              >
                View Job Applications
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={(e) => handleDownloadPDF(job, e)}
            className="cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Job Description
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderActionCell = actionCell || defaultActionCell;

  return (
    <div className="bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr className="text-md text-[#3a4f74] bg-gray-50">
              <th className="px-6 py-3 font-semibold">Title</th>
              <th className="px-6 py-3 font-semibold">Department</th>
              <th className="px-6 py-3 font-semibold">Location</th>
              <th className="px-6 py-3 font-semibold">Employment Type</th>
              <th className="px-6 py-3 font-semibold">Status</th> {/* Added status column */}
              <th className="px-6 py-3 font-semibold">Created At</th>
              <th className="px-6 py-3 font-semibold">Updated At</th>
              <th className="px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {filteredJobs.map((job) => (
              <tr 
                key={job.id} 
                className={`hover:bg-gray-50 cursor-pointer ${job.disable ? 'bg-gray-100 opacity-75' : ''}`}
                onClick={(e) => {
                  const target = e.target as Node;
                  const actionCell = document.getElementById(`action-cell-${job.id}`);
                  if (actionCell && (actionCell === target || actionCell.contains(target))) {
                    return;
                  }
                  navigateToJobDetails(job.id);
                }}
              >
                <td className="px-6 py-3">
                  <div className="flex items-center justify-center">
                    <span>{job.title}</span>
                  </div>
                </td>
                <td className="px-6 py-3">{job.department}</td>
                <td className="px-6 py-3">{job.location}</td>
                <td className="px-6 py-3">{job.employmentType}</td>
                <td className="px-6 py-3">
                  {job.disable ? (
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      Disabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-3">{formatDate(job.createdAt)}</td>
                <td className="px-6 py-3">{formatDate(job.updatedAt)}</td>
                <td className="px-6 py-3" id={`action-cell-${job.id}`} onClick={(e) => e.stopPropagation()}>
                  {renderActionCell(job)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4 p-4">
        {filteredJobs.map((job) => (
          <Card 
            key={job.id} 
            className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${job.disable ? 'bg-gray-50 opacity-75 border-gray-300' : ''}`}
            onClick={(e) => {
              const target = e.target as Node;
              const actionCell = document.getElementById(`mobile-action-cell-${job.id}`);
              const detailsButton = document.getElementById(`details-button-${job.id}`);
              if ((actionCell && (actionCell === target || actionCell.contains(target))) ||
                  (detailsButton && (detailsButton === target || detailsButton.contains(target)))) {
                return;
              }
              navigateToJobDetails(job.id);
            }}
          >
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold">
                  {job.title}
                </CardTitle>
                {job.disable && (
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    Disabled
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className={`p-4 space-y-3 ${!job.disable ? 'bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]' : 'bg-gray-300'}`}>
              <div className="flex items-center space-x-2 text-sm text-white">
                <BriefcaseIcon className="h-4 w-4" />
                <span>{job.department}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white">
                <MapPinIcon className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white">
                <BriefcaseIcon className="h-4 w-4" />
                <span>{job.employmentType}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white">
                <CalendarIcon className="h-4 w-4" />
                <span>Created: {formatDate(job.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white">
                <CalendarIcon className="h-4 w-4" />
                <span>Updated: {formatDate(job.updatedAt)}</span>
              </div>
              <div className="flex items-center space-x-2 justify-between">
                <div className="flex items-center space-x-2">
                  <FileTextIcon className="h-4 w-4 text-white" />
                  <Button
                    id={`details-button-${job.id}`}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.alert(job.description);
                    }}
                    className="bg-primary text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View Details
                  </Button>
                </div>
                <div id={`mobile-action-cell-${job.id}`} onClick={(e) => e.stopPropagation()}>
                  {renderActionCell(job)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}