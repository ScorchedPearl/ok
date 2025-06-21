import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle } from "lucide-react";


interface DeleteDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departmentName: string;
}

export default function DeleteDepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  departmentName,
}: DeleteDepartmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;
  const interviewServiceUrl = import.meta.env.VITE_INTERVIEW_SERVICE_URL;
  let authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL||  "http://localhost:8005"; 

  const handleDelete = async () => {
    if (!departmentName) return;

    setIsSubmitting(true);

    try {
      // Use the DELETE endpoint to remove the department
      const response = await fetch(
        `${authServiceUrl}/tenant/${tenantId}/departments/${encodeURIComponent(departmentName)}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete department");
      }

     
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting department:", error);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Delete Department</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this department? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-red-50 border border-red-100 rounded-md p-4">
            <p className="text-sm text-gray-700">
              You are about to delete the department: <span className="font-semibold">{departmentName}</span>
            </p>
            <p className="text-sm text-gray-700 mt-2">
              This may affect jobs and other data associated with this department.
            </p>
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
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Deleting..." : "Delete Department"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}