import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { ArrowLeft, Save, Send, Sparkles, Loader2, AlertCircle, User, Building, DollarSign, Calendar, MapPin, Clock, CheckCircle, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Separator } from "../../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { 
  useTemplates, 
  useCreateOffer, 
  useAIEnhancement,
  useOfferForm,
  useSubmitForApproval,
  useCandidates
} from "@/utils/offerhooks";
import { Candidate, formatSalary, formatDate } from "@/utils/api";
import { toast } from "react-hot-toast";

const CreateOfferPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [enhancementType, setEnhancementType] = useState<string>("PROFESSIONAL");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">Authentication Required</h2>
                <p className="text-gray-500 mb-4">Please log in to create offers.</p>
                <Button onClick={() => navigate("/login")} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userId = user.userId?.toString() || "";
  const userRole = user.role as string || "HR";
  const tenantId = user.tenant?.tenantId?.toString() || "";

  // Fetch candidates from backend
  const { data: candidates, loading: candidatesLoading, error: candidatesError } = useCandidates(tenantId);
  
  // API hooks
  const { data: templates, loading: templatesLoading } = useTemplates(userId, userRole);
  const { createOffer, createFromTemplate, loading: creatingOffer, validationErrors } = useCreateOffer();
  const { enhanceContent, loading: enhancing } = useAIEnhancement();
  const { submitForApproval, loading: submitting } = useSubmitForApproval();

  // Form state with validation
  const {
    offerContent,
    updateField,
    updateCandidate,
    resetForm,
    validate,
    isValid,
    getFieldError,
    hasError,
    toJson,
    isDirty
  } = useOfferForm(undefined, selectedCandidate || undefined);

  const handleSelectCandidate = (candidateId: string) => {
    const candidate = candidates?.find(c => c.id.toString() === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
      updateCandidate(candidate);
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find(t => t.id.toString() === templateId);
    
    if (template) {
      try {
        const templateContent = JSON.parse(template.templateContent);
        // Update form fields with template content
        Object.keys(templateContent).forEach(key => {
          if (key !== 'candidateName' && key !== 'candidateEmail' && key !== 'candidatePhone') {
            updateField(key as keyof typeof offerContent, templateContent[key]);
          }
        });
        toast.success("Template applied successfully!");
      } catch (error) {
        console.error("Error applying template:", error);
        toast.error("Failed to apply template");
      }
    }
  };

  const handleEnhanceContent = async () => {
    if (!offerContent.content?.trim()) {
      toast.error("Please enter some content to enhance");
      return;
    }

    const enhanced = await enhanceContent(
      offerContent.content,
      offerContent.position || "Software Engineer",
      "5 years",
      enhancementType as any
    );

    if (enhanced) {
      updateField('content', enhanced.enhancedContent);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/dashboard/offers");
      }
    } else {
      navigate("/dashboard/offers");
    }
  };

  const handleSaveDraft = async () => {
    if (!validate()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    const offer = await createOffer(userId, userRole, {
      candidateId: selectedCandidate.id,
      offerContent: toJson()
    });

    if (offer) {
      toast.success("Offer saved as draft successfully!");
      navigate("/dashboard/offers");
    }
  };

  const handleSubmitForApproval = async () => {
    if (!validate()) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    // First create the offer
    const offer = await createOffer(userId, userRole, {
      candidateId: selectedCandidate.id,
      offerContent: toJson()
    });

    if (offer) {
      // Then submit for approval
      const submittedOffer = await submitForApproval(userId, userRole, offer.id);
      if (submittedOffer) {
        navigate("/dashboard/offers");
      }
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !validate()) {
      toast.error("Please select a template and fix validation errors");
      return;
    }

    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    const offer = await createFromTemplate(userId, userRole, {
      templateId: parseInt(selectedTemplate),
      candidateId: selectedCandidate.id,
      customizations: toJson()
    });

    if (offer) {
      navigate("/dashboard/offers");
    }
  };

  // Validation error display component
  const ValidationErrorAlert = ({ errors }: { errors: string[] }) => (
    errors.length > 0 ? (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          <div className="font-medium mb-1">Please fix the following errors:</div>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">{error}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    ) : null
  );

  const renderBasicTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Building className="h-5 w-5 mr-2 text-indigo-600" />
            Offer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Validation Errors */}
            <ValidationErrorAlert errors={validationErrors.map(e => e.message)} />

            {/* Candidate Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <User className="h-4 w-4 inline mr-1" />
                Candidate *
              </label>
              {candidatesLoading ? (
                <div className="flex items-center p-3 border border-gray-300 rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-gray-500">Loading candidates...</span>
                </div>
              ) : candidatesError ? (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Failed to load candidates: {candidatesError}
                  </AlertDescription>
                </Alert>
              ) : (
                <Select 
                  value={selectedCandidate?.id.toString() || ""} 
                  onValueChange={handleSelectCandidate}
                >
                  <SelectTrigger className={`border-gray-300 text-gray-900 ${hasError('candidateName') ? 'border-red-300' : ''}`}>
                    <SelectValue placeholder="Select a candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates?.map(candidate => (
                      <SelectItem key={candidate.id} value={candidate.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{candidate.fullName}</span>
                          <span className="text-sm text-gray-500">{candidate.email}</span>
                          {candidate.phoneNumber && (
                            <span className="text-sm text-gray-400">{candidate.phoneNumber}</span>
                          )}
                        </div>
                      </SelectItem>
                    )) || (
                      <SelectItem value="" disabled>No candidates available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              {hasError('candidateName') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('candidateName')}</p>
              )}
            </div>

            {/* Selected Candidate Info */}
            {selectedCandidate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selected Candidate</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Name: </span>
                    <span className="text-blue-800">{selectedCandidate.fullName}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Email: </span>
                    <span className="text-blue-800">{selectedCandidate.email}</span>
                  </div>
                  {selectedCandidate.phoneNumber && (
                    <div>
                      <span className="text-blue-700 font-medium">Phone: </span>
                      <span className="text-blue-800">{selectedCandidate.phoneNumber}</span>
                    </div>
                  )}
                  {selectedCandidate.experience && (
                    <div>
                      <span className="text-blue-700 font-medium">Experience: </span>
                      <span className="text-blue-800">{selectedCandidate.experience}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Position */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="position">
                Position *
              </label>
              <Input
                id="position"
                value={offerContent.position || ""}
                onChange={(e) => updateField('position', e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className={`border-gray-300 text-gray-900 ${hasError('position') ? 'border-red-300' : ''}`}
              />
              {hasError('position') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('position')}</p>
              )}
            </div>
            
            {/* Salary */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="salary">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Salary *
              </label>
              <Input
                id="salary"
                value={offerContent.salary || ""}
                onChange={(e) => updateField('salary', e.target.value)}
                placeholder="e.g., $130,000 or 130000"
                className={`border-gray-300 text-gray-900 ${hasError('salary') ? 'border-red-300' : ''}`}
              />
              {hasError('salary') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('salary')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Enter amount with or without currency symbol</p>
            </div>
            
            {/* Start Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="startDate">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Start Date
                </label>
                <Input
                  id="startDate"
                  value={offerContent.startDate || ""}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  placeholder="e.g., 2024-12-01, 12/01/2024, or December 1, 2024"
                  className={`border-gray-300 text-gray-900 ${hasError('startDate') ? 'border-red-300' : ''}`}
                />
                {hasError('startDate') && (
                  <p className="text-red-600 text-sm mt-1">{getFieldError('startDate')}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </label>
                <Input
                  id="location"
                  value={offerContent.location || ""}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., New York, NY or Remote"
                  className="border-gray-300 text-gray-900"
                />
              </div>
            </div>

            {/* Work Type and Employment Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Work Type
                </label>
                <Select 
                  value={offerContent.workType || ""} 
                  onValueChange={(value) => updateField('workType', value)}
                >
                  <SelectTrigger className="border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Employment Type
                </label>
                <Select 
                  value={offerContent.employmentType || ""} 
                  onValueChange={(value) => updateField('employmentType', value)}
                >
                  <SelectTrigger className="border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Benefits and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="benefits">
                  Benefits
                </label>
                <Input
                  id="benefits"
                  value={offerContent.benefits || ""}
                  onChange={(e) => updateField('benefits', e.target.value)}
                  placeholder="e.g., Health, Dental, Vision, 401k"
                  className="border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="department">
                  Department
                </label>
                <Input
                  id="department"
                  value={offerContent.department || ""}
                  onChange={(e) => updateField('department', e.target.value)}
                  placeholder="e.g., Engineering, Marketing"
                  className="border-gray-300 text-gray-900"
                />
              </div>
            </div>

            {/* Reporting Manager and Working Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="reportingManager">
                  Reporting Manager
                </label>
                <Input
                  id="reportingManager"
                  value={offerContent.reportingManager || ""}
                  onChange={(e) => updateField('reportingManager', e.target.value)}
                  placeholder="e.g., John Doe, VP Engineering"
                  className="border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="workingHours">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Working Hours
                </label>
                <Input
                  id="workingHours"
                  value={offerContent.workingHours || ""}
                  onChange={(e) => updateField('workingHours', e.target.value)}
                  placeholder="e.g., 9:00 AM - 5:00 PM, Monday - Friday"
                  className="border-gray-300 text-gray-900"
                />
              </div>
            </div>

            {/* Probation and Notice Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="probationPeriod">
                  Probation Period
                </label>
                <Input
                  id="probationPeriod"
                  value={offerContent.probationPeriod || ""}
                  onChange={(e) => updateField('probationPeriod', e.target.value)}
                  placeholder="e.g., 3 months, 90 days"
                  className="border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="noticePeriod">
                  Notice Period
                </label>
                <Input
                  id="noticePeriod"
                  value={offerContent.noticePeriod || ""}
                  onChange={(e) => updateField('noticePeriod', e.target.value)}
                  placeholder="e.g., 2 weeks, 30 days"
                  className="border-gray-300 text-gray-900"
                />
              </div>
            </div>
            
            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="content">
                Additional Details
              </label>
              <Textarea
                id="content"
                value={offerContent.content || ""}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="Enter additional details about the offer, role responsibilities, company culture, growth opportunities, etc."
                rows={6}
                className="border-gray-300 text-gray-900"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleSaveDraft} 
              variant="outline" 
              className="w-full text-gray-700 border-gray-300 hover:bg-gray-50"
              disabled={creatingOffer || !isValid()}
            >
              {creatingOffer ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save as Draft
            </Button>
            
            <Button 
              onClick={handleSubmitForApproval} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={creatingOffer || submitting || !isValid()}
            >
              {(creatingOffer || submitting) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Approval
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          {/* Validation Status */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Validation Status</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                {offerContent.candidateName ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className={offerContent.candidateName ? "text-green-700" : "text-red-700"}>
                  Candidate selected
                </span>
              </div>
              <div className="flex items-center text-sm">
                {offerContent.position ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className={offerContent.position ? "text-green-700" : "text-red-700"}>
                  Position specified
                </span>
              </div>
              <div className="flex items-center text-sm">
                {offerContent.salary ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className={offerContent.salary ? "text-green-700" : "text-red-700"}>
                  Salary defined
                </span>
              </div>
            </div>
          </div>
          
          {/* Preview */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-gray-700">Preview</h3>
            {selectedCandidate ? (
              <div className="bg-gray-50 p-4 rounded-md text-sm border border-gray-200">
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">To: {selectedCandidate.fullName}</p>
                  <p className="text-gray-700">Position: {offerContent.position || "Not specified"}</p>
                  <p className="text-gray-700">Salary: {offerContent.salary || "Not specified"}</p>
                  <p className="text-gray-700">Start Date: {offerContent.startDate || "Not specified"}</p>
                  {offerContent.location && (
                    <p className="text-gray-700">Location: {offerContent.location}</p>
                  )}
                  {offerContent.workType && (
                    <p className="text-gray-700">Work Type: {offerContent.workType}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a candidate to preview the offer</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTemplateTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Select a Template</CardTitle>
        </CardHeader>
        <CardContent>
          {templatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-2">Loading templates...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {templates?.map(template => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow bg-white ${
                      selectedTemplate === template.id.toString() 
                        ? 'ring-2 ring-indigo-500 border-indigo-500' 
                        : 'border border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectTemplate(template.id.toString())}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{template.category}</p>
                      <p className="text-xs text-gray-400 mt-2">{template.description}</p>
                    </CardContent>
                  </Card>
                )) || (
                  <div className="col-span-2 text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No templates available</p>
                  </div>
                )}
              </div>
              
              {selectedTemplate && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Customize Template</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Candidate</label>
                      <Select 
                        value={selectedCandidate?.id.toString() || ""} 
                        onValueChange={handleSelectCandidate}
                      >
                        <SelectTrigger className="border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select a candidate" />
                        </SelectTrigger>
                        <SelectContent>
                          {candidates?.map(candidate => (
                            <SelectItem key={candidate.id} value={candidate.id.toString()}>
                              {candidate.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Input
                      placeholder="Position"
                      value={offerContent.position || ""}
                      onChange={(e) => updateField('position', e.target.value)}
                      className="border-gray-300 text-gray-900"
                    />
                    
                    <Input
                      placeholder="Salary"
                      value={offerContent.salary || ""}
                      onChange={(e) => updateField('salary', e.target.value)}
                      className="border-gray-300 text-gray-900"
                    />
                    
                    <Input
                      placeholder="Start Date"
                      value={offerContent.startDate || ""}
                      onChange={(e) => updateField('startDate', e.target.value)}
                      className="border-gray-300 text-gray-900"
                    />

                    <Button 
                      onClick={handleCreateFromTemplate} 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={creatingOffer || !isValid()}
                    >
                      {creatingOffer ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Create from Template
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Template Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTemplate ? (
            <div className="bg-gray-50 p-4 rounded-md text-sm border border-gray-200">
              <p className="text-gray-900">Dear {selectedCandidate?.fullName || "[Candidate Name]"},</p>
              <p className="mt-3 text-gray-700">
                We are pleased to offer you the position of <strong>{offerContent.position || "[Position]"}</strong> with a starting salary of <strong>{offerContent.salary || "[Salary]"}</strong> and an anticipated start date of <strong>{offerContent.startDate || "[Start Date]"}</strong>.
              </p>
              {offerContent.benefits && (
                <p className="mt-3 text-gray-700">
                  Your benefits package includes: {offerContent.benefits}
                </p>
              )}
              {offerContent.content && (
                <p className="mt-3 text-gray-700">
                  {offerContent.content}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a template to preview</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderEnhanceTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
            Enhance Offer Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Enhancement Type</label>
              <Select 
                value={enhancementType} 
                onValueChange={setEnhancementType}
              >
                <SelectTrigger className="border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select enhancement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="FRIENDLY">Friendly</SelectItem>
                  <SelectItem value="FORMAL">Formal</SelectItem>
                  <SelectItem value="CREATIVE">Creative</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                {enhancementType === "PROFESSIONAL" && "Formal business tone, suitable for most offers"}
                {enhancementType === "FRIENDLY" && "Warm, approachable tone for a more casual company culture"}
                {enhancementType === "FORMAL" && "Very formal tone for executive or legal positions"}
                {enhancementType === "CREATIVE" && "Engaging, creative tone for design or marketing roles"}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="content">
                Current Offer Content
              </label>
              <Textarea
                id="content"
                value={offerContent.content || ""}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="Enter offer content to enhance..."
                rows={8}
                className="border-gray-300 text-gray-900"
              />
            </div>
            
            <Button 
              onClick={handleEnhanceContent} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={enhancing || !offerContent.content?.trim()}
            >
              {enhancing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {enhancing ? "Enhancing..." : "Enhance with AI"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleSaveDraft} 
              variant="outline" 
              className="w-full text-gray-700 border-gray-300 hover:bg-gray-50"
              disabled={creatingOffer || !isValid()}
            >
              {creatingOffer ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save as Draft
            </Button>
            
            <Button 
              onClick={handleSubmitForApproval} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={creatingOffer || submitting || !isValid()}
            >
              {(creatingOffer || submitting) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Approval
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-sm font-medium mb-3 text-gray-700">AI Suggestions</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                Include competitive salary details and performance bonuses
              </li>
              <li className="flex items-start">
                <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                Highlight professional development and learning opportunities
              </li>
              <li className="flex items-start">
                <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                Mention company culture, values, and team dynamics
              </li>
              <li className="flex items-start">
                <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                Detail comprehensive benefits and perks package
              </li>
              <li className="flex items-start">
                <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                Explain career growth path and advancement opportunities
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-3 text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Offer</h1>
            <p className="text-gray-600 mt-1">Create and manage job offers for candidates</p>
          </div>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="basic" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger 
              value="template" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
            >
              Use Template
            </TabsTrigger>
            <TabsTrigger 
              value="enhance" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
            >
              AI Enhancement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            {renderBasicTab()}
          </TabsContent>

          <TabsContent value="template">
            {renderTemplateTab()}
          </TabsContent>

          <TabsContent value="enhance">
            {renderEnhanceTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateOfferPage;