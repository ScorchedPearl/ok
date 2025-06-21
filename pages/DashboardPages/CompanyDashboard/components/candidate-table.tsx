"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Mail, User, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveTab, TestAssignment } from "../Candidates";
import CandidateDetailModal from "./CandidateDetailModal";

interface CandidatesTableProps {
  assignments: TestAssignment[];
  activeTab: ActiveTab;
  onUpdateCandidate?: (assignmentId: number, newStatus: boolean) => void;
}

export default function CandidatesTable({
  assignments,
  activeTab,
  onUpdateCandidate,
}: CandidatesTableProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<TestAssignment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getInvitationStatusStyle = (emailSent: boolean) => {
    return emailSent
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-red-100 text-red-800 border border-red-200";
  };

  const handleViewDetails = (assignment: TestAssignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  // Desktop Table view
  const desktopTable = (
    <table className="w-full text-left">
      <thead className="bg-gray-50">
        <tr className="text-sm font-normal text-gray-500">
          <th className="px-4 py-3 font-semibold text-center">Assignment ID</th>
          <th className="px-4 py-3 font-semibold">Candidate ID</th>
          <th className="px-4 py-3 font-semibold">Email</th>
          <th className="px-4 py-3 font-semibold">Test Name</th>
          <th className="px-4 py-3 font-semibold">Email Status</th>
          {activeTab === "Assessments" && (
            <th className="px-4 py-3 font-semibold">Assessment</th>
          )}
          {activeTab === "Interviews" && (
            <th className="px-4 py-3 font-semibold">Interview</th>
          )}
          {activeTab === "Rounds" && (
            <th className="px-4 py-3 font-semibold">Rounds</th>
          )}
          <th className="px-4 py-3 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody className="text-sm text-gray-800">
        {assignments.map((assignment) => (
          <tr key={assignment.assignmentId} className="hover:bg-gray-50 border-b border-gray-100">
            <td className="px-4 py-3 text-center">{assignment.assignmentId}</td>
            <td className="px-4 py-3">{assignment.candidateId}</td>
            <td className="px-4 py-3">{assignment.candidateEmail}</td>
            <td className="px-4 py-3">SDE Test</td>
            <td className="px-4 py-3">
              <Badge
                variant="outline"
                className={getInvitationStatusStyle(assignment.emailSent)}
              >
                {assignment.emailSent ? "Sent" : "Not Sent"}
              </Badge>
            </td>
            {activeTab === "Assessments" && (
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={
                    assignment.assessmentCleared 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }
                >
                  {assignment.assessmentCleared ? "Cleared" : "Pending"}
                </Badge>
              </td>
            )}
            {activeTab === "Interviews" && (
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={
                    assignment.interviewScheduled 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }
                >
                  {assignment.interviewScheduled ? "Scheduled" : "Not Scheduled"}
                </Badge>
              </td>
            )}
            {activeTab === "Rounds" && (
              <td className="px-4 py-3">
                {assignment.totalRounds
                  ? `${assignment.roundsCompleted ?? 0}/${assignment.totalRounds}`
                  : "N/A"}
              </td>
            )}
            <td className="px-4 py-3">
              {!assignment.emailSent ? (
                <Button size="sm" variant="outline" disabled>
                  Email Not Sent
                </Button>
              ) : activeTab === "Interviews" && onUpdateCandidate ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onUpdateCandidate(
                      assignment.assignmentId,
                      !assignment.interviewScheduled
                    )
                  }
                >
                  {assignment.interviewScheduled ? "Mark Not Scheduled" : "Mark Scheduled"}
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewDetails(assignment)}
                >
                  {activeTab === "Assessments"
                    ? "View Assessment"
                    : activeTab === "Rounds"
                    ? "Manage Rounds"
                    : "View Details"}
                </Button>
              )}
            </td>
          </tr>
        ))}
        {assignments.length === 0 && (
          <tr>
            <td className="px-4 py-3 text-center text-gray-500" colSpan={7}>
              No assignments found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // Mobile view cards with improved styling
  const mobileCards = assignments.map((assignment) => (
    <Card key={assignment.assignmentId} className="mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gray-50 border-b border-gray-200 p-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex justify-between items-center">
          <span>Assignment #{assignment.assignmentId}</span>
          <Badge
            variant="outline"
            className={getInvitationStatusStyle(assignment.emailSent)}
          >
            {assignment.emailSent ? "Email Sent" : "Email Not Sent"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">ID: {assignment.candidateId}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 font-medium">{assignment.candidateEmail}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Test: SDE Test</span>
          </div>
        </div>

        {assignment.emailSent && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            {activeTab === "Assessments" && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Assessment Status:</span>
                <Badge
                  variant="outline"
                  className={
                    assignment.assessmentCleared 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }
                >
                  {assignment.assessmentCleared ? "Cleared" : "Pending"}
                </Badge>
              </div>
            )}
            
            {activeTab === "Interviews" && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Interview Status:</span>
                <Badge
                  variant="outline"
                  className={
                    assignment.interviewScheduled 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }
                >
                  {assignment.interviewScheduled ? "Scheduled" : "Not Scheduled"}
                </Badge>
              </div>
            )}
            
            {activeTab === "Rounds" && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Round Progress:</span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm font-medium">
                    {assignment.totalRounds
                      ? `${assignment.roundsCompleted ?? 0}/${assignment.totalRounds} Completed`
                      : "N/A"}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="border-t border-gray-100 pt-3 flex justify-end">
          {!assignment.emailSent ? (
            <Button className="w-full" variant="outline" disabled>
              Email Not Sent
            </Button>
          ) : activeTab === "Interviews" && onUpdateCandidate ? (
            <Button
              className="w-full"
              variant={assignment.interviewScheduled ? "outline" : "default"}
              onClick={() =>
                onUpdateCandidate(
                  assignment.assignmentId,
                  !assignment.interviewScheduled
                )
              }
            >
              {assignment.interviewScheduled ? "Mark Not Scheduled" : "Mark Scheduled"}
            </Button>
          ) : (
            <Button 
              className="w-full"
              variant={activeTab === "Assessments" || activeTab === "Rounds" ? "default" : "outline"}
              onClick={() => handleViewDetails(assignment)}
            >
              {activeTab === "Assessments"
                ? "View Assessment"
                : activeTab === "Rounds"
                ? "Manage Rounds"
                : "View Details"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="hidden md:block overflow-x-auto">{desktopTable}</div>
      <div className="md:hidden space-y-4 p-4">{mobileCards}</div>
      
      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        assignment={selectedAssignment}
      />
    </div>
  );
}