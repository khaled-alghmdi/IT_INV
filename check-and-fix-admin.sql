-- ====================================
-- CHECK AND FIX ADMIN ACCESS
-- ====================================

-- Step 1: Check if you're in the user_roles table
-- Replace 'your-email@example.com' with YOUR actual email
SELECT * FROM public.user_roles 
WHERE email = 'your-email@example.com';

-- If you see NO RESULTS, you need to add yourself:

-- Step 2: Get your user ID from auth.users
SELECT id, email FROM auth.users 
WHERE email = 'your-email@example.com';

-- Step 3: Add yourself as admin (replace the email and user_id)
INSERT INTO public.user_roles (user_id, email, role, created_at)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
    'your-email@example.com',
    'admin',
    now()
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';

-- Step 4: Verify you're now admin
SELECT * FROM public.user_roles 
WHERE email = 'your-email@example.com';

-- You should see: role = 'admin'

-- ====================================
-- ALTERNATIVE: Update existing role
-- ====================================

-- If you already exist but role is 'user', update it:
UPDATE public.user_roles 
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- ====================================
-- VERIFY ACCESS
-- ====================================

-- Check all admins
SELECT 
    ur.email,
    ur.role,
    ur.created_at
FROM public.user_roles ur
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;

