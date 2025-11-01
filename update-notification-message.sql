-- Update notification message with better grammar
CREATE OR REPLACE FUNCTION notify_device_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if device is assigned with a user email
    IF NEW.status = 'assigned' AND NEW.assigned_to IS NOT NULL THEN
        -- For INSERT: always notify
        -- For UPDATE: only notify if assignment changed
        IF (TG_OP = 'INSERT') OR 
           (TG_OP = 'UPDATE' AND (
               OLD.status != 'assigned' OR 
               OLD.assigned_to IS NULL OR 
               OLD.assigned_to != NEW.assigned_to
           )) THEN
            
            -- Insert notification with new message
            INSERT INTO public.notifications (
                user_email,
                title,
                message,
                type,
                device_id,
                read
            ) VALUES (
                NEW.assigned_to,
                'Device Assigned - Action Required',
                'Hello from Admin,' || E'\n\n' ||
                'This is your device details:' || E'\n\n' ||
                'Asset Number: ' || NEW.asset_number || E'\n' ||
                'Serial Number: ' || NEW.serial_number || E'\n\n' ||
                'Please go to ServiceNow and fill out the delivery note.' || E'\n\n' ||
                'Thank you!',
                'device_assignment',
                NEW.id,
                false
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Notification message updated with correct grammar!' as status;

