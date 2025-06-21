"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"

interface EditQuestionDialogProps {
  question: any
  libraryId: string
  onQuestionEdited: () => void
}

const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || 'http://localhost:8004';
const partnerServiceUrl = import.meta.env.VITE_PARTNER_SERVICE_URL || 'http://localhost:8008';

export function EditQuestionDialog({ question, libraryId, onQuestionEdited }: EditQuestionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    question_type: question.question_type,
    question_text: question.question_text,
    options: question.options,
    correct_option: question.correct_option,
    difficulty_level: question.difficulty_level,
    time_required: question.time_required || 30, // new field for time required (minutes)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${questionBankServiceUrl}/libraries/${libraryId}/questions/${question.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          created_by: question.created_by,
          created_at: question.created_at,
          tenant_user_id: question.tenant_user_id,
        }),
      })

      if (response.ok) {
        setIsOpen(false)
        onQuestionEdited()
      }
    } catch (error) {
      console.error("Error editing question:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="question_type">Question Type</Label>
              <Input
                id="question_type"
                value={formData.question_type}
                onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="question_text">Question Text</Label>
              <Textarea
                id="question_text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Options</Label>
              {Object.keys(formData.options).map((key) => (
                <div key={key} className="flex gap-2 items-center">
                  <Label htmlFor={`option_${key}`} className="w-8">
                    {key}:
                  </Label>
                  <Input
                    id={`option_${key}`}
                    value={formData.options[key]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        options: { ...formData.options, [key]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="correct_option">Correct Option</Label>
              <Select
                value={formData.correct_option}
                onValueChange={(value) => setFormData({ ...formData, correct_option: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(formData.options).map((key) => (
                    <SelectItem key={key} value={key}>
                      Option {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="difficulty_level">Difficulty Level</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="time_required">Time Required (minutes)</Label>
              <Input
                id="time_required"
                type="number"
                min="1"
                value={formData.time_required}
                onChange={(e) =>
                  setFormData({ ...formData, time_required: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}