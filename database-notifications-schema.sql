-- ====================================
-- NOTIFICATIONS TABLE SCHEMA
-- ====================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'device_assignment', 'device_return', 'maintenance', etc.
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON public.notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (
        user_email = (auth.jwt() ->> 'email')
    );

-- Policy 2: Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (
        user_email = (auth.jwt() ->> 'email')
    )
    WITH CHECK (
        user_email = (auth.jwt() ->> 'email')
    );

-- Policy 3: Admins can create notifications for any user
CREATE POLICY "Admins can create notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.email = (auth.jwt() ->> 'email')
            AND user_roles.role = 'admin'
        )
    );

-- Policy 4: Service role can create notifications (for API)
CREATE POLICY "Service role can create notifications"
    ON public.notifications
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy 5: Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.email = (auth.jwt() ->> 'email')
            AND user_roles.role = 'admin'
        )
    );

-- Policy 6: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (
        user_email = (auth.jwt() ->> 'email')
    );

-- ====================================
-- FUNCTION TO AUTO-NOTIFY ON DEVICE ASSIGNMENT
-- ====================================

-- Create a function that triggers when a device is assigned
CREATE OR REPLACE FUNCTION notify_device_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if device status changed to 'assigned' and has an assigned_to email
    IF NEW.status = 'assigned' AND NEW.assigned_to IS NOT NULL THEN
        -- Check if this is a new assignment (status changed or assigned_to changed)
        IF OLD.status != 'assigned' OR OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to THEN
            -- Insert notification
            INSERT INTO public.notifications (
                user_email,
                title,
                message,
                type,
                device_id,
                read
            ) VALUES (
                NEW.assigned_to,
                'Device Assigned to You',
                'A device has been assigned to you!' || E'\n\n' ||
                'Device Details:' || E'\n' ||
                '• Asset Number: ' || NEW.asset_number || E'\n' ||
                '• Serial Number: ' || NEW.serial_number || E'\n' ||
                '• Device Type: ' || NEW.device_type || E'\n' ||
                '• Brand/Model: ' || COALESCE(NEW.brand, 'N/A') || ' ' || COALESCE(NEW.model, ''),
                'device_assignment',
                NEW.id,
                false
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic notifications
DROP TRIGGER IF EXISTS trigger_notify_device_assignment ON public.devices;
CREATE TRIGGER trigger_notify_device_assignment
    AFTER UPDATE ON public.devices
    FOR EACH ROW
    EXECUTE FUNCTION notify_device_assignment();

-- ====================================
-- SAMPLE DATA (Optional - for testing)
-- ====================================

-- This will create a test notification
-- Replace 'test@example.com' with a real user email to test
/*
INSERT INTO public.notifications (user_email, title, message, type, read)
VALUES (
    'test@example.com',
    'Test Notification',
    'This is a test notification to verify the system is working.',
    'system',
    false
);
*/

-- ====================================
-- VERIFY SETUP
-- ====================================

-- Check if table was created
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'notifications';

-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_device_assignment';

-- View all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

-- ====================================
-- HELPFUL QUERIES
-- ====================================

-- View all notifications
-- SELECT * FROM public.notifications ORDER BY created_at DESC;

-- View unread notifications for a user
-- SELECT * FROM public.notifications 
-- WHERE user_email = 'user@example.com' 
-- AND read = false 
-- ORDER BY created_at DESC;

-- Mark notification as read
-- UPDATE public.notifications 
-- SET read = true, read_at = now() 
-- WHERE id = 'notification-id-here';

-- Delete old read notifications (older than 30 days)
-- DELETE FROM public.notifications 
-- WHERE read = true 
-- AND read_at < now() - INTERVAL '30 days';

