import axios from 'axios';
import { KeycloakTokenResponse } from '@/context/types';
import { UserProfile } from '@/context/types';

const KEYCLOAK_BASE_URL = import.meta.env.VITE_KEYCLOAK_BASE_URL;
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL;
const API_BASE_URL = import.meta.env.VITE_INTERVIEW_SERVICE_URL;

// ================================
// VALIDATION SCHEMAS
// ================================

export interface ValidationError {
  field: string;
  message: string;
}

export class OfferValidationError extends Error {
  public errors: ValidationError[];
  
  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.errors = errors;
    this.name = 'OfferValidationError';
  }
}

export const validateOfferContent = (content: OfferContent): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!content.candidateName?.trim()) {
    errors.push({ field: 'candidateName', message: 'Candidate name is required' });
  }

  if (!content.position?.trim()) {
    errors.push({ field: 'position', message: 'Position is required' });
  }

  if (!content.salary?.trim()) {
    errors.push({ field: 'salary', message: 'Salary is required' });
  } else {
    // Salary format validation
    const salaryPattern = /^[\$]?[\d,]+(\.\d{2})?$/;
    if (!salaryPattern.test(content.salary.replace(/\s/g, ''))) {
      errors.push({ field: 'salary', message: 'Please enter a valid salary amount (e.g., $50,000 or 50000)' });
    }
  }

  // Date validation
  if (content.startDate) {
    const datePattern = /^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4})$/;
    if (!datePattern.test(content.startDate)) {
      errors.push({ field: 'startDate', message: 'Please enter a valid date (e.g., 2024-12-01, 12/01/2024, or December 1, 2024)' });
    }
  }

  // Email validation for candidate
  if (content.candidateEmail) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(content.candidateEmail)) {
      errors.push({ field: 'candidateEmail', message: 'Please enter a valid email address' });
    }
  }

  // Phone validation
  if (content.candidatePhone) {
    const phonePattern = /^[\+]?[\d\s\(\)\-\.]{10,}$/;
    if (!phonePattern.test(content.candidatePhone)) {
      errors.push({ field: 'candidatePhone', message: 'Please enter a valid phone number' });
    }
  }

  return errors;
};

export const formatSalary = (salary: string): string => {
  // Remove any non-digit characters except decimal point
  const numbers = salary.replace(/[^\d.]/g, '');
  const numericValue = parseFloat(numbers);
  
  if (isNaN(numericValue)) return salary;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// ================================
// ENHANCED INTERFACES
// ================================

export interface OfferContent {
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  position?: string;
  salary?: string;
  startDate?: string;
  benefits?: string;
  location?: string;
  reportingManager?: string;
  department?: string;
  workingHours?: string;
  probationPeriod?: string;
  noticePeriod?: string;
  content?: string;
  workType?: 'Remote' | 'Hybrid' | 'On-site'; // New field
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'; // New field
  [key: string]: any;
}
export interface PendingApprovalDetailDTO {
  approvalId: number;
  offerId: number;
  approverId: number;
  approverRole: string;
  approvalOrder: number;
  comment: string | null;
  createdAt: string;
  candidateId: number;
  candidateName: string;
  position: string;
  salary: string;
  createdBy: number;
  offerStatus: string;
  offerSummary: string;
}

export interface SignOfferRequest {
  offerSignatureType: 'TYPED' | 'DRAWN';
  signatureData: string;
  consentText: string;
  agreedToElectronicSignature: boolean;
}

export interface SignatureDTO {
  id: number;
  offerId: number;
  candidateId: number;
  offerSignatureType: 'TYPED' | 'DRAWN';
  signatureData: string;
  consentText: string;
  signedAt: string;
  signerIp: string;
  signerUserAgent: string;
  docHash: string;
}
export interface Candidate {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  resumeContent?: string;
  resumeSummary?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  applicationCount?: number;
  testCount?: number;
  interviewCount?: number;
  createdAt: string;
  // Additional fields from backend
  skills?: string[];
  experience?: string;
  currentSalary?: string;
  expectedSalary?: string;
  availableFrom?: string;
  currentLocation?: string;
  preferredLocation?: string;
}

// Request DTOs matching backend exactly
export interface CreateOfferRequest {
  candidateId: number;
  offerContent: string; // JSON stringified OfferContent
}

export interface CreateOfferFromTemplateRequest {
  templateId: number;
  candidateId: number;
  customizations: string; // JSON stringified customizations
}

export interface EnhanceOfferRequest {
  offerContent: string;
  role: string;
  experience: string;
  enhancementType: 'PROFESSIONAL' | 'FRIENDLY' | 'FORMAL' | 'CREATIVE';
}

export interface ApprovalActionRequest {
  action: 'APPROVED' | 'REJECTED' | 'SKIPPED';
  comment?: string;
}

export interface ApprovalWorkflowRequest {
  approvalSteps?: ApprovalStep[];
}

export interface ApprovalStep {
  approverId: number;
  approverRole: string;
  order: number;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  templateContent: string; // JSON stringified template
  category: string;
}

export interface SignOfferRequest {
  offerSignatureType: 'DRAWN' | 'TYPED';
  signatureData: string;
  consentText: string;
  agreedToElectronicSignature: boolean;
}

// Response DTOs matching backend exactly
export interface OfferLetterDTO {
  id: number;
  candidateId: number;
  createdBy: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'READY_FOR_SIGN' | 'SIGNED' | 'REJECTED';
  offerContent: string; // JSON stringified OfferContent
  signedPdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
  approvals: OfferApprovalDTO[];
}

export interface OfferSummaryDTO {
  id: number;
  candidateId: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'READY_FOR_SIGN' | 'SIGNED' | 'REJECTED';
  createdBy: number;
  createdAt: string;
  pendingApprovalsCount: number;
  totalApprovalsCount: number;
}

export interface OfferApprovalDTO {
  id: number;
  offerId: number;
  approverId: number;
  approverRole: string;
  approvalOrder: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  comment: string | null;
  actionTimestamp: string | null;
}

export interface PendingApprovalDetailDTO {
  approvalId: number;
  offerId: number;
  approverId: number;
  approverRole: string;
  approvalOrder: number;
  comment: string | null;
  createdAt: string;
  candidateId: number;
  candidateName: string;
  position: string;
  salary: string;
  createdBy: number;
  offerStatus: string;
  offerSummary: string;
}

export interface OfferTemplateDTO {
  id: number;
  name: string;
  description: string;
  templateContent: string; // JSON stringified template structure
  category: string;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignatureDTO {
  id: number;
  offerId: number;
  candidateId: number;
  offerSignatureType: 'DRAWN' | 'TYPED';
  signatureData: string;
  consentText: string;
  signedAt: string;
  signerIp: string;
  signerUserAgent: string;
  docHash: string;
}

export interface EnhanceOfferResponse {
  enhancedContent: string;
  suggestions: string;
  improvements: string[];
}

// Authentication interfaces (existing)
export interface PasswordChangeRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface FirstLoginResponse {
  isFirstLogin: boolean;
}

export interface InitiateRegistrationRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface CompleteRegistrationRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface RegistrationResponse {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface OTPResponse {
  message: string;
  email: string;
  otpExpiryMinutes?: number;
}

export interface VerifyOTPResponse {
  verified: boolean;
  message: string;
  email: string;
}

export interface CustomerData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

// ================================
// UTILITY FUNCTIONS
// ================================

export const parseOfferContent = (offerContentJson: string): OfferContent => {
  try {
    const parsed = JSON.parse(offerContentJson);
    // Ensure all expected fields exist
    return {
      candidateName: parsed.candidateName || '',
      candidateEmail: parsed.candidateEmail || '',
      candidatePhone: parsed.candidatePhone || '',
      position: parsed.position || '',
      salary: parsed.salary || '',
      startDate: parsed.startDate || '',
      benefits: parsed.benefits || '',
      location: parsed.location || '',
      reportingManager: parsed.reportingManager || '',
      department: parsed.department || '',
      workingHours: parsed.workingHours || '',
      probationPeriod: parsed.probationPeriod || '',
      noticePeriod: parsed.noticePeriod || '',
      content: parsed.content || '',
      workType: parsed.workType || undefined,
      employmentType: parsed.employmentType || undefined,
      ...parsed // Include any additional fields
    };
  } catch (error) {
    console.error('Failed to parse offer content:', error);
    return {
      candidateName: '',
      candidateEmail: '',
      candidatePhone: '',
      position: '',
      salary: '',
      startDate: '',
      benefits: '',
      location: '',
      content: ''
    };
  }
};

export const stringifyOfferContent = (offerContent: OfferContent): string => {
  // Clean up empty fields before stringifying
  const cleanedContent = Object.entries(offerContent).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
  
  return JSON.stringify(cleanedContent);
};

// Enhanced candidate parsing
export const parseCandidate = (candidateData: any): Candidate => {
  const nameParts = (candidateData.fullName || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    id: candidateData.id || 0,
    fullName: candidateData.fullName || '',
    firstName,
    lastName,
    email: candidateData.email || '',
    phoneNumber: candidateData.phoneNumber || '',
    resumeContent: candidateData.resumeContent || '',
    resumeSummary: candidateData.resumeSummary || '',
    status: candidateData.status || 'Active',
    applicationCount: candidateData.applicationCount || 0,
    testCount: candidateData.testCount || 0,
    interviewCount: candidateData.interviewCount || 0,
    createdAt: candidateData.createdAt || new Date().toISOString(),
    skills: candidateData.skills || [],
    experience: candidateData.experience || '',
    currentSalary: candidateData.currentSalary || '',
    expectedSalary: candidateData.expectedSalary || '',
    availableFrom: candidateData.availableFrom || '',
    currentLocation: candidateData.currentLocation || '',
    preferredLocation: candidateData.preferredLocation || ''
  };
};

// ================================
// API IMPLEMENTATION
// ================================

export const api = {
  auth: {
    login: async (realm: string, username: string, password: string): Promise<KeycloakTokenResponse> => {
      const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
      let clientSecret;
      if(realm === "tenant-realm"){
         clientSecret = import.meta.env.VITE_KEYCLOCK_CLIENT_SECRET;
      }else if(realm === "candidate-realm"){
          clientSecret = import.meta.env.VITE_KEYCLOCK_CLIENT_SECRET_CANDIDATE;
      }
      else if(realm === "partner-realm"){
          clientSecret = import.meta.env.VITE_KEYCLOCK_CLIENT_SECRET_PARTNER;
      }

      if (!clientId || !clientSecret) {
        throw new Error("Missing Keycloak client ID or secret in environment variables.");
      }

      try {
        const response = await axios.post(
          `${KEYCLOAK_BASE_URL}/realms/${realm}/protocol/openid-connect/token`,
          new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'password',
            username,
            password,
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.error_description || 'Authentication failed');
        }
        throw error;
      }
    },
    
    refreshToken: async (realm: string, refreshToken: string): Promise<KeycloakTokenResponse> => {
      const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_KEYCLOCK_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("Missing Keycloak client ID or secret in environment variables.");
      }

      try {
        const response = await axios.post(
          `${KEYCLOAK_BASE_URL}/realms/${realm}/protocol/openid-connect/token`,
          new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 400) {
            throw new Error('Session expired. Please login again.');
          }
          throw new Error(error.response.data?.error_description || 'Token refresh failed');
        }
        throw error;
      }
    },

    createAuthenticatedApi: (token: KeycloakTokenResponse) => {
      return axios.create({
        baseURL: AUTH_SERVICE_URL,
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
      });
    },

    isTokenExpired: (token: KeycloakTokenResponse): boolean => {
      if (!token || !token.access_token) return true;
      
      try {
        const payload = token.access_token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedPayload.exp <= currentTime;
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        return true;
      }
    },

    isTokenExpiringSoon: (token: KeycloakTokenResponse): boolean => {
      if (!token || !token.access_token) return true;
      
      try {
        const payload = token.access_token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedPayload.exp - currentTime < 60;
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        return true;
      }
    },

    getTenantProfile: async (token: KeycloakTokenResponse): Promise<UserProfile> => {
      try {
        const authApi = api.auth.createAuthenticatedApi(token);
        const response = await authApi.get('/tenant/my-profile');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to fetch user profile');
        }
        throw error;
      }
    },

    getCandidateProfile: async (token: KeycloakTokenResponse): Promise<UserProfile> => {
      try {
        const authApi = api.auth.createAuthenticatedApi(token);
        const response = await authApi.get('/candidate/my-profile');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to fetch user profile');
        }
        throw error;
      }
    },

    getPartnerProfile: async (token: KeycloakTokenResponse): Promise<UserProfile> => {
      try {
        const authApi = api.auth.createAuthenticatedApi(token);
        const response = await authApi.get('/partner/my-profile');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to fetch partner profile');
        }
        throw error;
      }
    },
  },

  // ================================
  // CANDIDATE API
  // ================================
  candidates: {
    getCandidates: async (token: KeycloakTokenResponse, tenantId: string): Promise<Candidate[]> => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/tenant-candidates/tenants/${tenantId}/candidates`,
          {
            headers: {
              'Authorization': `Bearer ${token.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Parse and return candidates with proper structure
        return response.data.map((candidate: any) => parseCandidate(candidate));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to fetch candidates');
        }
        throw error;
      }
    }
  },

  // ================================
  // OFFER MANAGEMENT API
  // ================================
  offers: {
    // Helper function to get headers
    getHeaders: (token: KeycloakTokenResponse, userId: string, userRole: string) => {
      return {
        'Authorization': `Bearer ${token.access_token}`,
        'X-User-Id': userId,
        'X-User-Role': userRole,
        'Content-Type': 'application/json'
      };
    },

    // Create basic offer with validation
    createOffer: async (token: KeycloakTokenResponse, userId: string, userRole: string, data: CreateOfferRequest): Promise<OfferLetterDTO> => {
      // Validate offer content before sending
      const offerContent = parseOfferContent(data.offerContent);
      const validationErrors = validateOfferContent(offerContent);
      
      if (validationErrors.length > 0) {
        throw new OfferValidationError(validationErrors);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/offers`,
          data,
          { headers: api.offers.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to create offer');
        }
        throw error;
      }
    },

    // Create offer from template
    createFromTemplate: async (token: KeycloakTokenResponse, userId: string, userRole: string, data: CreateOfferFromTemplateRequest): Promise<OfferLetterDTO> => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/offers/create-from-template`,
          data,
          { headers: api.offers.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to create offer from template');
        }
        throw error;
      }
    },

    // AI enhance offer content
    enhanceContent: async (token: KeycloakTokenResponse, data: EnhanceOfferRequest): Promise<EnhanceOfferResponse> => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/offers/enhance`,
          data,
          { 
            headers: { 
              'Authorization': `Bearer ${token.access_token}`,
              'Content-Type': 'application/json' 
            } 
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to enhance offer content');
        }
        throw error;
      }
    },

    // Get AI suggestions
    getSuggestions: async (token: KeycloakTokenResponse, role: string, experience: string, company = 'Company'): Promise<string[]> => {
      try {
        const params = new URLSearchParams();
        params.append('role', role);
        params.append('experience', experience);
        params.append('company', company);
        
        const response = await axios.get(
          `${API_BASE_URL}/api/offers/suggestions?${params.toString()}`,
          { 
            headers: { 
              'Authorization': `Bearer ${token.access_token}`,
            } 
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to get suggestions');
        }
        throw error;
      }
    },

    // Submit offer for approval
    submitForApproval: async (
      token: KeycloakTokenResponse,
      userId: string, 
      userRole: string, 
      offerId: number, 
      data?: ApprovalWorkflowRequest
    ): Promise<OfferLetterDTO> => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/offers/${offerId}/submit`,
          data || {},
          { headers: api.offers.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to submit for approval');
        }
        throw error;
      }
    },

    // Get single offer
    getOffer: async (token: KeycloakTokenResponse, userId: string, userRole: string, offerId: number): Promise<OfferLetterDTO> => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/offers/${offerId}`,
          { headers: api.offers.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to get offer');
        }
        throw error;
      }
    },

    // Update offer (draft only)
    updateOffer: async (token: KeycloakTokenResponse, userId: string, userRole: string, offerId: number, data: CreateOfferRequest): Promise<OfferLetterDTO> => {
      // Validate offer content before sending
      const offerContent = parseOfferContent(data.offerContent);
      const validationErrors = validateOfferContent(offerContent);
      
      if (validationErrors.length > 0) {
        throw new OfferValidationError(validationErrors);
      }

      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/offers/${offerId}`,
          data,
          { headers: api.offers.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to update offer');
        }
        throw error;
      }
    },

    // Get all offers
    getAllOffers: async (token: KeycloakTokenResponse, userId: string, userRole: string): Promise<OfferSummaryDTO[]> => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/offers`,
          { headers: api.offers.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to get offers');
        }
        throw error;
      }
    },

    // Get offers by status
    getOffersByStatus: async (token: KeycloakTokenResponse, userId: string, userRole: string, status: string): Promise<OfferSummaryDTO[]> => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/offers/status/${status}`,
          { headers: api.offers.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to get offers by status');
        }
        throw error;
      }
    },

    // Get my offers
    getMyOffers: async (token: KeycloakTokenResponse, userId: string): Promise<OfferSummaryDTO[]> => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/offers/my-offers`,
          { 
            headers: { 
              'Authorization': `Bearer ${token.access_token}`,
              'X-User-Id': userId 
            } 
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to get my offers');
        }
        throw error;
      }
    },

    // Download offer PDF
    downloadOfferPdf: async (token: KeycloakTokenResponse, userId: string, userRole: string, offerId: number): Promise<Blob> => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/offers/${offerId}/pdf`,
          { 
            headers: api.offers.getHeaders(token, userId, userRole),
            responseType: 'blob'
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error('Failed to download offer PDF');
        }
        throw error;
      }
    },

    // Helper to download offer PDF directly
    downloadOfferPdfFile: async (token: KeycloakTokenResponse, userId: string, userRole: string, offerId: number): Promise<void> => {
      try {
        const blob = await api.offers.downloadOfferPdf(token, userId, userRole, offerId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `offer_${offerId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        throw error;
      }
    }
  },

  // ================================
  // APPROVAL API
  // ================================
  approvals: {
    // Helper function to get headers
    getHeaders: (token: KeycloakTokenResponse, userId: string, userRole: string) => {
      return {
        'Authorization': `Bearer ${token.access_token}`,
        'X-User-Id': userId,
        'X-User-Role': userRole,
        'Content-Type': 'application/json'
      };
    },

    // Approve offer by offer ID (recommended method)
    approveOffer: async (
      token: KeycloakTokenResponse,
      userId: string, 
      userRole: string, 
      offerId: number, 
      data: ApprovalActionRequest
    ): Promise<OfferApprovalDTO> => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/approvals/offer/${offerId}/approve`,
          data,
          { headers: api.approvals.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to approve offer');
        }
        throw error;
      }
    },

    

    // Get approvals for specific offer
    getOfferApprovals: async (token: KeycloakTokenResponse, userId: string, userRole: string, offerId: number): Promise<OfferApprovalDTO[]> => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/approvals/offer/${offerId}`,
          { headers: api.approvals.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to get offer approvals');
        }
        throw error;
      }
    },
    getPendingApprovalsDetailed: async (token: KeycloakTokenResponse, userId: string): Promise<PendingApprovalDetailDTO[]> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/approvals/pending/detailed`,
        { 
          headers: { 
            'Authorization': `Bearer ${token.access_token}`,
            'X-User-Id': userId 
          } 
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Failed to get detailed pending approvals');
      }
      throw error;
    }
  },

  // Process approval by offer ID (recommended method)
  approveOfferByOfferId: async (
    token: KeycloakTokenResponse,
    userId: string, 
    userRole: string, 
    offerId: number, 
    data: ApprovalActionRequest
  ): Promise<OfferApprovalDTO> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/approvals/offer/${offerId}/approve`,
        data,
        { 
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'X-User-Id': userId,
            'X-User-Role': userRole,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Failed to approve offer');
      }
      throw error;
    }
  },

  // Get all my approvals (historical)
  getMyApprovals: async (token: KeycloakTokenResponse, userId: string): Promise<OfferApprovalDTO[]> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/approvals/my-approvals`,
        { 
          headers: { 
            'Authorization': `Bearer ${token.access_token}`,
            'X-User-Id': userId 
          } 
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Failed to get my approvals');
      }
      throw error;
    }
  }
  },

  // ================================
  // SIGNATURE API
  // ================================
  signatures: {
    // Sign offer
   

   
     signOffer: async (token: KeycloakTokenResponse, offerId: number, data: SignOfferRequest): Promise<SignatureDTO> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/signatures/offers/${offerId}/sign`,
        data,
        { 
          headers: { 
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
            'X-Forwarded-For': window.location.hostname,
            'User-Agent': navigator.userAgent
          } 
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Failed to sign offer');
      }
      throw error;
    }
  },

  // Get signature details
  getSignatureDetails: async (token: KeycloakTokenResponse, userId: string, userRole: string, offerId: number): Promise<SignatureDTO> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/signatures/offers/${offerId}`,
        { 
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'X-User-Id': userId,
            'X-User-Role': userRole,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Failed to get signature details');
      }
      throw error;
    }
  },

  // Download signed PDF
  downloadSignedPdf: async (token: KeycloakTokenResponse, userId: string, userRole: string, offerId: number): Promise<Blob> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/signatures/offers/${offerId}/signed-pdf`,
        { 
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'X-User-Id': userId,
            'X-User-Role': userRole,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error('Failed to download signed PDF');
      }
      throw error;
    }
  },

  // Helper to download signed PDF directly
  downloadSignedPdfFile: async (token: KeycloakTokenResponse, userId: string, userRole: string, offerId: number): Promise<void> => {
    try {
      const blob = await api.signatures.downloadSignedPdf(token, userId, userRole, offerId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed_offer_${offerId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  },

  
  },

  // ================================
  // TEMPLATE API
  // ================================
  templates: {
    // Helper function to get headers
    getHeaders: (token: KeycloakTokenResponse, userId: string, userRole: string) => {
      return {
        'Authorization': `Bearer ${token.access_token}`,
        'X-User-Id': userId,
        'X-User-Role': userRole,
        'Content-Type': 'application/json'
      };
    },

    // Get all active templates
    getAllTemplates: async (token: KeycloakTokenResponse, userId: string, userRole: string): Promise<OfferTemplateDTO[]> => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/templates`,
          { headers: api.templates.getHeaders(token, userId, userRole) }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to get templates');
        }
        throw error;
      }
    }
  },

  users: {
    checkFirstTimeLogin: async (token: KeycloakTokenResponse, realm: string): Promise<FirstLoginResponse> => {
      try {
        const authApi = api.auth.createAuthenticatedApi(token);
        
        if(realm === "partner-realm") {
          const response = await authApi.get(`/partner/check-first-login`);
          return response.data;
        }
        else if(realm === "candidate-realm") {
          const response = await authApi.get(`/candidate/check-first-login`);
          return response.data;
        }
        
        const response = await authApi.get(`/tenant/check-first-login`);
        return response.data;
       
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data?.message || 'Failed to check first login status');
        }
        throw error;
      }
    }
  }
};

// Helper type definitions
export type OfferStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'READY_FOR_SIGN' | 'SIGNED' | 'REJECTED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
export type SignatureType = 'TYPED' | 'DRAWN';
export type EnhancementType = 'PROFESSIONAL' | 'FRIENDLY' | 'FORMAL' | 'CREATIVE';
export type TemplateCategory = 'TECHNICAL' | 'SALES' | 'EXECUTIVE' | 'INTERN';
export type UserRole = 'HR' | 'MANAGER' | 'FINANCE' | 'LEGAL' | 'LEADERSHIP';

// Export default
export default api;

const BILLING_SERVICE_URL = 'http://localhost:8081/api/billing';

export const billingApi = {
  // Get available plans (public endpoint)
  getAvailablePlans: async () => {
    try {
      const response = await axios.get(`${BILLING_SERVICE_URL}/user/plans`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch plans');
      }
      throw error;
    }
  },

  // Create authenticated billing API instance
  createAuthenticatedBillingApi: (token: KeycloakTokenResponse) => {
    return axios.create({
      baseURL: BILLING_SERVICE_URL,
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // Initiate upgrade
  initiateUpgrade: async (token: KeycloakTokenResponse, tenantId: string, planId: string, customerData: CustomerData) => {
    try {
      const authenticatedApi = billingApi.createAuthenticatedBillingApi(token);
      const response = await authenticatedApi.post(`/user/upgrade/${tenantId}/${planId}`, customerData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Failed to initiate upgrade');
      }
      throw error;
    }
  },

  // Complete payment callback
  completePaymentCallback: async (token: KeycloakTokenResponse, callbackData: any) => {
    try {
      const authenticatedApi = billingApi.createAuthenticatedBillingApi(token);
      const response = await authenticatedApi.post('/user/upgrade/complete-callback', callbackData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Failed to complete payment');
      }
      throw error;
    }
  },

  // Get current subscription
  getCurrentSubscription: async (token: KeycloakTokenResponse, tenantId: string) => {
    try {
      const authenticatedApi = billingApi.createAuthenticatedBillingApi(token);
      const response = await authenticatedApi.get(`/user/subscription/${tenantId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch subscription');
      }
      throw error;
    }
  },
};

