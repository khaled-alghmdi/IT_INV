export type DeviceStatus = "assigned" | "available" | "not_working";

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
  notes: string;
}

