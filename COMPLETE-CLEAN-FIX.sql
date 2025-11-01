-- ====================================
-- COMPLETE CLEAN FIX - RUN THIS ONCE
-- ====================================

-- Step 1: Disable RLS temporarily to clean up
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_roles';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create ONE simple policy - allow ALL authenticated users to read
CREATE POLICY "authenticated_read_all"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Step 5: Allow ALL authenticated users to insert their own role
CREATE POLICY "authenticated_insert_own"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Step 6: Allow users to update their own record
CREATE POLICY "authenticated_update_own"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Step 7: Verify setup
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'user_roles' 
AND schemaname = 'public'
ORDER BY policyname;

SELECT '✅ All policies cleaned and fixed!' as status;

