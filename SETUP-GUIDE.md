# Quick Setup Guide - IT Inventory Management System

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies ✅
Already done! All dependencies are installed.

### Step 2: Set Up Supabase Database

1. **Create a Supabase Account**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create a New Project**
   - Click "New Project"
   - Choose organization
   - Name your project (e.g., "IT Inventory")
   - Set a secure database password
   - Choose a region close to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Set Up the Database**
   - In your Supabase dashboard, click "SQL Editor" in the left sidebar
   - Click "New query"
   - Open the `supabase-schema.sql` file in this project
   - Copy ALL the SQL code
   - Paste it into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - You should see "Success. No rows returned"

4. **Get Your API Credentials**
   - Click "Settings" (gear icon) in the left sidebar
   - Click "API" in the settings menu
   - Find these two values:
     * **Project URL** (looks like: https://xxxxxxxxxxxxx.supabase.co)
     * **anon public** key (under "Project API keys")
   - Keep this tab open - you'll need these values next

### Step 3: Configure Environment Variables

1. **Create .env.local file**
   - In your project root, create a new file called `.env.local`
   - Add the following content:

   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   \`\`\`

2. **Replace with your values**
   - Replace `your_project_url_here` with your Project URL
   - Replace `your_anon_key_here` with your anon public key
   - Save the file

### Step 4: Run the Application

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000 in your browser

You should see the IT Inventory Management dashboard with 5 sample devices! 🎉

---

## 🎯 What You Can Do Now

### Add a Device
1. Click "Add Device" button
2. Fill in:
   - Asset Number: AST-006 (must be unique)
   - Serial Number: SN-TEST-001 (must be unique)
   - Device Type: Laptop, Monitor, etc.
   - Brand & Model (optional)
   - Status: Available, Assigned, or Not Working
3. Click "Add Device"

### Search & Filter
- Use the search bar to find devices
- Use status dropdown to filter
- View statistics at the top

### Edit a Device
- Click the pencil icon on any device
- Update information
- Click "Update Device"

### Delete a Device
- Click the trash icon
- Confirm deletion

---

## 🔧 Troubleshooting

### "Failed to fetch" or connection errors
**Solution:**
1. Check your `.env.local` file exists and has correct values
2. Verify your Supabase project is active (green dot in dashboard)
3. Restart the dev server: Stop it (Ctrl+C) and run `npm run dev` again

### No devices showing
**Solution:**
1. Go to Supabase dashboard
2. Click "Table Editor"
3. You should see "devices" table with 5 rows
4. If not, run the SQL from `supabase-schema.sql` again

### Page not loading
**Solution:**
1. Make sure you ran `npm run dev`
2. Check console for errors
3. Try: `npm install` then `npm run dev`

### "Module not found" errors
**Solution:**
\`\`\`bash
npm install
npm run dev
\`\`\`

---

## 📝 Next Steps

After you're up and running:

1. **Customize the sample data**
   - Delete sample devices
   - Add your actual IT inventory

2. **Configure Row Level Security (Optional)**
   - By default, anyone can read/write
   - In production, set up authentication
   - Modify RLS policies in Supabase

3. **Deploy to Production**
   - Push code to GitHub
   - Deploy to Vercel (free)
   - Add environment variables in Vercel settings

4. **Extend functionality**
   - Add user authentication
   - Create assignment history
   - Add file upload for device images
   - Generate QR codes for assets

---

## 🆘 Need Help?

1. Check the main `README.md` for detailed documentation
2. Review Supabase documentation: https://supabase.com/docs
3. Check Next.js documentation: https://nextjs.org/docs

---

**🎉 Congratulations! Your IT Inventory System is ready to use!**

