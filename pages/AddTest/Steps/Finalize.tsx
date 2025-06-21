"use client";

import { useState, useRef, type KeyboardEvent, useEffect } from "react";
import { Mail, Clock, Upload, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Swal from "sweetalert2";
import axios from "axios";
import type { FormData } from "../Types/Test"; // Adjust the import path as needed
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

// Example email templates for demonstration
const emailTemplates = [
  {
    id: "template1",
    name: "Formal Invitation to Participate",
    content:
      "Dear Candidate,\n\nWe are delighted to extend this invitation for you to participate in our comprehensive assessment process. This step is pivotal in our evaluation as we seek to understand your capabilities and fit within our organization. We anticipate your participation with great interest and look forward to a fruitful engagement.",
  },
  {
    id: "template2",
    name: "Invitation for Technical Assessment",
    content:
      "Dear Candidate,\n\nIn continuation of your application process for the Technical role at our company, we invite you to partake in a specialized coding assessment designed to evaluate your technical skills and problem-solving abilities. Your performance in this assessment will be crucial to advancing in our selection process. Details regarding the assessment platform and guidelines will follow shortly.",
  },
  {
    id: "template3",
    name: "Leadership Evaluation Invitation",
    content:
      "Dear Candidate,\n\nWe are pleased to inform you that your application for the Leadership role has progressed to the next stage. We invite you to complete a leadership assessment that will help us gain deeper insights into your management and strategic thinking skills. This assessment is designed to ascertain your potential for driving our organization's objectives forward. We look forward to your participation.",
  },
  {
    id: "template4",
    name: "Creative Role Assessment Invitation",
    content:
      "Dear Candidate,\n\nFollowing your application for our Creative role and a thorough review of your portfolio, we are impressed by your artistic vision and execution. We would like to further explore your creative capabilities through a specialized assessment tailored to your field of expertise. This will provide us with a comprehensive view of your creative process and how it aligns with our project needs.",
  },
];

const assesmentUrl = import.meta.env.VITE_ASSESMENT_SERVICE || 'http://localhost:8000/api/assessment';

export default function FinalizeAndSend({ formData }: { formData: FormData }) {
  const { user } = useAuth();
  const tenantId = user?.tenant?.tenantId || 4;
  const testId = formData.testId || 6;
  const testName = formData.testName ?? "Untitled Test";
  
  // Initialize candidate emails by reading from router state if available
  const location = useLocation();
  const passedState = location.state as { candidateEmails?: string[] } | null;
  
  // State for candidate emails
  const [emails, setEmails] = useState<string[]>(passedState?.candidateEmails || []);
  const [currentEmail, setCurrentEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0].id);
  const [isSending, setIsSending] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collapsible sections
  const [isEmailSectionExpanded, setIsEmailSectionExpanded] = useState(true);
  const [isTemplateSectionExpanded, setIsTemplateSectionExpanded] = useState(true);

  // When component mounts, prefill message with the selected template
  useEffect(() => {
    const selectedContent = emailTemplates.find((t) => t.id === selectedTemplate)?.content;
    setMessage(selectedContent || "");
  }, [selectedTemplate]);

  // --- Email Management ---
  const addEmail = () => {
    const trimmed = currentEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (trimmed && emailRegex.test(trimmed)) {
      if (!emails.includes(trimmed)) {
        setEmails((prev) => [...prev, trimmed]);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Duplicate Email",
          text: "This email is already added.",
          confirmButtonColor: "#1e1b4b",
        });
      }
      setCurrentEmail("");
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#1e1b4b",
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails((prev) => prev.filter((email) => email !== emailToRemove));
  };

  // --- Invitations ---
  const handleSend = async () => {
    if (emails.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please add at least one valid email address.",
        confirmButtonColor: "#1e1b4b",
      });
      return;
    }

    setIsSending(true);

    Swal.fire({
      title: "Sending Invitations...",
      text: "Please wait while we send invitations to candidates.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      for (let i = 0; i < emails.length; i++) {
        const candidateEmail = emails[i];
        const candidateId = 501 + i;
        await axios.post(
          `${assesmentUrl}/assignments/${tenantId}/${testId}/${candidateId}`,
          {
            candidateEmail: candidateEmail,
            messageTemplate: message  // The email template containing the [secureLink] placeholder
          }
        );
      }

      Swal.fire({
        icon: "success",
        title: "Invitations Sent!",
        text: `The assessment invitations have been sent to ${emails.length} candidate(s).`,
        confirmButtonColor: "#1e1b4b",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Sending Failed",
        text: "There was an error sending the invitations. Please try again.",
        confirmButtonColor: "#1e1b4b",
      });
    } finally {
      setIsSending(false);
    }
  };

  // --- Draft ---
  const handleSaveDraft = () => {
    Swal.fire({
      icon: "success",
      title: "Draft Saved",
      text: "Your draft has been saved successfully.",
      confirmButtonColor: "#1e1b4b",
      timer: 2000,
      timerProgressBar: true,
    });
  };

  // --- Template Selection ---
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const selectedTemplateContent = emailTemplates.find((t) => t.id === templateId)?.content;
    setMessage(selectedTemplateContent || "");
  };

  // --- CSV Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      Swal.fire({
        icon: "success",
        title: "CSV Uploaded",
        text: "The CSV file has been uploaded successfully. Email addresses would be extracted here.",
        confirmButtonColor: "#1e1b4b",
      });
    }
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 rounded-xl text-[#1e1b4b] p-2 sm:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1e1b4b] mb-2">
              Finalize Assessment & Send Invitations
            </h1>
            <p className="text-sm md:text-base text-[#1e1b4b]/70">
              Complete the form below to send the assessment to multiple candidates.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 md:mt-0 gap-2 bg-white border-[#1e1b4b] text-[#1e1b4b] hover:bg-[#1e1b4b] hover:text-white rounded-md shadow-sm transition-colors duration-200"
            onClick={handleSaveDraft}
          >
            <Clock className="h-4 w-4" />
            Save Draft
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-[3fr,2fr]">
          <Card className="bg-white border rounded-md shadow-md border-[#1e1b4b]/20 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] p-6">
              <CardTitle className="text-2xl font-semibold text-white">
                Assessment Details
              </CardTitle>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-1">
                <p className="text-sm text-[#1e1b4b]">
                  <span className="font-semibold">Test ID:</span> {testId}
                </p>
                <p className="text-sm text-[#1e1b4b]">
                  <span className="font-semibold">Test Name:</span> {testName}
                </p>
              </div>
              <form className="space-y-8">
                {/* Email Section */}
                <div className="space-y-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsEmailSectionExpanded(!isEmailSectionExpanded)}
                  >
                    <Label className="text-lg font-semibold text-[#1e1b4b]">
                      Candidate Emails
                    </Label>
                    {isEmailSectionExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[#1e1b4b]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#1e1b4b]" />
                    )}
                  </div>
                  {isEmailSectionExpanded && (
                    <>
                      <ScrollArea className="h-32 w-full rounded-md border p-4">
                        <div className="flex flex-wrap gap-2">
                          {emails.map((email) => (
                            <div
                              key={email}
                              className="flex items-center gap-1 bg-gray-100 text-black px-2 py-1 rounded-full"
                            >
                              <span className="text-sm p-2">{email}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEmail(email)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter email address"
                          value={currentEmail}
                          onChange={(e) => setCurrentEmail(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full text-black"
                        />
                        <Button
                          onClick={addEmail}
                          type="button"
                          variant="outline"
                          className="text-[#2e2883]"
                        >
                          Add Email
                        </Button>
                      </div>
                      {/* CSV Upload Section */}
                      {/* <div className="space-y-4">
                        <Label className="text-lg font-semibold text-[#1e1b4b]">
                          Upload CSV File (Optional)
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2 bg-white border-[#1e1b4b] text-[#1e1b4b] hover:bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] hover:text-white rounded-md shadow-sm transition-colors duration-200"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4" />
                            Upload CSV
                          </Button>
                          {csvFile && (
                            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                              <span className="text-sm text-[#1e1b4b] mr-2">{csvFile.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveFile}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div> */}
                    </>
                  )}
                </div>

                {/* Email Template Section */}
                <div className="space-y-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsTemplateSectionExpanded(!isTemplateSectionExpanded)}
                  >
                    <Label className="text-lg font-semibold text-[#1e1b4b]">
                      Email Template
                    </Label>
                    {isTemplateSectionExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[#1e1b4b]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#1e1b4b]" />
                    )}
                  </div>
                  {isTemplateSectionExpanded && (
                    <>
                      <RadioGroup
                        value={selectedTemplate}
                        onValueChange={handleTemplateChange}
                        className="grid grid-cols-2 gap-4"
                      >
                        {emailTemplates.map((template) => (
                          <div key={template.id} className="min-h-[100px]">
                            <RadioGroupItem
                              value={template.id}
                              id={template.id}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={template.id}
                              className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer overflow-hidden ${
                                selectedTemplate === template.id
                                  ? "bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white"
                                  : "bg-white text-[#1e1b4b] hover:bg-gray-50"
                              }`}
                            >
                              <span
                                className="text-sm font-medium block overflow-hidden text-ellipsis"
                                style={{
                                  maxHeight: "3em",
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                }}
                              >
                                {template.name}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {/* Custom Message */}
                      <div className="space-y-4 text-[#1e1b4b]">
                        <Label htmlFor="message" className="text-lg font-semibold">
                          Custom Message
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Enter your message here"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="min-h-[200px] w-full border-[#1e1b4b]/20 text-[#1e1b4b] rounded-md p-3"
                        />
                      </div>
                    </>
                  )}
                </div>

                <Button
                  onClick={handleSend}
                  className="w-full bg-[#1e1b4b] hover:bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white font-semibold py-4 px-6 rounded-md shadow-md transition-colors duration-200"
                  disabled={isSending}
                >
                  <Mail className="mr-2 h-5 w-5" /> {isSending ? "Sending..." : "Send Invitations"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="bg-white border rounded-md shadow-md border-[#1e1b4b]/20 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] p-6">
                <CardTitle className="text-2xl font-semibold text-white">
                  Email Preview
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="space-y-6 text-sm">
                  <div className="text-[#1e1b4b]">
                    <span className="font-semibold">To:</span>{" "}
                    {emails.join(", ") || "candidate@example.com"}
                  </div>
                  <div className="text-[#1e1b4b]">
                    <span className="font-semibold">Subject:</span> Invitation to Complete Assessment
                  </div>
                  <div>
                    <span className="font-semibold text-[#1e1b4b]">Message:</span>
                    <ScrollArea className="h-[200px] w-full mt-4 p-4 bg-gray-50 rounded-md">
                      <p className="text-[#1e1b4b] whitespace-pre-wrap">
                        {message ||
                          "You have been invited to complete an assessment as part of your application process."}
                        {"\n"}
                        [Assessment Link Will Be Inserted Here]
                        {"\n\n"}
                        Best regards,
                        {"\n"}Recruitment Team
                      </p>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border rounded-md shadow-md border-[#1e1b4b]/20">
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-[#1e1b4b]/70">
                  <Clock className="mr-2 h-4 w-4" />
                  Last saved 2 minutes ago
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
