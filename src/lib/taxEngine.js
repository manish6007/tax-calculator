/**
 * Tax Calculation Engine — FY 2026-27
 * All calculations follow Income Tax Act 1961 as amended by Finance Act 2025.
 * Pure functions only — no side effects.
 */

import {
    NEW_REGIME_SLABS,
    NEW_REGIME_STANDARD_DEDUCTION,
    NEW_REGIME_REBATE_87A_LIMIT,
    NEW_REGIME_REBATE_87A_MAX,
    OLD_REGIME_SLABS,
    OLD_REGIME_STANDARD_DEDUCTION,
    OLD_REGIME_REBATE_87A_LIMIT,
    OLD_REGIME_REBATE_87A_MAX,
    SURCHARGE_SLABS,
    HEALTH_EDUCATION_CESS_RATE,
    DEDUCTION_CAPS,
    HRA_METRO_PERCENT,
    HRA_NON_METRO_PERCENT,
} from './constants.js';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Clamp a value between 0 and a cap */
const clamp = (value, cap) => Math.min(Math.max(0, value), cap);

/** Zero-floor a number (no negative deductions) */
const nonNeg = (v) => Math.max(0, v);

// ─────────────────────────────────────────────────────────────────────────────
// HRA EXEMPTION  [Section 10(13A)]
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Calculate HRA exemption — minimum of three conditions.
 * Only applicable if the individual pays rent and receives HRA.
 *
 * @param {object} p
 * @param {number} p.basic       - Basic salary per annum
 * @param {number} p.da          - Dearness allowance per annum (included in salary for HRA)
 * @param {number} p.hraReceived - HRA received from employer
 * @param {number} p.rentPaid    - Annual rent actually paid
 * @param {boolean} p.isMetro    - true = metro city (Delhi/Mumbai/Kolkata/Chennai)
 * @returns {number} HRA exemption amount
 */
export function calcHRAExemption({ basic, da, hraReceived, rentPaid, isMetro }) {
    if (!hraReceived || hraReceived <= 0) return 0;
    if (!rentPaid || rentPaid <= 0) return 0;

    const salary = basic + da; // salary = Basic + DA for HRA purposes
    const cityPercent = isMetro ? HRA_METRO_PERCENT : HRA_NON_METRO_PERCENT;

    const condition1 = hraReceived;                       // Actual HRA received
    const condition2 = nonNeg(rentPaid - 0.10 * salary); // Rent paid – 10% of salary
    const condition3 = cityPercent * salary;              // 50%/40% of salary

    return Math.min(condition1, condition2, condition3);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLAB-WISE TAX CALCULATION
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Apply progressive tax slabs to a taxable income.
 * Returns detailed breakdown per slab and total tax before surcharge/cess.
 *
 * @param {number} taxableIncome
 * @param {Array}  slabs  - array of { upTo, rate, label }
 * @returns {{ slabBreakdown: Array, totalTax: number }}
 */
export function applySlabs(taxableIncome, slabs) {
    let remaining = taxableIncome;
    let prevLimit = 0;
    let totalTax = 0;
    const slabBreakdown = [];

    for (const slab of slabs) {
        if (remaining <= 0) break;

        const slabMax = slab.upTo === Infinity ? remaining : slab.upTo - prevLimit;
        const taxableInSlab = Math.min(remaining, slabMax);
        const taxInSlab = taxableInSlab * slab.rate;

        slabBreakdown.push({
            label: slab.label,
            rate: slab.rate,
            taxableAmount: taxableInSlab,
            tax: taxInSlab,
        });

        totalTax += taxInSlab;
        remaining -= taxableInSlab;
        prevLimit = slab.upTo === Infinity ? prevLimit : slab.upTo;
    }

    return { slabBreakdown, totalTax };
}

// ─────────────────────────────────────────────────────────────────────────────
// SURCHARGE + MARGINAL RELIEF
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Calculate surcharge on income tax (before cess).
 * Applies marginal relief: ensure that total tax + surcharge increase caused by
 * crossing a threshold does not exceed the incremental income above the threshold.
 *
 * @param {number} taxOnIncome  - Income tax before surcharge & cess
 * @param {number} totalIncome  - Total taxable income (after all deductions)
 * @param {Array}  slabs        - Tax slabs (used for marginal relief recalculation)
 * @returns {{ surchargeRate: number, surcharge: number, marginalRelief: number }}
 */
export function calcSurcharge(taxOnIncome, totalIncome, slabs) {
    // Determine applicable surcharge rate
    let surchargeRate = 0;
    for (const sc of [...SURCHARGE_SLABS].reverse()) {
        if (totalIncome > sc.above) {
            surchargeRate = sc.rate;
            break;
        }
    }

    if (surchargeRate === 0) {
        return { surchargeRate: 0, surcharge: 0, marginalRelief: 0 };
    }

    const grossSurcharge = taxOnIncome * surchargeRate;

    // ── Marginal Relief ──────────────────────────────────────────────────────
    // Find the threshold just below (the lower bracket's upper limit)
    let threshold = 0;
    for (const sc of SURCHARGE_SLABS) {
        if (totalIncome > sc.above) threshold = sc.above;
    }

    // Tax at threshold (income exactly at the threshold)
    const { totalTax: taxAtThreshold } = applySlabs(threshold, slabs);

    // Marginal relief: extra tax paid by THIS person vs person at exact threshold,
    // should not exceed extra income earned above threshold
    const extraIncome = totalIncome - threshold;
    const extraTaxWithSurcharge = (taxOnIncome + grossSurcharge) - taxAtThreshold;

    let marginalRelief = 0;
    if (extraTaxWithSurcharge > extraIncome) {
        // Relief = excess tax over the extra income earned
        marginalRelief = extraTaxWithSurcharge - extraIncome;
    }

    const surcharge = Math.max(0, grossSurcharge - marginalRelief);

    return { surchargeRate, surcharge, marginalRelief };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 87A REBATE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Apply Section 87A rebate.
 * Under new regime: if total income ≤ ₹12,00,000 → rebate = min(tax, 60,000) → tax = 0
 * Under old regime: if total income ≤ ₹5,00,000 → rebate = min(tax, 12,500)
 *
 * IMPORTANT: Rebate is applied on income tax BEFORE surcharge and cess.
 * Rebate is NOT available on special rate income (LTCG etc.) — excluded here.
 *
 * @param {number}  taxBeforeRebate - income tax from slabs
 * @param {number}  taxableIncome   - taxable income (after all deductions)
 * @param {'new'|'old'} regime
 * @returns {{ rebate: number, taxAfterRebate: number }}
 */
export function applyRebate87A(taxBeforeRebate, taxableIncome, regime) {
    const limit = regime === 'new' ? NEW_REGIME_REBATE_87A_LIMIT : OLD_REGIME_REBATE_87A_LIMIT;
    const maxReb = regime === 'new' ? NEW_REGIME_REBATE_87A_MAX : OLD_REGIME_REBATE_87A_MAX;

    if (taxableIncome <= limit) {
        const rebate = Math.min(taxBeforeRebate, maxReb);
        return { rebate, taxAfterRebate: Math.max(0, taxBeforeRebate - rebate) };
    }
    return { rebate: 0, taxAfterRebate: taxBeforeRebate };
}

// ─────────────────────────────────────────────────────────────────────────────
// OLD REGIME FULL CALCULATION
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Full old regime tax calculation.
 *
 * @param {object} inputs - All user inputs (see App.jsx for shape)
 * @returns {object} Detailed tax computation object
 */
export function calcOldRegimeTax(inputs) {
    const {
        basic = 0, da = 0, hraReceived = 0, specialAllowance = 0,
        bonus = 0, otherIncome = 0,
        rentPaid = 0, isMetro = false,
        sec80C = 0, secNPSSelf = 0,
        sec80DSelf = 0, sec80DParents = 0, parentsAreSenior = false,
        homeLoanInterest = 0,
        sec80DD = 0, sec80DDSevere = false,
        otherDeductions = 0,
        employerNPS = 0, // 80CCD(2) allowed in old regime too
    } = inputs;

    // ── 1. Gross Salary ─────────────────────────────────────────────────────
    const grossSalary = basic + da + hraReceived + specialAllowance + bonus;
    const grossIncome = grossSalary + otherIncome;

    // ── 2. Exemptions ────────────────────────────────────────────────────────
    const hraExemption = calcHRAExemption({ basic, da, hraReceived, rentPaid, isMetro });

    // ── 3. Standard Deduction ────────────────────────────────────────────────
    const standardDeduction = Math.min(OLD_REGIME_STANDARD_DEDUCTION, grossSalary);

    // ── 4. Income after standard deduction & HRA ────────────────────────────
    const incomeAfterExemptions = nonNeg(grossIncome - hraExemption - standardDeduction);

    // ── 5. Deductions under Chapter VI-A ─────────────────────────────────────

    // 80C (LIC, PPF, ELSS, EPF, etc.) — cap ₹1.5L
    const deduction80C = clamp(sec80C, DEDUCTION_CAPS.SEC_80C);

    // 80CCD(1B) — NPS self contribution — cap ₹50K (additional over 80C)
    const deductionNPSSelf = clamp(secNPSSelf, DEDUCTION_CAPS.SEC_80CCD_1B);

    // 80CCD(2) — Employer NPS — 10% of Basic+DA (old regime allows this too)
    const maxEmployerNPS = 0.10 * (basic + da);
    const deductionEmployerNPS = clamp(employerNPS, maxEmployerNPS);

    // 80D — Health insurance
    const maxParents80D = parentsAreSenior ? DEDUCTION_CAPS.SEC_80D_PARENTS_SENIOR : DEDUCTION_CAPS.SEC_80D_PARENTS_NORMAL;
    const deduction80D = clamp(sec80DSelf, DEDUCTION_CAPS.SEC_80D_SELF) + clamp(sec80DParents, maxParents80D);

    // Section 24(b) — Home loan interest — cap ₹2L
    const deductionHomeLoan = clamp(homeLoanInterest, DEDUCTION_CAPS.SEC_24_HOME_LOAN);

    // 80DD — Disabled dependent
    const maxDD = sec80DDSevere ? DEDUCTION_CAPS.SEC_80DD_SEVERE : DEDUCTION_CAPS.SEC_80DD_NORMAL;
    const deduction80DD = sec80DD > 0 ? maxDD : 0; // Fixed deduction (not based on actual expense)

    // Other deductions (user-specified)
    const deductionOther = nonNeg(otherDeductions);

    const totalDeductions = deduction80C + deductionNPSSelf + deductionEmployerNPS
        + deduction80D + deductionHomeLoan + deduction80DD + deductionOther;

    // ── 6. Taxable Income ────────────────────────────────────────────────────
    const taxableIncome = nonNeg(incomeAfterExemptions - totalDeductions);

    // ── 7. Tax on total income (slab-wise) ───────────────────────────────────
    const { slabBreakdown, totalTax: taxFromSlabs } = applySlabs(taxableIncome, OLD_REGIME_SLABS);

    // ── 8. Section 87A Rebate ────────────────────────────────────────────────
    const { rebate, taxAfterRebate } = applyRebate87A(taxFromSlabs, taxableIncome, 'old');

    // ── 9. Surcharge + Marginal Relief ───────────────────────────────────────
    const { surchargeRate, surcharge, marginalRelief } = calcSurcharge(
        taxAfterRebate, taxableIncome, OLD_REGIME_SLABS
    );

    // ── 10. Cess ─────────────────────────────────────────────────────────────
    const taxPlusSurcharge = taxAfterRebate + surcharge;
    const cess = taxPlusSurcharge * HEALTH_EDUCATION_CESS_RATE;

    // ── 11. Final Tax ────────────────────────────────────────────────────────
    const totalTax = Math.round(taxPlusSurcharge + cess);

    return {
        regime: 'old',
        grossIncome,
        hraExemption,
        standardDeduction,
        incomeAfterExemptions,
        deductions: {
            sec80C: deduction80C,
            nps80CCD1B: deductionNPSSelf,
            employerNPS: deductionEmployerNPS,
            sec80D: deduction80D,
            homeLoan: deductionHomeLoan,
            sec80DD: deduction80DD,
            other: deductionOther,
            total: totalDeductions,
        },
        taxableIncome,
        slabBreakdown,
        taxFromSlabs,
        rebate,
        taxAfterRebate,
        surchargeRate,
        surcharge,
        marginalRelief,
        cess: Math.round(cess),
        totalTax,
        effectiveRate: grossIncome > 0 ? ((totalTax / grossIncome) * 100).toFixed(2) : '0.00',
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW REGIME FULL CALCULATION
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Full new regime tax calculation (default regime from FY 2023-24).
 * Deductions NOT allowed EXCEPT standard deduction & employer NPS (80CCD(2)).
 * HRA exemption NOT available.
 *
 * @param {object} inputs
 * @returns {object}
 */
export function calcNewRegimeTax(inputs) {
    const {
        basic = 0, da = 0, hraReceived = 0, specialAllowance = 0,
        bonus = 0, otherIncome = 0,
        employerNPS = 0,
    } = inputs;

    // ── 1. Gross Income ──────────────────────────────────────────────────────
    const grossSalary = basic + da + hraReceived + specialAllowance + bonus;
    const grossIncome = grossSalary + otherIncome;

    // ── 2. Standard Deduction ────────────────────────────────────────────────
    const standardDeduction = Math.min(NEW_REGIME_STANDARD_DEDUCTION, grossSalary);

    // ── 3. Employer NPS 80CCD(2) — allowed in new regime ────────────────────
    const maxEmployerNPS = 0.10 * (basic + da); // 10% of basic+DA for private sector
    const deductionEmployerNPS = clamp(employerNPS, maxEmployerNPS);

    // ── 4. Taxable Income ────────────────────────────────────────────────────
    const taxableIncome = nonNeg(grossIncome - standardDeduction - deductionEmployerNPS);

    // ── 5. Tax on total income (slab-wise) ───────────────────────────────────
    const { slabBreakdown, totalTax: taxFromSlabs } = applySlabs(taxableIncome, NEW_REGIME_SLABS);

    // ── 6. Section 87A Rebate ────────────────────────────────────────────────
    // Under new regime: if taxable income ≤ ₹12L → full rebate (zero tax)
    const { rebate, taxAfterRebate } = applyRebate87A(taxFromSlabs, taxableIncome, 'new');

    // ── 7. Surcharge + Marginal Relief ───────────────────────────────────────
    const { surchargeRate, surcharge, marginalRelief } = calcSurcharge(
        taxAfterRebate, taxableIncome, NEW_REGIME_SLABS
    );

    // ── 8. Cess ──────────────────────────────────────────────────────────────
    const taxPlusSurcharge = taxAfterRebate + surcharge;
    const cess = taxPlusSurcharge * HEALTH_EDUCATION_CESS_RATE;

    // ── 9. Final Tax ─────────────────────────────────────────────────────────
    const totalTax = Math.round(taxPlusSurcharge + cess);

    return {
        regime: 'new',
        grossIncome,
        standardDeduction,
        deductionEmployerNPS,
        taxableIncome,
        slabBreakdown,
        taxFromSlabs,
        rebate,
        taxAfterRebate,
        surchargeRate,
        surcharge,
        marginalRelief,
        cess: Math.round(cess),
        totalTax,
        effectiveRate: grossIncome > 0 ? ((totalTax / grossIncome) * 100).toFixed(2) : '0.00',
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Run both regimes and return a comparison with recommendation.
 *
 * @param {object} inputs
 * @returns {{ oldRegime, newRegime, savings, betterRegime, savedAmount }}
 */
export function compareTaxes(inputs) {
    const oldRegime = calcOldRegimeTax(inputs);
    const newRegime = calcNewRegimeTax(inputs);

    const diff = oldRegime.totalTax - newRegime.totalTax;
    const betterRegime = diff > 0 ? 'new' : diff < 0 ? 'old' : 'equal';
    const savedAmount = Math.abs(diff);

    return { oldRegime, newRegime, diff, betterRegime, savedAmount };
}
