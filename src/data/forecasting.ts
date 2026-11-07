export const FORECAST_GROUPS = [
  {
    "id": "inventory",
    "title": "Inventory & Demand",
    "description": "Balance stock availability, expiry risk and working capital.",
    "features": [
      {
        "id": "seasonal",
        "title": "Seasonal demand",
        "description": "Identify seasonal changes in category demand."
      },
      {
        "id": "reorder",
        "title": "Reorder points & lead times",
        "description": "Estimate when and how much to order using sales velocity and supplier lead times."
      },
      {
        "id": "expiry",
        "title": "Expiry risk",
        "description": "Identify batches at risk of expiring before stock is depleted."
      },
      {
        "id": "slow",
        "title": "Slow-moving & dead stock",
        "description": "Review products at risk of low movement over 6?12 months."
      }
    ]
  },
  {
    "id": "revenue",
    "title": "Sales & Revenue",
    "description": "Plan revenue, cash flow and category performance.",
    "features": [
      {
        "id": "sales",
        "title": "Daily & monthly revenue",
        "description": "Estimate sales patterns around paydays, holidays and trading cycles."
      },
      {
        "id": "category",
        "title": "Category revenue",
        "description": "Compare expected prescription, OTC, personal care, device and surgical revenue."
      },
      {
        "id": "margin",
        "title": "Gross profit margins",
        "description": "Assess supplier costs, discounts and expected product mix."
      }
    ]
  },
  {
    "id": "staff",
    "title": "HR & Staffing",
    "description": "Plan coverage around expected customer demand.",
    "features": [
      {
        "id": "traffic",
        "title": "Peak hours & foot traffic",
        "description": "Identify likely busy hours using arrivals, clinic hours and external factors."
      },
      {
        "id": "coverage",
        "title": "Pharmacist shift coverage",
        "description": "Estimate licensed pharmacist coverage requirements and possible gaps."
      },
      {
        "id": "labor",
        "title": "Overtime & labor costs",
        "description": "Review expected labor expenses during busy periods."
      }
    ]
  },
  {
    "id": "health",
    "title": "Disease Trends & Refills",
    "description": "Explore demand signals and recurring prescription needs.",
    "features": [
      {
        "id": "outbreak",
        "title": "Outbreak & viral demand signals",
        "description": "Flag unusual OTC sales changes for review; sales patterns alone cannot confirm an outbreak."
      },
      {
        "id": "refill",
        "title": "Prescription refill patterns",
        "description": "Estimate recurring demand using aggregated refill intervals, without patient identifiers."
      }
    ]
  }
] as const;
export const FORECAST_METHODS = ['Automatic recommendation', 'Time-series (ARIMA / exponential smoothing)', 'Machine learning (XGBoost / Random Forest / LSTM)', 'Moving averages / linear regression'] as const;

// Small fictional datasets selected on the server for each forecasting area.
export const FORECAST_HISTORY: Record<string, Record<string, string | number>[]> = {
  inventory: [
    { period: '2026-08', category: 'OTC', product: 'ORS sachets', unitsSold: 980, stockOnHand: 760, leadTimeDays: 7, batchExpiry: '2027-02-28' },
    { period: '2026-09', category: 'OTC', product: 'ORS sachets', unitsSold: 1060, stockOnHand: 680, leadTimeDays: 9, batchExpiry: '2027-02-28' },
    { period: '2026-10', category: 'OTC', product: 'ORS sachets', unitsSold: 1180, stockOnHand: 540, leadTimeDays: 10, batchExpiry: '2027-02-28' },
  ],
  revenue: [
    { period: '2026-08', category: 'OTC', unitsSold: 980, revenueLkr: 1420000, costOfGoodsLkr: 901600 },
    { period: '2026-09', category: 'OTC', unitsSold: 1060, revenueLkr: 1590000, costOfGoodsLkr: 996400 },
    { period: '2026-10', category: 'OTC', unitsSold: 1180, revenueLkr: 1770000, costOfGoodsLkr: 1132800 },
  ],
  staff: [
    { date: '2026-11-02', hour: '09:00', customers: 28, pharmacistHours: 1, staffHours: 2, overtimeHours: 0, hourlyRateLkr: 500, overtimeRateLkr: 750 },
    { date: '2026-11-02', hour: '12:00', customers: 46, pharmacistHours: 1, staffHours: 3, overtimeHours: 1, hourlyRateLkr: 500, overtimeRateLkr: 750 },
    { date: '2026-11-02', hour: '17:00', customers: 62, pharmacistHours: 1, staffHours: 3, overtimeHours: 2, hourlyRateLkr: 500, overtimeRateLkr: 750 },
  ],
  health: [
    { week: '2026-10-12', feverMedicationUnits: 120, antidiarrhealUnits: 45, hypertensionRefills: 38, diabetesRefills: 42, typicalRefillIntervalDays: 30 },
    { week: '2026-10-19', feverMedicationUnits: 142, antidiarrhealUnits: 48, hypertensionRefills: 40, diabetesRefills: 45, typicalRefillIntervalDays: 30 },
    { week: '2026-10-26', feverMedicationUnits: 168, antidiarrhealUnits: 52, hypertensionRefills: 41, diabetesRefills: 44, typicalRefillIntervalDays: 30 },
  ],
};
