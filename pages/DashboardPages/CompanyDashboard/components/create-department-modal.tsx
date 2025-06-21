import React, { useState } from "react";
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
import { Building2 } from "lucide-react";
import { Toast } from "@/components/ui/toast";

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDepartmentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDepartmentModalProps) {
  const [departmentName, setDepartmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;
  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;
  let authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL||  "http://localhost:8005"; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departmentName.trim()) {
      Toast({
        title: "Error",
        
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {

      const requestBody = {
        department: departmentName.trim()
      };
      
      console.log("Request body:", JSON.stringify(requestBody));

      const response = await fetch(`${authServiceUrl}/tenant/${tenantId}/departments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to create department");
      }

      
      
      // Reset form and close modal
      setDepartmentName("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating department:", error);
      
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
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold">Create Department</DialogTitle>
          </div>
          <DialogDescription>
            Add a new department to your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="departmentName" className="text-right font-medium text-gray-700 col-span-1">
                Name
              </label>
              <div className="col-span-3">
                <Input
                  id="departmentName"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
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
              {isSubmitting ? "Creating..." : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}