import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EnquiriesTable } from "@/components/enquiry/EnquiriesTable"
import { EnquiryDetails } from "@/components/enquiry/EnquiryDetails"
import { demoEnquiries } from "@/utils/demoData"
import { PlanEnquiry, EnquiryStatus } from "@/context/types"

export default function EnquiriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEnquiry, setSelectedEnquiry] = useState<PlanEnquiry | null>(null)
  const [enquiries, setEnquiries] = useState<PlanEnquiry[]>(demoEnquiries)
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | "ALL">("ALL")

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = 
      enquiry.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.companyName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || enquiry.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (enquiryId: number, newStatus: EnquiryStatus) => {
    setEnquiries(prev => prev.map(enquiry => 
      enquiry.id === enquiryId 
        ? { 
            ...enquiry, 
            status: newStatus,
            lastUpdatedAt: new Date().toISOString()
          }
        : enquiry
    ))
  }

  const handleAssign = (enquiryId: number, assignedTo: string) => {
    setEnquiries(prev => prev.map(enquiry => 
      enquiry.id === enquiryId
        ? {
            ...enquiry,
            assignedTo,
            lastUpdatedAt: new Date().toISOString()
          }
        : enquiry
    ))
  }

  const handleUpdateNotes = (enquiryId: number, notes: string) => {
    setEnquiries(prev => prev.map(enquiry => 
      enquiry.id === enquiryId
        ? {
            ...enquiry,
            internalNotes: notes,
            lastUpdatedAt: new Date().toISOString()
          }
        : enquiry
    ))
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Plan Enquiries</h1>
        <div className="flex gap-4">
          <select 
            className="rounded-md border p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EnquiryStatus | "ALL")}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search enquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <EnquiriesTable 
            enquiries={filteredEnquiries}
            onSelect={setSelectedEnquiry}
            selectedId={selectedEnquiry?.id}
            onStatusChange={handleStatusChange}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedEnquiry ? (
            <EnquiryDetails 
              enquiry={selectedEnquiry}
              onStatusChange={handleStatusChange}
              onAssign={handleAssign}
              onUpdateNotes={handleUpdateNotes}
            />
          ) : (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              Select an enquiry to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}