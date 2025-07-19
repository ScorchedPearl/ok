import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Textarea } from "../../../../components/ui/textarea";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  DollarSign,
  Briefcase,
  MessageSquare,
  AlertCircle,
  Loader2,
  ChevronRight,
  Building
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePendingApprovals, useApprovalWorkflow } from "@/utils/offerhooks";
import { formatDate } from "@/utils/api";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/ui/dialog";
import { toast } from "react-hot-toast";

const PendingApprovalsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [actionComment, setActionComment] = useState("");
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);

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
                <p className="text-gray-500 mb-4">Please log in to view pending approvals.</p>
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

  const { pendingApprovals, loading, processApproval, refetch } = useApprovalWorkflow(userId);

  const handleApprovalAction = async (approval: any, action: 'APPROVED' | 'REJECTED') => {
    setSelectedApproval(approval);
    setActionType(action);
    setActionComment("");
    setShowActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedApproval || !actionType) return;

    if (actionType === 'REJECTED' && !actionComment.trim()) {
      toast.error("Please provide a comment when rejecting an offer");
      return;
    }

    const success = await processApproval(
      userRole,
      selectedApproval.offerId,
      actionType,
      actionComment.trim() || undefined
    );

    if (success) {
      setShowActionDialog(false);
      setSelectedApproval(null);
      setActionType(null);
      setActionComment("");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'APPROVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge className={`${colors[status as keyof typeof colors] || colors.PENDING} font-medium`} variant="outline">
        {status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
        {status === 'APPROVED' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const LoadingState = () => (
    <Card className="bg-white border border-gray-200">
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading pending approvals...</span>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <Card className="bg-white border border-gray-200">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
        <p className="text-xl font-medium text-gray-600 mb-2">All caught up!</p>
        <p className="text-gray-500 text-center max-w-md">
          You have no pending approvals at the moment. Check back later for new offers requiring your approval.
        </p>
      </CardContent>
    </Card>
  );

  const ApprovalCard = ({ approval }: { approval: any }) => (
    <Card key={approval.approvalId} className="hover:shadow-md transition-all duration-200 bg-white border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-gray-900 font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Offer #{approval.offerId}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Created {formatDate(approval.createdAt)} by User {approval.createdBy}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium" variant="outline">
              Order #{approval.approvalOrder}
            </Badge>
            {getStatusBadge('PENDING')}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Offer Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Offer Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Candidate</p>
                <p className="text-sm text-gray-900 font-medium">{approval.candidateName}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Position</p>
                <p className="text-sm text-gray-900 font-medium">{approval.position}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Salary</p>
                <p className="text-sm text-gray-900 font-medium">{approval.salary}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Building className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Status</p>
                <p className="text-sm text-gray-900 font-medium">{approval.offerStatus.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Details */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Approval Details</h4>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Role:</span> {approval.approverRole}
          </p>
          {approval.comment && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <MessageSquare className="h-4 w-4 inline mr-1" />
                <span className="font-medium">Comment:</span> {approval.comment}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/dashboard/offers/${approval.offerId}`)}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApprovalAction(approval, 'REJECTED')}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            
            <Button
              size="sm"
              onClick={() => handleApprovalAction(approval, 'APPROVED')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">
            Review and approve offers waiting for your decision
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingApprovals?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Your Role</p>
                  <p className="text-2xl font-bold text-gray-900">{userRole}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-2xl font-bold text-gray-900">{userId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals List */}
        {loading ? (
          <LoadingState />
        ) : !pendingApprovals || pendingApprovals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Offers Requiring Your Approval ({pendingApprovals.length})
              </h2>
              <Button 
                variant="outline" 
                onClick={refetch}
                disabled={loading}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
            
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <ApprovalCard key={approval.approvalId} approval={approval} />
              ))}
            </div>
          </div>
        )}

        {/* Action Confirmation Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {actionType === 'APPROVED' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                {actionType === 'APPROVED' ? 'Approve Offer' : 'Reject Offer'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedApproval && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    Offer #{selectedApproval.offerId} - {selectedApproval.candidateName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedApproval.position} • {selectedApproval.salary}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'REJECTED' ? 'Rejection Reason *' : 'Comment (Optional)'}
                </label>
                <Textarea
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  placeholder={
                    actionType === 'REJECTED' 
                      ? "Please provide a reason for rejection..."
                      : "Add a comment (optional)..."
                  }
                  rows={3}
                  className="w-full"
                />
                {actionType === 'REJECTED' && (
                  <p className="text-xs text-red-600 mt-1">* Required for rejections</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowActionDialog(false)}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmAction}
                  disabled={actionType === 'REJECTED' && !actionComment.trim()}
                  className={
                    actionType === 'APPROVED'
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }
                >
                  {actionType === 'APPROVED' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PendingApprovalsPage;