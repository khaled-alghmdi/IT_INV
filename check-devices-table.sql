-- Check what columns exist in devices table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'devices'
ORDER BY ordinal_position;

-- Check if there are any columns with NOT NULL constraint that don't have defaults
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'devices'
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY ordinal_position;

