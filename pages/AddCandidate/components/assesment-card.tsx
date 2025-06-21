// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Clock, BookOpen, BarChart } from "lucide-react"

// interface AssessmentCardProps {
//   id: string
//   title: string
//   description: string
//   duration: string
//   difficulty: "Easy" | "Medium" | "Hard"
//   selected: boolean
//   onSelect: (id: string) => void
// }

// export function AssessmentCard({
//   id,
//   title,
//   description,
//   duration,
//   difficulty,
//   selected,
//   onSelect,
// }: AssessmentCardProps) {
//   return (
//     <Card
//       className={`cursor-pointer transition-all border-[#1e1b4b]/10 hover:shadow-md ${
//         selected ? "ring-2 ring-[#1e1b4b] bg-[#1e1b4b]/5" : ""
//       }`}
//       onClick={() => onSelect(id)}
//     >
//       <CardHeader className="pb-2">
//         <CardTitle className="flex justify-between items-center text-lg text-[#1e1b4b]">
//           {title}
//           <Badge
//             className={`ml-2 ${
//               difficulty === "Easy"
//                 ? "bg-green-100 text-green-800"
//                 : difficulty === "Medium"
//                   ? "bg-yellow-100 text-yellow-800"
//                   : "bg-red-100 text-red-800"
//             }`}
//           >
//             {difficulty}
//           </Badge>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <CardDescription className="mb-2 text-[#1e1b4b]/70">{description}</CardDescription>
//         <div className="flex items-center justify-between text-xs text-[#1e1b4b]/70">
//           <span className="flex items-center">
//             <Clock className="w-3 h-3 mr-1" />
//             {duration}
//           </span>
//           <span className="flex items-center">
//             <BookOpen className="w-3 h-3 mr-1" />
//             {difficulty === "Easy" ? "10" : difficulty === "Medium" ? "20" : "30"} Questions
//           </span>
//           <span className="flex items-center">
//             <BarChart className="w-3 h-3 mr-1" />
//             {difficulty === "Easy" ? "70%" : difficulty === "Medium" ? "80%" : "90%"} Pass Rate
//           </span>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, BarChart } from "lucide-react"

// Adjust the prop interface to match your new DTO.
interface AssessmentCardProps {
  id: number
  testName: string
  category: string
  timeLimit: number
  testType: string
  createdAt: string
  updatedAt: string
  questionLibraryIds: string[]
  stream: string
  tenantId: number
  selected: boolean
  onSelect: (id: number) => void
}

export function AssessmentCard({
  id,
  testName,
  category,
  timeLimit,
  testType,
  createdAt,
  updatedAt,
  questionLibraryIds,
  stream,
  tenantId,
  selected,
  onSelect,
}: AssessmentCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all border-[#1e1b4b]/10 hover:shadow-md ${
        selected ? "ring-2 ring-[#1e1b4b] bg-[#1e1b4b]/5" : ""
      }`}
      onClick={() => onSelect(id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg text-[#1e1b4b]">
          {testName}

          {/* Example: show category as a badge */}
          <Badge className="ml-2 bg-green-100 text-green-800">
            {category}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* You can display more details here. For example: */}
        <CardDescription className="mb-2 text-[#1e1b4b]/70">
          Stream: {stream} <br />
          Tenant: {tenantId}
        </CardDescription>

        <div className="flex items-center justify-between text-xs text-[#1e1b4b]/70">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeLimit} mins
          </span>
          <span className="flex items-center">
            <BookOpen className="w-3 h-3 mr-1" />
            {questionLibraryIds.length} Libraries
          </span>
          <span className="flex items-center">
            <BarChart className="w-3 h-3 mr-1" />
            {testType.toUpperCase()}
          </span>
        </div>

        <div className="mt-2 text-xs text-[#1e1b4b]/70">
          <p>Created: {new Date(createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(updatedAt).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

