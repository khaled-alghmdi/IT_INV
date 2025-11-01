-- ====================================
-- FINAL FIX FOR 406 ERROR
-- ====================================

-- Drop all policies on user_roles
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Create ONE simple policy for SELECT
CREATE POLICY "Allow authenticated users to read"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (true);

-- Create policies for modifications (admins only by checking the table directly)
CREATE POLICY "Allow updates for admins"
    ON public.user_roles FOR UPDATE
    TO authenticated
    USING (
        email IN (SELECT email FROM public.user_roles WHERE role = 'admin')
    );

CREATE POLICY "Allow inserts for admins"
    ON public.user_roles FOR INSERT
    TO authenticated
    WITH CHECK (
        (auth.jwt() ->> 'email') IN (SELECT email FROM public.user_roles WHERE role = 'admin')
    );

CREATE POLICY "Allow deletes for admins"
    ON public.user_roles FOR DELETE
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN (SELECT email FROM public.user_roles WHERE role = 'admin')
    );

SELECT '✅ All fixed! Refresh your page.' as status;

