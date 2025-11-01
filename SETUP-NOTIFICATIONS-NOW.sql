-- ====================================
-- COMPLETE NOTIFICATION SETUP
-- RUN THIS ENTIRE FILE IN SUPABASE
-- ====================================

-- Step 1: Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON public.notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Step 3: Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Step 5: Create policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_email = (auth.jwt() ->> 'email'))
    WITH CHECK (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Service role can create notifications"
    ON public.notifications FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Admins can view all notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.email = (auth.jwt() ->> 'email')
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    TO authenticated
    USING (user_email = (auth.jwt() ->> 'email'));

-- Step 6: Create notification function
CREATE OR REPLACE FUNCTION notify_device_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if device is being assigned
    IF NEW.status = 'assigned' AND NEW.assigned_to IS NOT NULL THEN
        -- Check if this is a new assignment
        IF (OLD IS NULL) OR 
           (OLD.status != 'assigned') OR 
           (OLD.assigned_to IS NULL) OR 
           (OLD.assigned_to != NEW.assigned_to) THEN
            
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

-- Step 7: Create trigger
DROP TRIGGER IF EXISTS trigger_notify_device_assignment ON public.devices;
CREATE TRIGGER trigger_notify_device_assignment
    AFTER INSERT OR UPDATE ON public.devices
    FOR EACH ROW
    EXECUTE FUNCTION notify_device_assignment();

-- Step 8: Create a test notification for khalid.alghamdi@tamergroup.com
INSERT INTO public.notifications (
    user_email,
    title,
    message,
    type,
    read
) VALUES (
    'khalid.alghamdi@tamergroup.com',
    '🎉 Welcome! Notification System Active',
    'Your notification system is now working!' || E'\n\n' ||
    'You will receive notifications when:' || E'\n' ||
    '• A device is assigned to you' || E'\n' ||
    '• Device details are updated' || E'\n' ||
    '• System announcements are made' || E'\n\n' ||
    'Click the 🔔 bell icon anytime to view notifications.',
    'system',
    false
);

-- Step 9: Verify setup
SELECT 'Setup Complete! ✅' as status;
SELECT COUNT(*) as notification_count FROM public.notifications;
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5;

