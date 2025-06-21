import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import {  Edit } from "lucide-react";
import { Toast } from "@/components/ui/toast";

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departmentName: string;
  allDepartments: string[];
}

export default function EditDepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  departmentName,
  allDepartments,
}: EditDepartmentModalProps) {
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;
  
  let authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL||  "http://localhost:8005"; 
  let interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL || "http://localhost:8007";

  // Set initial department name when modal opens
  useEffect(() => {
    if (isOpen && departmentName) {
      setNewDepartmentName(departmentName);
    }
  }, [isOpen, departmentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDepartmentName.trim()) {
      Toast({
        title: "Error",
        variant: "destructive",
      });
      return;
    }

    if (newDepartmentName.trim() === departmentName) {
      // No changes made
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      // Create updated department list
      const updatedDepartments = allDepartments.map(dept => 
        dept === departmentName ? newDepartmentName.trim() : dept
      );

      // Call the PutMapping endpoint to update all departments
      const response = await fetch(`${authServiceUrl}/tenant/${tenantId}/departments`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departments: updatedDepartments
        }),
      });

      // First call the API to update department name in jobs
      const updateDepartmentResponse = await fetch(
        `${interviewServiceUrl}/api/jobs/tenant/${tenantId}/department/update`,
        {
          method: "PUT",
          headers: {
        "Authorization": `Bearer ${token?.access_token}`,
        "Content-Type": "application/json",
          },
          body: JSON.stringify({
        oldDepartment: departmentName,
        newDepartment: newDepartmentName.trim()
          }),
        }
      );

      if (!updateDepartmentResponse.ok) {
        throw new Error("Failed to update department name in jobs");
      }

      // Get updated jobs
      const updatedJobs = await updateDepartmentResponse.json();
      console.log("Jobs with updated department:", updatedJobs);

      if (!response.ok) {
        throw new Error("Failed to update department");
      }

      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating department:", error);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#4338ca]">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold">Edit Department</DialogTitle>
          </div>
          <DialogDescription>
            Update the department name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="newDepartmentName" className="text-right font-medium text-gray-700 col-span-1">
                Name
              </label>
              <div className="col-span-3">
                <Input
                  id="newDepartmentName"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="Enter department name"
                  className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border border-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white font-medium"
              style={{
                background: "linear-gradient(to bottom right, #1e1b4b, #4338ca)",
              }}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}