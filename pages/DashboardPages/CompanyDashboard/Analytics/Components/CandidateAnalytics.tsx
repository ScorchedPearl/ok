"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MalpracticeIncidentsChart } from "./MalpracticeIncidentCharts"
import { TopIncidentsTable } from "./TopIncidentsTable"
import { BestPractices } from "./BestPractices"
import { TrendAnalysis } from "./TrendAnalysis"
import { DetailedAnalytics } from "./DetailedAnalytics"

export function CandidateAnalytics() {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="sm:container mx-auto py-8 ">

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8 ">
      <TabsList className="grid w-full grid-cols-2 lg:w-1/2 lg:mx-auto text-white bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
      <TabsTrigger
        value="overview"
        className={`transition-colors ${
          selectedTab === 'overview' ? 'bg-blue-300' : 'bg-transparent'
        }`}
        onClick={() => setSelectedTab('overview')}
      >
        Overview
      </TabsTrigger>
      <TabsTrigger
        value="detailed"
        className={`transition-colors  ${
          selectedTab === 'detailed' ? 'bg-blue-300' : 'bg-transparent'
        }`}
        onClick={() => setSelectedTab('detailed')}
      >
        Detailed Analysis
      </TabsTrigger>
    </TabsList>
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#1e1b4b]">Malpractice Incidents</CardTitle>
                <CardDescription className="text-[#1e1b4b]">Total incidents and trend over time</CardDescription>
              </CardHeader>
              <CardContent className="sm:px-0">
                <MalpracticeIncidentsChart />
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-[#1e1b4b]">Trend Analysis</CardTitle>
                <CardDescription className="text-[#1e1b4b]">Malpractice patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendAnalysis />
              </CardContent>
            </Card>


          </div>

          
        </TabsContent>

        <TabsContent value="detailed">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#1e1b4b]">Detailed Candidate Sessions</CardTitle>
              <CardDescription className="text-[#1e1b4b]">Review individual candidate session details</CardDescription>
            </CardHeader>
            <CardContent>
               <DetailedAnalytics/>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

