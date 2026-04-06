/**
 * Tax Constants for FY 2026-27
 * Effective from April 1, 2026 (Finance Act 2025 / Union Budget 2025-26)
 * Source: Income Tax Act 1961, as amended
 */

// ─── NEW TAX REGIME (Default from FY 2023-24, enhanced from FY 2024-25) ───────
// Slabs announced in Union Budget 2025-26, effective 1 Apr 2026
export const NEW_REGIME_SLABS = [
    { upTo: 400_000, rate: 0.00, label: 'Up to ₹4,00,000' },
    { upTo: 800_000, rate: 0.05, label: '₹4,00,001 – ₹8,00,000' },
    { upTo: 1_200_000, rate: 0.10, label: '₹8,00,001 – ₹12,00,000' },
    { upTo: 1_600_000, rate: 0.15, label: '₹12,00,001 – ₹16,00,000' },
    { upTo: 2_000_000, rate: 0.20, label: '₹16,00,001 – ₹20,00,000' },
    { upTo: 2_400_000, rate: 0.25, label: '₹20,00,001 – ₹24,00,000' },
    { upTo: Infinity, rate: 0.30, label: 'Above ₹24,00,000' },
];

// Standard deduction under new regime (increased to ₹75,000 from FY 2024-25)
export const NEW_REGIME_STANDARD_DEDUCTION = 75_000;

// 87A Rebate: Zero tax if total income ≤ ₹12,00,000 under new regime
export const NEW_REGIME_REBATE_87A_LIMIT = 1_200_000;
export const NEW_REGIME_REBATE_87A_MAX = 60_000; // max rebate amount (covers tax on 12L)

// ─── OLD TAX REGIME ────────────────────────────────────────────────────────────
export const OLD_REGIME_SLABS = [
    { upTo: 250_000, rate: 0.00, label: 'Up to ₹2,50,000' },
    { upTo: 500_000, rate: 0.05, label: '₹2,50,001 – ₹5,00,000' },
    { upTo: 1_000_000, rate: 0.20, label: '₹5,00,001 – ₹10,00,000' },
    { upTo: Infinity, rate: 0.30, label: 'Above ₹10,00,000' },
];

// Standard deduction under old regime
export const OLD_REGIME_STANDARD_DEDUCTION = 50_000;

// 87A Rebate: Zero tax if total income ≤ ₹5,00,000 under old regime
export const OLD_REGIME_REBATE_87A_LIMIT = 500_000;
export const OLD_REGIME_REBATE_87A_MAX = 12_500;

// ─── SURCHARGE ────────────────────────────────────────────────────────────────
// Applied on income tax (before cess), based on total income
// Note: Under new regime from FY 2023-24, max surcharge on all income types is 25%
// Under old regime, surcharge on long-term capital gains capped at 15% — we skip LTCG
export const SURCHARGE_SLABS = [
    { above: 5_000_000, rate: 0.10, label: 'Above ₹50 Lakh' },     // 10%
    { above: 10_000_000, rate: 0.15, label: 'Above ₹1 Crore' },     // 15%
    { above: 20_000_000, rate: 0.25, label: 'Above ₹2 Crore' },     // 25%
    // Note: 37% surcharge (above ₹5Cr) abolished under new regime.
    // Under old regime it still applies — but since new regime is default/recommended,
    // we cap at 25% for both to keep it simple and flag in UI.
];

// ─── CESS ─────────────────────────────────────────────────────────────────────
export const HEALTH_EDUCATION_CESS_RATE = 0.04; // 4%

// ─── DEDUCTION CAPS (Old Regime Only) ─────────────────────────────────────────
export const DEDUCTION_CAPS = {
    /** Section 80C — LIC, PPF, ELSS, EPF, tuition fees, etc. */
    SEC_80C: 150_000,

    /** Section 80CCD(1B) — NPS self contribution (over & above 80C) */
    SEC_80CCD_1B: 50_000,

    /** Section 80CCD(2) — Employer's NPS contribution (allowed in BOTH regimes) */
    SEC_80CCD_2_MAX_PERCENT: 0.10, // 10% of basic+DA (public sector up to 14%, simplified to 10%)

    /** Section 80D — Health insurance premium */
    SEC_80D_SELF: 25_000,          // Self + family (non-senior)
    SEC_80D_PARENTS_NORMAL: 25_000, // Parents (non-senior citizen)
    SEC_80D_PARENTS_SENIOR: 50_000, // Parents (senior citizen)

    /** Section 24(b) — Home loan interest on self-occupied property */
    SEC_24_HOME_LOAN: 200_000,

    /** Section 80DD — Maintenance/treatment of disabled dependent */
    SEC_80DD_NORMAL: 75_000,  // 40–80% disability
    SEC_80DD_SEVERE: 125_000, // >80% disability
};

// ─── HRA EXEMPTION ────────────────────────────────────────────────────────────
export const HRA_METRO_PERCENT = 0.50; // 50% of (Basic + DA) for metro cities
export const HRA_NON_METRO_PERCENT = 0.40; // 40% of (Basic + DA) for non-metro

// Metro cities (50% HRA exemption): Expanded from 4 to 8 cities w.e.f. 1 April 2026
// Rule 2A of Income Tax Rules amended by Finance Act 2025 / Notification for FY 2026-27
export const METRO_CITIES = [
    'Delhi',
    'Mumbai',
    'Kolkata',
    'Chennai',
    'Bengaluru',   // Added w.e.f. 1 April 2026
    'Hyderabad',   // Added w.e.f. 1 April 2026
    'Pune',        // Added w.e.f. 1 April 2026
    'Ahmedabad',   // Added w.e.f. 1 April 2026
];
