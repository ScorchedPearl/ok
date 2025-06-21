"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Info, Lock } from "lucide-react"
import { Link } from "react-router-dom"
import ExamHeader from "./ExamHeader"

const accuracyLevels = [
  { value: 1, label: "Not at all accurate" },
  { value: 2, label: "Slightly accurate" },
  { value: 3, label: "Moderately accurate" },
  { value: 4, label: "Accurate" },
  { value: 5, label: "Very accurate" }
]

export default function ExamFeedback() {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")

  return (
    <div className="min-h-screen bg-white">
      <ExamHeader />
      
      <main className="container max-w-3xl mx-auto py-12 px-4">
        <Card className="bg-[#F5F7FF] border-none shadow-lg">
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header Section */}
              <header className="space-y-2">
                <h1 className="text-2xl font-bold text-[#2E2883]">
                  You've finished the test
                </h1>
                <p className="text-[#4B5563]">
                  We'd like to know what you think about the test you just completed, regardless of how you think you did.
                </p>
              </header>

              <section className="space-y-6">
                {/* Rating Section */}
                <div className="space-y-4">
                
                  
                  {/* Info Box */}
                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 border border-[#E5E7EB]">
                    <Info className="w-5 h-5 text-[#2E2883] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#4B5563]">
                      Your feedback is anonymous. We analyze it alongside all other feedback to improve the test. No one involved in reviewing your performance has access to it.
                    </p>
                  </div>

                  {/* Rating Buttons */}
                  <div className="grid grid-cols-5 gap-3 pt-2">
                    {accuracyLevels.map((level) => (
                      <motion.button
                        key={level.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRating(level.value)}
                        className={`
                          relative p-4 rounded-xl border-2 transition-colors duration-200
                          flex flex-col items-center gap-3
                          ${selectedRating === level.value
                            ? 'border-[#2E2883] bg-[#EEF2FF]'
                            : 'border-[#E5E7EB] hover:border-[#2E2883]/30 hover:bg-white'
                          }
                        `}
                      >
                        <span className={`
                          text-2xl font-bold transition-colors
                          ${selectedRating === level.value ? 'text-[#2E2883]' : 'text-[#374151]'}
                        `}>
                          {level.value}
                        </span>
                        <span className="text-xs text-center text-[#6B7280] font-medium">
                          {level.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Feedback Section */}
            
                {/* Feedback Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-[#2E2883]">
                    What can we do, if anything, to improve the test? (optional)
                  </h2>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please enter your suggestions..."
                    className="min-h-[120px] bg-white border-[#E5E7EB] 
                             focus:border-[#2E2883] focus:ring-[#2E2883]/10 
                             text-gray-900 placeholder:text-gray-500
                             resize-none rounded-xl"
                  />
                </div>
              </section>
              

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-4">
                <Link to="/assessment/result">
                  <Button 
                    className={`
                      px-8 py-6 rounded-xl text-lg font-medium
                      transition-all duration-200 
                      disabled:cursor-not-allowed disabled:opacity-50
                      ${selectedRating
                        ? 'bg-[#2E2883] hover:bg-[#2E2883]/90 text-white shadow-md hover:shadow-lg'
                        : 'bg-[#E5E7EB] text-[#9CA3AF]'
                      }
                    `}
                    disabled={!selectedRating}
                  >
                    <span>Submit Feedback</span>
                    <ArrowRight className={`
                      ml-2 w-5 h-5 transition-transform duration-200
                      ${selectedRating ? 'group-hover:translate-x-1' : ''}
                    `} />
                  </Button>
                </Link>
              </div>

              {/* Footer */}
              <footer className="flex items-center gap-2 justify-center text-sm text-[#6B7280]">
                <Lock className="w-4 h-4" />
                <span>Your feedback is secure and anonymous</span>
              </footer>
            </motion.div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}