"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, UserIcon, ClockIcon, CheckCircleIcon, XCircleIcon, SearchIcon, XIcon } from "lucide-react"

interface Session {
  id: string
  candidateName: string
  date: string
  duration: string
  status: string
}

const candidateSessions: Session[] = [
  { id: "CS001", candidateName: "John Doe", date: "2023-06-15", duration: "45 minutes", status: "Completed" },
  { id: "CS002", candidateName: "Jane Smith", date: "2023-06-16", duration: "30 minutes", status: "Incomplete" },
  { id: "CS003", candidateName: "Bob Johnson", date: "2023-06-17", duration: "60 minutes", status: "Completed" },
  { id: "CS004", candidateName: "Alice Brown", date: "2023-06-18", duration: "40 minutes", status: "Completed" },
  { id: "CS005", candidateName: "Charlie Davis", date: "2023-06-19", duration: "35 minutes", status: "Incomplete" },
]

export function DetailedAnalytics() {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const filteredSessions = candidateSessions.filter(
    (session) =>
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.candidateName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 bg-white rounded-lg shadow-sm p-4"
    >
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search by Session ID or Candidate Name"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full text-[#1e1b4b] border-gray-300 focus:border-[#4338ca] focus:ring-[#4338ca]"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <Button
          onClick={() => setSearchTerm("")}
          variant="outline"
          className="bg-white text-[#4338ca] border-[#4338ca] hover:bg-[#4338ca] hover:text-white transition-colors"
        >
          <XIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Table for larger screens */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent text-[#718EBF]">
              <TableHead className="font-semibold">Session ID</TableHead>
              <TableHead className="font-semibold">Candidate Name</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Duration</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.map((session) => (
              <TableRow key={session.id} className="text-[#1e1b4b] hover:bg-gray-50">
                <TableCell>{session.id}</TableCell>
                <TableCell>{session.candidateName}</TableCell>
                <TableCell>{session.date}</TableCell>
                <TableCell>{session.duration}</TableCell>
                <TableCell>
                  <Badge className="font-semibold p-2 rounded-full bg-green-500">
                    Completed
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => setSelectedSession(session)}
                    variant="outline"
                    className="bg-[#4338ca] rounded-full text-white hover:bg-[#1e1b4b] transition-colors"
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards for smaller screens */}
      <div className="md:hidden space-y-4">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-[#1e1b4b]">{session.candidateName}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
              <div className="flex items-center justify-between text-sm text-white">
                <span>Session ID:</span>
                <Badge variant="secondary">{session.id}</Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white">
                <CalendarIcon className="h-4 w-4" />
                <span>{session.date}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white">
                <ClockIcon className="h-4 w-4" />
                <span>{session.duration}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white">
                {session.status === "Completed" ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-400" />
                )}
                <span>{session.status}</span>
              </div>
              <Button
                onClick={() => setSelectedSession(session)}
                className="w-full bg-white text-[#4338ca] hover:bg-gray-100 transition-colors"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSession && (
        <CandidateSessionDetails session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </motion.div>
  )
}

function CandidateSessionDetails({ session, onClose }: { session: Session; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white">
          <CardTitle className="text-xl font-semibold">Session Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-[#4338ca]" />
            <span className="font-semibold text-[#1e1b4b]">{session.candidateName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-[#4338ca]" />
            <span className="text-[#1e1b4b]">{session.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-[#4338ca]" />
            <span className="text-[#1e1b4b]">{session.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            {session.status === "Completed" ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span className="text-[#1e1b4b]">{session.status}</span>
          </div>
          <Button onClick={onClose} className="w-full bg-[#4338ca] text-white hover:bg-[#1e1b4b] transition-colors">
            Close
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

