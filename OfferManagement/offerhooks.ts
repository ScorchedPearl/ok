import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import {
  OfferLetterDTO,
  OfferSummaryDTO,
  OfferApprovalDTO,
  PendingApprovalDetailDTO,
  OfferTemplateDTO,
  SignatureDTO,
  CreateOfferRequest,
  CreateOfferFromTemplateRequest,
  ApprovalActionRequest,
  SignOfferRequest,
  CreateTemplateRequest,
  OfferStatus,
  parseOfferContent,
  OfferContent,
  EnhanceOfferRequest,
  EnhanceOfferResponse,
  Candidate,
  parseCandidate,
  validateOfferContent,
  OfferValidationError,
  ValidationError,
  formatSalary,
  formatDate
} from '@/utils/api';

// =============================================================================
// CUSTOM REACT HOOKS FOR OFFER MANAGEMENT WITH VALIDATION
// =============================================================================

interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiHookActions {
  refetch: () => Promise<void>;
  reset: () => void;
}

// =============================================================================
// CANDIDATE HOOKS
// =============================================================================

export const useCandidates = (tenantId?: string) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<Candidate[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchCandidates = useCallback(async () => {
    if (!token || !tenantId) {
      setState({ data: [], loading: false, error: 'Missing authentication or tenant ID' });
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const candidates = await api.candidates.getCandidates(token, tenantId);
      setState({ data: candidates, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setState({ data: [], loading: false, error: (error as Error).message });
    }
  }, [token, tenantId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    ...state,
    refetch: fetchCandidates,
    reset: () => setState({ data: null, loading: false, error: null })
  };
};

// =============================================================================
// OFFER HOOKS
// =============================================================================

export const useOffers = (userId: string, userRole: string) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<OfferSummaryDTO[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchOffers = useCallback(async () => {
    if (!token || !userId) {
      setState({ data: null, loading: false, error: 'Authentication required' });
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const offers = await api.offers.getAllOffers(token, userId, userRole);
      setState({ data: offers, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching offers:', error);
      setState({ data: null, loading: false, error: (error as Error).message });
    }
  }, [token, userId, userRole]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return {
    ...state,
    refetch: fetchOffers,
    reset: () => setState({ data: null, loading: false, error: null })
  };
};

export const useOffer = (userId: string, userRole: string, offerId: number | null) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<OfferLetterDTO>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchOffer = useCallback(async () => {
    if (!offerId || !token || !userId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const offer = await api.offers.getOffer(token, userId, userRole, offerId);
      setState({ data: offer, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching offer:', error);
      setState({ data: null, loading: false, error: (error as Error).message });
    }
  }, [token, userId, userRole, offerId]);

  useEffect(() => {
    fetchOffer();
  }, [fetchOffer]);

  return {
    ...state,
    refetch: fetchOffer,
    reset: () => setState({ data: null, loading: false, error: null }),
    // Helper to get parsed offer content with better error handling
    offerContent: state.data ? parseOfferContent(state.data.offerContent) : null
  };
};

export const useCreateOffer = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const createOffer = async (
    userId: string, 
    userRole: string, 
    offerData: CreateOfferRequest
  ): Promise<OfferLetterDTO | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      setValidationErrors([]);
      
      const offer = await api.offers.createOffer(token, userId, userRole, offerData);
      toast.success('Offer created successfully!');
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      
      if (error instanceof OfferValidationError) {
        setValidationErrors(error.errors);
        toast.error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      } else {
        toast.error((error as Error).message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (
    userId: string,
    userRole: string,
    templateData: CreateOfferFromTemplateRequest
  ): Promise<OfferLetterDTO | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      setValidationErrors([]);
      
      const offer = await api.offers.createFromTemplate(token, userId, userRole, templateData);
      toast.success('Offer created from template successfully!');
      return offer;
    } catch (error) {
      console.error('Error creating offer from template:', error);
      
      if (error instanceof OfferValidationError) {
        setValidationErrors(error.errors);
        toast.error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      } else {
        toast.error((error as Error).message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOffer = async (
    userId: string,
    userRole: string,
    offerId: number,
    offerData: CreateOfferRequest
  ): Promise<OfferLetterDTO | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      setValidationErrors([]);
      
      const offer = await api.offers.updateOffer(token, userId, userRole, offerId, offerData);
      toast.success('Offer updated successfully!');
      return offer;
    } catch (error) {
      console.error('Error updating offer:', error);
      
      if (error instanceof OfferValidationError) {
        setValidationErrors(error.errors);
        toast.error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      } else {
        toast.error((error as Error).message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    createOffer, 
    createFromTemplate, 
    updateOffer, 
    loading, 
    validationErrors,
    clearValidationErrors: () => setValidationErrors([])
  };
};

export const useOffersByStatus = (userId: string, userRole: string, status: OfferStatus) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<OfferSummaryDTO[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchOffersByStatus = useCallback(async () => {
    if (!token || !userId) {
      setState({ data: null, loading: false, error: 'Authentication required' });
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const offers = await api.offers.getOffersByStatus(token, userId, userRole, status);
      setState({ data: offers, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching offers by status:', error);
      setState({ data: null, loading: false, error: (error as Error).message });
    }
  }, [token, userId, userRole, status]);

  useEffect(() => {
    fetchOffersByStatus();
  }, [fetchOffersByStatus]);

  return {
    ...state,
    refetch: fetchOffersByStatus,
    reset: () => setState({ data: null, loading: false, error: null })
  };
};

// =============================================================================
// APPROVAL HOOKS
// =============================================================================

export const usePendingApprovals = (userId: string) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<PendingApprovalDetailDTO[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchPendingApprovals = useCallback(async () => {
    if (!token || !userId) {
      setState({ data: null, loading: false, error: 'Authentication required' });
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const approvals = await api.approvals.getPendingApprovalsDetailed(token, userId);
      setState({ data: approvals, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      setState({ data: null, loading: false, error: (error as Error).message });
    }
  }, [token, userId]);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  return {
    ...state,
    refetch: fetchPendingApprovals,
    reset: () => setState({ data: null, loading: false, error: null })
  };
};

export const useApproveOffer = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const approveOffer = async (
    userId: string,
    userRole: string,
    offerId: number,
    action: ApprovalActionRequest
  ): Promise<boolean> => {
    if (!token) {
      toast.error('Authentication required');
      return false;
    }

    try {
      setLoading(true);
      await api.approvals.approveOffer(token, userId, userRole, offerId, action);
      toast.success(`Offer ${action.action.toLowerCase()} successfully!`);
      return true;
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error((error as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { approveOffer, loading };
};

// =============================================================================
// TEMPLATE HOOKS
// =============================================================================

export const useTemplates = (userId: string, userRole: string) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<OfferTemplateDTO[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchTemplates = useCallback(async () => {
    if (!token || !userId) {
      setState({ data: null, loading: false, error: 'Authentication required' });
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const templates = await api.templates.getAllTemplates(token, userId, userRole);
      setState({ data: templates, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching templates:', error);
      setState({ data: null, loading: false, error: (error as Error).message });
    }
  }, [token, userId, userRole]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    ...state,
    refetch: fetchTemplates,
    reset: () => setState({ data: null, loading: false, error: null })
  };
};

// =============================================================================
// SIGNATURE HOOKS
// =============================================================================

export const useSignOffer = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const signOffer = async (
    offerId: number,
    signatureData: SignOfferRequest
  ): Promise<SignatureDTO | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      const signature = await api.signatures.signOffer(token, offerId, signatureData);
      toast.success('Offer signed successfully!');
      return signature;
    } catch (error) {
      console.error('Error signing offer:', error);
      toast.error((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { signOffer, loading };
};

// =============================================================================
// AI ENHANCEMENT HOOKS
// =============================================================================

export const useAIEnhancement = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const enhanceContent = async (
    offerContent: string,
    role: string,
    experience: string,
    enhancementType: 'PROFESSIONAL' | 'FRIENDLY' | 'FORMAL' | 'CREATIVE'
  ): Promise<EnhanceOfferResponse | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    if (!offerContent.trim()) {
      toast.error('Please provide content to enhance');
      return null;
    }

    try {
      setLoading(true);
      const response = await api.offers.enhanceContent(token, {
        offerContent,
        role,
        experience,
        enhancementType
      });
      toast.success('Content enhanced successfully!');
      return response;
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast.error((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (role: string, experience: string, company?: string): Promise<string[]> => {
    if (!token) {
      toast.error('Authentication required');
      return [];
    }

    if (!role.trim()) {
      toast.error('Please provide a role to get suggestions');
      return [];
    }

    try {
      setLoading(true);
      const suggestions = await api.offers.getSuggestions(token, role, experience, company);
      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error((error as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { enhanceContent, getSuggestions, loading };
};

// =============================================================================
// PDF DOWNLOAD HOOKS
// =============================================================================

export const usePdfDownload = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const downloadOfferPdf = async (userId: string, userRole: string, offerId: number) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      await api.offers.downloadOfferPdfFile(token, userId, userRole, offerId);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSignedPdf = async (userId: string, userRole: string, offerId: number) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      await api.signatures.downloadSignedPdfFile(token, userId, userRole, offerId);
      toast.success('Signed PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading signed PDF:', error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { downloadOfferPdf, downloadSignedPdf, loading };
};

// =============================================================================
// ENHANCED UTILITY HOOKS
// =============================================================================

// Hook for managing form state with offer content and validation
export const useOfferForm = (initialContent?: OfferContent, candidateData?: Candidate) => {
  const [offerContent, setOfferContent] = useState<OfferContent>(() => {
    const defaultContent: OfferContent = {
      candidateName: candidateData?.fullName || '',
      candidateEmail: candidateData?.email || '',
      candidatePhone: candidateData?.phoneNumber || '',
      position: '',
      salary: '',
      startDate: '',
      benefits: '',
      location: '',
      reportingManager: '',
      department: '',
      workingHours: '',
      probationPeriod: '',
      noticePeriod: '',
      content: '',
      workType: undefined,
      employmentType: undefined
    };
    
    return initialContent ? { ...defaultContent, ...initialContent } : defaultContent;
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const updateField = (field: keyof OfferContent, value: string) => {
    setOfferContent(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-format certain fields
      if (field === 'salary' && value) {
        updated[field] = formatSalary(value);
      }
      
      return updated;
    });
    setIsDirty(true);
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => error.field !== field));
  };

  const updateCandidate = (candidate: Candidate) => {
    setOfferContent(prev => ({
      ...prev,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phoneNumber
    }));
    setIsDirty(true);
  };

  const resetForm = () => {
    const defaultContent: OfferContent = {
      candidateName: candidateData?.fullName || '',
      candidateEmail: candidateData?.email || '',
      candidatePhone: candidateData?.phoneNumber || '',
      position: '',
      salary: '',
      startDate: '',
      benefits: '',
      location: '',
      reportingManager: '',
      department: '',
      workingHours: '',
      probationPeriod: '',
      noticePeriod: '',
      content: '',
      workType: undefined,
      employmentType: undefined
    };
    
    setOfferContent(initialContent ? { ...defaultContent, ...initialContent } : defaultContent);
    setValidationErrors([]);
    setIsDirty(false);
  };

  const validate = (): boolean => {
    const errors = validateOfferContent(offerContent);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const isValid = (): boolean => {
    return !!(offerContent.candidateName && offerContent.position && offerContent.salary);
  };

  const getFieldError = (field: string): string | undefined => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const hasError = (field: string): boolean => {
    return validationErrors.some(error => error.field === field);
  };

  return {
    offerContent,
    setOfferContent,
    updateField,
    updateCandidate,
    resetForm,
    validate,
    isValid,
    getFieldError,
    hasError,
    validationErrors,
    isDirty,
    // Convert to JSON string for API calls
    toJson: () => JSON.stringify(offerContent),
    // Helper to populate from candidate data
    populateFromCandidate: (candidate: Candidate) => {
      updateCandidate(candidate);
    }
  };
};

// Hook for managing approval workflow
export const useApprovalWorkflow = (userId: string) => {
  const { data: pendingApprovals, loading, refetch } = usePendingApprovals(userId);
  const { approveOffer, loading: approving } = useApproveOffer();

  const processApproval = async (
    userRole: string,
    offerId: number,
    action: 'APPROVED' | 'REJECTED' | 'SKIPPED',
    comment?: string
  ) => {
    if (!comment && action === 'REJECTED') {
      toast.error('Please provide a comment when rejecting an offer');
      return false;
    }

    const success = await approveOffer(userId, userRole, offerId, { action, comment });
    if (success) {
      await refetch(); // Refresh pending approvals
    }
    return success;
  };

  return {
    pendingApprovals,
    loading: loading || approving,
    processApproval,
    refetch
  };
};

// Hook for submission workflow
export const useSubmitForApproval = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const submitForApproval = async (
    userId: string,
    userRole: string,
    offerId: number,
    approvalSteps?: { approverId: number; approverRole: string; order: number }[]
  ): Promise<OfferLetterDTO | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      const workflowRequest = approvalSteps ? { approvalSteps } : undefined;
      const offer = await api.offers.submitForApproval(token, userId, userRole, offerId, workflowRequest);
      toast.success('Offer submitted for approval successfully!');
      return offer;
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast.error((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submitForApproval, loading };
};

// Hook for offer status management
export const useOfferStatus = () => {
  const getStatusColor = (status: OfferStatus): string => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'READY_FOR_SIGN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SIGNED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: OfferStatus): string => {
    return status.replace(/_/g, ' ').toLowerCase();
  };

  const canEdit = (status: OfferStatus): boolean => {
    return status === 'DRAFT';
  };

  const canSubmit = (status: OfferStatus): boolean => {
    return status === 'DRAFT';
  };

  const canApprove = (status: OfferStatus): boolean => {
    return status === 'PENDING_APPROVAL';
  };

  const canSign = (status: OfferStatus): boolean => {
    return status === 'READY_FOR_SIGN';
  };

  return {
    getStatusColor,
    getStatusText,
    canEdit,
    canSubmit,
    canApprove,
    canSign
  };
};
