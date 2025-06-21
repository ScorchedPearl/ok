import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const topCandidates = [
  { id: 1, name: "John Doe", flagReason: "Background Check", urgency: "High" },
  { id: 2, name: "Jane Smith", flagReason: "Skills Mismatch", urgency: "Medium" },
  { id: 3, name: "Bob Johnson", flagReason: "Experience Gap", urgency: "Low" },
]

export function TopCandidatesTable() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Flag Reason</TableHead>
            <TableHead>Urgency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topCandidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>{candidate.name}</TableCell>
              <TableCell>{candidate.flagReason}</TableCell>
              <TableCell>{candidate.urgency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  )
}

