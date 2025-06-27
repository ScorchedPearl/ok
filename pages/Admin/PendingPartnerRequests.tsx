import { useState, useEffect } from "react"
import { Search,  RefreshCw, Linkedin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"


import { useAuth } from "@/context/AuthContext"
import { api } from '@/utils/api'

type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface PartnerRegistrationRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason: string;
}

type StatusFilterType = RegistrationStatus | 'ALL';

// const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8005';

export default function PendingPartnerRequestsPage() {
  const { token } = useAuth();

  const [searchQuery, setSearchQuery] = useState("")
  const [pendingRequests, setPendingRequests] = useState<PartnerRegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<PartnerRegistrationRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL")

  useEffect(() => {
    fetchPendingRequests();
  }, []);

const fetchPendingRequests = async () => {
  if(!token) return;
  try {
    setLoading(true);
    const data = await api.partner.getPendingRegistrations(token);
    setPendingRequests(data);
    setError(null);
  } catch (err: any) {
    setError('Failed to load pending requests. Please try again.');
    console.error('Error fetching pending requests:', err);
  } finally {
    setLoading(false);
  }
};

  const filteredRequests = pendingRequests.filter(request => {
    const fullName = `${request.firstName} ${request.lastName}`.toLowerCase();
    
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.phone.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleApprove = async (requestId: number) => {
    if (!token) return;
    if (!requestId) return;

    try {
      setActionInProgress(requestId);
      await api.partner.approveRegistration(token, requestId);
      
      setPendingRequests(prev => prev.map(req => 
        req.id === requestId
        ? {
            ...req,
            status: 'APPROVED' as RegistrationStatus,
            updatedAt: new Date().toISOString()
          }
        : req
      ));
      
      setSuccessMessage('Partner registration approved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve request. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };



  const openRejectModal = (requestId: number) => {
    setSelectedRequestId(requestId);
    setRejectReason('');
    setShowRejectModal(true);
  };

 const handleReject = async () => {
  if (!selectedRequestId) return;
  if (!token) return;
  
  try {
    setActionInProgress(selectedRequestId);
    await api.partner.rejectRegistration(token, selectedRequestId, rejectReason);
    
    setPendingRequests(prev => prev.map(req => 
      req.id === selectedRequestId
      ? {
          ...req,
          status: 'REJECTED' as RegistrationStatus,
          rejectionReason: rejectReason,
          updatedAt: new Date().toISOString()
        }
      : req
    ));
    
    setShowRejectModal(false);
    setSuccessMessage('Partner registration rejected successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to reject request. Please try again.');
  } finally {
    setActionInProgress(null);
  }
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const openLinkedInProfile = (url: string) => {
    if (!url) return;
    
    // Make sure URL has proper format
    let profileUrl = url;
    if (!profileUrl.startsWith('http://') && !profileUrl.startsWith('https://')) {
      profileUrl = 'https://' + profileUrl;
    }
    
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Partner Registration Requests</h1>
        <div className="flex gap-4">
          <select 
            className="rounded-md border p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchPendingRequests}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {loading && pendingRequests.length === 0 ? (
            <div className="flex justify-center items-center h-64 border rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              No partner registration requests found
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr 
                      key={request.id} 
                      className={`${selectedRequest?.id === request.id ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.firstName} {request.lastName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(request.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(request.id);
                                }}
                                disabled={actionInProgress === request.id}
                                className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                              >
                                {actionInProgress === request.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRejectModal(request.id);
                                }}
                                disabled={actionInProgress === request.id}
                                className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Partner Details</h2>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedRequest.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  selectedRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedRequest.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">LinkedIn Profile</p>
                  {selectedRequest.linkedinUrl ? (
                    <div className="flex items-center mt-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center text-blue-600 border-blue-200" 
                        onClick={() => openLinkedInProfile(selectedRequest.linkedinUrl)}
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No LinkedIn profile provided</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date Submitted</p>
                  <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                
                {selectedRequest.status === 'REJECTED' && selectedRequest.rejectionReason && (
                  <div>
                    <p className="text-sm text-gray-500">Rejection Reason</p>
                    <p className="font-medium text-red-600">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
              
              {selectedRequest.status === 'PENDING' && (
                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={actionInProgress === selectedRequest.id}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                  >
                    {actionInProgress === selectedRequest.id ? 'Processing...' : 'Approve Request'}
                  </Button>
                  
                  <Button 
                    onClick={() => openRejectModal(selectedRequest.id)}
                    disabled={actionInProgress === selectedRequest.id}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 w-full"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              Select a request to view details
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject Partner Registration</h2>
            <p className="mb-4 text-gray-600">Please provide a reason for rejecting this registration request:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
              required
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionInProgress === selectedRequestId}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
              >
                {actionInProgress === selectedRequestId ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}