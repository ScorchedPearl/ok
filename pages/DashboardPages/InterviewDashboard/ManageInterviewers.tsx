"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios"; // Make sure to install axios if not already installed
import { useAuth } from "@/context/AuthContext";

// Updated Interviewer interface to match the backend model
interface Interviewer {
  id?: number;
  userId?: number;
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: string;
  status: string;
}

// API base URL - adjust this to match your environment
const API_BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8005";

/**
 * Improved ManageInterviewers component with backend integration
 */
function NewManageInterviewersSection() {
  // State for the list of interviewers
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  
  // Get authentication details from auth context
  const { token, user } = useAuth();
  const tenantId = user?.tenant?.tenantId;
  
  // Form state for adding a new interviewer
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    role: "INTERVIEWER", // Default role
    status: "active" // Default status
  });
  
  // Edit state to track which interviewer is being edited and their data
  const [editState, setEditState] = useState<{
    id: number | null;
    userId?: number;
    username: string;
    email: string;
    fullName: string;
    password: string;
    role: string;
    status: string;
  }>({
    id: null,
    userId: undefined,
    username: "",
    email: "",
    fullName: "",
    password: "",
    role: "INTERVIEWER",
    status: "active"
  });
  
  // Loading states to track async operations
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch interviewers on component mount
  useEffect(() => {
    fetchInterviewers();
  }, []);

  // Function to fetch interviewers from the backend
  const fetchInterviewers = async () => {
    setIsLoading(true);
    try {
      if (!token?.access_token) {
        toast.error("Authentication required");
        setIsLoading(false);
        return;
      }

      // Fetch interviewers with role=INTERVIEWER
      const response = await axios.get(`${API_BASE_URL}/tenant/users/role/INTERVIEWER`, {
        headers: {
          'Authorization': `Bearer ${token.access_token}`
        }
      });
      
      setInterviewers(response.data);
    } catch (error) {
      console.error("Error fetching interviewers:", error);
      toast.error("Failed to load interviewers");
    } finally {
      setIsLoading(false);
    }
  };

  // Form input change handler with type safety
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "username" | "email" | "fullName" | "password"
  ) => {
    setFormState({
      ...formState,
      [field]: e.target.value
    });
  };

  // Edit form input change handler
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "username" | "email" | "fullName" | "password"
  ) => {
    setEditState({
      ...editState,
      [field]: e.target.value
    });
  };

  // Add interviewer handler - integrates with backend
  const handleAddInterviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formState.username.trim() || !formState.email.trim() || 
        !formState.fullName.trim() || !formState.password.trim()) {
      toast.error("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsAdding(true);

    try {
      if (!token?.access_token) {
        toast.error("Authentication required");
        setIsAdding(false);
        return;
      }

      // Prepare the payload according to the backend requirements
      const payload = {
        username: formState.username.trim(),
        email: formState.email.trim(),
        fullName: formState.fullName.trim(),
        password: formState.password.trim(),
        role: "INTERVIEWER",
        status: "active"
      };
      
      // Send POST request to create tenant user
      const response = await axios.post(
        `${API_BASE_URL}/tenant/users`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Add the new interviewer to our local state
      if (response.data) {
        setInterviewers(prevInterviewers => [...prevInterviewers, response.data]);
        
        // Reset form state
        setFormState({
          username: "",
          email: "",
          fullName: "",
          password: "",
          role: "INTERVIEWER",
          status: "active"
        });
        
        toast.success("Interviewer added successfully");
      }
    } catch (error: any) {
      console.error("Error adding interviewer:", error);
      // Check for 409 Conflict status - user already exists
      if (error.response?.status === 409) {
        toast.error("User already exists with this email or username");
      } else {
        toast.error(error.response?.data?.message || "Failed to add interviewer");
      }
    } finally {
      setIsAdding(false);
    }
  };



  // Cancel editing
  const handleCancelEdit = () => {
    setEditState({
      id: null,
      userId: undefined,
      username: "",
      email: "",
      fullName: "",
      password: "",
      role: "INTERVIEWER",
      status: "active"
    });
  };

  // Save edited interviewer
  const handleSaveEdit = async () => {
    // Validate all required fields
    if (!editState.username.trim() || !editState.email.trim() || 
        !editState.fullName.trim()) {
      toast.error("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editState.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (editState.id === null) return;
    
    setIsEditing(true);

    try {
      if (!token?.access_token) {
        toast.error("Authentication required");
        setIsEditing(false);
        return;
      }
      
      // Prepare the payload for update
      const payload = {
        username: editState.username.trim(),
        email: editState.email.trim(),
        fullName: editState.fullName.trim(),
        role: editState.role,
        status: editState.status
      };
      
      // Include password only if it was changed
      // if (editState.password.trim()) {
      //   payload['password'] = editState.password.trim();
      // }
      
      // Since the /users/profile endpoint doesn't work with UUID, implement a workaround
      // We can create a custom endpoint for updating an interviewer by their numeric ID
      try {
        // This would be a proper implementation once your backend has the endpoint
        const response = await axios.put(
          `${API_BASE_URL}/api/users/profile/${editState.userId}`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data) {
          // Update the interviewer in the local state
          setInterviewers(prevInterviewers =>
            prevInterviewers.map(interviewer =>
              interviewer.userId === editState.userId
                ? response.data
                : interviewer
            )
          );
          
          toast.success("Interviewer updated successfully");
        }
      } catch (error: any) {
        // If endpoint doesn't exist, show a more specific error
        if (error.response?.status === 404) {
          toast.error("Update endpoint not implemented in backend. Please contact your developer.");
          console.error("The endpoint for updating users by ID does not exist:", error);
        } else {
          throw error; // Re-throw to be caught by outer catch
        }
      }
      
      // Reset edit state
      setEditState({
        id: null,
        userId: undefined,
        username: "",
        email: "",
        fullName: "",
        password: "",
        role: "INTERVIEWER",
        status: "active"
      });
      
    } catch (error: any) {
      console.error("Error updating interviewer:", error);
      toast.error(error.response?.data?.message || "Failed to update interviewer");
    } finally {
      setIsEditing(false);
    }
  };

  // Delete interviewer - for this we would need an additional API endpoint
  const handleDeleteInterviewer = async (id: number) => {
    setDeletingId(id);

    try {
      if (!token?.access_token) {
        toast.error("Authentication required");
        setDeletingId(null);
        return;
      }

      try {
        // Try to call the delete endpoint that should exist
        await axios.delete(`${API_BASE_URL}/tenant/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token.access_token}`
          }
        });
        
        // Remove the interviewer from the local state
        setInterviewers(prevInterviewers =>
          prevInterviewers.filter(interviewer => interviewer.userId !== id)
        );
        
        toast.success("Interviewer removed successfully");
      } catch (error: any) {
        // If endpoint doesn't exist (404) or isn't implemented (405)
        if (error.response?.status === 404 || error.response?.status === 405) {
          toast.error("Delete functionality not implemented in backend. Please contact your developer.");
          console.error("The endpoint for deleting users does not exist:", error);
        } else {
          throw error; // Re-throw to be caught by outer catch
        }
      }
      
    } catch (error: any) {
      console.error("Error deleting interviewer:", error);
      toast.error(error.response?.data?.message || "Failed to remove interviewer");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="mb-8 border border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50 border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Manage Interviewers
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Add Interviewer Form */}
        <form onSubmit={handleAddInterviewer} className="mb-6 z-50">
          <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
            <h3 className="text-md font-medium text-gray-700 mb-4">Add New Interviewer</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="current-fullName"
                  placeholder="Enter full name"
                  value={formState.fullName}
                  onChange={(e) => handleInputChange(e, "fullName")}
                  className="w-full text-gray-800"
                  disabled={isAdding}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  // autoComplete="username"
                  placeholder="Enter username"
                  value={formState.username}
                  onChange={(e) => handleInputChange(e, "username")}
                  className="w-full text-gray-800"
                  disabled={isAdding}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="current-email"
                  placeholder="Enter email address"
                  value={formState.email}
                  onChange={(e) => handleInputChange(e, "email")}
                  className="w-full text-gray-800"
                  disabled={isAdding}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  // autoComplete="current-password"
                  placeholder="Enter password"
                  value={formState.password}
                  onChange={(e) => handleInputChange(e, "password")}
                  className="w-full text-gray-800"
                  disabled={isAdding}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white"
                disabled={isAdding}
              >
                {isAdding ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Add Interviewer
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Interviewers List */}
        <div className="space-y-4 h-[50vh] overflow-y-auto">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            Interviewers ({interviewers.length})
          </h3>
          
          {isLoading ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 mt-2">Loading interviewers...</p>
            </div>
          ) : interviewers.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">No interviewers added yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first interviewer using the form above.
              </p>
            </div>
          ) : (
            interviewers.map((interviewer) => (
              <div
                key={interviewer.userId || Math.random()}
                className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {editState.id === interviewer.userId ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-fullName-${interviewer.userId}`} className="text-sm font-medium text-gray-700">
                          Full Name
                        </Label>
                        <Input
                          id={`edit-fullName-${interviewer.userId}`}
                          type="text"
                          value={editState.fullName}
                          onChange={(e) => handleEditChange(e, "fullName")}
                          className="w-full text-gray-800"
                          disabled={isEditing}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`edit-username-${interviewer.userId}`} className="text-sm font-medium text-gray-700">
                          Username
                        </Label>
                        <Input
                          id={`edit-username-${interviewer.userId}`}
                          type="text"
                          value={editState.username}
                          onChange={(e) => handleEditChange(e, "username")}
                          className="w-full text-gray-800"
                          disabled={isEditing}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`edit-email-${interviewer.userId}`} className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <Input
                          id={`edit-email-${interviewer.userId}`}
                          type="email"
                          value={editState.email}
                          onChange={(e) => handleEditChange(e, "email")}
                          className="w-full text-gray-800"
                          disabled={isEditing}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`edit-password-${interviewer.userId}`} className="text-sm font-medium text-gray-700">
                          Password (leave blank to keep unchanged)
                        </Label>
                        <Input
                          id={`edit-password-${interviewer.userId}`}
                          type="password"
                          value={editState.password}
                          onChange={(e) => handleEditChange(e, "password")}
                          className="w-full text-gray-800"
                          disabled={isEditing}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        onClick={handleSaveEdit}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={isEditing}
                      >
                        {isEditing ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="border-gray-300 text-gray-700"
                        disabled={isEditing}
                      >
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900">{interviewer.fullName}</h4>
                      <p className="text-sm text-gray-500">{interviewer.email}</p>
                      <p className="text-xs text-gray-400">Username: {interviewer.username}</p>
                    </div>
                    
                    {/* <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <Button
                        type="button"
                        onClick={() => handleStartEdit(interviewer)}
                        variant="outline"
                        size="sm"
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => handleDeleteInterviewer(interviewer.userId || 0)}
                        variant="outline"
                        size="sm"
                        className="border-red-100 text-red-600 hover:bg-red-50"
                        disabled={deletingId === interviewer.userId}
                      >
                        {deletingId === interviewer.userId ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Removing...
                          </span>
                        ) : (
                          <>
                            <Trash2 className="mr-1 h-4 w-4" /> Remove
                          </>
                        )}
                      </Button>
                    </div> */}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default NewManageInterviewersSection;