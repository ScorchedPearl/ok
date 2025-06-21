"use client"

import React from "react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { name: "Jan", incidents: 40, resolved: 35 },
  { name: "Feb", incidents: 30, resolved: 28 },
  { name: "Mar", incidents: 50, resolved: 45 },
  { name: "Apr", incidents: 28, resolved: 25 },
  { name: "May", incidents: 39, resolved: 35 },
  { name: "Jun", incidents: 43, resolved: 40 },
]

export function MalpracticeIncidentsChart() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="incidents" stroke="#4338ca" strokeWidth={2} name="Total Incidents" />
          <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Resolved Incidents" />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

