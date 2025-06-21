"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Share2,  Search, UserPlus } from "lucide-react"

interface Job {
  id: string
  title: string
  department: string
  location: string
  locationType: string
  workType: string
  owner: {
    name: string
    avatar: string
  }
}

const jobs: Job[] = [
  {
    id: "1",
    title: "Staff Customer Success Manager",
    department: "Customer Success, CSM",
    location: "United States",
    locationType: "Remote",
    workType: "Full-Time",
    owner: {
      name: "Kiani Huey",
      avatar: "K",
    },
  },
  {
    id: "2",
    title: "Manager, Digital Customer Experience & Content Strategy",
    department: "Customer Success, General",
    location: "Bengaluru",
    locationType: "On-site",
    workType: "Full-Time",
    owner: {
      name: "Sudhindra MG Rao",
      avatar: "S",
    },
  },
  {
    id: "3",
    title: "Delivery Manager (Professional Services)",
    department: "Customer Success, Solutions & Services",
    location: "Greater London, UK",
    locationType: "On-site",
    workType: "Full-Time",
    owner: {
      name: "Sudhindra MG Rao",
      avatar: "S",
    },
  },
]

export default function ReferralsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocationType, setSelectedLocationType] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedWorkType, setSelectedWorkType] = useState<string>("")

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocationType = !selectedLocationType || selectedLocationType === "Any" || job.locationType === selectedLocationType
    const matchesLocation = !selectedLocation || selectedLocation === "Any" || job.location === selectedLocation
    const matchesDepartment = !selectedDepartment || selectedDepartment === "Any" || job.department === selectedDepartment
    const matchesWorkType = !selectedWorkType || selectedWorkType === "Any" || job.workType === selectedWorkType

    return matchesSearch && matchesLocationType && matchesLocation && matchesDepartment && matchesWorkType
  })

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white">
      <BackgroundBeams />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <h1 className="text-4xl font-bold text-[#2E2883]">Referrals</h1>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2 ">
                <Share2 className="w-4 h-4" />
                SHARE REFERRAL LINK
              </Button>
              <Button className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                REFER CANDIDATE
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs defaultValue="jobs" className="space-y-6">
                <TabsList className="bg-slate-200">
                  <TabsTrigger value="referred" className="text-gray-700">Referred candidates</TabsTrigger>
                  <TabsTrigger value="jobs" className="text-gray-700">Jobs</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="space-y-6">
                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search job postings"
                        className="pl-8 text-black"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={selectedLocationType} onValueChange={setSelectedLocationType}>
                      <SelectTrigger className="text-black">
                        <SelectValue placeholder="Location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="text-black">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                        <SelectItem value="Greater London, UK">Greater London, UK</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="text-black">
                        <SelectValue placeholder="Department/teams" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="Customer Success, CSM">Customer Success, CSM</SelectItem>
                        <SelectItem value="Customer Success, General">Customer Success, General</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedWorkType} onValueChange={setSelectedWorkType}>
                      <SelectTrigger className="text-black">
                        <SelectValue placeholder="Work type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Jobs Table */}
                  <div className="rounded-md ">
                    <Table>
                      <TableHeader className="hover:bg-inherit">
                        <TableRow className="hover:bg-inherit">
                          <TableHead className="w-[300px] text-[#2E2883] font-semibold">JOB POSTING</TableHead>
                          <TableHead className="w-[300px] text-[#2E2883] font-semibold">DEPT AND TEAM</TableHead>
                          <TableHead className="w-[300px] text-[#2E2883] font-semibold">LOCATIONS</TableHead>
                          <TableHead className="w-[300px] text-[#2E2883] font-semibold">LOCATION TYPE</TableHead>
                          <TableHead className="w-[300px] text-[#2E2883] font-semibold">WORK TYPE</TableHead>
                          <TableHead className="w-[300px] text-[#2E2883] font-semibold">OWNER</TableHead>
                          <TableHead className="w-[300px] text-[#2E2883] font-semibold"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredJobs.map((job) => (
                          <TableRow key={job.id} className="hover:bg-inherit">
                            <TableCell className="font-medium text-gray-700" >{job.title}</TableCell>
                            <TableCell className="font-medium text-gray-700">{job.department}</TableCell>
                            <TableCell className="font-medium text-gray-700">{job.location}</TableCell>
                            <TableCell className="font-medium text-gray-700">{job.locationType}</TableCell>
                            <TableCell className="font-medium text-gray-700">{job.workType}</TableCell>
                            <TableCell className="font-medium text-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#2E2883] text-white flex items-center justify-center">
                                  {job.owner.avatar}
                                </div>
                                <span>{job.owner.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white">
                                REFER CANDIDATE
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="referred">
                  <div className="text-center py-8 text-gray-500">No referred candidates yet</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
