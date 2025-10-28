# Authentication Setup Guide

## 🔐 Supabase Auth Configuration

Your IT Inventory system now includes **email/password authentication** using Supabase Auth!

---

## ✅ Step 1: Enable Email Authentication in Supabase

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/kjbfytlkefgjylpbimnk

2. **Navigate to Authentication:**
   - Click **Authentication** in the left sidebar
   - Click **Providers** tab

3. **Enable Email Provider:**
   - Find **Email** provider
   - Make sure it's **ENABLED** (should be enabled by default)
   - Configure settings:
     - ✅ **Enable Email provider**
     - ✅ **Confirm email** (recommended - users must verify email)
     - Or ☐ **Confirm email** (unchecked - users can login immediately)

4. **Click "Save"**

---

## ✅ Step 2: Configure Email Templates (Optional)

If you enabled email confirmation:

1. **Go to Authentication → Email Templates**
2. Customize templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

---

## ✅ Step 3: Set Up Database with RLS

**IMPORTANT:** The database schema has been updated to use Row Level Security (RLS).

1. **Go to SQL Editor** in Supabase
2. **Run the updated schema** from `database-schema.sql`
3. This creates policies that **only allow authenticated users** to access devices

---

## 🎯 How Authentication Works

### **Login Flow:**
1. User visits your app → automatically redirected to `/login`
2. User enters email and password
3. If credentials are valid → redirected to dashboard
4. Session is maintained until user signs out

### **Sign Up Flow:**
1. User clicks "Sign up" on login page
2. User enters email and password
3. If email confirmation is **enabled**:
   - User receives confirmation email
   - Must click link to verify
   - Then can sign in
4. If email confirmation is **disabled**:
   - Account created immediately
   - User can sign in right away

### **Protected Routes:**
- The main dashboard (`/`) is protected
- Users must be logged in to access it
- If not logged in → automatically redirected to `/login`

### **Sign Out:**
- User clicks "Sign Out" button in header
- Session is cleared
- Redirected to login page

---

## 🚀 Testing Authentication

### **Create Your First User:**

**Option 1: Through the App**
1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000
3. You'll be redirected to `/login`
4. Click "Sign up"
5. Enter email and password
6. Sign in with those credentials

**Option 2: Through Supabase Dashboard**
1. Go to **Authentication → Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create user**

### **Test Login:**
1. Go to http://localhost:3000
2. Enter email and password
3. Click "Sign In"
4. You should see the dashboard with your email in the header!

### **Test Logout:**
1. Click the "Sign Out" button in the header
2. You should be redirected to the login page

---

## 🔒 Security Features

### **Row Level Security (RLS):**
- ✅ Database tables are protected
- ✅ Only authenticated users can access devices
- ✅ Prevents unauthorized API access

### **Session Management:**
- ✅ Sessions are stored securely
- ✅ Automatic session refresh
- ✅ Sessions persist across page refreshes

### **Password Requirements:**
- Minimum 6 characters (can be increased)
- Passwords are hashed by Supabase
- Never stored in plain text

---

## 📧 Email Confirmation Settings

### **With Email Confirmation (Recommended for Production):**

**Pros:**
- ✅ Verifies email addresses are real
- ✅ Prevents spam accounts
- ✅ More secure

**Cons:**
- ❌ Requires email service setup
- ❌ Users must check email before logging in

**Setup:**
1. Go to **Authentication → Providers**
2. Enable "Confirm email"
3. Configure email templates
4. Test with real email

### **Without Email Confirmation (Good for Development):**

**Pros:**
- ✅ Faster testing
- ✅ No email service needed
- ✅ Users can login immediately

**Cons:**
- ❌ No email verification
- ❌ Less secure for production

**Setup:**
1. Go to **Authentication → Providers**
2. Disable "Confirm email"
3. Click Save

**For development, I recommend DISABLING email confirmation!**

---

## 🛠️ Troubleshooting

### **"Invalid login credentials"**
- Check email and password are correct
- If email confirmation is enabled, check if user verified email
- Go to **Authentication → Users** in Supabase to verify user exists

### **"User already registered"**
- Email is already in use
- Try logging in instead
- Or use password reset feature

### **Infinite redirect loop**
- Check `.env.local` has correct Supabase credentials
- Restart dev server after changing env variables
- Clear browser cookies/cache

### **"Not authorized" when accessing devices**
- Database RLS policies may not be set up
- Re-run the `database-schema.sql` script
- Check user is authenticated

### **Email not sending**
- Check Supabase email settings
- For development, disable email confirmation
- Or set up SMTP in Supabase settings

---

## 🎨 Customization

### **Change Password Requirements:**

Edit `app/signup/page.tsx`:
```typescript
// Current: minimum 6 characters
if (password.length < 6) {
  setError("Password must be at least 6 characters long");
  return;
}

// Change to:
if (password.length < 8) {
  setError("Password must be at least 8 characters long");
  return;
}
```

### **Add Additional Fields:**

You can add more fields to the sign-up form:
- Name
- Company
- Role
- Department

Store these in Supabase user metadata or a separate `profiles` table.

### **Style the Login Page:**

Edit `app/login/page.tsx` and `app/signup/page.tsx` to customize colors, logo, and layout.

---

## 🔐 Production Checklist

Before deploying to production:

- [ ] Enable email confirmation
- [ ] Set up custom email templates
- [ ] Configure SMTP settings (or use Supabase's email service)
- [ ] Test password reset flow
- [ ] Set up custom domain
- [ ] Review RLS policies
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Create admin user accounts
- [ ] Document user onboarding process

---

## 📚 Additional Features to Add

### **Password Reset:**
```typescript
// In Supabase client
const { error } = await supabase.auth.resetPasswordForEmail(email);
```

### **Social Auth (Google, GitHub, etc.):**
1. Enable providers in Supabase dashboard
2. Add OAuth buttons to login page
3. Configure redirect URLs

### **Multi-Factor Authentication (MFA):**
1. Enable in Supabase settings
2. Add MFA setup in user profile
3. Require for admin users

### **User Roles:**
- Create `admin` and `user` roles
- Store in user metadata
- Check roles in RLS policies
- Show/hide features based on role

---

## 🎉 You're All Set!

Your IT Inventory system now has secure authentication! Users must log in to access the inventory dashboard.

**Next steps:**
1. Disable email confirmation for development (optional)
2. Create a test user account
3. Test login/logout functionality
4. Start adding your actual IT inventory!

**Need help?** Check the main README.md or Supabase documentation.

---

**Built with 🔒 Supabase Auth**

