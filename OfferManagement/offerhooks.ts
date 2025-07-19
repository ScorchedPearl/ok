import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import {
  Offer,
  OfferSummary,
  OfferApproval,
  DetailedApproval,
  Template,
  SignatureResponse,
  OfferRequest,
  TemplateOfferRequest,
  ApprovalAction,
  SignatureRequest,
  TemplateRequest,
  OfferStatus,
  UserRole,
  parseOfferContent,
  OfferContent
} from '@/utils/api';

// =============================================================================
// CUSTOM REACT HOOKS FOR OFFER MANAGEMENT
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
// OFFER HOOKS
// =============================================================================

export const useOffers = (userId: string, userRole: UserRole) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<OfferSummary[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchOffers = useCallback(async () => {
    if (!token || !userId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const offers = await api.offerManagement.offers.getAllOffers(token, userId, userRole);
      setState({ data: offers, loading: false, error: null });
    } catch (error) {
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

export const useOffer = (userId: string, userRole: UserRole, offerId: number | null) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<Offer>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchOffer = useCallback(async () => {
    if (!offerId || !token || !userId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const offer = await api.offerManagement.offers.getOffer(token, userId, userRole, offerId);
      setState({ data: offer, loading: false, error: null });
    } catch (error) {
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
    // Helper to get parsed offer content
    offerContent: state.data ? parseOfferContent(state.data.offerContent) : null
  };
};

export const useCreateOffer = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const createOffer = async (
    userId: string, 
    userRole: UserRole, 
    offerData: OfferRequest
  ): Promise<Offer | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      const offer = await api.offerManagement.offers.createOffer(token, userId, userRole, offerData);
      toast.success('Offer created successfully!');
      return offer;
    } catch (error) {
      toast.error((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (
    userId: string,
    userRole: UserRole,
    templateData: TemplateOfferRequest
  ): Promise<Offer | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      const offer = await api.offerManagement.offers.createFromTemplate(token, userId, userRole, templateData);
      toast.success('Offer created from template successfully!');
      return offer;
    } catch (error) {
      toast.error((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createOffer, createFromTemplate, loading };
};

export const useOffersByStatus = (userId: string, userRole: UserRole, status: OfferStatus) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<OfferSummary[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchOffersByStatus = useCallback(async () => {
    if (!token || !userId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const offers = await api.offerManagement.offers.getOffersByStatus(token, userId, userRole, status);
      setState({ data: offers, loading: false, error: null });
    } catch (error) {
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
  const [state, setState] = useState<ApiHookState<DetailedApproval[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchPendingApprovals = useCallback(async () => {
    if (!token || !userId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const approvals = await api.offerManagement.approvals.getPendingApprovalsDetailed(token, userId);
      setState({ data: approvals, loading: false, error: null });
    } catch (error) {
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
    userRole: UserRole,
    offerId: number,
    action: ApprovalAction
  ): Promise<boolean> => {
    if (!token) {
      toast.error('Authentication required');
      return false;
    }

    try {
      setLoading(true);
      await api.offerManagement.approvals.approveOffer(token, userId, userRole, offerId, action);
      toast.success(`Offer ${action.action.toLowerCase()} successfully!`);
      return true;
    } catch (error) {
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

export const useTemplates = (userId: string, userRole: UserRole) => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<Template[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchTemplates = useCallback(async () => {
    if (!token || !userId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const templates = await api.offerManagement.templates.getAllTemplates(token, userId, userRole);
      setState({ data: templates, loading: false, error: null });
    } catch (error) {
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

export const useCreateTemplate = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const createTemplate = async (
    userId: string,
    userRole: UserRole,
    templateData: TemplateRequest
  ): Promise<Template | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      const template = await api.offerManagement.templates.createTemplate(token, userId, userRole, templateData);
      toast.success('Template created successfully!');
      return template;
    } catch (error) {
      toast.error((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createTemplate, loading };
};

// =============================================================================
// SIGNATURE HOOKS
// =============================================================================

export const useSignOffer = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const signOffer = async (
    offerId: number,
    signatureData: SignatureRequest
  ): Promise<SignatureResponse | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      const signature = await api.offerManagement.signatures.signOffer(token, offerId, signatureData);
      toast.success('Offer signed successfully!');
      return signature;
    } catch (error) {
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
  ) => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      const response = await api.offerManagement.offers.enhanceContent(token, {
        offerContent,
        role,
        experience,
        enhancementType
      });
      return response;
    } catch (error) {
      toast.error((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (role: string, experience: string, company?: string) => {
    if (!token) {
      toast.error('Authentication required');
      return [];
    }

    try {
      setLoading(true);
      const suggestions = await api.offerManagement.offers.getSuggestions(token, role, experience, company);
      return suggestions;
    } catch (error) {
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

  const downloadOfferPdf = async (userId: string, userRole: UserRole, offerId: number) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      await api.offerManagement.offers.downloadOfferPdfFile(token, userId, userRole, offerId);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSignedPdf = async (userId: string, userRole: UserRole, offerId: number) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      await api.offerManagement.signatures.downloadSignedPdfFile(token, userId, userRole, offerId);
      toast.success('Signed PDF downloaded successfully!');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { downloadOfferPdf, downloadSignedPdf, loading };
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

// Hook for managing form state with offer content
export const useOfferForm = (initialContent?: OfferContent) => {
  const [offerContent, setOfferContent] = useState<OfferContent>(
    initialContent || {
      candidateName: '',
      position: '',
      salary: '',
      startDate: '',
      benefits: ''
    }
  );

  const updateField = (field: keyof OfferContent, value: string) => {
    setOfferContent(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setOfferContent(initialContent || {
      candidateName: '',
      position: '',
      salary: '',
      startDate: '',
      benefits: ''
    });
  };

  const isValid = () => {
    return !!(offerContent.candidateName && offerContent.position && offerContent.salary);
  };

  return {
    offerContent,
    setOfferContent,
    updateField,
    resetForm,
    isValid,
    // Convert to JSON string for API calls
    toJson: () => JSON.stringify(offerContent)
  };
};

// Hook for managing approval workflow
export const useApprovalWorkflow = (userId: string) => {
  const { data: pendingApprovals, loading, refetch } = usePendingApprovals(userId);
  const { approveOffer, loading: approving } = useApproveOffer();

  const processApproval = async (
    userRole: UserRole,
    offerId: number,
    action: 'APPROVED' | 'REJECTED' | 'SKIPPED',
    comment?: string
  ) => {
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
