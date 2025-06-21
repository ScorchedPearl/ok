import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CandidateSessionDetailsProps {
  session: {
    id: string
    candidateName: string
    date: string
    duration: string
    status: string
  }
  onClose: () => void
}

export function CandidateSessionDetails({ session, onClose }: CandidateSessionDetailsProps) {
  // Mock detailed data for a candidate session
  const detailedData = {
    technicalSkills: {
      programmingLanguages: ["JavaScript", "Python", "Java"],
      frameworks: ["React", "Node.js", "Django"],
      databases: ["MySQL", "MongoDB"],
    },
    softSkills: ["Communication", "Problem Solving", "Teamwork"],
    assessmentScores: {
      technicalAssessment: 85,
      codingChallenge: 92,
      behavioralInterview: 88,
    },
    notes:
      "Strong technical skills, particularly in web development. Shows good problem-solving abilities and communicates clearly. Could improve on system design concepts.",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {session.candidateName} - Session {session.id}
            </CardTitle>
            <CardDescription>
              Date: {session.date} | Duration: {session.duration} | Status: {session.status}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Technical Skills</h3>
            <ul className="list-disc pl-5">
              <li>Programming Languages: {detailedData.technicalSkills.programmingLanguages.join(", ")}</li>
              <li>Frameworks: {detailedData.technicalSkills.frameworks.join(", ")}</li>
              <li>Databases: {detailedData.technicalSkills.databases.join(", ")}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Soft Skills</h3>
            <ul className="list-disc pl-5">
              {detailedData.softSkills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Assessment Scores</h3>
            <ul className="list-disc pl-5">
              <li>Technical Assessment: {detailedData.assessmentScores.technicalAssessment}%</li>
              <li>Coding Challenge: {detailedData.assessmentScores.codingChallenge}%</li>
              <li>Behavioral Interview: {detailedData.assessmentScores.behavioralInterview}%</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Notes</h3>
            <p>{detailedData.notes}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

