"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function OfferAnalysis() {
  const offerComparisons = [
    { category: "Salary", percentage: 85 },
    { category: "Benefits", percentage: 75 },
    { category: "Work-Life Balance", percentage: 90 },
    { category: "Career Growth", percentage: 80 },
  ]

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
      <CardHeader className="border-b border-[#E2E8F0] pb-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-[#6366F1] bg-opacity-10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <CardTitle className="text-[#1E293B] text-xl font-bold">Offer Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          {offerComparisons.map((comparison, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-[#1E293B]">{comparison.category}</span>
                <span className="text-sm font-medium text-[#6366F1]">{comparison.percentage}%</span>
              </div>
              <Progress value={comparison.percentage} className="h-2" />
            </div>
          ))}
        </div>

        <div className="bg-[#F1F5F9] p-4 rounded-lg">
          <h3 className="text-[#1E293B] font-medium mb-2">Overall Analysis</h3>
          <p className="text-sm text-[#64748B]">
            Based on the offers you've received, you're in a strong position. The salary offers are competitive, and the
            benefits packages are above average for your industry. Consider factors beyond compensation, such as
            work-life balance and career growth opportunities, when making your decision.
          </p>
        </div>

        <div>
          <h3 className="text-[#1E293B] font-medium mb-2">Next Steps</h3>
          <ul className="list-disc list-inside text-sm text-[#64748B] space-y-1">
            <li>Review each offer in detail</li>
            <li>Consider your long-term career goals</li>
            <li>Negotiate if necessary</li>
            <li>Make your decision within the given timeframe</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

