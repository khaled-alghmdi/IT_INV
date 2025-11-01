-- Check for triggers on devices table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'devices'
AND event_object_schema = 'public';

-- Count exact number of columns
SELECT COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'devices';

-- Show ALL columns including hidden ones
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'devices'
ORDER BY ordinal_position;

-- Try to see the actual table definition
SELECT 
    pg_get_tabledef('public.devices'::regclass) as table_definition;

