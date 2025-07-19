import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { ArrowLeft, Save, Send, Sparkles, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Separator } from "../../../../components/ui/separator";
import { useAuth } from "@/context/AuthContext"; // Your existing auth context
import { 
  useTemplates, 
  useCreateOffer, 
  useAIEnhancement,
  useOfferForm 
} from "@/utils/offerhooks"; // Your existing hooks
import { toast } from "react-hot-toast";

// Mock candidates - you can replace this with your actual candidates hook
const mockCandidates = [
  { id: 456, name: "John Doe", email: "john.doe@email.com" },
  { id: 457, name: "Jane Smith", email: "jane.smith@email.com" },
  { id: 458, name: "Michael Johnson", email: "michael.johnson@email.com" },
  { id: 459, name: "Emily Davis", email: "emily.davis@email.com" },
  { id: 460, name: "Robert Wilson", email: "robert.wilson@email.com" },
];

const CreateOfferPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [enhancementType, setEnhancementType] = useState<string>("PROFESSIONAL");

  if (!isAuthenticated || !user) {
    toast.error("Authentication required");
    navigate("/login");
    return null;
  }

  const userId = user.userId?.toString() || "";
  const userRole = user.role as any;

  // API hooks
  const { data: templates, loading: templatesLoading } = useTemplates(userId, userRole);
  const { createOffer, createFromTemplate, loading: creatingOffer } = useCreateOffer();
  const { enhanceContent, loading: enhancing } = useAIEnhancement();

  // Form state
  const {
    offerContent,
    updateField,
    resetForm,
    isValid,
    toJson
  } = useOfferForm();

  const handleSelectCandidate = (candidateId: string) => {
    const candidate = mockCandidates.find(c => c.id.toString() === candidateId);
    updateField('candidateName', candidate ? candidate.name : '');
  };

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find(t => t.id.toString() === templateId);
    
    if (template) {
      try {
        const templateContent = JSON.parse(template.templateContent);
        Object.keys(templateContent).forEach(key => {
          updateField(key as keyof typeof offerContent, templateContent[key]);
        });
        toast.success("Template applied successfully!");
      } catch (error) {
        toast.error("Failed to apply template");
      }
    }
  };

  const handleEnhanceContent = async () => {
    if (!offerContent.content) {
      toast.error("Please enter some content to enhance");
      return;
    }

    const enhanced = await enhanceContent(
      offerContent.content,
      offerContent.position || "Software Engineer",
      "5 years", // This could be dynamic
      enhancementType as any
    );

    if (enhanced) {
      updateField('content', enhanced.enhancedContent);
      toast.success("Content enhanced successfully!");
    }
  };

  const handleBack = () => {
    navigate("/dashboard/offers");
  };

  const handleSaveDraft = async () => {
    if (!isValid()) {
      toast.error("Please fill in required fields (candidate name, position, salary)");
      return;
    }

    const candidateId = mockCandidates.find(c => c.name === offerContent.candidateName)?.id;
    if (!candidateId) {
      toast.error("Please select a valid candidate");
      return;
    }

    const offer = await createOffer(userId, userRole, {
      candidateId,
      offerContent: toJson()
    });

    if (offer) {
      navigate("/dashboard/offers");
    }
  };

  const handleSubmitForApproval = async () => {
    await handleSaveDraft(); // First save, then the success handler will navigate
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !isValid()) {
      toast.error("Please select a template and fill required fields");
      return;
    }

    const candidateId = mockCandidates.find(c => c.name === offerContent.candidateName)?.id;
    if (!candidateId) {
      toast.error("Please select a valid candidate");
      return;
    }

    const offer = await createFromTemplate(userId, userRole, {
      templateId: parseInt(selectedTemplate),
      candidateId,
      customizations: toJson()
    });

    if (offer) {
      navigate("/dashboard/offers");
    }
  };

  const renderBasicTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Offer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Candidate</label>
              <Select 
                value={mockCandidates.find(c => c.name === offerContent.candidateName)?.id.toString() || ""} 
                onValueChange={handleSelectCandidate}
              >
                <SelectTrigger className="border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select a candidate" />
                </SelectTrigger>
                <SelectContent>
                  {mockCandidates.map(candidate => (
                    <SelectItem key={candidate.id} value={candidate.id.toString()}>
                      {candidate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="position">
                Position *
              </label>
              <Input
                id="position"
                value={offerContent.position || ""}
                onChange={(e) => updateField('position', e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="border-gray-300 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="salary">
                Salary *
              </label>
              <Input
                id="salary"
                value={offerContent.salary || ""}
                onChange={(e) => updateField('salary', e.target.value)}
                placeholder="e.g., $130,000"
                className="border-gray-300 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="startDate">
                Start Date
              </label>
              <Input
                id="startDate"
                value={offerContent.startDate || ""}
                onChange={(e) => updateField('startDate', e.target.value)}
                placeholder="e.g., September 1, 2025"
                className="border-gray-300 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="benefits">
                Benefits
              </label>
              <Input
                id="benefits"
                value={offerContent.benefits || ""}
                onChange={(e) => updateField('benefits', e.target.value)}
                placeholder="e.g., Health, Dental, Vision"
                className="border-gray-300 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="content">
                Additional Details
              </label>
              <Textarea
                id="content"
                value={offerContent.content || ""}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="Enter additional details about the offer"
                rows={6}
                className="border-gray-300 text-gray-900"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleSaveDraft} 
              variant="outline" 
              className="w-full text-gray-700 border-gray-300"
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
              disabled={creatingOffer || !isValid()}
            >
              {creatingOffer ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Approval
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700">Preview</h3>
            {offerContent.candidateName ? (
              <div className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
                <p className="font-medium text-gray-900">To: {offerContent.candidateName}</p>
                <p className="mt-2 text-gray-700">Position: {offerContent.position || "Not specified"}</p>
                <p className="text-gray-700">Salary: {offerContent.salary || "Not specified"}</p>
                <p className="text-gray-700">Start Date: {offerContent.startDate || "Not specified"}</p>
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
      <Card className="lg:col-span-2 bg-white border border-gray-200">
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
                    className={`cursor-pointer hover:shadow-md transition-shadow bg-white ${selectedTemplate === template.id.toString() ? 'border-2 border-indigo-500' : 'border border-gray-200'}`}
                    onClick={() => handleSelectTemplate(template.id.toString())}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.category}</p>
                    </CardContent>
                  </Card>
                )) || (
                  <p className="text-gray-500 col-span-2">No templates available</p>
                )}
              </div>
              
              {selectedTemplate && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Customize Template</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Candidate</label>
                      <Select 
                        value={mockCandidates.find(c => c.name === offerContent.candidateName)?.id.toString() || ""} 
                        onValueChange={handleSelectCandidate}
                      >
                        <SelectTrigger className="border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select a candidate" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCandidates.map(candidate => (
                            <SelectItem key={candidate.id} value={candidate.id.toString()}>
                              {candidate.name}
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
      
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Template Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTemplate ? (
            <div className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
              <p className="text-gray-900">Dear {offerContent.candidateName || "[Candidate Name]"},</p>
              <p className="mt-2 text-gray-700">
                We are pleased to offer you the position of {offerContent.position || "[Position]"} with a starting salary of {offerContent.salary || "[Salary]"} and an anticipated start date of {offerContent.startDate || "[Start Date]"}.
              </p>
              {offerContent.benefits && (
                <p className="mt-2 text-gray-700">
                  Your benefits package includes: {offerContent.benefits}
                </p>
              )}
              {offerContent.content && (
                <p className="mt-2 text-gray-700">
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
      <Card className="lg:col-span-2 bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Enhance Offer Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Enhancement Type</label>
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
              <p className="text-xs text-gray-500 mt-1">
                {enhancementType === "PROFESSIONAL" && "Formal business tone, suitable for most offers"}
                {enhancementType === "FRIENDLY" && "Warm, approachable tone for a more casual company culture"}
                {enhancementType === "FORMAL" && "Very formal tone for executive or legal positions"}
                {enhancementType === "CREATIVE" && "Engaging, creative tone for design or marketing roles"}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="content">
                Current Offer Content
              </label>
              <Textarea
                id="content"
                value={offerContent.content || ""}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="Enter offer content to enhance"
                rows={8}
                className="border-gray-300 text-gray-900"
              />
            </div>
            
            <Button 
              onClick={handleEnhanceContent} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={enhancing || !offerContent.content}
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
      
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleSaveDraft} 
              variant="outline" 
              className="w-full text-gray-700 border-gray-300"
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
              disabled={creatingOffer || !isValid()}
            >
              {creatingOffer ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Approval
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700">AI Suggestions</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                Include competitive salary details
              </li>
              <li className="flex items-start">
                <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                Highlight professional development opportunities
              </li>
              <li className="flex items-start">
                <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                Mention company culture and values
              </li>
              <li className="flex items-start">
                <Sparkles className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                Detail comprehensive benefits package
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 bg-white text-gray-900">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-2 text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Offer</h1>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 bg-gray-100">
          <TabsTrigger value="basic" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="template" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
            Use Template
          </TabsTrigger>
          <TabsTrigger value="enhance" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
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
  );
};

export default CreateOfferPage;