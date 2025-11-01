-- ============================================
-- IT INVENTORY - ISSUE REPORTS SYSTEM
-- Database Schema for Hardware/Software Issues
-- ============================================

-- Create issue_reports table
CREATE TABLE IF NOT EXISTS public.issue_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Reporter Information
    user_email TEXT NOT NULL,
    user_name TEXT,
    
    -- Issue Details
    issue_type TEXT NOT NULL CHECK (issue_type IN ('hardware', 'software', 'network', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Device Information (optional - can be related to a specific device)
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    device_asset_number TEXT,
    device_type TEXT,
    
    -- Status & Assignment
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed', 'rejected')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to TEXT, -- Admin/IT staff assigned to resolve
    
    -- Resolution
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional metadata
    location TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_issue_reports_user_email ON public.issue_reports(user_email);
CREATE INDEX IF NOT EXISTS idx_issue_reports_status ON public.issue_reports(status);
CREATE INDEX IF NOT EXISTS idx_issue_reports_severity ON public.issue_reports(severity);
CREATE INDEX IF NOT EXISTS idx_issue_reports_created_at ON public.issue_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issue_reports_device_id ON public.issue_reports(device_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_issue_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_issue_reports_timestamp
    BEFORE UPDATE ON public.issue_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_issue_reports_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own reports
CREATE POLICY "Users can view their own issue reports"
    ON public.issue_reports
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'email' = user_email);

-- Policy 2: Users can create their own reports
CREATE POLICY "Users can create issue reports"
    ON public.issue_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Policy 3: Users can update their own pending reports
CREATE POLICY "Users can update their own pending reports"
    ON public.issue_reports
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = user_email 
        AND status = 'pending'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = user_email 
        AND status = 'pending'
    );

-- Policy 4: Admins can view all reports
CREATE POLICY "Admins can view all issue reports"
    ON public.issue_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.email = (auth.jwt() ->> 'email')
            AND user_roles.role = 'admin'
        )
    );

-- Policy 5: Admins can update any report
CREATE POLICY "Admins can update issue reports"
    ON public.issue_reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.email = (auth.jwt() ->> 'email')
            AND user_roles.role = 'admin'
        )
    );

-- Policy 6: Admins can delete reports
CREATE POLICY "Admins can delete issue reports"
    ON public.issue_reports
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.email = (auth.jwt() ->> 'email')
            AND user_roles.role = 'admin'
        )
    );

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample issue report (replace with actual user email)
-- INSERT INTO public.issue_reports (
--     user_email,
--     user_name,
--     issue_type,
--     severity,
--     title,
--     description,
--     device_asset_number,
--     device_type,
--     location
-- ) VALUES (
--     'user@example.com',
--     'John Doe',
--     'hardware',
--     'high',
--     'Laptop screen flickering',
--     'The laptop screen has been flickering for the past 2 days. It gets worse when running multiple applications.',
--     'IT-LAP-001',
--     'Laptop',
--     'Building A - 3rd Floor'
-- );

-- ============================================
-- STATISTICS VIEW (Optional)
-- ============================================

CREATE OR REPLACE VIEW issue_reports_stats AS
SELECT
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
    COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE severity = 'high') as high_count,
    COUNT(*) FILTER (WHERE issue_type = 'hardware') as hardware_issues,
    COUNT(*) FILTER (WHERE issue_type = 'software') as software_issues,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600), 2) as avg_resolution_hours
FROM public.issue_reports;

-- ============================================
-- INSTRUCTIONS
-- ============================================

/*
1. Run this SQL in your Supabase SQL Editor
2. This will create the issue_reports table with all necessary fields
3. RLS policies are configured for security
4. Users can create and view their own reports
5. Admins can view and manage all reports
6. Indexes are created for better performance

Next steps:
- Create the frontend components
- Add notification system
- Integrate with existing device management
*/


