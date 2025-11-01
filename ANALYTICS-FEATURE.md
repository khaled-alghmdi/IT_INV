# 📊 Analytics Dashboard Feature

## Overview
The Analytics Dashboard provides comprehensive insights into your IT inventory with beautiful charts, key metrics, and export capabilities.

## Features

### 📈 Key Metrics Cards
- **Total Devices**: Overall device count
- **Added This Month**: New devices with trend comparison
- **Assignment Rate**: Percentage of devices assigned with visual progress bar
- **Recent Assignments**: Assignments in the last 30 days

### 📊 Interactive Charts

1. **Device Status Distribution** (Pie Chart)
   - Visual breakdown of Assigned, Available, and Not Working devices
   - Color-coded for quick understanding

2. **Device Types** (Bar Chart)
   - Top 8 device types in your inventory
   - Horizontal bar chart for easy comparison

3. **Purchase Timeline** (Line Chart)
   - 6-month trend of device purchases
   - Helps identify purchasing patterns

4. **Assignment Timeline** (Line Chart)
   - 6-month trend of device assignments
   - Tracks utilization over time

5. **Top Brands** (Horizontal Bar Chart)
   - Top 6 brands in your inventory
   - Identifies preferred vendors

6. **Top 5 Users** (Progress Bars)
   - Users with most assigned devices
   - Visual ranking with device counts

### 📥 Export Options

#### Excel Export
- Generates `.xlsx` file with multiple sheets:
  - Summary metrics
  - Device types distribution
  - Brand distribution
  - Top users
- Professional branding with Tamer Pharmaceutical Industries logo
- Filename: `Tamer_IT_Inventory_Analytics_YYYY-MM-DD.xlsx`

#### PDF Export
- Professional PDF report with:
  - Tamer logo and branding (green theme)
  - Company name centered at top
  - Summary tables
  - Device type distribution
  - Top users
- Filename: `Tamer_IT_Inventory_Analytics_YYYY-MM-DD.pdf`

## Access

### Admin Only
The Analytics section is only visible to users with the **Admin** role on the main Dashboard.

### Location
Analytics & Insights appear at the **top** of your main Dashboard page automatically when you sign in as an admin - first thing you see!

## Technical Details

### API Endpoint
- **Route**: `/api/analytics`
- **Method**: GET
- **Authentication**: Server-side using service role key
- **Response**: JSON with summary and chart data

### Performance Optimizations
- Server-side data aggregation
- Efficient Supabase queries
- Responsive charts with Recharts
- Lazy loading of chart components
- Optimized date calculations

### Data Refresh
- Data is fetched on page load
- Manual refresh by navigating away and back
- Real-time updates with automatic refresh

## Chart Library
Uses **Recharts** - a composable charting library built on React components.

### Why Recharts?
- ✅ Built specifically for React
- ✅ Highly customizable
- ✅ Responsive and mobile-friendly
- ✅ Beautiful out-of-the-box design
- ✅ Active development and support

## Export Libraries
- **xlsx**: Excel file generation
- **jspdf**: PDF generation
- **jspdf-autotable**: PDF table formatting

## Color Scheme
All charts and UI elements follow the green theme:
- Primary Green: `#22c55e`
- Dark Green: `#16a34a`
- Light Green: `#4ade80`
- Gradient backgrounds for visual appeal

## Features Implemented

✅ **Key Metrics Cards**
- Total Devices count
- Devices Added This Month
- Assignment Rate with progress bar
- Recent Assignments (last 30 days)

✅ **Interactive Charts**
- Device Status Distribution (Pie Chart)
- Top 8 Device Types (Bar Chart)
- Purchase Timeline - 6 months (Line Chart)
- Assignment Timeline - 6 months (Line Chart)
- Top 6 Brands (Bar Chart)
- Top 5 Users by device count (Progress Bars)

✅ **Export Features**
- Export to Excel with multiple sheets
- Export to PDF with Tamer logo and branding
- Professional formatting with company branding

✅ **UI/UX Enhancements**
- Hover effects on all cards
- Smooth animations
- Responsive design for all screen sizes
- Green and white theme consistent throughout

## Usage

### For Admins

1. **View Analytics**
   - Log in as an admin
   - Navigate to the Dashboard
   - Analytics section appears automatically at the top

2. **Export Reports**
   - Click "Export Excel" for spreadsheet format
   - Click "Export PDF" for professional reports
   - Files download automatically with date stamp

### Chart Interactions
- **Hover** over chart elements for detailed tooltips
- **Legends** show/hide data series
- All charts are **responsive** and adapt to screen size

## Data Included in Analytics

### Summary Metrics
- Total number of devices
- Assigned devices count
- Available devices count
- Not working devices count
- Devices added this month
- Overall assignment rate percentage
- Recent assignments (last 30 days)

### Chart Data
- **Status Distribution**: Count by status (Assigned/Available/Not Working)
- **Device Types**: Top 8 most common device types
- **Purchase Timeline**: Monthly purchases for last 6 months
- **Assignment Timeline**: Monthly assignments for last 6 months
- **Top Brands**: Top 6 most common brands
- **Top Users**: Top 5 users with most devices assigned

## Troubleshooting

### Charts not displaying
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify API endpoint is returning data

### Export not working
- Verify xlsx and jspdf packages are installed
- Check browser's download settings
- Ensure pop-up blocker isn't interfering

### No data showing
- Ensure devices exist in your database
- Check that dates are properly formatted
- Verify Supabase connection
- Check browser console for API errors

## Future Enhancements
- [ ] Custom date range selection
- [ ] Scheduled email reports
- [ ] Additional chart types (scatter, area)
- [ ] Comparison with previous periods
- [ ] Predictive analytics
- [ ] Cost analysis charts
- [ ] Warranty expiration tracking
- [ ] Department-wise device distribution
- [ ] Device age analysis
- [ ] Maintenance history charts

## Support
For issues or feature requests, please contact your system administrator.

---

## Installation & Setup

All required dependencies are already installed:
- `recharts` - Chart library
- `xlsx` - Excel export
- `jspdf` - PDF export
- `jspdf-autotable` - PDF tables

The feature is ready to use immediately after logging in as an admin!
