"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle,
  Mail,
  CalendarClock,
  ArrowRight,
  Clock,
  Share2,
  Download,
  AlertCircle,
  Star
} from "lucide-react"
import { BackgroundGradient, SparklesCore } from "@/components/ui/aceternity"

export default function TestSubmissionConfirmation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0EAFF] via-white to-[#FFE5F9]">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Success Message Card */}
          <Card className="border-none shadow-xl bg-gradient-to-r from-[#2E2883] to-[#4338CA] overflow-hidden">
            <CardContent className="p-12">
              <div className="relative">
                <div className="text-center space-y-4 relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-white">
                    Assessment Complete!
                  </h1>
                  <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                    Great work on completing your assessment. Your dedication shows in every response.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* <BackgroundGradient className="rounded-2xl"> */}
              <Card className="border-none bg-gradient-to-br from-[#D9E7FF] to-white h-full">
                <CardContent className="p-8">
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-[#2E2883] flex items-center justify-center mb-6">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#2E2883] mb-4">
                      Results Coming Soon
                    </h3>
                    <p className="text-gray-600">
                      Expect your detailed results within 48 hours via email. We'll provide comprehensive feedback on your performance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            {/* </BackgroundGradient> */}

            {/* <BackgroundGradient className="rounded-2xl"> */}
              <Card className="border-none bg-gradient-to-br from-[#FFE5F9] to-white h-full">
                <CardContent className="p-8">
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-[#E535AB] flex items-center justify-center mb-6">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#E535AB] mb-4">
                      Your Achievement
                    </h3>
                    <p className="text-gray-600">
                      You've completed all sections of the assessment, demonstrating your skills and expertise.
                    </p>
                  </div>
                </CardContent>
              </Card>
            {/* </BackgroundGradient> */}
          </div>

          {/* Important Information */}
          <Card className="border-none shadow-lg bg-gradient-to-r from-[#F0F7FF] to-white">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#60A5FA] flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2563EB] mb-2">
                    What's Next?
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                      Check your email (including spam folder) for results
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                      Results will be evaluated by our expert team
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                      You'll receive detailed feedback on your performance
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button 
              className="bg-gradient-to-r from-[#2E2883] to-[#4338CA] hover:opacity-90 text-white p-8 rounded-xl h-auto"
            >
              <Download className="w-5 h-5 mr-3" />
              Download Assessment Summary
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#E535AB] to-[#D946EF] hover:opacity-90 text-white p-8 rounded-xl h-auto"
            >
              <Share2 className="w-5 h-5 mr-3" />
              Share Your Achievement
            </Button>
          </div>

          {/* Return Link */}
          <div className="text-center pt-8">
            <Button
              variant="ghost"
              className="text-[#2E2883] hover:bg-[#2E2883]/10 group"
            >
              Return to Dashboard
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}