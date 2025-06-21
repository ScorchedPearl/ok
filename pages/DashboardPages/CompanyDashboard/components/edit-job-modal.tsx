import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
 
import { useAuth } from "@/context/AuthContext";

// Job interface matching the backend model
interface Job {
  id: string;
  title: string;
  department: string;
  companyName: string; // Added for API compatibility
  location: string;
  employmentType: string;
  description: string;
  recruiterId: string;
  testId: number;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onSave?: (updatedJob: Job) => void; // Optional since we handle API directly
  onSuccess?: () => void; // Callback for after successful update
}

const employmentTypeOptions = [
  "Full-time", 
  "Part-time", 
  "Contract", 
  "Temporary", 
  "Internship", 
  "Remote"
];

const EditJobModal: React.FC<EditJobModalProps> = ({ 
  isOpen, 
  onClose, 
  job, 
  onSave,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Job>({...job});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = useAuth();
  
  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

  // Update form data when job changes
  useEffect(() => {
    // Ensure both company and companyName fields are synced
    const updatedJob = {...job};
    
      updatedJob.companyName = job.companyName;
    
    
    setFormData(updatedJob);
    setError(null); // Clear errors when job changes
  }, [job]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Special handling for company/companyName fields to keep them in sync
      if (name === 'company') {
        return {
          ...prev,
          company: value,
          companyName: value // Keep both fields in sync
        };
      } else if (name === 'companyName') {
        return {
          ...prev,
          companyName: value,
          company: value // Keep both fields in sync
        };
      }
      
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateJob = async (jobData: Job): Promise<Job> => {
    if (!token) {
      throw new Error("Authentication token not found");
    }
    
    // Prepare the data for the API - ensure both company and companyName are consistent
    const apiJobData = {
      ...jobData,
      companyName: jobData.companyName // Ensure the backend field is set
    };
    
    const response = await fetch(`${interviewServiceUrl}/api/jobs/${jobData.id}`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiJobData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to update job");
    }
    
    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Make the API call directly
      const updatedJob = await updateJob(formData);
      
      // Call the optional onSave callback if provided
      if (onSave) {
        onSave(updatedJob);
      }
 
      
      // Call optional onSuccess callback (for refreshing data, etc.)
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error updating job:", error);
      setError(error instanceof Error ? error.message : "Failed to update job");
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Job</DialogTitle>
          <DialogDescription>
            Update job information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter job title"
                required
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter department"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company || formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) => handleSelectChange("employmentType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed job description"
              className="h-32"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobModal;