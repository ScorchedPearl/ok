import React, { useState } from "react";
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
  Loader2
} from "lucide-react";
import { Separator } from "../../../../components/ui/separator";
import { useAuth } from "@/context/AuthContext"; // Your existing auth context
import { 
  useOffer, 
  useApproveOffer, 
  usePdfDownload 
} from "@/utils/offerhooks"; // Your existing hooks
import { toast } from "react-hot-toast";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status) {
      case "DRAFT":
        return { color: "bg-gray-200 text-gray-800", icon: <FileText className="h-4 w-4 mr-1" /> };
      case "PENDING_APPROVAL":
        return { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4 mr-1" /> };
      case "READY_FOR_SIGN":
        return { color: "bg-blue-100 text-blue-800", icon: <FileText className="h-4 w-4 mr-1" /> };
      case "SIGNED":
        return { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4 mr-1" /> };
      case "REJECTED":
        return { color: "bg-red-100 text-red-800", icon: <XCircle className="h-4 w-4 mr-1" /> };
      default:
        return { color: "bg-gray-200 text-gray-800", icon: <FileText className="h-4 w-4 mr-1" /> };
    }
  };

  const { color, icon } = getStatusProps();
  const displayStatus = status.replace(/_/g, " ");

  return (
    <Badge className={`flex items-center ${color} hover:${color}`}>
      {icon}
      {displayStatus}
    </Badge>
  );
};

// Approval status badge component
const ApprovalStatusBadge = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status) {
      case "APPROVED":
        return { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4 mr-1" /> };
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4 mr-1" /> };
      case "REJECTED":
        return { color: "bg-red-100 text-red-800", icon: <XCircle className="h-4 w-4 mr-1" /> };
      case "SKIPPED":
        return { color: "bg-gray-200 text-gray-800", icon: <FileText className="h-4 w-4 mr-1" /> };
      default:
        return { color: "bg-gray-200 text-gray-800", icon: <FileText className="h-4 w-4 mr-1" /> };
    }
  };

  const { color, icon } = getStatusProps();

  return (
    <Badge className={`flex items-center ${color} hover:${color}`}>
      {icon}
      {status}
    </Badge>
  );
};

const OfferManagementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("details");

  if (!isAuthenticated || !user) {
    toast.error("Authentication required");
    navigate("/login");
    return null;
  }

  const userId = user.userId?.toString() || "";
  const userRole = user.role as any;

  // API hooks
  const { data: offer, loading, error, refetch, offerContent } = useOffer(
    userId, 
    userRole, 
    id ? parseInt(id) : null
  );
  const { approveOffer, loading: approving } = useApproveOffer();
  const { downloadOfferPdf, downloadSignedPdf, loading: downloading } = usePdfDownload();

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
    
    const success = await approveOffer(userId, userRole, offer.id, {
      action: 'REJECTED',
      comment: 'Rejected via detail page'
    });

    if (success) {
      await refetch();
    }
  };

  const handleSubmitForApproval = async () => {
    // TODO: Implement submit for approval using your existing API
    toast.success("Feature coming soon - Submit for approval");
  };

  if (loading) {
    return (
      <div className="p-6 bg-white">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-2 text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Loading offer details...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-2 text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-red-600">Error loading offer</h1>
        </div>
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
            <Button onClick={refetch} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="p-6 bg-white">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-2 text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Offer not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white text-gray-900">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-2 text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Offer Details #{offer.id}</h1>
        <div className="ml-auto flex gap-2">
          {offer.status === "DRAFT" && (
            <>
              <Button onClick={handleEdit} variant="outline" className="text-gray-700 border-gray-300">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleSubmitForApproval} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Send className="h-4 w-4 mr-2" />
                Submit for Approval
              </Button>
            </>
          )}
          <Button 
            onClick={handleDownloadPdf} 
            variant="outline" 
            className="text-gray-700 border-gray-300"
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
              className="text-gray-700 border-gray-300"
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

      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Candidate ID</p>
                <p className="font-medium text-gray-900">{offer.candidateId}</p>
                {offerContent?.candidateName && (
                  <p className="text-sm text-gray-600">{offerContent.candidateName}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium text-gray-900">{offerContent?.position || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="font-medium text-gray-900">{offerContent?.salary || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card className="col-span-1 bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <StatusBadge status={offer.status} />
            </div>
            <div className="text-sm text-gray-500 mb-1">Created by</div>
            <div className="font-medium text-gray-900 mb-4">User {offer.createdBy}</div>
            <div className="text-sm text-gray-500 mb-1">Created on</div>
            <div className="font-medium text-gray-900 mb-4">
              {new Date(offer.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500 mb-1">Last updated</div>
            <div className="font-medium text-gray-900">
              {new Date(offer.updatedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900">Offer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-gray-100">
                <TabsTrigger value="details" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
                  Details
                </TabsTrigger>
                <TabsTrigger value="approvals" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
                  Approvals ({offer.approvals?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
                  <h3 className="font-medium mb-2 text-gray-900">Offer Content</h3>
                  {offerContent ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(offerContent)
                        .filter(([_, value]) => value) // Only show fields with values
                        .map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <p className="text-sm text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="font-medium text-gray-900">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No offer content available</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="approvals">
                <div className="space-y-4">
                  {offer.approvals && offer.approvals.length > 0 ? (
                    offer.approvals.map((approval, index) => (
                      <Card key={approval.id} className="bg-gray-50 border border-gray-200">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Approver {approval.approverId}</p>
                                <p className="text-sm text-gray-500">{approval.approverRole}</p>
                              </div>
                            </div>
                            <ApprovalStatusBadge status={approval.status} />
                          </div>
                          
                          {approval.comment && (
                            <div className="mt-2 bg-white p-3 rounded-md border border-gray-200">
                              <p className="text-sm text-gray-700">{approval.comment}</p>
                            </div>
                          )}
                          
                          {approval.status === "PENDING" && (
                            <div className="flex gap-2 mt-4 justify-end">
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
                            <div className="mt-2 text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(approval.actionTimestamp).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500">No approvals configured for this offer</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Offer created</p>
                      <p className="text-sm text-gray-500">
                        {new Date(offer.createdAt).toLocaleString()} by User {offer.createdBy}
                      </p>
                    </div>
                  </div>
                  
                  {offer.status !== "DRAFT" && (
                    <div className="flex items-start">
                      <div className="bg-yellow-100 p-2 rounded-full mr-3">
                        <Send className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Submitted for approval</p>
                        <p className="text-sm text-gray-500">
                          {new Date(offer.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {offer.approvals?.filter(approval => approval.status !== "PENDING")
                    .map((approval) => (
                      <div key={approval.id} className="flex items-start">
                        <div className={`${approval.status === "APPROVED" ? "bg-green-100" : "bg-red-100"} p-2 rounded-full mr-3`}>
                          {approval.status === "APPROVED" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {approval.status === "APPROVED" ? "Approved" : "Rejected"} by Approver {approval.approverId}
                          </p>
                          {approval.actionTimestamp && (
                            <p className="text-sm text-gray-500">
                              {new Date(approval.actionTimestamp).toLocaleString()}
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfferManagementDetailPage;