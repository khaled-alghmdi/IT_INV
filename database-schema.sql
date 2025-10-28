-- IT Inventory Management System - Database Schema
-- Run this in Supabase SQL Editor to create the devices table

-- Create devices table
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_number TEXT UNIQUE NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    device_type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    status TEXT NOT NULL CHECK (status IN ('assigned', 'available', 'not_working')),
    assigned_to TEXT,
    assigned_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_asset_number ON public.devices(asset_number);
CREATE INDEX IF NOT EXISTS idx_devices_serial_number ON public.devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_devices_assigned_to ON public.devices(assigned_to);

-- Enable Row Level Security (RLS)
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can customize this based on your auth requirements)
CREATE POLICY "Enable all operations for all users" ON public.devices
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.devices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data (optional - delete if you don't want sample data)
INSERT INTO public.devices (asset_number, serial_number, device_type, brand, model, status, assigned_to, assigned_date, notes)
VALUES
    ('AST-001', 'SN-DELL-123456', 'Laptop', 'Dell', 'Latitude 7420', 'assigned', 'John Doe', '2024-01-15', 'Standard company laptop'),
    ('AST-002', 'SN-HP-789012', 'Monitor', 'HP', 'E27 G4', 'available', NULL, NULL, '27-inch display'),
    ('AST-003', 'SN-APPLE-345678', 'Laptop', 'Apple', 'MacBook Pro 14"', 'assigned', 'Jane Smith', '2024-02-01', 'Development team'),
    ('AST-004', 'SN-DELL-901234', 'Desktop', 'Dell', 'OptiPlex 7090', 'not_working', NULL, NULL, 'Power supply issue - under maintenance'),
    ('AST-005', 'SN-SAMSUNG-567890', 'Monitor', 'Samsung', 'Odyssey G5', 'available', NULL, NULL, 'Gaming monitor - 32 inch')
ON CONFLICT (asset_number) DO NOTHING;

