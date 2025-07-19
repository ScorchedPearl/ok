import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  PlusCircle,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  AlertCircle,
  PenTool,
  Shield,
  BarChart3,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  useOffers, 
  useOffersByStatus, 
  usePendingApprovals,
  useEnhancedOfferStatus 
} from "@/utils/offerhooks";
import { formatDate } from "@/utils/api";

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

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
                <p className="text-gray-500 mb-4">Please log in to access the dashboard.</p>
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

  // Data hooks
  const { data: allOffers, loading: offersLoading } = useOffers(userId, userRole);
  const { data: draftOffers } = useOffersByStatus(userId, userRole, 'DRAFT');
  const { data: pendingOffers } = useOffersByStatus(userId, userRole, 'PENDING_APPROVAL');
  const { data: readyOffers } = useOffersByStatus(userId, userRole, 'READY_FOR_SIGN');
  const { data: signedOffers } = useOffersByStatus(userId, userRole, 'SIGNED');
  const { data: rejectedOffers } = useOffersByStatus(userId, userRole, 'REJECTED');
  const { data: pendingApprovals, loading: approvalsLoading } = usePendingApprovals(userId);

  const { getStatusColor, getStatusIcon } = useEnhancedOfferStatus();

  // Calculate metrics
  const totalOffers = allOffers?.length || 0;
  const completionRate = totalOffers > 0 ? ((signedOffers?.length || 0) / totalOffers * 100) : 0;
  const pendingApprovalsCount = pendingApprovals?.length || 0;

  // Recent activity (last 5 offers)
  const recentOffers = allOffers?.slice(0, 5) || [];

  const handleCreateOffer = () => {
    navigate("/dashboard/offers/create");
  };

  const handleViewOffers = () => {
    navigate("/dashboard/offer");
  };

  const handleViewApprovals = () => {
    navigate("/dashboard/approval");
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color, 
    trend = 'neutral',
    onClick 
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    onClick?: () => void;
  }) => (
    <Card 
      className={`bg-white border border-gray-200 shadow-sm ${onClick ? 'hover:shadow-md cursor-pointer transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center mt-1 ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
                <span className="text-xs font-medium">{change}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatusOverviewCard = () => (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center justify-between">
          <span>Offer Status Overview</span>
          <Button variant="outline" size="sm" onClick={handleViewOffers}>
            <BarChart3 className="h-4 w-4 mr-1" />
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { status: 'DRAFT', count: draftOffers?.length || 0, label: 'Draft' },
            { status: 'PENDING_APPROVAL', count: pendingOffers?.length || 0, label: 'Pending Approval' },
            { status: 'READY_FOR_SIGN', count: readyOffers?.length || 0, label: 'Ready to Sign' },
            { status: 'SIGNED', count: signedOffers?.length || 0, label: 'Signed' },
            { status: 'REJECTED', count: rejectedOffers?.length || 0, label: 'Rejected' }
          ].map(({ status, count, label }) => {
            const StatusIcon = getStatusIcon(status as any);
            const colorClasses = getStatusColor(status as any);
            
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <StatusIcon className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <div className="flex items-center">
                  <Badge className={`${colorClasses} font-medium mr-2`} variant="outline">
                    {count}
                  </Badge>
                  {count > 0 && (
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${totalOffers > 0 ? (count / totalOffers) * 100 : 0}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const PendingApprovalsCard = () => (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center justify-between">
          <span>Pending Approvals</span>
          {pendingApprovalsCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleViewApprovals}>
              <Clock className="h-4 w-4 mr-1" />
              Review ({pendingApprovalsCount})
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {approvalsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : pendingApprovalsCount === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
            <p className="text-gray-500">All caught up!</p>
            <p className="text-sm text-gray-400">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals?.slice(0, 3).map((approval) => (
              <div key={approval.approvalId} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Offer #{approval.offerId}</p>
                  <p className="text-sm text-gray-600">{approval.candidateName} • {approval.position}</p>
                  <p className="text-xs text-gray-500">Order #{approval.approvalOrder}</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/dashboard/offers/${approval.offerId}`)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Review
                </Button>
              </div>
            ))}
            {pendingApprovalsCount > 3 && (
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={handleViewApprovals}
              >
                View {pendingApprovalsCount - 3} more approvals
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const RecentActivityCard = () => (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {offersLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : recentOffers.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No recent activity</p>
            <Button onClick={handleCreateOffer} className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create First Offer
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOffers.map((offer) => {
              const StatusIcon = getStatusIcon(offer.status);
              const colorClasses = getStatusColor(offer.status);
              
              return (
                <div 
                  key={offer.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/dashboard/offers/${offer.id}`)}
                >
                  <div className="flex items-center">
                    <StatusIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Offer #{offer.id}</p>
                      <p className="text-sm text-gray-600">Candidate ID: {offer.candidateId}</p>
                      <p className="text-xs text-gray-500">{formatDate(offer.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge className={`${colorClasses} font-medium mr-2`} variant="outline">
                      {offer.status.replace(/_/g, ' ')}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionsCard = () => (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={handleCreateOffer}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Offer
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleViewOffers}
            className="w-full justify-start text-black"
          >
            <FileText className="h-4 w-4 mr-2" />
            View All Offers
          </Button>
          
          {pendingApprovalsCount > 0 && (
            <Button 
              variant="outline"
              onClick={handleViewApprovals}
              className="w-full justify-start border-yellow-300 text-yellow-700 hover:bg-yellow-50 "
            >
              <Clock className="h-4 w-4 mr-2" />
              Review Approvals ({pendingApprovalsCount})
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={() => navigate("/dashboard/templates")}
            className="w-full justify-start  text-black"
          >
            <FileText className="h-4 w-4 mr-2" />
            Manage Templates
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.fullName || user.email}! Here's your offer management overview.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Offers"
            value={totalOffers}
            change="+12% this month"
            icon={FileText}
            color="bg-indigo-600"
            trend="up"
            onClick={handleViewOffers}
          />
          
          <StatCard
            title="Pending Approvals"
            value={pendingApprovalsCount}
            change={pendingApprovalsCount > 0 ? "Requires attention" : "All clear"}
            icon={Clock}
            color="bg-yellow-600"
            trend={pendingApprovalsCount > 0 ? "neutral" : "up"}
            onClick={pendingApprovalsCount > 0 ? handleViewApprovals : undefined}
          />
          
          <StatCard
            title="Completion Rate"
            value={`${Math.round(completionRate)}%`}
            change="+5% this month"
            icon={CheckCircle}
            color="bg-green-600"
            trend="up"
          />
          
          <StatCard
            title="Ready to Sign"
            value={readyOffers?.length || 0}
            change="Waiting for candidates"
            icon={PenTool}
            color="bg-blue-600"
            trend="neutral"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Overview */}
          <div className="lg:col-span-2">
            <StatusOverviewCard />
          </div>
          
          {/* Quick Actions */}
          <div>
            <QuickActionsCard />
          </div>
        </div>

        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <PendingApprovalsCard />
          
          {/* Recent Activity */}
          <RecentActivityCard />
        </div>

        {/* Success Stories Section (if there are completed offers) */}
        {signedOffers && signedOffers.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Offers Successfully Completed</h3>
                    <p className="text-sm text-gray-600">
                      {signedOffers.length} offers have been signed and completed this {timeframe}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard/offers?filter=signed")}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  View Completed
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;