"use client"

import { useState, useEffect, useContext } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, AlertCircle, BookOpen, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AssessmentContext } from "@/context/AssessmentContext"

export default function ExamPre() {
  const { testName, testCategory, testType } = useContext(AssessmentContext)
  const navigate = useNavigate()
  const [seconds, setSeconds] = useState(10)

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (seconds === 0) {
      navigate("/assessment/que")
    }
  }, [seconds, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-[#2E2883]">Assessment Platform</h1>
              <div className="h-6 w-px bg-gray-200" />
              <span className="text-gray-600">{testName || "Assessment"}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] rounded-full">
                <span className="text-sm font-medium text-[#2E2883]">Preparation</span>
                <div className="w-24 h-1.5 bg-[#2E2883]/10 rounded-full">
                  <motion.div
                    className="h-full bg-[#2E2883] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white border-none shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-gray-600">Preparing your assessment</p>
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-[#2E2883]" />
                      <h1 className="text-2xl font-bold text-[#2E2883]">
                        {testName || "Assessment"}
                      </h1>
                    </div>
                  </div>

                  {/* Test Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      <p className="font-medium text-[#2E2883]">
                        {testCategory || "General Assessment"}
                      </p>
                    </div>
                    <div className="bg-[#F8FAFC] p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Type</p>
                      <p className="font-medium text-[#2E2883]">
                        {testType || "Standard"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Points */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-[#F8FAFC] p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-[#2E2883] mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-[#2E2883]">Assessment Guidelines</p>
                      <p className="text-gray-600 text-sm">
                        Read each question carefully and ensure you understand it before answering.
                        Take your time but be mindful of the timer for timed sections.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-[#F8FAFC] p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-[#2E2883] mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-[#2E2883]">Technical Requirements</p>
                      <p className="text-gray-600 text-sm">
                        Ensure you have a stable internet connection. Keep your browser window active 
                        throughout the assessment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timer Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#2E2883]" />
                    <p className="text-gray-700">
                      Your assessment will begin in{" "}
                      <span className="font-bold text-[#2E2883]">
                        {seconds} seconds
                      </span>
                    </p>
                  </div>

                  {/* Warning Message */}
                  <div className="flex items-start gap-3 bg-[#FEF3C7] p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                    <p className="text-[#92400E] text-sm leading-relaxed">
                      Please remain on this screen. Once started, the assessment timer cannot 
                      be paused and will continue even if you close your browser. Ensure you're 
                      ready to begin before the countdown completes.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Good luck with your assessment!
                    </p>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-sm">Secured Assessment Platform</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}