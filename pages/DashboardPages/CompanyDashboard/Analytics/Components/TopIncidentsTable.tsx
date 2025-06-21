"use client"

import React from "react"
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const topIncidents = [
  { id: 1, description: "Unauthorized access to patient records", category: "Ethical Violation", severity: "High" },
  { id: 2, description: "Failure to obtain informed consent", category: "Procedural Error", severity: "Medium" },
  { id: 3, description: "Improper disposal of medical waste", category: "Compliance Breach", severity: "High" },
]

export function TopIncidentsTable() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Severity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topIncidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium text-[#1e1b4b]">{incident.description}</TableCell>
              <TableCell className="text-[#1e1b4b]">{incident.category}</TableCell>
              <TableCell className="text-[#1e1b4b]">
                <Badge
                >
                  {incident.severity}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  )
}

