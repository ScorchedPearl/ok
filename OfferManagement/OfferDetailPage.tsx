import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowLeft, 
  Download, 
  Send, 
  Edit, 
  User, 
  Briefcase,
  DollarSign,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  Building,
  Phone,
  Mail,
  Users,
  Timer,
  Globe
} from "lucide-react";
import { Separator } from "../../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { 
  useOffer, 
  useApproveOffer, 
  usePdfDownload,
  useSubmitForApproval,
  useCandidates,
  useOfferStatus
} from "@/utils/offerhooks";
import { Candidate, formatSalary, formatDate } from "@/utils/api";
import { toast } from "react-hot-toast";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const { getStatusColor } = useOfferStatus();
  const color = getStatusColor(status as any);
  
  const getStatusIcon = () => {
    switch (status) {
      case "DRAFT":
        return <FileText className="h-4 w-4 mr-1" />;
      case "PENDING_APPROVAL":
        return <Clock className="h-4 w-4 mr-1" />;
      case "READY_FOR_SIGN":
        return <FileText className="h-4 w-4 mr-1" />;
      case "SIGNED":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  const displayStatus = status.replace(/_/g, " ");

  return (
    <Badge className={`flex items-center text-sm font-medium border ${color}`} variant="outline">
      {getStatusIcon()}
      {displayStatus}
    </Badge>
  );
};

// Approval status badge component
const ApprovalStatusBadge = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status) {
      case "APPROVED":
        return { 
          color: "bg-green-100 text-green-800 border-green-200", 
          icon: <CheckCircle className="h-4 w-4 mr-1" /> 
        };
      case "PENDING":
        return { 
          color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
          icon: <Clock className="h-4 w-4 mr-1" /> 
        };
      case "REJECTED":
        return { 
          color: "bg-red-100 text-red-800 border-red-200", 
          icon: <XCircle className="h-4 w-4 mr-1" /> 
        };
      case "SKIPPED":
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-200", 
          icon: <FileText className="h-4 w-4 mr-1" /> 
        };
      default:
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-200", 
          icon: <FileText className="h-4 w-4 mr-1" /> 
        };
    }
  };

  const { color, icon } = getStatusProps();

  return (
    <Badge className={`flex items-center text-xs font-medium border ${color}`} variant="outline">
      {icon}
      {status}
    </Badge>
  );
};

// Detail row component for consistent formatting
const DetailRow = ({ 
  icon: Icon, 
  label, 
  value, 
  fallback = "Not specified",
  className = ""
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  fallback?: string;
  className?: string;
}) => (
  <div className={`flex items-center ${className}`}>
    <Icon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="font-medium text-gray-900 truncate">{value || fallback}</p>
    </div>
  </div>
);

const OfferManagementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [candidateDetails, setCandidateDetails] = useState<Candidate | null>(null);

  const { canEdit, canSubmit, canApprove } = useOfferStatus();

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
                <p className="text-gray-500 mb-4">Please log in to view offer details.</p>
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

  // API hooks
  const { data: offer, loading, error, refetch, offerContent } = useOffer(
    userId, 
    userRole, 
    id ? parseInt(id) : null
  );
  const { approveOffer, loading: approving } = useApproveOffer();
  const { downloadOfferPdf, downloadSignedPdf, loading: downloading } = usePdfDownload();
  const { submitForApproval, loading: submitting } = useSubmitForApproval();
  const { data: candidates } = useCandidates(tenantId);

  // Fetch candidate details when offer loads
  useEffect(() => {
    if (offer && candidates) {
      const candidate = candidates.find(c => c.id === offer.candidateId);
      setCandidateDetails(candidate || null);
    }
  }, [offer, candidates]);

  const handleBack = () => {
    navigate("/dashboard/offers");
  };

  const handleEdit = () => {
    navigate(`/dashboard/offers/${id}/edit`);
  };

  const handleDownloadPdf = async () => {
    if (!offer) return;
    await downloadOfferPdf(userId, userRole, offer.id);
  };

  const handleDownloadSignedPdf = async () => {
    if (!offer) return;
    await downloadSignedPdf(userId, userRole, offer.id);
  };

  const handleApprove = async (approvalId: number) => {
    if (!offer) return;
    
    const success = await approveOffer(userId, userRole, offer.id, {
      action: 'APPROVED',
      comment: 'Approved via detail page'
    });

    if (success) {
      await refetch();
    }
  };

  const handleReject = async (approvalId: number) => {
    if (!offer) return;
    
    const comment = prompt("Please provide a reason for rejection:");
    if (!comment) {
      toast.error("Rejection comment is required");
      return;
    }
    
    const success = await approveOffer(userId, userRole, offer.id, {
      action: 'REJECTED',
      comment
    });

    if (success) {
      await refetch();
    }
  };

  const handleSubmitForApprovalAction = async () => {
    if (!offer) return;
    
    const result = await submitForApproval(userId, userRole, offer.id);
    if (result) {
      await refetch();
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-3 text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Loading offer details...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-3 text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-red-600">Error loading offer</h1>
          </div>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <div className="font-medium mb-1">Failed to load offer details</div>
              <p>{error}</p>
              <Button onClick={refetch} className="mt-4" variant="outline" size="sm">
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-3 text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Offer not found</h1>
          </div>
          <Card className="bg-white border border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">The requested offer could not be found.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="mr-3 text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offer #{offer.id}</h1>
              <p className="text-gray-600 mt-1">
                Created on {formatDate(offer.createdAt)} by User {offer.createdBy}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {canEdit(offer.status) && (
              <>
                <Button onClick={handleEdit} variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  onClick={handleSubmitForApprovalAction} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Submit for Approval
                </Button>
              </>
            )}
            
            <Button 
              onClick={handleDownloadPdf} 
              variant="outline" 
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
            
            {offer.status === "SIGNED" && offer.signedPdfUrl && (
              <Button 
                onClick={handleDownloadSignedPdf} 
                variant="outline" 
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download Signed PDF
              </Button>
            )}
          </div>
        </div>

        {/* Status and Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <DetailRow
                icon={User}
                label="Candidate"
                value={candidateDetails?.fullName || `Candidate ID: ${offer.candidateId}`}
              />
              {candidateDetails?.email && (
                <div className="mt-2 ml-8">
                  <p className="text-sm text-gray-600">{candidateDetails.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <DetailRow
                icon={Briefcase}
                label="Position"
                value={offerContent?.position}
              />
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <DetailRow
                icon={DollarSign}
                label="Salary"
                value={offerContent?.salary}
              />
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <StatusBadge status={offer.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Timeline Sidebar */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Offer created</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(offer.createdAt)} by User {offer.createdBy}
                    </p>
                  </div>
                </div>
                
                {offer.status !== "DRAFT" && (
                  <div className="flex items-start">
                    <div className="bg-yellow-100 p-2 rounded-full mr-3">
                      <Send className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Submitted for approval</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(offer.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
                
                {offer.approvals?.filter(approval => approval.status !== "PENDING")
                  .map((approval) => (
                    <div key={approval.id} className="flex items-start">
                      <div className={`${approval.status === "APPROVED" ? "bg-green-100" : "bg-red-100"} p-2 rounded-full mr-3`}>
                        {approval.status === "APPROVED" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {approval.status === "APPROVED" ? "Approved" : "Rejected"} by User {approval.approverId}
                        </p>
                        {approval.actionTimestamp && (
                          <p className="text-sm text-gray-500">
                            {formatDate(approval.actionTimestamp)}
                          </p>
                        )}
                        {approval.comment && (
                          <p className="text-sm mt-1 bg-gray-50 p-2 rounded-md text-gray-700">
                            "{approval.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <Card className="lg:col-span-3 bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900">Offer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="details" 
                    className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="candidate" 
                    className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
                  >
                    Candidate Info
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approvals" 
                    className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
                  >
                    Approvals ({offer.approvals?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <div className="space-y-6">
                    {/* Core Offer Information */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="font-medium mb-4 text-gray-900">Offer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {offerContent?.position && (
                          <DetailRow icon={Briefcase} label="Position" value={offerContent.position} />
                        )}
                        
                        {offerContent?.salary && (
                          <DetailRow icon={DollarSign} label="Salary" value={offerContent.salary} />
                        )}
                        
                        {offerContent?.startDate && (
                          <DetailRow icon={Calendar} label="Start Date" value={offerContent.startDate} />
                        )}
                        
                        {offerContent?.location && (
                          <DetailRow icon={MapPin} label="Location" value={offerContent.location} />
                        )}

                        {offerContent?.workType && (
                          <DetailRow icon={Globe} label="Work Type" value={offerContent.workType} />
                        )}

                        {offerContent?.employmentType && (
                          <DetailRow icon={Users} label="Employment Type" value={offerContent.employmentType} />
                        )}
                        
                        {offerContent?.benefits && (
                          <DetailRow icon={Building} label="Benefits" value={offerContent.benefits} />
                        )}

                        {offerContent?.department && (
                          <DetailRow icon={Building} label="Department" value={offerContent.department} />
                        )}

                        {offerContent?.reportingManager && (
                          <DetailRow icon={User} label="Reporting Manager" value={offerContent.reportingManager} />
                        )}

                        {offerContent?.workingHours && (
                          <DetailRow icon={Clock} label="Working Hours" value={offerContent.workingHours} />
                        )}

                        {offerContent?.probationPeriod && (
                          <DetailRow icon={Timer} label="Probation Period" value={offerContent.probationPeriod} />
                        )}

                        {offerContent?.noticePeriod && (
                          <DetailRow icon={Calendar} label="Notice Period" value={offerContent.noticePeriod} />
                        )}
                      </div>
                    </div>

                    {/* Additional Content */}
                    {offerContent?.content && (
                      <div>
                        <h3 className="font-medium mb-3 text-gray-900">Additional Details</h3>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-700 whitespace-pre-wrap">{offerContent.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="candidate">
                  <div className="space-y-6">
                    {candidateDetails ? (
                      <>
                        {/* Basic Candidate Info */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <h3 className="font-medium mb-4 text-gray-900">Candidate Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailRow icon={User} label="Full Name" value={candidateDetails.fullName} />
                            <DetailRow icon={Mail} label="Email" value={candidateDetails.email} />
                            
                            {candidateDetails.phoneNumber && (
                              <DetailRow icon={Phone} label="Phone" value={candidateDetails.phoneNumber} />
                            )}

                            {candidateDetails.experience && (
                              <DetailRow icon={Briefcase} label="Experience" value={candidateDetails.experience} />
                            )}

                            {candidateDetails.currentLocation && (
                              <DetailRow icon={MapPin} label="Current Location" value={candidateDetails.currentLocation} />
                            )}

                            {candidateDetails.preferredLocation && (
                              <DetailRow icon={MapPin} label="Preferred Location" value={candidateDetails.preferredLocation} />
                            )}

                            {candidateDetails.currentSalary && (
                              <DetailRow icon={DollarSign} label="Current Salary" value={candidateDetails.currentSalary} />
                            )}

                            {candidateDetails.expectedSalary && (
                              <DetailRow icon={DollarSign} label="Expected Salary" value={candidateDetails.expectedSalary} />
                            )}

                            {candidateDetails.availableFrom && (
                              <DetailRow icon={Calendar} label="Available From" value={candidateDetails.availableFrom} />
                            )}

                            <div className="flex items-center">
                              <Building className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm text-gray-500 font-medium">Status</p>
                                <Badge className="mt-1" variant="outline">
                                  {candidateDetails.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        {candidateDetails.skills && candidateDetails.skills.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-3 text-gray-900">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {candidateDetails.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resume Summary */}
                        {candidateDetails.resumeSummary && (
                          <div>
                            <h3 className="font-medium mb-3 text-gray-900">Resume Summary</h3>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <p className="text-gray-700 whitespace-pre-wrap">{candidateDetails.resumeSummary}</p>
                            </div>
                          </div>
                        )}

                        {/* Application Stats */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <h3 className="font-medium mb-4 text-gray-900">Application Statistics</h3>
                          <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-indigo-600">{candidateDetails.applicationCount || 0}</p>
                              <p className="text-sm text-gray-500">Applications</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{candidateDetails.testCount || 0}</p>
                              <p className="text-sm text-gray-500">Tests</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{candidateDetails.interviewCount || 0}</p>
                              <p className="text-sm text-gray-500">Interviews</p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Candidate details not available. 
                          <br />
                          Candidate ID: {offer.candidateId}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="approvals">
                  <div className="space-y-4">
                    {offer.approvals && offer.approvals.length > 0 ? (
                      offer.approvals.map((approval, index) => (
                        <Card key={approval.id} className="bg-gray-50 border border-gray-200">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">User {approval.approverId}</p>
                                  <p className="text-sm text-gray-500">{approval.approverRole}</p>
                                </div>
                              </div>
                              <ApprovalStatusBadge status={approval.status} />
                            </div>
                            
                            {approval.comment && (
                              <div className="mt-3 bg-white p-3 rounded-md border border-gray-200">
                                <p className="text-sm text-gray-700">{approval.comment}</p>
                              </div>
                            )}
                            
                            {approval.status === "PENDING" && canApprove(offer.status) && (
                              <div className="flex gap-3 mt-4 justify-end">
                                <Button 
                                  variant="outline" 
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(approval.id)}
                                  disabled={approving}
                                >
                                  {approving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Reject
                                </Button>
                                <Button 
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleApprove(approval.id)}
                                  disabled={approving}
                                >
                                  {approving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Approve
                                </Button>
                              </div>
                            )}
                            
                            {approval.actionTimestamp && (
                              <div className="mt-3 text-right">
                                <p className="text-xs text-gray-500">
                                  {formatDate(approval.actionTimestamp)}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No approvals configured for this offer</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfferManagementDetailPage;