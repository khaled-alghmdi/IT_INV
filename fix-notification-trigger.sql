-- Check if notification trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'devices'
AND trigger_name = 'trigger_notify_device_assignment';

-- DROP the notification trigger temporarily
DROP TRIGGER IF EXISTS trigger_notify_device_assignment ON public.devices;

-- DROP the function too
DROP FUNCTION IF EXISTS notify_device_assignment();

SELECT '✅ Notification trigger removed. Try adding device now.' as status;

-- After testing, we can recreate it properly if needed

