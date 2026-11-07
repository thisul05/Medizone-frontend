// Report Data Definition
export const REPORTS_DATA = [
  // Sales & Finance
  {
    id: 'dsr',
    title: 'Daily Sales Report (DSR)',
    category: 'Sales & Finance',
    frequency: 'Daily',
    description: 'Summarizes total daily revenue broken down by cash, cards, digital payments, direct insurance billing, and average basket size.',
    tags: ['Sales', 'Cash Flow', 'POS'],
    status: 'Ready',
    statusColor: 'green',
    lastUpdated: '10 mins ago',
    icon: 'TrendingUp',
    stats: 'LKR 452,800 Today',
    trend: '+8.4%'
  },
  {
    id: 'sales-summary',
    title: 'Weekly / Monthly / Annual Sales Summary',
    category: 'Sales & Finance',
    frequency: 'Monthly',
    description: 'Compares long-term sales volume, seasonal spikes, peak store hours, and category performance trends over selected time periods.',
    tags: ['Revenue', 'Trends', 'Analytics'],
    status: 'Ready',
    statusColor: 'green',
    lastUpdated: 'Today, 06:00 AM',
    icon: 'BarChart3',
    stats: 'LKR 12.4M (Oct)',
    trend: '+12.1%'
  },
  {
    id: 'pnl-margin',
    title: 'Profit & Loss (P&L) / Margin Report',
    category: 'Sales & Finance',
    frequency: 'Monthly',
    description: 'Evaluates gross profit margins by comparing Gross Revenue against Cost of Goods Sold (COGS) across prescription, OTC, and surgicals.',
    tags: ['Profitability', 'COGS', 'Margins'],
    status: 'Updated',
    statusColor: 'blue',
    lastUpdated: '1 day ago',
    icon: 'FileText',
    stats: '28.4% Margin Avg',
    trend: '+1.2%'
  },
  {
    id: 'credit-ar',
    title: 'Credit / Accounts Receivable Report',
    category: 'Sales & Finance',
    frequency: 'Weekly',
    description: 'Tracks outstanding pending payments for corporate accounts, patient credit ledger balances, and insurance claim reimbursements.',
    tags: ['Credit', 'Claims', 'Receivables'],
    status: 'Action Required',
    statusColor: 'amber',
    lastUpdated: '2 hours ago',
    icon: 'Clock',
    stats: 'LKR 1.8M Outstanding',
    trend: '-3.5%'
  },
  {
    id: 'tax-vat',
    title: 'Tax / GST / VAT Summary Report',
    category: 'Sales & Finance',
    frequency: 'Monthly',
    description: 'Consolidates sales tax collected across taxable vs. tax-exempt items for official regulatory filing and financial auditing.',
    tags: ['Tax', 'Compliance', 'Audit'],
    status: 'Ready',
    statusColor: 'green',
    lastUpdated: '3 days ago',
    icon: 'FileText',
    stats: 'LKR 840,200 Tax Collected',
    trend: 'Stable'
  },

  // Inventory & Stock
  {
    id: 'current-stock',
    title: 'Current Stock Valuation Report',
    category: 'Inventory & Stock',
    frequency: 'Daily',
    description: 'Displays live real-time stock quantities across all SKUs alongside monetary valuation based on unit cost and retail prices.',
    tags: ['Stock', 'Valuation', 'SKU'],
    status: 'Live',
    statusColor: 'green',
    lastUpdated: 'Real-time',
    icon: 'Package',
    stats: '4,280 SKUs Active',
    trend: 'LKR 34.5M Value'
  },
  {
    id: 'expiry-report',
    title: 'Expiry & Near-Expiry Report',
    category: 'Inventory & Stock',
    frequency: 'Weekly',
    description: 'Lists medications expiring within 30, 60, or 90 days for return-to-vendor (RTV) processing or discounted clearout sales.',
    tags: ['Expiry', 'RTV', 'Quality Control'],
    status: '14 Items Near Expiry',
    statusColor: 'amber',
    lastUpdated: 'Today, 08:00 AM',
    icon: 'AlertTriangle',
    stats: '14 SKUs < 60 days',
    trend: 'Urgent Action'
  },
  {
    id: 'reorder-shortage',
    title: 'Reorder / Shortage Threshold Report',
    category: 'Inventory & Stock',
    frequency: 'Daily',
    description: 'Automatically flags SKUs that have fallen below minimum safety stock levels to generate instant purchase requisitions.',
    tags: ['Purchase', 'Reorder', 'Shortage'],
    status: '8 Items Low',
    statusColor: 'amber',
    lastUpdated: '15 mins ago',
    icon: 'RefreshCw',
    stats: '8 Low Stock Items',
    trend: 'PO Pending'
  },
  {
    id: 'abc-xyz',
    title: 'ABC / XYZ Inventory Velocity Analysis',
    category: 'Inventory & Stock',
    frequency: 'Monthly',
    description: 'Categorizes inventory by turnover speed and monetary value (Fast-Moving vs. Dead Stock) to optimize capital allocation.',
    tags: ['ABC Analysis', 'Turnover', 'Deadstock'],
    status: 'Ready',
    statusColor: 'green',
    lastUpdated: '2 days ago',
    icon: 'SlidersHorizontal',
    stats: 'Fast Moving: 35%',
    trend: 'Optimal'
  },
  {
    id: 'shrinkage-adjustments',
    title: 'Stock Adjustments & Shrinkage Report',
    category: 'Inventory & Stock',
    frequency: 'Weekly',
    description: 'Logs stock adjustments, physical audit count variances, damaged goods, expired disposals, and internal usage logs.',
    tags: ['Shrinkage', 'Auditing', 'Variance'],
    status: 'Audit Ready',
    statusColor: 'blue',
    lastUpdated: 'Yesterday',
    icon: 'ShieldCheck',
    stats: '0.4% Variance',
    trend: 'Within Limit'
  },
  {
    id: 'batch-traceability',
    title: 'Batch-wise / Lot Traceability Report',
    category: 'Inventory & Stock',
    frequency: 'Daily',
    description: 'Complete audit trail mapping batch numbers, manufacturer, expiry, and supplier invoice details for drug safety recalls.',
    tags: ['Batch', 'Lot No', 'Recall Safety'],
    status: 'Verified',
    statusColor: 'green',
    lastUpdated: 'Real-time',
    icon: 'CheckCircle2',
    stats: '100% Traced',
    trend: 'Compliant'
  },

  // HR & Attendance
  {
    id: 'daily-attendance',
    title: 'Daily Attendance & Biometric Punch Log',
    category: 'HR & Attendance',
    frequency: 'Daily',
    description: 'Tracks employee check-in/out logs, biometric scans, overtime hours, late arrivals, and absent staff records.',
    tags: ['Biometric', 'Punch Log', 'Punctuality'],
    status: '24 Present',
    statusColor: 'green',
    lastUpdated: '5 mins ago',
    icon: 'Users',
    stats: '24/26 Staff On Duty',
    trend: '92% On-time'
  },
  {
    id: 'shift-roster',
    title: 'Shift Roster & Master Schedule',
    category: 'HR & Attendance',
    frequency: 'Weekly',
    description: 'Displays monthly/weekly shift coverage, night duty assignments, weekend rotations, and holiday relief rosters.',
    tags: ['Roster', 'Shifts', 'Schedules'],
    status: 'Active Week 45',
    statusColor: 'blue',
    lastUpdated: '3 days ago',
    icon: 'Calendar',
    stats: '3 Shifts Configured',
    trend: 'Covered'
  },
  {
    id: 'leave-summary',
    title: 'Leave & Time-Off Summary Report',
    category: 'HR & Attendance',
    frequency: 'Monthly',
    description: 'Tracks accumulated casual leave, medical leave balances, duty swaps, and unpaid leaves for monthly payroll preparation.',
    tags: ['Leave', 'Payroll', 'Time-off'],
    status: 'Ready',
    statusColor: 'green',
    lastUpdated: 'Yesterday',
    icon: 'Calendar',
    stats: '4 Pending Requests',
    trend: 'Reviewed'
  },
  {
    id: 'pharmacist-productivity',
    title: 'Salesperson & Pharmacist Productivity',
    category: 'HR & Attendance',
    frequency: 'Weekly',
    description: 'Evaluates throughput metrics per employee, including scripts fulfilled, total sales volume, OTC upsells, and average processing speed.',
    tags: ['Performance', 'KPI', 'Fulfillment'],
    status: 'Updated',
    statusColor: 'blue',
    lastUpdated: 'Today, 07:00 AM',
    icon: 'TrendingUp',
    stats: 'Avg 48 Scripts/hr',
    trend: '+5.3%'
  },
  {
    id: 'pic-duty-log',
    title: 'Pharmacist-in-Charge (PIC) Supervision Log',
    category: 'HR & Attendance',
    frequency: 'Daily',
    description: 'Legal attendance record verifying licensed pharmacist presence during operational hours to meet regulatory board standards.',
    tags: ['PIC', 'Supervision', 'Regulatory'],
    status: 'Fully Logged',
    statusColor: 'green',
    lastUpdated: 'Real-time',
    icon: 'ShieldCheck',
    stats: '100% Coverage',
    trend: 'Compliant'
  },

  // Regulatory & Clinical
  {
    id: 'narcotic-register',
    title: 'Controlled Substance / Narcotic Register Log',
    category: 'Regulatory & Clinical',
    frequency: 'Daily',
    description: 'Strict regulatory ledger detailing scheduled drug dispensing, prescribing doctor license numbers, patient IDs, and physical balance count.',
    tags: ['Narcotics', 'Controlled', 'Mandatory Log'],
    status: 'Audit Sealed',
    statusColor: 'green',
    lastUpdated: '1 hour ago',
    icon: 'ShieldCheck',
    stats: 'All Balances Match',
    trend: 'Strict Audit'
  },
  {
    id: 'dispensing-register',
    title: 'Prescription Dispensing Log & History',
    category: 'Regulatory & Clinical',
    frequency: 'Daily',
    description: 'Chronological master registry of all electronic and physical prescriptions filled, complete with dosage instructions and pharmacist ID.',
    tags: ['Prescriptions', 'Clinical', 'Dispensing'],
    status: '340 Filled Today',
    statusColor: 'blue',
    lastUpdated: '10 mins ago',
    icon: 'FileText',
    stats: '342 Scripts Dispensed',
    trend: 'Normal Vol'
  },
  {
    id: 'supplier-po-history',
    title: 'Supplier & Purchase Order (PO) History',
    category: 'Regulatory & Clinical',
    frequency: 'Weekly',
    description: 'Logs vendor invoices, Goods Received Notes (GRN), quality verification checks, and supplier payment terms.',
    tags: ['Suppliers', 'GRN', 'Purchase Orders'],
    status: 'Ready',
    statusColor: 'green',
    lastUpdated: 'Yesterday',
    icon: 'Building2',
    stats: '12 Active Vendors',
    trend: 'PO Approved'
  }
];

// Sample Interactive Table Data for Preview Modal
export const MOCK_PREVIEW_DATA: Record<string, { headers: string[]; rows: string[][]; summary: Record<string, string> }> = {
  dsr: {
    headers: ['Time', 'Receipt #', 'Customer / Patient', 'Type', 'Payment Mode', 'Amount (LKR)'],
    rows: [
      ['09:15 AM', 'INV-2026-981', 'Kamal Perera', 'Prescription', 'Card', '4,850.00'],
      ['09:32 AM', 'INV-2026-982', 'Nimali Silva', 'OTC / Personal', 'Cash', '1,200.00'],
      ['10:05 AM', 'INV-2026-983', 'Dr. Aruni Wickrama', 'Health Devices', 'Digital (Koko)', '18,500.00'],
      ['10:40 AM', 'INV-2026-984', 'Sahan Jayawardena', 'Prescription', 'Direct Insurance', '12,400.00'],
      ['11:15 AM', 'INV-2026-985', 'Dilini Fernando', 'OTC', 'Cash', '850.00']
    ],
    summary: { Total: 'LKR 452,800.00', Transactions: '184 Completed', AvgBasket: 'LKR 2,460.00' }
  },
  'expiry-report': {
    headers: ['SKU Code', 'Medicine / Item Name', 'Batch No', 'Stock Qty', 'Expiry Date', 'Days Left', 'Action Required'],
    rows: [
      ['MED-8841', 'Amoxicillin 500mg Capsules', 'BT-2024-09', '120 boxes', '2026-12-15', '37 Days', 'Return to Vendor'],
      ['MED-9920', 'Omeprazole 20mg Tabs', 'BT-2024-11', '45 bottles', '2026-12-28', '50 Days', 'Promotional Discount'],
      ['DEV-3301', 'Glucose Test Strips (50s)', 'BT-GT-901', '15 packs', '2026-11-30', '22 Days', 'Clearout Urgent'],
      ['MED-1042', 'Paracetamol 500mg Syrup', 'BT-SY-88', '30 bottles', '2027-01-10', '63 Days', 'Monitor Stock']
    ],
    summary: { TotalItems: '14 SKUs', PotentialLoss: 'LKR 84,500.00', PrimaryAction: '4 RTV Notes Pending' }
  }
};


export type Report = (typeof REPORTS_DATA)[number];
