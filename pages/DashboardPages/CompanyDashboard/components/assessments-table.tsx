import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CalendarIcon, Clock, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Assessment {
  id: number;
  testName: string;
  category: string;
  updatedAt: string;
  timeLimit: number;
  testStatus: "Active" | "Archived";
  testType: string;
  [key: string]: any;
}

export interface AssessmentsTableProps {
  assessments: Assessment[];
  selectedTests?: number[];
  onToggleSelect?: (id: number) => void;
  onToggleSelectAll?: (selectAll: boolean) => void;
}

export default function AssessmentsTable({
  assessments,
  selectedTests = [],
  onToggleSelect = () => {},
  onToggleSelectAll = () => {},
}: AssessmentsTableProps): JSX.Element {
  const navigate = useNavigate();
  
  const handleRowClick = (testId: number, event: React.MouseEvent<HTMLElement>) => {
    if (
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
      (event.target as HTMLElement).closest('button') ||
      (event.target as HTMLElement).closest('a')
    ) {
      return;
    }
    
    navigate(`/test-details/${testId}`);
  };

  const allSelected = assessments.length > 0 && assessments.every((a) => selectedTests.includes(a.id));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If no assessments, show empty state
  if (assessments.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col items-center justify-center space-y-3">
          <FileText className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No assessments found</h3>
          <p className="text-sm text-gray-500 max-w-md">
            There are no assessments matching your current filters. Try changing your search or filters, or create a new assessment.
          </p>
          <Link to="/add-test/1">
            <Button 
              className="mt-4 bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white"
            >
              Create New Assessment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const desktopTable = (
    <table className="w-full text-left">
      <thead className="bg-gray-50">
        <tr className="text-sm font-normal text-gray-500">
          <th className="px-4 py-3 font-semibold">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onToggleSelectAll(e.target.checked)}
              className="rounded border-gray-300"
            />
          </th>
          <th className="px-4 py-3 font-semibold">Test Name</th>
          <th className="px-4 py-3 font-semibold">Category</th>
          <th className="px-4 py-3 font-semibold">Updated At</th>
          <th className="px-4 py-3 font-semibold">Time Limit</th>
          <th className="px-4 py-3 font-semibold">Status</th>
          <th className="px-4 py-3 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody className="text-sm text-gray-800">
        {assessments.map((assessment) => (
          <tr 
            key={assessment.id} 
            className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors"
            onClick={(e) => handleRowClick(assessment.id, e)}
          >
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={selectedTests.includes(assessment.id)}
                onChange={() => onToggleSelect(assessment.id)}
                className="rounded border-gray-300"
              />
            </td>
            <td className="px-4 py-3 font-medium">{assessment.testName}</td>
            <td className="px-4 py-3">{assessment.category}</td>
            <td className="px-4 py-3">{formatDate(assessment.updatedAt)}</td>
            <td className="px-4 py-3">{assessment.timeLimit} mins</td>
            <td className="px-4 py-3">
              <Badge
                variant="outline"
                className={
                  assessment.testStatus === "Active"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }
              >
                {assessment.testStatus}
              </Badge>
            </td>
            <td className="pl-4 pr-1 py-3">
              <div className="flex gap-2">
                <Link to={`/candidate/email-send?testId=${assessment.id}`}>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>Send Invitation</span>
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="default"
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the row click
                    navigate(`/test-details/${assessment.id}`);
                  }}
                >
                  <FileText className="h-4 w-4" />
                  <span>View</span>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Mobile card view
  const mobileCards = assessments.map((assessment) => (
    <Card 
      key={assessment.id} 
      className="mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={(e) => handleRowClick(assessment.id, e)}
    >
      <CardHeader className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedTests.includes(assessment.id)}
              onChange={(e) => {
                e.stopPropagation(); // Prevent card click propagation
                onToggleSelect(assessment.id);
              }}
              className="rounded border-gray-300"
            />
            <CardTitle className="text-lg font-semibold text-gray-800">
              {assessment.testName}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={
              assessment.testStatus === "Active"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-gray-100 text-gray-800 border border-gray-200"
            }
          >
            {assessment.testStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Category: {assessment.category}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Updated: {formatDate(assessment.updatedAt)}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Time Limit: {assessment.timeLimit} mins</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Type: {assessment.testType}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex justify-between">
          <Link 
            to={`/candidate/email-send?testId=${assessment.id}`}
            className="w-1/2 mr-2"
            onClick={(e) => e.stopPropagation()} // Prevent card click
          >
            <Button 
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" />
              <span>Send Invitation</span>
            </Button>
          </Link>
          
          <Button 
            className="w-1/2 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              navigate(`/test-details/${assessment.id}`);
            }}
          >
            <FileText className="h-4 w-4" />
            <span>View Details</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  ));

  // Return the rendered content
  return (
    <div>
      <div className="hidden md:block overflow-x-auto">{desktopTable}</div>
      <div className="md:hidden">{mobileCards}</div>
    </div>
  );
}