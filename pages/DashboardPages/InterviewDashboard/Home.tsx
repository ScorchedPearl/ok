"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Edit3, MessageSquare, Users } from "lucide-react"
import { SparklesCore } from "@/components/ui/sparkles"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { useAuth } from "@/context/AuthContext"

export default function DashboardHome() {

  const user = useAuth();
  console.log("user", user)

  const [selectedFeedbackTab, setSelectedFeedbackTab] = useState("outstanding")
  const [selectedApprovalTab, setSelectedApprovalTab] = useState("overview")

  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* <BackgroundBeams /> */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="relative">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={100}
              className="absolute top-0 left-0 w-full h-full"
              particleColor="#2E2883"
            />
            <div className="relative">
              <h1 className="text-4xl font-bold text-[#2E2883]">Welcome back, {user.user?.fullName}</h1>
              <p className="text-gray-600 mt-2">It is {formattedDate} IST</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-8 lg:col-span-1">
              {/* My Tasks */}
              <TracingBeam>
                <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-[#2E2883]">My tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Edit3 className="text-[#2E2883]" />
                        <a
                    href="/job/interviews/interviews-page"
                    className="text-[#2E2883] whitespace-nowrap hover:underline text-sm"
                  >
                   1 Feedback Form to Complete
                   </a>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </motion.div>
                  </CardContent>
                </Card>
              </TracingBeam>

              {/* Upcoming Interviews */}
              <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between bg-slate-200">
                  <CardTitle className="text-[#2E2883] text-xl font-semibold">Upcoming interviews</CardTitle>
                  <a
                    href="/job/interviews/interviews-page"
                    className="text-[#2E2883] whitespace-nowrap hover:underline text-sm"
                  >
                    View all interviews
                   </a>
                </CardHeader>
                <CardContent>
                  <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-lg bg-gray-50">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-600">January 29, 2025</span>
                        <span className="text-sm text-gray-500">4:00 pm to 5:00 pm IST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#2E2883]">Akshay Waghmare</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500 text-sm">Senior Backend Dev</span>
                      </div>
                      <div className="text-sm text-gray-500">Round 1: Technical Round - (Code + Design)</div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-[#2E2883]">Quick links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { icon: Users, text: "Internal job board" },
                    { icon: MessageSquare, text: "Refer a candidate" },
                    { icon: MessageSquare, text: "Contact support" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="text-[#2E2883]" />
                        <span className="text-[#2E2883]">{item.text}</span>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Feedback Section */}
              <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-[#2E2883] text-2xl font-semibold">Feedback</CardTitle>
                    <a
                    href="/job/interviews/interviews-page"
                    className="text-[#2E2883] whitespace-nowrap hover:underline text-sm"
                  >
                    View all interviews
                   </a>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedFeedbackTab} onValueChange={setSelectedFeedbackTab} className="w-full pt-5">
                    <TabsList className="grid w-full grid-cols-2 lg:w-1/2 lg:mx-auto text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                      <TabsTrigger
                        value="outstanding"
                        className={`transition-colors ${
                          selectedFeedbackTab === "outstanding" ? "bg-blue-300" : "bg-transparent"
                        }`}
                      >
                        Outstanding feedback <Badge className="ml-2 bg-[#2E2883]">3</Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                        className={`transition-colors ${
                          selectedFeedbackTab === "completed" ? "bg-blue-300" : "bg-transparent"
                        }`}
                      >
                        Completed feedback <Badge className="ml-2 bg-gray-500">7</Badge>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="outstanding">
                      <Table>
                        <TableHeader className="hover:bg-inherit">
                          <TableRow className="hover:bg-inherit">
                            <TableHead className="text-slate-900 font-bold">Date of Interview</TableHead>
                            <TableHead className="text-slate-900 font-bold">Candidate</TableHead>
                            <TableHead className="text-slate-900 font-bold">Interview Stage</TableHead>
                            <TableHead className="text-slate-900 font-bold">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-inherit">
                            <TableCell>
                              <div className="font-medium text-slate-900">Jan 29, 2025</div>
                              <div className="text-sm text-slate-900">4:00 pm to 5:00 pm</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-slate-900">Akshay Waghmare</div>
                              <div className="text-sm text-slate-900">Senior Backend Developer</div>
                            </TableCell>
                            <TableCell className="text-slate-900">
                              Technical Round - QE (Code + Design)
                              <div className="text-sm text-slate-900">Round 1</div>
                            </TableCell>
                            <TableCell>
                            <a
                    href="/job/interviews/interviews-feedback"
                    className="text-[#2E2883] whitespace-nowrap hover:underline text-sm"
                  >
                    Complete Feedback
                   </a>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TabsContent>
                    <TabsContent value="completed">
                      <div className="text-center py-8 text-gray-500">No completed feedback to show</div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Approval Requests */}
              <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between bg-slate-200 mb-5 gap-4">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-[#2E2883] text-xl">Approval requests</CardTitle>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32 text-slate-900">
                        <SelectValue placeholder="Filter by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-white">
                          All
                        </SelectItem>
                        <SelectItem value="pending" className="text-white">
                          Pending
                        </SelectItem>
                        <SelectItem value="approved" className="text-white">
                          Approved
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedApprovalTab} onValueChange={setSelectedApprovalTab}>
                    <TabsList className="grid w-full grid-cols-4 lg:w-3/4 lg:mx-auto text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                      <TabsTrigger
                        value="overview"
                        className={`transition-colors ${
                          selectedApprovalTab === "overview" ? "bg-blue-300" : "bg-transparent"
                        }`}
                      >
                        Overview{" "}
                        <Badge variant="secondary" className="ml-1">
                          0
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="offers"
                        className={`transition-colors ${
                          selectedApprovalTab === "offers" ? "bg-blue-300" : "bg-transparent"
                        }`}
                      >
                        Offers{" "}
                        <Badge variant="secondary" className="ml-1">
                          0
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="requisitions"
                        className={`transition-colors ${
                          selectedApprovalTab === "requisitions" ? "bg-blue-300" : "bg-transparent"
                        }`}
                      >
                        Requisitions{" "}
                        <Badge variant="secondary" className="ml-1">
                          0
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="postings"
                        className={`transition-colors ${
                          selectedApprovalTab === "postings" ? "bg-blue-300" : "bg-transparent"
                        }`}
                      >
                        Postings{" "}
                        <Badge variant="secondary" className="ml-1">
                          0
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                      <div className="py-8 text-center text-gray-500">
                        You do not have any outstanding approvals to review
                      </div>
                    </TabsContent>
                    <TabsContent value="offers">
                      <div className="py-8 text-center text-gray-500">No offers requiring approval</div>
                    </TabsContent>
                    <TabsContent value="requisitions">
                      <div className="py-8 text-center text-gray-500">No requisitions requiring approval</div>
                    </TabsContent>
                    <TabsContent value="postings">
                      <div className="py-8 text-center text-gray-500">No postings requiring approval</div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

