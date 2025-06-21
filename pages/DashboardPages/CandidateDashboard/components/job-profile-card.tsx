"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Download, MapPin, Search, Briefcase, ClipboardList, Save, Edit, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/context/AuthContext"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Toast } from "@/components/ui/toast"
import { Link } from "react-router-dom"

const interviewServiceUrl =
  import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

// Define TypeScript interfaces
interface Skill {
  name: string;
  proficiency: number;
}

interface CandidateJob {
  // Define the structure based on your actual data
  id: number;
  jobId: number;
  jobTitle?: string;
  // Add other fields as needed
}

interface CandidateData {
  id?: number;
  userId?: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  resumeContent?: string;
  resumeSummary?: string;
  skills: Skill[];
  candidateJobs: CandidateJob[];
  // Additional fields for UI
  jobTitle?: string;
  salary?: string;
  language?: string;
  location?: string;
  workMode?: string;
  preferredRole?: string;
  preferredLocations?: string;
  resumeFileUrl?: string;
}

interface AuthContextType {
  token: string | null;
  user: {
    email: string;
    [key: string]: any;
  } | null;
}

interface ToastOptions {
  title: string;
  description: string;
  variant: "default" | "destructive" | "success";
}

// Toast function (since it's not imported)
const toast = (options: ToastOptions) => {
  // Implementation would depend on your toast library
  console.log(`Toast: ${options.title} - ${options.description}`);
};

export default function JobProfilePage() {
  const { token, user } = useAuth() as AuthContextType;
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [formData, setFormData] = useState<CandidateData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    jobTitle: "Software Engineer",
    salary: "$50,000/yr",
    language: "Fluent (English)",
    location: "Remote",
    workMode: "Remote/Onsite",
    preferredRole: "Software Engineer",
    preferredLocations: "Remote, Worldwide",
    skills: [
      { name: "JavaScript", proficiency: 90 },
      { name: "React.js", proficiency: 85 },
      { name: "Node.js", proficiency: 80 }
    ],
    candidateJobs: []
  });

  // Fetch candidate data from backend
  useEffect(() => {
    const fetchCandidate = async () => {
      if (!token || !user?.email) return;
      
      try {
        setLoading(true);
        // Updated to use the email endpoint directly
        const response = await fetch(`${interviewServiceUrl}/api/candidates/email/${user.email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch candidate data');
        }
        
        const data = await response.json();
        setCandidate(data);
        
        // Parse skills from resumeSummary if skills array is empty
        const parsedSkills = data.skills && data.skills.length > 0 
          ? data.skills 
          : extractSkillsFromResume(data.resumeSummary || data.resumeContent || "");
        
        // Initialize form data with fetched candidate data
        setFormData({
          id: data.id,
          userId: data.userId,
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          resumeContent: data.resumeContent || "",
          resumeSummary: data.resumeSummary || "",
          // Default values for UI fields if not present in API response
          jobTitle: data.jobTitle || "Software Engineer",
          salary: data.salary || "$50,000/yr",
          language: data.language || "Fluent (English)",
          location: data.location || "Remote",
          workMode: data.workMode || "Remote/Onsite",
          preferredRole: data.preferredRole || "Software Engineer",
          preferredLocations: data.preferredLocations || "Remote, Worldwide",
          skills: parsedSkills,
          candidateJobs: data.candidateJobs || []
        });
      } catch (err) {
        console.error("Error fetching candidate:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [token, user]);

  // Helper function to extract skills from resume summary
  const extractSkillsFromResume = (text: string): Skill[] => {
    // This is a simplified example - you might want to use a more sophisticated approach
    const commonSkills = [
      "Java", "Python", "JavaScript", "React.js", "Spring Boot", "AWS", "GCP", 
      "Cloud", "Software Engineering", "Coding", "Programming"
    ];
    
    const foundSkills: Skill[] = [];
    
    commonSkills.forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        // Calculate a random proficiency between 70-95 for extracted skills
        const proficiency = Math.floor(Math.random() * 25) + 70;
        foundSkills.push({ name: skill, proficiency });
      }
    });
    
    // If we didn't find any skills, add some default ones
    if (foundSkills.length === 0) {
      return [
        { name: "Software Development", proficiency: 85 },
        { name: "Programming", proficiency: 80 },
        { name: "Problem Solving", proficiency: 90 }
      ];
    }
    
    return foundSkills;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle skill changes
  const handleSkillChange = (index: number, field: keyof Skill, value: string) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: field === 'proficiency' ? parseInt(value) : value
    };
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!candidate?.id) return;
    
    try {
      const payload: CandidateData = {
        id: candidate.id,
        userId: candidate.userId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        // Include the resume content from the original data
        resumeContent: candidate.resumeContent,
        resumeSummary: candidate.resumeSummary,
        // Include additional fields that will be stored in the user preferences or metadata
        skills: formData.skills,
        candidateJobs: candidate.candidateJobs || []
      };

      const response = await fetch(`${interviewServiceUrl}/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedCandidate = await response.json();
      setCandidate(updatedCandidate);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "success",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleVisibilityToggle = () => {
    setIsVisible(!isVisible);
    // In a real implementation, you would send this to the backend
    toast({
      title: isVisible ? "Profile Hidden" : "Profile Visible",
      description: isVisible ? 
        "Your profile is now hidden from hiring companies" : 
        "Your profile is now visible to hiring companies",
      variant: "default",
    });
  };

  const downloadResume = () => {
    if (candidate?.resumeFileUrl) {
      window.open(candidate.resumeFileUrl, '_blank');
    } else {
      toast({
        title: "No Resume Found",
        description: "You haven't uploaded a resume yet, but we have your resume content saved in our system.",
        variant: "default",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Error loading profile: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#F3F4FF] to-white flex items-center justify-center px-4 py-4">
      <div className="flex w-full flex-col md:flex-row bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#2E2883] p-8 flex-[0.35] text-white"
        >
          <h2 className="text-2xl font-semibold mb-4">Your Profile Overview</h2>
          <p className="text-gray-200 mb-6">
            Keep your profile updated to attract more job opportunities tailored to your preferences and skills.
          </p>
          {/* <div className="flex items-center gap-2 mb-6">
            <Switch checked={isVisible} onCheckedChange={handleVisibilityToggle} />
            <label className="font-medium">Show my profile to hiring companies</label>
          </div> */}
          <Link to="/job-visibility-and-privacy">
          <Button variant="link" className="text-white hover:text-gray-300 mb-6">
            Learn more about profile visibility and privacy policy
          </Button>
          </Link>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link to="/jobs">
            <Button className="bg-[#1a1648] text-white hover:bg-[#1a1648]">
              Find More Jobs
              <Search className="ml-2 w-4 h-4" />
            </Button>
            </Link>
            <Button
              variant="outline"
              className="text-white bg-transparent border-white hover:bg-white hover:text-[#2E2883] hover:border-transparent"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel Edit" : "Update Profile"}
              {isEditing ? <X className="ml-2 w-4 h-4" /> : <Edit className="ml-2 w-4 h-4" />}
            </Button>
          </div>
          
          {/* Resume Summary Section */}
          {candidate?.resumeSummary && (
            <div className="mt-8 bg-[#1a1648] rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Resume Summary</h3>
              <p className="text-gray-300 text-sm">
                {candidate.resumeSummary.length > 250 
                  ? `${candidate.resumeSummary.substring(0, 250)}...` 
                  : candidate.resumeSummary}
              </p>
              {candidate.resumeSummary.length > 250 && (
                <Button variant="link" className="text-white p-0 mt-1 text-sm hover:text-gray-300">
                  Read more
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 flex-[0.65] bg-[#F9FAFF] overflow-y-auto"
        >
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#2E2883]">Edit Your Profile</h3>
              
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#2E2883]">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Title</label>
                    <Input
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="Job Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <Input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Salary</label>
                    <Input
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g. $50,000/yr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <Input
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder="e.g. Fluent (English)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Remote"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Work Mode</label>
                    <Input
                      name="workMode"
                      value={formData.workMode}
                      onChange={handleInputChange}
                      placeholder="e.g. Remote/Onsite"
                    />
                  </div>
                </div>
              </div>
              
              {/* Skills Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#2E2883]">Skills</h4>
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Input
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                      placeholder="Skill name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={skill.proficiency}
                      onChange={(e) => handleSkillChange(index, 'proficiency', e.target.value)}
                      className="w-20"
                    />
                    <span>%</span>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, { name: "", proficiency: 0 }]
                  }))}
                  className="mt-2"
                >
                  Add Skill
                </Button>
              </div>
              
              {/* Job Preferences */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#2E2883]">Job Preferences</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Role</label>
                  <Input
                    name="preferredRole"
                    value={formData.preferredRole}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Locations</label>
                  <Input
                    name="preferredLocations"
                    value={formData.preferredLocations}
                    onChange={handleInputChange}
                    placeholder="e.g. Remote, Worldwide"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  className="bg-[#2E2883] text-white hover:bg-[#1a1648]"
                  onClick={handleSubmit}
                >
                  Save Changes
                  <Save className="ml-2 w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="text-[#2E2883] bg-white border-[#2E2883] hover:bg-[#2E2883]/10"
                >
                  Cancel
                  <X className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-lg p-6 mb-8 shadow">
                <div className="flex flex-col sm:flex-row items-start justify-between">
                  {/* Profile Info */}
                  <div className="flex gap-4 mb-4 sm:mb-0">
                    <img
                      src="/src/assets/brain2.png"
                      alt="Profile"
                      width={75}
                      height={75}
                      className="rounded-full object-cover border-2 border-[#2E2883]"
                    />
                    <div>
                      <h3 className="font-semibold text-lg text-[#2E2883]">
                        {formData.fullName} - {formData.jobTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                        <span>{formData.salary}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formData.language}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {formData.location}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formData.workMode}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <div>Email: {formData.email}</div>
                        {formData.phoneNumber && <div>Phone: {formData.phoneNumber}</div>}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex bg-[#2E2883] text-white items-center gap-2"
                    onClick={downloadResume}
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </Button>
                </div>
              </div>

              {/* Skills Section */}
              <div className="mb-8">
                <h4 className="font-semibold text-[#2E2883] mb-3">Skills</h4>
                <div className="grid gap-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-primary">{skill.name}</span>
                      <Progress value={skill.proficiency} className="w-40" />
                      <span className="text-[#2E2883] font-medium">{skill.proficiency}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Preferences Section */}
              <div className="mb-8">
                <h4 className="font-semibold text-[#2E2883] mb-3">Job Preferences</h4>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <div className="flex items-center gap-4 mb-2">
                    <Briefcase className="w-5 h-5 text-[#2E2883]" />
                    <span className="font-medium text-primary">Preferred Role:</span>
                    <span className="text-primary">{formData.preferredRole}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <ClipboardList className="w-5 h-5 text-[#2E2883]" />
                    <span className="font-medium text-primary">Preferred Locations:</span>
                    <span className="text-primary">{formData.preferredLocations}</span>
                  </div>
                </div>
              </div>

              {/* Display Applied Jobs Count if available */}
              {formData.candidateJobs && formData.candidateJobs.length > 0 && (
                <div className="mb-8">
                  <div className="bg-[#2E2883]/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#2E2883] mb-2">Applications</h4>
                    <p className="text-gray-700">
                      You have applied to <span className="font-bold">{formData.candidateJobs.length}</span> jobs so far. 
                      Check your applications status below.
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/jobs">
                  <Button className="bg-[#2E2883] text-white hover:bg-[#1a1648]">
                    Apply for Jobs
                  </Button>
                </Link>
                <Link to="/job/view-applications">
                <Button variant="outline" className="text-[#2E2883] bg-white border-[#2E2883] hover:bg-[#2E2883]/10">
                  View Applied Jobs
                </Button>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}