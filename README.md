# AC Invoice Pro - UAE Edition

A Progressive Web App (PWA) designed specifically for AC technicians in UAE to generate professional invoices on the go.

## Features

### Invoice Management
- ✅ Create professional invoices with customer details
- ✅ Multiple service types: AC Installation, Repair, Gas Filling, Maintenance
- ✅ Automatic invoice number generation
- ✅ Real-time calculation with optional 5% UAE VAT
- ✅ Add digital signatures to invoices

### PDF Generation
- ✅ Professional PDF invoice generation
- ✅ Company branding with logo support
- ✅ Paid/Unpaid status tracking
- ✅ Download and share PDFs

### Sharing & Export
- ✅ Download PDF invoices
- ✅ Share via device share sheet
- ✅ Direct WhatsApp integration

### Invoice History
- ✅ View all saved invoices
- ✅ Edit and resend invoices
- ✅ Filter and search functionality
- ✅ Payment status tracking
- ✅ Revenue statistics dashboard

### Company Settings
- ✅ Company profile with logo upload
- ✅ Contact information
- ✅ VAT registration number
- ✅ Default currency (AED)

## Technical Features

### Offline-First
- Works without internet connection
- All data stored locally in the browser
- Automatic data persistence

### PWA Capabilities
- Install on home screen (iOS & Android)
- Native app-like experience
- Fast loading and responsive
- Works offline

### Mobile Optimized
- Touch-friendly interface
- Responsive design for all screen sizes
- Mobile-optimized navigation
- Safe area support for notched devices

## Installation

### As a Mobile App (Recommended)

#### iPhone/iPad (Safari):
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

#### Android (Chrome):
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Tap "Add to Home Screen"
4. Tap "Install"

### Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage Guide

### Creating Your First Invoice

1. **Set up your company** (first time only):
   - Go to Settings
   - Enter your company name, phone, address
   - Upload your company logo (optional)
   - Save settings

2. **Create an invoice**:
   - Tap "New Invoice"
   - Enter customer details (name, phone, address)
   - Add service items with descriptions and prices
   - Toggle VAT if applicable
   - Add signature (optional)
   - Preview and save

3. **Share the invoice**:
   - Download PDF for printing
   - Share via WhatsApp
   - Use device share option

### Managing Invoices

- **View History**: See all invoices with payment status
- **Edit Invoice**: Tap any invoice to view, then click Edit
- **Delete Invoice**: Swipe or tap delete (with confirmation)
- **Track Payments**: Mark invoices as Paid/Unpaid

## Data Storage

All data is stored locally in your browser using IndexedDB:
- ✅ Invoices are saved locally
- ✅ Company settings are preserved
- ✅ Works offline
- ⚠️ Clear browser data will delete all invoices

**Recommendation**: Regularly back up important invoices by downloading PDFs.

## UAE-Specific Features

- **Default Currency**: UAE Dirham (AED)
- **VAT Support**: Optional 5% VAT calculation
- **Phone Format**: Optimized for UAE phone numbers
- **Professional Layout**: Suitable for UAE business standards

## Browser Compatibility

- Chrome (recommended)
- Safari (iOS)
- Firefox
- Edge

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- jsPDF (PDF generation)
- localforage (Local storage)
- date-fns (Date formatting)
- Lucide React (Icons)

## License

MIT License - Free for personal and commercial use.

---

Made with ❄️ for AC Technicians in UAE
