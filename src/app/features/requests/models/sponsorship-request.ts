export type RequestStatus =
  | 'Draft'
  | 'PendingManagerApproval'
  | 'PendingFinanceReview'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export interface SponsorshipRequest {
  id: string;
  title: string;
  requestorId: string;
  requestorName: string;
  department: string;
  sponsorshipTypeId: number;
  sponsorshipTypeName: string;
  eventName: string;
  eventDate: string;
  requestedAmount: number;
  purpose: string;
  expectedBenefit?: string | null;
  remarks?: string | null;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateRequest {
  title: string;
  department: string;
  sponsorshipTypeId: number;
  eventName: string;
  eventDate: string;
  requestedAmount: number;
  purpose: string;
  expectedBenefit?: string | null;
  remarks?: string | null;
}

export type UpdateRequest = CreateRequest;

export interface WorkflowHistoryEntry {
  id: number;
  requestId: string;
  actionById: string;
  actionByName: string;
  action: 'Submit' | 'Approve' | 'Reject' | 'Cancel';
  fromStatus: RequestStatus;
  toStatus: RequestStatus;
  remarks?: string | null;
  actionAt: string;
}

export interface SponsorshipType {
  id: number;
  name: string;
  isActive: boolean;
}

export type ApprovalDecision = 1 | 2; // 1 = Approve, 2 = Reject

export interface ApprovalAction {
  action: ApprovalDecision;
  remarks?: string | null;
}
