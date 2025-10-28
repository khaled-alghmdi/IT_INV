# 🔐 User Roles System Setup Guide

## 🎉 Role-Based Access Control Added!

Your IT Inventory system now has a complete admin/user role system!

---

## ✨ Features

### **1. Two User Roles:**
- **👑 ADMIN** - Full access to all features including Users page
- **👤 USER** - Can only access the main Dashboard

### **2. Role-Based Page Protection:**
- `/users` page is now **admin-only**
- Non-admin users see "Access Denied" message
- Automatic redirect to dashboard

### **3. Role Badges:**
- Visual indicators showing who is admin
- Crown icon (👑) for admins
- User icon for regular users

### **4. Auto-Assignment:**
- New users automatically get "user" role
- First admin must be set manually (see below)

---

## 🚀 Setup Instructions

### **Step 1: Run the Database Schema**

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. Copy ALL content from `database-schema-roles.sql`
5. **IMPORTANT:** Change this line:
   ```sql
   WHERE email = 'your-email@example.com'  -- ← CHANGE THIS TO YOUR EMAIL!
   ```
   Replace with YOUR email address that you use to login!

6. Click **RUN** or press `Ctrl + Enter`
7. You should see: ✅ "Success. No rows returned"

---

## 🔧 What the Schema Creates

### **New Table: `user_roles`**
- Stores user_id, email, and role
- Roles: "admin" or "user"
- Auto-created for new signups

### **Automatic Triggers:**
- New users automatically get "user" role
- You don't need to manually add roles

### **Row Level Security:**
- Users can read their own role
- Admins can read all roles
- Admins can update roles

---

## 👑 How to Make Someone Admin

### **Option 1: Update in Supabase (Easiest)**

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Find `user_roles` table
4. Find the user's row (by email)
5. Change `role` from `user` to `admin`
6. Save

### **Option 2: Run SQL Query**

```sql
-- Replace with the user's email
UPDATE user_roles 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

### **Option 3: First-Time Setup**

When running `database-schema-roles.sql`:
1. Change the email in the INSERT statement
2. That user becomes admin automatically
3. All other users are regular users

---

## 🎯 Testing the Role System

### **Test as Admin:**
1. Login with your admin account
2. Click **"Users"** in navigation
3. You'll see all users with role badges
4. Admins have 👑 ADMIN badge
5. Regular users have USER badge

### **Test as Regular User:**
1. Create a new account (or use existing non-admin)
2. Login
3. Try to access `/users` page
4. You'll see "Access Denied" message
5. Auto-redirected to Dashboard

---

## 📋 Role Permissions

### **👑 ADMIN Can:**
- ✅ View Dashboard
- ✅ Add/Edit/Delete devices
- ✅ View Users page
- ✅ See all registered users
- ✅ See all assigned devices
- ✅ Change user roles (future feature)

### **👤 USER Can:**
- ✅ View Dashboard
- ✅ Add/Edit/Delete devices
- ❌ Cannot access Users page
- ❌ Cannot see other users
- ❌ Cannot change roles

---

## 🎨 Visual Indicators

### **Admin Users:**
- Crown icon (👑)
- Amber/Orange gradient background
- "👑 ADMIN" badge
- Gold color scheme

### **Regular Users:**
- User icon
- Green background
- "USER" badge
- Gray color scheme

---

## 📁 Files Added/Modified

### **New Files:**
- ✅ `database-schema-roles.sql` - Database setup
- ✅ `lib/auth-helpers.ts` - Role checking functions
- ✅ `components/AdminRoute.tsx` - Admin route protection
- ✅ `ROLES-SETUP-GUIDE.md` - This guide

### **Modified Files:**
- ✅ `lib/types.ts` - Added UserRole type
- ✅ `app/users/page.tsx` - Added role display & admin check
- ✅ `lib/supabase.ts` - Already has admin client

---

## 🔐 Security Features

### **1. Database Level:**
- Row Level Security (RLS) enabled
- Only admins can modify roles
- Users can only see their own role

### **2. Application Level:**
- Protected routes check admin status
- Client-side validation
- Server-side validation

### **3. Access Control:**
- Real-time role checking
- Automatic redirects
- Clear access denied messages

---

## 💡 Common Use Cases

### **Scenario 1: New Employee**
1. They sign up at `/signup`
2. Automatically assigned "user" role
3. Can access dashboard only
4. Cannot see Users page

### **Scenario 2: Promote to Admin**
1. You (admin) go to Supabase
2. Update their role to "admin"
3. They refresh browser
4. Now have full access!

### **Scenario 3: Multiple Admins**
1. Run UPDATE query for each admin email
2. All admins can access Users page
3. All admins see role badges

---

## 🛠️ Troubleshooting

### **"Access Denied" for admin user**

**Check:**
1. Database has `user_roles` table
2. Your email is in the table with role='admin'
3. Restart dev server after database changes
4. Clear browser cache

**Fix:**
```sql
-- Verify your role
SELECT * FROM user_roles WHERE email = 'your@email.com';

-- Set to admin if needed
UPDATE user_roles SET role = 'admin' WHERE email = 'your@email.com';
```

### **New users not getting roles**

**Check:**
1. Trigger `on_auth_user_created` exists
2. Function `handle_new_user()` exists
3. Re-run `database-schema-roles.sql`

### **Cannot change roles**

**Check:**
1. You are logged in as admin
2. RLS policies are set correctly
3. Run the schema SQL again

---

## 🔮 Future Enhancements

You can add:

1. **More Roles:**
   - Manager, Viewer, etc.
   - Different permission levels

2. **Role Management UI:**
   - Change roles from Users page
   - Add dropdown to change roles
   - Real-time updates

3. **Department Roles:**
   - IT Admin, HR User, etc.
   - Department-based access

4. **Permission System:**
   - Granular permissions
   - Can view but not edit
   - Custom permission sets

---

## 📊 Database Schema

### **user_roles Table:**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Auth user ID (unique) |
| email | TEXT | User's email |
| role | TEXT | "admin" or "user" |
| created_at | TIMESTAMP | When role was assigned |
| updated_at | TIMESTAMP | Last role change |

---

## ✅ Setup Checklist

Before using the system:

- [ ] Run `database-schema-roles.sql` in Supabase
- [ ] Changed email to YOUR email in the SQL
- [ ] Verified `user_roles` table exists
- [ ] Verified trigger `on_auth_user_created` exists
- [ ] Restarted dev server
- [ ] Tested admin access to `/users`
- [ ] Tested regular user cannot access `/users`
- [ ] Verified role badges show correctly

---

## 🎉 You're All Set!

Your IT Inventory system now has:
- ✅ Role-based access control
- ✅ Admin-only pages
- ✅ Visual role indicators
- ✅ Automatic role assignment
- ✅ Secure database policies

**Make yourself admin and start managing your users!** 👑💚

---

**Need help setting up roles? Check the troubleshooting section or the SQL comments in `database-schema-roles.sql`!**

