import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Mail, User, FileText, Key, AlertCircle } from "lucide-react";
import { TestAssignment } from "../Candidates";

interface CandidateDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: TestAssignment | null;
}

export default function CandidateDetailModal({
  open,
  onOpenChange,
  assignment,
}: CandidateDetailModalProps) {
  if (!assignment) return null;

  // Format date for better readability
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge style
  const getStatusStyle = (status: boolean | string | undefined) => {
    if (status === true || status === "Sent") {
      return "bg-green-100 text-green-800 border border-green-200";
    } else if (status === false || status === "Not Sent") {
      return "bg-red-100 text-red-800 border border-red-200";
    }
    return "bg-gray-100 text-gray-800 border border-gray-200";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <span>Candidate Details</span>
            <Badge className="ml-2 bg-indigo-100 text-indigo-800 border border-indigo-200">
              #{assignment.assignmentId}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Candidate Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase text-gray-500 border-b pb-1">
              Candidate Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="text-gray-900">{assignment.candidateId}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900 break-all">{assignment.candidateEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase text-gray-500 border-b pb-1">
              Test Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Test ID</p>
                  <p className="text-gray-900">{assignment.testId}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Badge
                  variant="outline"
                  className={getStatusStyle(assignment.invitationStatus)}
                >
                  {assignment.invitationStatus || (assignment.emailSent ? "Sent" : "Not Sent")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Security Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase text-gray-500 border-b pb-1">
              Security Details
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-2">
                <Key className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Secure Token</p>
                  <p className="text-gray-900 break-all font-mono text-xs bg-gray-50 p-2 rounded">
                    {assignment.secureToken}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Token Expiration</p>
                  <p className="text-gray-900">
                    {formatDate(assignment.tokenExpiration)}
                  </p>
                  {new Date(assignment.tokenExpiration) < new Date() && (
                    <Badge variant="outline" className="bg-red-100 text-red-800 mt-1 flex items-center w-fit">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase text-gray-500 border-b pb-1">
              Status Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignment.assessmentCleared !== undefined && (
                <div className="flex items-start gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assessment</p>
                    <Badge
                      variant="outline"
                      className={getStatusStyle(assignment.assessmentCleared)}
                    >
                      {assignment.assessmentCleared ? "Cleared" : "Not Cleared"}
                    </Badge>
                  </div>
                </div>
              )}
              
              {assignment.interviewScheduled !== undefined && (
                <div className="flex items-start gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interview</p>
                    <Badge
                      variant="outline"
                      className={getStatusStyle(assignment.interviewScheduled)}
                    >
                      {assignment.interviewScheduled ? "Scheduled" : "Not Scheduled"}
                    </Badge>
                  </div>
                </div>
              )}
              
              {assignment.totalRounds !== undefined && (
                <div className="flex items-start gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rounds Progress</p>
                    <p className="text-gray-900">
                      {assignment.roundsCompleted || 0}/{assignment.totalRounds} completed
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
          {assignment.emailSent && (
            <Button onClick={() => window.open(`mailto:${assignment.candidateEmail}`)}>
              Contact Candidate
            </Button>
          )}
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}