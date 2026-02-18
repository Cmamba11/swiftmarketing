
/**
 * SWIFT PLASTICS - LOGIC CORE
 * These are the baseline values. The AI Architect can "Override" these
 * through the System Config in the Database/LocalStorage.
 */

export const BUSINESS_LOGIC = {
  // --- REVENUE & COMMISSIONS ---
  COMMISSION_REVENUE_BASE: 0.30,
  DEFAULT_AGENT_COMMISSION_RATE: 2.0,

  // --- PRODUCT DEFAULTS ---
  DEFAULT_PRICING: {
    ROLLER_PER_KG: 15.50,
    PACKING_BAG_PER_UNIT: 0.45,
  },

  // --- LOGISTICS & PERFORMANCE ---
  FUEL_ALERT_THRESHOLD_LITERS: 45,
  MAX_LOCAL_DIST_KM: 150,
  TARGET_FULFILLMENT_DAYS: 3, // New: AI can tune this for "Speed" roadmaps

  // --- UI & BRANDING ---
  CURRENCY_SYMBOL: "$",
  SYSTEM_VERSION: "4.7.0-HYPER-TUNE",
};

export const PRODUCT_CATEGORIES = [
  { id: 'ROLLER', label: 'Industrial Rollers', unit: 'kg', billing: 'WEIGHT' },
  { id: 'PACKING_BAG', label: 'Poly Packing Bags', unit: 'units', billing: 'QUANTITY' },
];

export const MICRON_OPTIONS = [
  "30,32", "35,38", "40,42", "42,45", "45,48", "50+"
];

export const COLOR_OPTIONS = [
  { id: 'red', label: 'Industrial Red', hex: '#E31E24' },
  { id: 'blue', label: 'Royal Blue', hex: '#003358' },
  { id: 'sky_blue', label: 'Sky Blue', hex: '#0EA5E9' },
  { id: 'emerald', label: 'Emerald Green', hex: '#10B981' },
  { id: 'yellow', label: 'Caution Yellow', hex: '#F59E0B' }
];
