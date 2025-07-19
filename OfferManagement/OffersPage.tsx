import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { PlusCircle, FileText, CheckCircle, Clock, XCircle, Loader2, AlertCircle, Search, Filter, User, Briefcase, DollarSign, Calendar } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOffers, useOffersByStatus, useCandidates, useOfferStatus } from "@/utils/offerhooks";
import { OfferStatus, parseOfferContent, formatDate, Candidate } from "@/utils/api";
import { toast } from "react-hot-toast";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const { getStatusColor } = useOfferStatus();
  const color = getStatusColor(status as OfferStatus);
  
  const getStatusIcon = () => {
    switch (status) {
      case "DRAFT":
        return <FileText className="h-3 w-3 mr-1" />;
      case "PENDING_APPROVAL":
        return <Clock className="h-3 w-3 mr-1" />;
      case "READY_FOR_SIGN":
        return <FileText className="h-3 w-3 mr-1" />;
      case "SIGNED":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "REJECTED":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <FileText className="h-3 w-3 mr-1" />;
    }
  };

  const displayStatus = status.replace(/_/g, " ");

  return (
    <Badge className={`flex items-center text-xs font-medium border ${color}`} variant="outline">
      {getStatusIcon()}
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
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
      <p className="text-xl font-medium text-red-600 mb-2">Error loading offers</p>
      <p className="text-red-500 mb-6 text-center max-w-md">{error}</p>
      <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
        Try Again
      </Button>
    </CardContent>
  </Card>
);

// Empty state component
const EmptyStateCard = ({ 
  onCreateOffer, 
  isFiltered = false,
  filterText = ""
}: { 
  onCreateOffer: () => void;
  isFiltered?: boolean;
  filterText?: string;
}) => (
  <Card className="bg-white border border-gray-200">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <FileText className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-xl font-medium text-gray-600 mb-2">
        {isFiltered ? "No offers match your filters" : "No offers found"}
      </p>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        {isFiltered 
          ? `Try adjusting your search criteria${filterText ? ` or clearing the search for "${filterText}"` : ''}.`
          : "There are no offers in this category yet. Create your first offer to get started."
        }
      </p>
      {!isFiltered && (
        <Button onClick={onCreateOffer} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Offer
        </Button>
      )}
    </CardContent>
  </Card>
);

// Offer card component
const OfferCard = ({ 
  offer, 
  candidate,
  offerContent,
  onClick 
}: {
  offer: any;
  candidate?: Candidate;
  offerContent?: any;
  onClick: () => void;
}) => (
  <Card 
    className="hover:shadow-md transition-all duration-200 cursor-pointer bg-white border border-gray-200 hover:border-gray-300"
    onClick={onClick}
  >
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg text-gray-900 font-medium">
            Offer #{offer.id}
          </CardTitle>
          {candidate && (
            <p className="text-sm text-gray-600 mt-1">{candidate.fullName}</p>
          )}
        </div>
        <StatusBadge status={offer.status} />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Candidate</p>
            <p className="text-sm text-gray-900 font-medium">
              {candidate?.fullName || `ID: ${offer.candidateId}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Position</p>
            <p className="text-sm text-gray-900 font-medium">
              {offerContent?.position || "Not specified"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Salary</p>
            <p className="text-sm text-gray-900 font-medium">
              {offerContent?.salary || "Not specified"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Created</p>
            <p className="text-sm text-gray-900 font-medium">
              {formatDate(offer.createdAt)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Additional offer details */}
      <div className="mt-4 space-y-2">
        {offer.status === "PENDING_APPROVAL" && (
          <div className="flex items-center">
            <div className="bg-yellow-50 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-200 font-medium">
              {offer.pendingApprovalsCount} of {offer.totalApprovalsCount} approvals pending
            </div>
          </div>
        )}
        
        {offer.status === "READY_FOR_SIGN" && (
          <div className="flex items-center">
            <div className="bg-blue-50 text-blue-800 text-xs px-3 py-1 rounded-full border border-blue-200 font-medium">
              Ready for candidate signature
            </div>
          </div>
        )}
        
        {offer.status === "SIGNED" && (
          <div className="flex items-center">
            <div className="bg-green-50 text-green-800 text-xs px-3 py-1 rounded-full border border-green-200 font-medium">
              ✓ Signed and completed
            </div>
          </div>
        )}

        {offerContent?.startDate && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Start Date:</span> {offerContent.startDate}
          </div>
        )}
        
        {offerContent?.location && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Location:</span> {offerContent.location}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const OffersManagementPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Handle authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">Authentication Required</h2>
                <p className="text-gray-500 mb-4">Please log in to access offer management.</p>
                <Button 
                  onClick={() => navigate("/login")} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
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

  // Use appropriate hook based on tab - always call these hooks
  const allOffersHook = useOffers(userId, userRole);
  const draftOffersHook = useOffersByStatus(userId, userRole, "DRAFT");
  const pendingOffersHook = useOffersByStatus(userId, userRole, "PENDING_APPROVAL");
  const readyOffersHook = useOffersByStatus(userId, userRole, "READY_FOR_SIGN");
  const signedOffersHook = useOffersByStatus(userId, userRole, "SIGNED");
  const rejectedOffersHook = useOffersByStatus(userId, userRole, "REJECTED");

  // Fetch candidates for enriching offer data
  const { data: candidates } = useCandidates(tenantId);

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

  // Enhanced offers with candidate and content data
  const enhancedOffers = useMemo(() => {
    if (!offers) return [];

    return offers.map(offer => {
      const candidate = candidates?.find(c => c.id === offer.candidateId);
      // For OfferSummaryDTO, we don't have offerContent, so we'll need to handle this differently
      // We could either fetch individual offers or modify the backend to include key fields
      return {
        ...offer,
        candidate,
        offerContent: null // We don't have this in summary, would need separate call
      };
    });
  }, [offers, candidates]);

  // Filtered and sorted offers
  const filteredOffers = useMemo(() => {
    if (!enhancedOffers) return [];

    let filtered = enhancedOffers;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(offer => 
        offer.id.toString().includes(query) ||
        offer.candidate?.fullName?.toLowerCase().includes(query) ||
        offer.candidate?.email?.toLowerCase().includes(query) ||
        offer.candidateId.toString().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "candidateName":
          aValue = a.candidate?.fullName || "";
          bValue = b.candidate?.fullName || "";
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "id":
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [enhancedOffers, searchQuery, sortBy, sortOrder]);

  const handleCreateOffer = () => {
    navigate("/dashboard/offers/create");
  };

  const handleViewOffer = (id: number) => {
    navigate(`/dashboard/offers/${id}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingCard />;
    }

    if (error) {
      return <ErrorCard error={error} onRetry={refetch} />;
    }

    const isFiltered = searchQuery.trim() !== "";
    
    if (!filteredOffers || filteredOffers.length === 0) {
      return (
        <EmptyStateCard 
          onCreateOffer={handleCreateOffer} 
          isFiltered={isFiltered}
          filterText={searchQuery}
        />
      );
    }

    return (
      <div className="space-y-4">
        {filteredOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            candidate={offer.candidate}
            offerContent={offer.offerContent}
            onClick={() => handleViewOffer(offer.id)}
          />
        ))}
      </div>
    );
  };

  // Get counts for tab badges
  const getTabCount = (tabName: string) => {
    switch (tabName) {
      case "all": return allOffersHook.data?.length || 0;
      case "draft": return draftOffersHook.data?.length || 0;
      case "pending_approval": return pendingOffersHook.data?.length || 0;
      case "ready_for_sign": return readyOffersHook.data?.length || 0;
      case "signed": return signedOffersHook.data?.length || 0;
      case "rejected": return rejectedOffersHook.data?.length || 0;
      default: return 0;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Offer Management</h1>
            <p className="text-gray-600 mt-1">
              Create, manage, and track job offers throughout their lifecycle
            </p>
          </div>
          <Button 
            onClick={handleCreateOffer}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Offer
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by offer ID, candidate name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sort Controls */}
              <div className="flex gap-3 ">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <SelectValue placeholder="Sort by" className="bg-indigo-600 hover:bg-indigo-700 text-white" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="candidateName">Candidate</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="id">Offer ID</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                  <SelectTrigger className="w-32 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <SelectValue placeholder="Order" className="bg-indigo-600 hover:bg-indigo-700 text-white" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest</SelectItem>
                    <SelectItem value="asc">Oldest</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery || sortBy !== "createdAt" || sortOrder !== "desc") && (
                  <Button variant="outline" onClick={clearFilters} size="default" className="text-black">
                    <Filter className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || sortBy !== "createdAt" || sortOrder !== "desc") && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {sortBy !== "createdAt" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Sort: {sortBy}
                  </Badge>
                )}
                {sortOrder !== "desc" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Order: {sortOrder === "asc" ? "Oldest first" : "Newest first"}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-8 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
            >
              All
              {getTabCount("all") > 0 && (
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {getTabCount("all")}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="draft" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
            >
              Draft
              {getTabCount("draft") > 0 && (
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {getTabCount("draft")}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="pending_approval" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
            >
              Pending
              {getTabCount("pending_approval") > 0 && (
                <span className="ml-2 bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                  {getTabCount("pending_approval")}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="ready_for_sign" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
            >
              Ready
              {getTabCount("ready_for_sign") > 0 && (
                <span className="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {getTabCount("ready_for_sign")}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="signed" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
            >
              Signed
              {getTabCount("signed") > 0 && (
                <span className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  {getTabCount("signed")}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="rejected" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-700 font-medium"
            >
              Rejected
              {getTabCount("rejected") > 0 && (
                <span className="ml-2 bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">
                  {getTabCount("rejected")}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {/* Results Summary */}
            {!loading && !error && filteredOffers && (
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredOffers.length} of {offers?.length || 0} offers
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            )}
            
            {renderContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OffersManagementPage;