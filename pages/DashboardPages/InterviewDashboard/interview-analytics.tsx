"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { SparklesCore } from "@/components/ui/sparkles"
import { Calendar, Users, CheckCircle, Clock, Download, TrendingUp } from "lucide-react"
import type React from "react" // Import React
// Mock data for charts
const monthlyData = [
  { month: "Jan", interviews: 45, success: 32, time: 15 },
  { month: "Feb", interviews: 38, success: 28, time: 12 },
  { month: "Mar", interviews: 52, success: 40, time: 18 },
  { month: "Apr", interviews: 35, success: 25, time: 14 },
  { month: "May", interviews: 42, success: 35, time: 16 },
  { month: "Jun", interviews: 48, success: 38, time: 13 },
]
const pipelineData = [
  { month: "Jan", applied: 100, screened: 80, interviewed: 45, hired: 20 },
  { month: "Feb", applied: 90, screened: 70, interviewed: 38, hired: 18 },
  { month: "Mar", applied: 120, screened: 95, interviewed: 52, hired: 25 },
  { month: "Apr", applied: 80, screened: 60, interviewed: 35, hired: 15 },
  { month: "May", applied: 95, screened: 75, interviewed: 42, hired: 22 },
  { month: "Jun", applied: 110, screened: 85, interviewed: 48, hired: 24 },
]
interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: string
}
const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon, trend }) => (
  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
    <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-[#2E2883] rounded-lg">{icon}</div>
          {trend && (
            <span className="text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-[#2E2883]">{value}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)
export default function InterviewAnalytics() {
  const [selectedTab, setSelectedTab] = useState("overview")
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <BackgroundBeams />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="relative">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={100}
              className="absolute top-0 left-0 w-full h-full"
              particleColor="#2E2883"
            />
            <div className="relative flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-[#2E2883]">Interview Analytics</h1>
                <p className="text-gray-600 mt-2">Track and analyze interview performance and hiring trends</p>
              </div>
              <Button className="bg-[#2E2883] text-white hover:bg-[#1E1A5F]">
                <Download className="w-4 h-4 mr-2" /> Export Report
              </Button>
            </div>
          </div>
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Interviews"
              value="134"
              description="Conducted this month"
              icon={<Calendar className="w-6 h-6 text-white" />}
              trend="+12%"
            />
            <MetricCard
              title="Total Candidates"
              value="456"
              description="In the pipeline"
              icon={<Users className="w-6 h-6 text-white" />}
              trend="+8%"
            />
            <MetricCard
              title="Success Rate"
              value="38%"
              description="Converted Interviews"
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              trend="+3%"
            />
            <MetricCard
              title="Avg. Time to Hire"
              value="15 days"
              description="From first interview"
              icon={<Clock className="w-6 h-6 text-white" />}
              trend="-2 days"
            />
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interview Success Rates */}
            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#2E2883]">Interview Success Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="interviews" stroke="#2E2883" name="Total Interviews" />
                      <Line type="monotone" dataKey="success" stroke="#10B981" name="Successful Interviews" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Hiring Pipeline Trends */}
            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#2E2883]">Hiring Pipeline Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pipelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="applied"
                        stackId="1"
                        stroke="#2E2883"
                        fill="#2E2883"
                        fillOpacity={0.2}
                        name="Applied"
                      />
                      <Area
                        type="monotone"
                        dataKey="screened"
                        stackId="1"
                        stroke="#4338CA"
                        fill="#4338CA"
                        fillOpacity={0.2}
                        name="Screened"
                      />
                      <Area
                        type="monotone"
                        dataKey="interviewed"
                        stackId="1"
                        stroke="#6366F1"
                        fill="#6366F1"
                        fillOpacity={0.2}
                        name="Interviewed"
                      />
                      <Area
                        type="monotone"
                        dataKey="hired"
                        stackId="1"
                        stroke="#818CF8"
                        fill="#818CF8"
                        fillOpacity={0.2}
                        name="Hired"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Detailed Analytics */}
          <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#2E2883]">Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-1/2 text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
                  <TabsTrigger
                    value="overview"
                    className={`transition-colors ${selectedTab === "overview" ? "bg-blue-300" : "bg-transparent"}`}
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="interviewers"
                    className={`transition-colors ${selectedTab === "interviewers" ? "bg-blue-300" : "bg-transparent"}`}
                  >
                    Interviewer Performance
                  </TabsTrigger>
                  <TabsTrigger
                    value="trends"
                    className={`transition-colors ${selectedTab === "trends" ? "bg-blue-300" : "bg-transparent"}`}
                  >
                    Hiring Trends
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Overall interview success rate is trending upward with a 78% positive feedback rate. Average time
                      to hire has decreased by 2 days compared to last month.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-[#2E2883]">Top Performing Roles</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="text-sm text-gray-600">Frontend Developer (85%)</li>
                            <li className="text-sm text-gray-600">Product Manager (82%)</li>
                            <li className="text-sm text-gray-600">DevOps Engineer (80%)</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-[#2E2883]">Key Metrics</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="text-sm text-gray-600">Offer Acceptance Rate: 92%</li>
                            <li className="text-sm text-gray-600">Interview to Hire: 25%</li>
                            <li className="text-sm text-gray-600">Candidate Satisfaction: 4.5/5</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-[#2E2883]">Areas for Improvement</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="text-sm text-gray-600">Technical Assessment Duration</li>
                            <li className="text-sm text-gray-600">Feedback Turnaround Time</li>
                            <li className="text-sm text-gray-600">Interview Schedule Optimization</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="interviewers" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-[#2E2883]">Top Interviewers</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="text-sm text-gray-600">Sarah Chen (4.9/5)</li>
                            <li className="text-sm text-gray-600">Michael Rodriguez (4.8/5)</li>
                            <li className="text-sm text-gray-600">Priya Sharma (4.7/5)</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-[#2E2883]">Performance Metrics</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="text-sm text-gray-600">Avg. Interview Duration: 45 mins</li>
                            <li className="text-sm text-gray-600">Feedback Quality Score: 92%</li>
                            <li className="text-sm text-gray-600">Candidate NPS: 85</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="trends" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-[#2E2883]">Hiring Velocity</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="text-sm text-gray-600">Time to Hire: 15 days</li>
                            <li className="text-sm text-gray-600">Time to Fill: 30 days</li>
                            <li className="text-sm text-gray-600">Offer Acceptance Time: 3 days</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-[#2E2883]">Source Quality</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="text-sm text-gray-600">Employee Referrals: 45%</li>
                            <li className="text-sm text-gray-600">Direct Applications: 30%</li>
                            <li className="text-sm text-gray-600">Agency Hires: 25%</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-[#2E2883]">Diversity Metrics</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="text-sm text-gray-600">Gender Ratio: 45:55</li>
                            <li className="text-sm text-gray-600">Age Distribution: 25-45</li>
                            <li className="text-sm text-gray-600">International Hires: 15%</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}