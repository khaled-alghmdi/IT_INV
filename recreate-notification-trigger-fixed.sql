-- Recreate the notification trigger PROPERLY
CREATE OR REPLACE FUNCTION notify_device_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if device is being assigned
    IF NEW.status = 'assigned' AND NEW.assigned_to IS NOT NULL THEN
        -- Check if this is a new assignment
        IF (TG_OP = 'INSERT') OR 
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

-- Create trigger - ONLY on UPDATE, not INSERT
DROP TRIGGER IF EXISTS trigger_notify_device_assignment ON public.devices;
CREATE TRIGGER trigger_notify_device_assignment
    AFTER UPDATE ON public.devices
    FOR EACH ROW
    EXECUTE FUNCTION notify_device_assignment();

SELECT '✅ Notification trigger recreated! Now it works properly.' as status;

