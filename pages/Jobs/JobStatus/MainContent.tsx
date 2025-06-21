"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function MainContent() {
  const tasks = [
    {
      task: "Send Endorsement Request",
      jobTitle: "Software Engineer",
      jobReq: "JR280041",
      dateAssigned: "January 21, 2025",
    },
  ]

  const applications = [
    {
      jobTitle: "Software Engineer",
      jobReq: "JR280041",
      status: "In Consideration",
      dateSubmitted: "January 21, 2025",
    },
  ]

  return (
    <div className="space-y-8">
      <Card className="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
        <CardHeader className="border-b border-[#E2E8F0] pb-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-[#6366F1] bg-opacity-10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <CardTitle className="text-[#1E293B] text-xl font-bold">My Tasks</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="todo" className="w-full">
            <TabsList className="mb-6 bg-[#F1F5F9] p-1 rounded-lg">
              <TabsTrigger value="todo" className="text-[#64748B] data-[state=active]:text-[#1E293B] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">
                To Do (1)
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-[#64748B] data-[state=active]:text-[#1E293B] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">
                Completed (0)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="todo">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E2E8F0] bg-[#F8FAFC]">
                    <TableHead className="text-[#64748B] font-medium">Task</TableHead>
                    <TableHead className="text-[#64748B] font-medium">Job Title</TableHead>
                    <TableHead className="text-[#64748B] font-medium">Job Req</TableHead>
                    <TableHead className="text-[#64748B] font-medium">Date Assigned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task, index) => (
                    <TableRow key={index} className="border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <TableCell className="text-[#1E293B] font-medium">{task.task}</TableCell>
                      <TableCell className="text-[#334155]">{task.jobTitle}</TableCell>
                      <TableCell className="text-[#334155]">{task.jobReq}</TableCell>
                      <TableCell className="text-[#64748B]">{task.dateAssigned}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="completed">
              <div className="text-center py-16 bg-[#F8FAFC] rounded-lg">
                <div className="text-[#64748B] flex flex-col items-center">
                  <svg className="w-12 h-12 mb-4 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No completed tasks</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
        <CardHeader className="border-b border-[#E2E8F0] pb-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-[#6366F1] bg-opacity-10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle className="text-[#1E293B] text-xl font-bold">My Applications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6 bg-[#F1F5F9] p-1 rounded-lg">
              <TabsTrigger value="active" className="text-[#64748B] data-[state=active]:text-[#1E293B] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">
                Active (1)
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-[#64748B] data-[state=active]:text-[#1E293B] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">
                Inactive (0)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E2E8F0] bg-[#F8FAFC]">
                    <TableHead className="text-[#64748B] font-medium">Job Title</TableHead>
                    <TableHead className="text-[#64748B] font-medium">Job Req</TableHead>
                    <TableHead className="text-[#64748B] font-medium">Status</TableHead>
                    <TableHead className="text-[#64748B] font-medium">Date Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application, index) => (
                    <TableRow key={index} className="border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <TableCell className="text-[#1E293B] font-medium">{application.jobTitle}</TableCell>
                      <TableCell className="text-[#334155]">{application.jobReq}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#DCFCE7] text-[#166534] font-medium px-3 py-1 rounded-full">
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#64748B]">{application.dateSubmitted}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="inactive">
              <div className="text-center py-16 bg-[#F8FAFC] rounded-lg">
                <div className="text-[#64748B] flex flex-col items-center">
                  <svg className="w-12 h-12 mb-4 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                  <p>No inactive applications</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}