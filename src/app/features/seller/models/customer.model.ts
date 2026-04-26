export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  fullName: string;
  dni: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: CustomerStatus;
  portalEnabled: boolean;
  createdAt: string;
  collectorId: string | null;
  collectorName: string | null;
}

export interface CustomerDetail extends Customer {
  portalIsTempPassword: boolean;
  portalFailedAttempts: number;
  portalLockedAt: string | null;
  updatedAt: string;
}

export interface CustomerListFilters {
  status?: CustomerStatus;
  search?: string;
  collectorId?: string;
}

export interface CustomerCreatePayload {
  fullName: string;
  dni: string;
  address?: string;
  phone?: string;
  email?: string;
  assignedCollectorId?: string;
}

export interface CustomerUpdatePayload {
  fullName?: string;
  address?: string;
  phone?: string;
  email?: string;
  assignedCollectorId?: string;
}

export interface CustomerRaw {
  id: string;
  full_name: string;
  dni: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  portal_enabled: boolean;
  created_at: string;
  collector_id: string | null;
  collector_name: string | null;
}

export interface CustomerDetailRaw extends CustomerRaw {
  portal_is_temp_password: boolean;
  portal_failed_attempts: number;
  portal_locked_at: string | null;
  updated_at: string;
}
