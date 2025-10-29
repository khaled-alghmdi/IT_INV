export type DeviceStatus = "assigned" | "available" | "not_working";

export type UserRole = "admin" | "user";

export interface Device {
  id: string;
  asset_number: string;
  serial_number: string;
  device_type: string;
  brand: string | null;
  model: string | null;
  status: DeviceStatus;
  assigned_to: string | null;
  assigned_date: string | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceFormData {
  asset_number: string;
  serial_number: string;
  device_type: string;
  brand: string;
  model: string;
  status: DeviceStatus;
  assigned_to: string;
  assigned_date: string;
  purchase_date: string;
  notes: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type RequestStatus = "pending" | "approved" | "rejected";

export interface DeviceRequest {
  id: string;
  user_id: string;
  user_email: string;
  device_type: string;
  brand: string | null;
  model: string | null;
  justification: string;
  status: RequestStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}