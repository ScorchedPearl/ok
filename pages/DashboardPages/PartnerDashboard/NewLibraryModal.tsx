import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2, Plus, Clock, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast"

interface NewLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLibraryCreated?: () => void;
  partnerId?: number;
}



const questionBankServiceUrl = import.meta.env.VITE_QB_SERVICE || 'http://localhost:8004';
const partnerServiceUrl = import.meta.env.VITE_PARTNER_SERVICE_URL || 'http://localhost:8008';





export default function NewLibraryModal({ isOpen, onClose,partnerId, onLibraryCreated }: NewLibraryModalProps) {

  const [isSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    library_name: "",
    description: "",
    tags: [""],
    time_required: 30,
  });


  

  const handleAddTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ""]
    }));
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({ 
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleTagChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  

  // In the submit handler where the library is created
// This is likely in a file like c:\Users\Vraj\OneDrive\Desktop\screening-frontend\src\pages\DashboardPages\PartnerDashboard\NewLibraryModal.tsx or similar

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Library creation logic that you already have...
  
  try {
    const payload = {
      ...formData,
      created_by: partnerId, // Replace with actual user ID
      tenant_user_id: 456, // Replace with actual tenant ID
      tags: formData.tags.filter(tag => tag.trim() !== "")
    };  
    // Create library request
    const libraryResponse = await fetch(`${questionBankServiceUrl}/libraries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)   
    });

    if (libraryResponse.ok) {
      
      
      // Record activity for library creation - 2 points
      await fetch(`${partnerServiceUrl}/api/activities/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          type: "Library Creation",
          description: `Created new library: ${formData.library_name}`,
          points: 2,
          partnerId: partnerId // Hardcoded for demo, should be dynamic in production
        })
      });
      
      toast.success("Library created successfully");
      onClose();
      if (onLibraryCreated) {
        onLibraryCreated();
      }
    }
  } catch (error) {
    console.error("Error creating library:", error);
    toast.error("Failed to create library");
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#2E2883] to-[#1E1A5F] p-6">
          <DialogHeader className="text-white">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Create New Library
            </DialogTitle>
            <p className="text-white/80 font-normal text-sm">
              Create a new assessment library with customized settings
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="library_name" className="text-gray-700">
              Library Name
            </Label>
            <Input
              id="library_name"
              value={formData.library_name}
              onChange={(e) => setFormData(prev => ({ ...prev, library_name: e.target.value }))}
              className="h-11"
              placeholder="Enter library name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px] resize-none"
              placeholder="Describe the purpose of this library"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 flex items-center justify-between">
              Tags
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Tag
              </Button>
            </Label>
            <AnimatePresence>
              {formData.tags.map((tag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2 mb-2"
                >
                  <div className="flex-1 relative">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <Input
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="pl-10"
                      placeholder="Enter tag"
                    />
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveTag(index)}
                      className="h-10 w-10 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_required" className="text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Required (minutes)
            </Label>
            <Input
              id="time_required"
              type="number"
              min="1"
              value={formData.time_required}
              onChange={(e) => setFormData(prev => ({ ...prev, time_required: parseInt(e.target.value) }))}
              className="h-11"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-[#2E2883] hover:bg-[#1E1A5F] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Library'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}