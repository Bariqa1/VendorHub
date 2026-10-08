export interface UserSummary {
  publicId: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

export type VendorStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Vendor {
  publicId: string;
  companyNameAr: string;
  companyNameEn: string;
  crNumber: string;
  crExpiryDate: string;
  taxNumber: string;
  nationalAddress?: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  status: VendorStatus;
  complianceScore: number;
  crExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorCreateRequest {
  companyNameAr: string;
  companyNameEn: string;
  crNumber: string;
  crExpiryDate: string;
  taxNumber: string;
  nationalAddress?: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
}

export type ContractType = 'SUPPLY' | 'SERVICES' | 'CONSULTING' | 'MAINTENANCE' | 'IT_INFRASTRUCTURE';
export type ContractStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'AMENDED' | 'COMPLETED' | 'TERMINATED' | 'EXPIRED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'APPROVED' | 'PAID';

export interface Milestone {
  id?: number;
  title: string;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
  completedAt?: string;
}

export interface Contract {
  publicId: string;
  contractNumber: string;
  title: string;
  description?: string;
  vendorPublicId: string;
  vendorCompanyNameAr: string;
  vendorCompanyNameEn: string;
  contractType: ContractType;
  status: ContractStatus;
  totalAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentTerms?: string;
  signedAt?: string;
  signedByUserName?: string;
  active: boolean;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractCreateRequest {
  vendorPublicId: string;
  contractNumber: string;
  title: string;
  description?: string;
  contractType: ContractType;
  totalAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentTerms?: string;
  milestones: {
    title: string;
    amount: number;
    dueDate: string;
  }[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface DashboardMetrics {
  totalVendors: number;
  activeVendors: number;
  activeContracts: number;
  contractsExpiringSoon: number;
  pendingApprovals: number;
  totalCommittedValueSAR: number;
}

export interface ContractAnalysis {
  contractPublicId: string;
  summary: string;
  parties: { [key: string]: string };
  keyDates: { [key: string]: string };
  financialTerms: { [key: string]: any };
  clauses: { type: string; text?: string; description?: string }[];
  confidenceScore: number;
  processedByAiMicroservice: boolean;
}

export interface ContractQuestionResponse {
  contractPublicId: string;
  question: string;
  answer: string;
  relevantClause: string;
  confidenceScore: number;
  citations?: string[];
  grounded?: boolean;
  guardrailsPassed?: boolean;
  guardrailType?: string;
}
