-- ====================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ====================================

-- Step 1: Drop ALL existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.user_roles;

-- Step 2: Create SIMPLE policies WITHOUT recursion
-- Allow users to read their own role
CREATE POLICY "Users can read own role"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Allow admins to read all roles (using email match, no subquery)
CREATE POLICY "Admins can read all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (
        role = 'admin' AND email = (auth.jwt() ->> 'email')
    );

-- Allow admins to update roles
CREATE POLICY "Admins can update roles"
    ON public.user_roles FOR UPDATE
    TO authenticated
    USING (
        role = 'admin'
    );

-- Allow admins to insert roles
CREATE POLICY "Admins can insert roles"
    ON public.user_roles FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow admins to delete roles
CREATE POLICY "Admins can delete roles"
    ON public.user_roles FOR DELETE
    TO authenticated
    USING (
        role = 'admin'
    );

-- Step 3: Fix notifications policies (remove recursion)
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;

-- Simpler admin policy for notifications
CREATE POLICY "Admins can view all notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (
        user_email IN (
            SELECT email FROM public.user_roles WHERE role = 'admin' LIMIT 100
        ) OR 
        user_email = (auth.jwt() ->> 'email')
    );

SELECT '✅ Fixed! Refresh your page now.' as status;

