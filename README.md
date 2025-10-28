# IT Inventory Management System

A modern web-based inventory tracking and management system for IT departments. Built with Next.js, TypeScript, TailwindCSS, and Supabase.

## Features

### Phase 1 (Current)
- ✅ Track IT assets (computers, monitors, and other devices)
- ✅ Unique Asset Number and Serial Number for each device
- ✅ Device status tracking:
  - **Assigned** - Currently in use by an employee
  - **Available** - Free and ready to assign
  - **Not Working** - Under maintenance or retired
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Search and filter functionality
- ✅ Real-time statistics dashboard
- ✅ Responsive design for all screen sizes
- ✅ Cloud-based database with Supabase

### Planned Features
- Assignment history tracking
- User role management
- Maintenance logs
- Location tracking
- Warranty information
- Export reports (PDF/Excel)
- Email notifications
- Barcode/QR code generation

## Tech Stack

- **Frontend**: Next.js 14 (React) with TypeScript
- **Styling**: TailwindCSS
- **Database/Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier available)

## Installation

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd IT_INV
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy the contents of `supabase-schema.sql` and execute it
5. This will create the `devices` table with sample data

### 4. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   \`\`\`bash
   copy .env.local.example .env.local
   \`\`\`

2. Get your Supabase credentials:
   - Go to your Supabase project settings
   - Navigate to **API** section
   - Copy the **Project URL** and **anon public** key

3. Update `.env.local` with your credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding a Device
1. Click the **"Add Device"** button
2. Fill in the required fields:
   - Asset Number (unique)
   - Serial Number (unique)
   - Device Type (e.g., Laptop, Monitor)
3. Optionally add brand, model, and notes
4. Select the device status
5. If status is "Assigned", enter the assignee and date
6. Click **"Add Device"**

### Editing a Device
1. Click the edit icon (pencil) on any device row
2. Update the desired fields
3. Click **"Update Device"**

### Deleting a Device
1. Click the delete icon (trash) on any device row
2. Confirm the deletion

### Searching and Filtering
- Use the search bar to find devices by asset number, serial number, type, brand, model, or assignee
- Use the status dropdown to filter by device status
- Filters can be combined

## Database Schema

### Devices Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| asset_number | TEXT | Unique asset identifier |
| serial_number | TEXT | Unique serial number |
| device_type | TEXT | Type of device (e.g., Laptop, Monitor) |
| brand | TEXT | Device brand (optional) |
| model | TEXT | Device model (optional) |
| status | TEXT | Device status (assigned/available/not_working) |
| assigned_to | TEXT | Employee name (if assigned) |
| assigned_date | DATE | Date when device was assigned |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Project Structure

\`\`\`
IT_INV/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (main dashboard)
├── components/
│   ├── Header.tsx           # Header with stats and filters
│   ├── DeviceList.tsx       # Device table display
│   ├── AddDeviceModal.tsx   # Add device form modal
│   └── EditDeviceModal.tsx  # Edit device form modal
├── lib/
│   ├── supabase.ts          # Supabase client configuration
│   └── types.ts             # TypeScript type definitions
├── supabase-schema.sql      # Database schema
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # TailwindCSS configuration
└── README.md                # This file
\`\`\`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## Troubleshooting

### Can't connect to Supabase
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure Row Level Security policies are set up correctly

### Devices not showing up
- Check browser console for errors
- Verify the database table exists
- Check Supabase logs for any issues

### Build errors
- Make sure all dependencies are installed: `npm install`
- Clear cache and rebuild: `rm -rf .next && npm run build`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an issue in the GitHub repository.

---

**Built with ❤️ for efficient IT asset management**

