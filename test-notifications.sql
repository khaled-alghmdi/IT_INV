-- ====================================
-- QUICK TEST FOR NOTIFICATION SYSTEM
-- ====================================

-- Step 1: Check if notifications table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications'
) as table_exists;

-- Step 2: Check if trigger exists
SELECT EXISTS (
    SELECT FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_notify_device_assignment'
) as trigger_exists;

-- Step 3: View all notifications
SELECT 
    id,
    created_at,
    user_email,
    title,
    read,
    device_id
FROM public.notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 4: Count notifications per user
SELECT 
    user_email,
    COUNT(*) as notification_count,
    SUM(CASE WHEN read = false THEN 1 ELSE 0 END) as unread_count
FROM public.notifications 
GROUP BY user_email;

-- Step 5: Check last device assignment
SELECT 
    id,
    asset_number,
    serial_number,
    device_type,
    status,
    assigned_to,
    assigned_date
FROM public.devices 
WHERE status = 'assigned' 
ORDER BY assigned_date DESC NULLS LAST
LIMIT 5;

-- ====================================
-- MANUAL TEST: Create Test Notification
-- ====================================
-- Replace 'YOUR-EMAIL@example.com' with the user's email

/*
INSERT INTO public.notifications (
    user_email,
    title,
    message,
    type,
    read
) VALUES (
    'YOUR-EMAIL@example.com',
    'Test Notification',
    'This is a test notification!' || E'\n\n' ||
    'Device Details:' || E'\n' ||
    '• Asset Number: TEST123' || E'\n' ||
    '• Serial Number: SN-TEST-456' || E'\n' ||
    '• Device Type: Laptop' || E'\n' ||
    '• Brand/Model: Dell Test Model',
    'device_assignment',
    false
);
*/

-- ====================================
-- CHECK RLS POLICIES
-- ====================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

