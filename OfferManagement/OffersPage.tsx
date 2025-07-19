// components/OffersManagementPage.tsx - Updated to use your existing AuthContext
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Button } from "../../../../components/ui/button";
import { PlusCircle, FileText, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Your existing auth context
import { useOffers, useOffersByStatus } from "@/utils/offerhooks"; // Your existing hooks
import { OfferStatus } from "@/utils/api"; // Your existing API types
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
  const displayStatus = status.replace("_", " ");

  return (
    <Badge className={`flex items-center ${color} hover:${color}`}>
      {icon}
      {displayStatus}
    </Badge>
  );
};

// Loading component
const LoadingCard = () => (
  <Card className="bg-white border border-gray-200">
    <CardContent className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <span className="ml-2 text-gray-600">Loading offers...</span>
    </CardContent>
  </Card>
);

// Error component
const ErrorCard = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <Card className="bg-white border border-red-200">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <XCircle className="h-12 w-12 text-red-400 mb-4" />
      <p className="text-xl font-medium text-red-600 mb-2">Error loading offers</p>
      <p className="text-red-500 mb-6">{error}</p>
      <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
        Try Again
      </Button>
    </CardContent>
  </Card>
);

const OffersManagementPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Always call hooks before any conditional logic
  const userId = user?.userId?.toString() || "";
  const userRole = user?.role as any;

  // Use appropriate hook based on tab - always call these hooks
  const allOffersHook = useOffers(userId, userRole);
  const draftOffersHook = useOffersByStatus(userId, userRole, "DRAFT");
  const pendingOffersHook = useOffersByStatus(userId, userRole, "PENDING_APPROVAL");
  const readyOffersHook = useOffersByStatus(userId, userRole, "READY_FOR_SIGN");
  const signedOffersHook = useOffersByStatus(userId, userRole, "SIGNED");
  const rejectedOffersHook = useOffersByStatus(userId, userRole, "REJECTED");

  // Handle authentication check AFTER all hooks are called
  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-500 mb-4">Please log in to access offer management.</p>
            <Button onClick={() => navigate("/login")} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentHook = () => {
    switch (activeTab) {
      case "all": return allOffersHook;
      case "draft": return draftOffersHook;
      case "pending_approval": return pendingOffersHook;
      case "ready_for_sign": return readyOffersHook;
      case "signed": return signedOffersHook;
      case "rejected": return rejectedOffersHook;
      default: return allOffersHook;
    }
  };

  const currentHook = getCurrentHook();
  const { data: offers, loading, error, refetch } = currentHook;

  const handleCreateOffer = () => {
    navigate("/dashboard/offers/create");
  };

  const handleViewOffer = (id: number) => {
    navigate(`/dashboard/offers/${id}`);
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingCard />;
    }

    if (error) {
      return <ErrorCard error={error} onRetry={refetch} />;
    }

    if (!offers || offers.length === 0) {
      return (
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-600 mb-2">No offers found</p>
            <p className="text-gray-500 mb-6">There are no offers in this category yet.</p>
            <Button onClick={handleCreateOffer} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Create New Offer
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {offers.map((offer) => (
          <Card 
            key={offer.id} 
            className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-gray-200"
            onClick={() => handleViewOffer(offer.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-gray-900">
                  Offer #{offer.id}
                </CardTitle>
                <StatusBadge status={offer.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Candidate ID</p>
                  <p className="font-medium text-gray-900">{offer.candidateId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="font-medium text-gray-900">User {offer.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">{new Date(offer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {offer.status === "PENDING_APPROVAL" && (
                <div className="mt-4 flex items-center">
                  <div className="bg-yellow-50 text-yellow-800 text-xs px-2 py-1 rounded-md">
                    {offer.pendingApprovalsCount} of {offer.totalApprovalsCount} approvals pending
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Offer Management</h1>
        <Button 
          onClick={handleCreateOffer}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Offer
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 mb-8 bg-gray-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
            All Offers
          </TabsTrigger>
          <TabsTrigger value="draft" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
            Draft
          </TabsTrigger>
          <TabsTrigger value="pending_approval" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
            Pending Approval
          </TabsTrigger>
          <TabsTrigger value="ready_for_sign" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
            Ready for Sign
          </TabsTrigger>
          <TabsTrigger value="signed" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
            Signed
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-800">
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OffersManagementPage;