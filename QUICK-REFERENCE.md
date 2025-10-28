# Quick Reference Card - IT Inventory System

## 🚀 Common Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Dependencies
```bash
npm install          # Install dependencies
npm update           # Update dependencies
npm audit fix        # Fix security vulnerabilities
```

## 📝 Environment Variables

**Required in .env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Get these from:** Supabase Dashboard → Settings → API

## 🗄️ Database Quick Commands

### View Data (Supabase Dashboard)
1. Go to Table Editor
2. Select "devices" table
3. View/Edit rows directly

### Run SQL Query
1. Go to SQL Editor
2. Write query
3. Press Ctrl+Enter or click Run

### Common Queries

**View all devices:**
```sql
SELECT * FROM devices ORDER BY created_at DESC;
```

**Count by status:**
```sql
SELECT status, COUNT(*) 
FROM devices 
GROUP BY status;
```

**Find device:**
```sql
SELECT * FROM devices 
WHERE asset_number = 'AST-001';
```

**Update status:**
```sql
UPDATE devices 
SET status = 'available', assigned_to = NULL 
WHERE id = 'device-id-here';
```

**Delete all data:**
```sql
TRUNCATE devices RESTART IDENTITY;
```

## 🎨 Component Reference

### Main Components

**Header.tsx**
- Statistics dashboard
- Search bar
- Status filter

**DeviceList.tsx**
- Device table
- Edit/Delete buttons
- Status badges

**AddDeviceModal.tsx**
- Add new device form
- Field validation

**EditDeviceModal.tsx**
- Update device form
- Pre-filled fields

## 📊 Device Status Values

| Status | Value | Color | Meaning |
|--------|-------|-------|---------|
| Assigned | `assigned` | Green | In use by employee |
| Available | `available` | Yellow | Ready to assign |
| Not Working | `not_working` | Red | Maintenance/retired |

## 🔧 File Locations

### Modify Styles
- Global: `app/globals.css`
- Colors: `tailwind.config.ts`
- Components: Inline with Tailwind classes

### Add New Page
1. Create `app/your-page/page.tsx`
2. Auto-routes to `/your-page`

### Add New Component
1. Create `components/YourComponent.tsx`
2. Import where needed

### Update Types
- Edit `lib/types.ts`
- TypeScript will show errors if updates needed

## 🔍 Debugging

### Check Browser Console
```
Press F12 → Console tab
```

### Check Network Requests
```
Press F12 → Network tab → Filter: Fetch/XHR
```

### Check Supabase Logs
```
Dashboard → Logs → Recent Queries
```

### Common Errors & Fixes

**"Failed to fetch"**
→ Check .env.local file exists and is correct

**No devices showing**
→ Run supabase-schema.sql in SQL Editor

**Module not found**
→ Run `npm install`

**Port already in use**
→ Kill process or use different port: `npm run dev -- -p 3001`

## 📱 Testing Checklist

### Before Production
- [ ] All environment variables set
- [ ] Database schema created
- [ ] Sample data removed
- [ ] Real devices added
- [ ] Search works
- [ ] Filters work
- [ ] Add device works
- [ ] Edit device works
- [ ] Delete device works
- [ ] Responsive on mobile
- [ ] No console errors

## 🚀 Deployment Checklist

### Vercel Deployment
1. [ ] Push code to GitHub
2. [ ] Go to vercel.com
3. [ ] Import repository
4. [ ] Add environment variables
5. [ ] Deploy
6. [ ] Test production site
7. [ ] Set up custom domain (optional)

### Post-Deployment
- [ ] Test all features
- [ ] Check database connection
- [ ] Verify search and filters
- [ ] Test on mobile devices
- [ ] Share with team

## 💾 Backup Strategy

### Manual Backup
1. Supabase Dashboard
2. Database → Backups
3. Download backup

### Export Data
```sql
-- Copy result and save as CSV
SELECT * FROM devices;
```

## 🎯 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| White screen | Check browser console for errors |
| Can't add device | Check required fields are filled |
| Changes not saving | Check Supabase connection |
| Search not working | Clear search and try again |
| Slow performance | Check network tab, may be large dataset |

## 🔗 Important Links

- **Local Dev:** http://localhost:3000
- **Supabase Dashboard:** https://app.supabase.com
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Supabase Docs:** https://supabase.com/docs

## 📞 Quick Actions

### Add Device
1. Click "Add Device"
2. Fill required: Asset#, Serial#, Type
3. Select status
4. Submit

### Change Status
1. Click edit (pencil icon)
2. Change status dropdown
3. Update assignee if needed
4. Save

### Bulk Delete
*Not built-in yet*
Option 1: Delete one by one
Option 2: Run SQL in Supabase

### Search Device
Type in search bar:
- Asset number
- Serial number
- Device type
- Brand
- Model
- Assignee name

## 🎓 Pro Tips

1. **Use keyboard shortcuts**: Tab through form fields
2. **Bookmark dashboard**: Quick access to stats
3. **Use status filter**: Find available devices fast
4. **Add notes**: Help identify devices later
5. **Keep serials accurate**: Critical for warranty claims

---

**Need more help?** See README.md or SETUP-GUIDE.md

**Save this file** for quick reference! 🌟

