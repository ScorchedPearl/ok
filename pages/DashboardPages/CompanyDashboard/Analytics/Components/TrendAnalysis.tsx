"use client"

import React from "react"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Week 1", ethicalViolations: 4, proceduralErrors: 3, documentationIssues: 2, complianceBreaches: 1 },
  { name: "Week 2", ethicalViolations: 3, proceduralErrors: 4, documentationIssues: 3, complianceBreaches: 2 },
  { name: "Week 3", ethicalViolations: 5, proceduralErrors: 2, documentationIssues: 4, complianceBreaches: 1 },
  { name: "Week 4", ethicalViolations: 2, proceduralErrors: 5, documentationIssues: 3, complianceBreaches: 3 },
]

export function TrendAnalysis() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="ethicalViolations" stackId="1" stroke="#4338ca" fill="#4338ca" />
          <Area type="monotone" dataKey="proceduralErrors" stackId="1" stroke="#22c55e" fill="#22c55e" />
          <Area type="monotone" dataKey="documentationIssues" stackId="1" stroke="#eab308" fill="#eab308" />
          <Area type="monotone" dataKey="complianceBreaches" stackId="1" stroke="#ef4444" fill="#ef4444" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

