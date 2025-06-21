"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from 'lucide-react'
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/utils/api"
import { UserProfile } from "@/context/types"

interface AddQuestionDialogProps {
  libraryId: string
  onQuestionAdded: () => void
}

const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || 'http://localhost:8004';
const partnerServiceUrl = import.meta.env.VITE_PARTNER_SERVICE_URL || 'http://localhost:8008';

export function AddQuestionDialog({ libraryId, onQuestionAdded }: AddQuestionDialogProps) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false)
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [formData, setFormData] = useState({
    question_type: "",
    question_text: "",
    options: {
      A: "",
      B: "",
      C: "",
    },
    correct_option: "",
    difficulty_level: "",
  })

  // Fetch partner profile using the API
  useEffect(() => {
    async function fetchPartnerProfile() {
      if (!token) return;
      
      try {
        const profile = await api.auth.getPartnerProfile(token);
        setPartnerProfile(profile);
      } catch (error) {
        console.error("Error fetching partner profile:", error);
        toast.error("Error loading profile data");
      } finally {
        setProfileLoading(false);
      }
    }
    
    fetchPartnerProfile();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await fetch(`${questionBankServiceUrl}/libraries/${libraryId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          created_by: 101, // Hardcoded for example
          created_at: new Date().toISOString(),
          tenant_user_id: "14545545", // Hardcoded for example
        }),
      });
  
      if (response.ok) {
        // Determine points based on difficulty
        let pointsAwarded = 1; // Default for easy
        if (formData.difficulty_level === "Medium") {
          pointsAwarded = 2;
        } else if (formData.difficulty_level === "Hard") {
          pointsAwarded = 3;
        }
        
        // Record activity for question creation
        await fetch(`${partnerServiceUrl}/api/activities/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date().toISOString(),
            type: "Question Addition",
            description: `Added ${formData.difficulty_level.toLowerCase()} question to library`,
            points: pointsAwarded,
            partnerId: partnerProfile?.userId // Hardcoded for demo, should be dynamic in production
          })
        });
        
        setIsOpen(false);
        onQuestionAdded();
        setFormData({
          question_type: "",
          question_text: "",
          options: { A: "", B: "", C: "" },
          correct_option: "",
          difficulty_level: "",
        });
        
        toast.success(`Question added successfully! Earned ${pointsAwarded} points.`);
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} >
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Newsdsd Question</DialogTitle>
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
              <Label htmlFor="question_text">Question idhsidisd Text</Label>
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
                  <Label htmlFor={`option_${key}`} className="w-8">{key}:</Label>
                  <Input
                    id={`option_${key}`}
                    value={formData.options[key as keyof typeof formData.options]}
                    onChange={(e) => setFormData({
                      ...formData,
                      options: { ...formData.options, [key]: e.target.value }
                    })}
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
                    <SelectItem key={key} value={key}>Option {key}</SelectItem>
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
          </div>
          <Button type="submit" className="w-full">Add Question</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
