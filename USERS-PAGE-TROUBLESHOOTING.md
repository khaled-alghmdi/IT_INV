# 🔧 Users Page - Troubleshooting Guide

## ❌ Problem: "I can't reach Users page"

---

## 🎯 **Quick Solutions**

### **Solution 1: Check if You're Admin** ⭐ (Most Common)

#### **Symptoms:**
- Can't see "Users" link in sidebar/navbar
- Get redirected when clicking Users
- Page shows "Access Denied"

#### **Fix:**
1. **Go to Supabase Dashboard**
   - Open: https://supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run this query** (replace with YOUR email):
```sql
-- Check your current role
SELECT * FROM public.user_roles 
WHERE email = 'YOUR-EMAIL@example.com';
```

4. **If you see NO RESULTS** or **role = 'user'**:
```sql
-- Make yourself admin
INSERT INTO public.user_roles (user_id, email, role, created_at)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'YOUR-EMAIL@example.com'),
    'YOUR-EMAIL@example.com',
    'admin',
    now()
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

5. **Verify it worked:**
```sql
SELECT * FROM public.user_roles 
WHERE email = 'YOUR-EMAIL@example.com';
```
   - Should show: `role = 'admin'` ✅

6. **Sign out and sign in again**
   - Click your email in top right
   - Click "Sign Out"
   - Sign in again
   - ✅ You should now see "Users" in navigation!

---

### **Solution 2: Clear Browser Cache**

Sometimes the browser caches old permissions:

1. **Hard Refresh:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Clear Site Data:**
   - Press `F12` (Developer Tools)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Sign out and back in**

---

### **Solution 3: Check Navigation Links**

#### **Admin Users Should See:**

**In Sidebar (Left):**
```
🏠 Dashboard
💾 Devices
👥 Users         ← Should be visible
📋 Requests
🐛 Manage Issues
```

**In Top Navbar:**
```
Dashboard | Users | Requests
```

#### **If You Don't See "Users" Link:**
- ❌ You're not recognized as admin
- ➡️ Follow Solution 1 above

---

### **Solution 4: Check Database Tables**

Run this in Supabase SQL Editor to verify everything exists:

```sql
-- 1. Check if user_roles table exists
SELECT * FROM public.user_roles LIMIT 5;

-- 2. Check if you're in auth.users
SELECT id, email, created_at FROM auth.users 
ORDER BY created_at DESC LIMIT 10;

-- 3. Check all admin users
SELECT email, role FROM public.user_roles 
WHERE role = 'admin';
```

---

### **Solution 5: Restart Dev Server**

Sometimes the server needs a restart:

```powershell
# Stop all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start dev server
npm run dev
```

Then refresh your browser.

---

## 🔍 **Detailed Diagnosis**

### **Test 1: What do you see?**

#### **Scenario A: No "Users" link anywhere**
**Problem:** You're not admin  
**Solution:** Follow Solution 1 (Make yourself admin)

#### **Scenario B: See "Users" link but get redirected**
**Problem:** Permission check failing  
**Solution:** 
1. Sign out completely
2. Clear cookies
3. Sign in again
4. Try again

#### **Scenario C: Page loads but shows "No users found"**
**Problem:** API issue or no users in database  
**Solution:** Check browser console (F12) for errors

#### **Scenario D: Page loading forever (spinner)**
**Problem:** API not responding  
**Solution:** 
1. Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
2. Restart dev server
3. Check browser console for errors

---

## 📋 **Complete Checklist**

Run through this checklist:

- [ ] **Step 1:** I'm logged in to the system
- [ ] **Step 2:** I ran the SQL query to check my role
- [ ] **Step 3:** My role is set to `'admin'` in database
- [ ] **Step 4:** I signed out and signed back in
- [ ] **Step 5:** I hard refreshed the page (Ctrl+Shift+R)
- [ ] **Step 6:** I can see "Users" in the sidebar
- [ ] **Step 7:** Clicking "Users" opens the page
- [ ] **Step 8:** The page loads successfully

---

## 🎯 **What Email Are You Using?**

**Important:** Make sure you're using the **EXACT** email you signed up with!

Check your current logged-in email:
1. Look at top-right of the screen
2. Your email should be displayed
3. Use this EXACT email in SQL queries

---

## 🔐 **Environment Variables**

Make sure your `.env.local` file has all required keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Missing `SUPABASE_SERVICE_ROLE_KEY`?**
- Go to Supabase Dashboard
- Settings → API
- Copy "service_role" key (starts with `eyJ...`)
- Add to `.env.local`
- **Restart dev server!**

---

## 🚨 **Still Not Working?**

### **Check Browser Console:**

1. Press `F12` (Developer Tools)
2. Click "Console" tab
3. Look for errors in RED
4. Common errors:

```
❌ "Failed to fetch" 
   → API issue, check service role key

❌ "Unauthorized" 
   → Not admin, follow Solution 1

❌ "Cannot read property 'email'" 
   → Not logged in properly, sign out/in

❌ "404 Not Found"
   → Dev server issue, restart it
```

### **Network Tab Check:**

1. Press `F12` → "Network" tab
2. Click "Users" link
3. Look for request to `/api/users`
4. Click on it → Check "Response"

**If you see:**
```json
{
  "error": "Admin access required"
}
```
➡️ You're not admin! Follow Solution 1

---

## ✅ **Success Indicators**

You should see this when it works:

```
✅ "Users" link visible in sidebar
✅ Page loads without redirecting
✅ Shows "User Management" title
✅ Shows 3 stat cards (Total Users, Assigned Devices, Avg per User)
✅ Shows list of users
✅ Can click to expand user's devices
✅ Has "Add User" button
```

---

## 📞 **Quick Support Script**

Copy and paste this into Supabase SQL Editor:

```sql
-- COMPLETE DIAGNOSTIC SCRIPT
-- Copy all results and share if you need help

-- 1. Your user info
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'YOUR-EMAIL-HERE';

-- 2. Your role
SELECT user_id, email, role, created_at 
FROM public.user_roles 
WHERE email = 'YOUR-EMAIL-HERE';

-- 3. All admins
SELECT email, role 
FROM public.user_roles 
WHERE role = 'admin';

-- 4. Total users count
SELECT COUNT(*) as total_users 
FROM auth.users;

-- 5. Total roles count
SELECT COUNT(*) as total_roles 
FROM public.user_roles;
```

---

## 🎉 **Most Common Fix (90% of cases)**

**Just run this in Supabase SQL Editor:**

```sql
-- Replace YOUR-EMAIL-HERE with your actual email!
INSERT INTO public.user_roles (user_id, email, role, created_at)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'YOUR-EMAIL-HERE'),
    'YOUR-EMAIL-HERE',
    'admin',
    now()
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

Then:
1. Sign out
2. Sign in
3. Hard refresh (Ctrl+Shift+R)
4. ✅ You should see Users page!

---

**Need more help? Share:**
1. What you see when you try to access Users
2. Your browser console errors (F12)
3. Results from the diagnostic SQL script above

