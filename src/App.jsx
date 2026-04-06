import React, { useState, useMemo } from 'react';
import { Moon, Sun, Calculator } from 'lucide-react';
import IncomeInputs from './components/IncomeInputs.jsx';
import HRADetails from './components/HRADetails.jsx';
import DeductionsOldRegime from './components/DeductionsOldRegime.jsx';
import NewRegimeInputs from './components/NewRegimeInputs.jsx';
import TaxResults from './components/TaxResults.jsx';
import TaxBreakdown from './components/TaxBreakdown.jsx';
import { compareTaxes } from './lib/taxEngine.js';
import { toNum } from './lib/formatters.js';

const DEFAULT_INPUTS = {
  basic: '', da: '', hraReceived: '', specialAllowance: '',
  bonus: '', otherIncome: '',
  rentPaid: '', isMetro: true,
  sec80C: '', secNPSSelf: '', sec80DSelf: '', sec80DParents: '',
  parentsAreSenior: false, homeLoanInterest: '',
  sec80DD: 0, sec80DDSevere: false,
  otherDeductions: '',
  employerNPS: '',
};

function numericInputs(inputs) {
  return {
    basic: toNum(inputs.basic),
    da: toNum(inputs.da),
    hraReceived: toNum(inputs.hraReceived),
    specialAllowance: toNum(inputs.specialAllowance),
    bonus: toNum(inputs.bonus),
    otherIncome: toNum(inputs.otherIncome),
    rentPaid: toNum(inputs.rentPaid),
    isMetro: inputs.isMetro,
    sec80C: toNum(inputs.sec80C),
    secNPSSelf: toNum(inputs.secNPSSelf),
    sec80DSelf: toNum(inputs.sec80DSelf),
    sec80DParents: toNum(inputs.sec80DParents),
    parentsAreSenior: inputs.parentsAreSenior,
    homeLoanInterest: toNum(inputs.homeLoanInterest),
    sec80DD: inputs.sec80DD,
    sec80DDSevere: inputs.sec80DDSevere,
    otherDeductions: toNum(inputs.otherDeductions),
    employerNPS: toNum(inputs.employerNPS),
  };
}

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'breakdown'

  const handleChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setInputs(DEFAULT_INPUTS);

  // Real-time calculation (memoized for performance)
  const comparison = useMemo(() => {
    const nums = numericInputs(inputs);
    if (nums.basic === 0 && nums.otherIncome === 0) return null;
    return compareTaxes(nums);
  }, [inputs]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen transition-colors" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl" style={{ background: 'var(--header-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
                <Calculator size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  India Tax Regime Comparator
                </h1>
                <p className="text-xs text-gray-400">FY 2026-27 · Effective 1 April 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/20 text-gray-400 hover:bg-white/10 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setDarkMode((d) => !d)}
                className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Toggle dark/light mode"
              >
                {darkMode ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} className="text-gray-600" />}
              </button>
            </div>
          </div>
        </header>

        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-rose-600/10 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/40 bg-brand-500/10 text-brand-300 text-xs font-semibold mb-4">
                🇮🇳 FY 2026-27 · Finance Act 2025
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
                Old vs New Tax Regime<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-rose-400">
                  Comparator Pro
                </span>
              </h2>
              <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                Compare your tax liability under both regimes with accurate slab calculations, HRA exemptions,
                surcharge, marginal relief, and 87A rebate — as per latest income tax rules effective 1 April 2026.
              </p>
            </div>
          </div>
        </div>

        {/* ── Main Layout ──────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-8">

            {/* Left: Inputs */}
            <div className="space-y-5">
              <IncomeInputs inputs={inputs} onChange={handleChange} />
              <HRADetails inputs={inputs} onChange={handleChange} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DeductionsOldRegime inputs={inputs} onChange={handleChange} />
                <NewRegimeInputs inputs={inputs} onChange={handleChange} />
              </div>
            </div>

            {/* Right: Results */}
            <div className="space-y-5">
              {/* Sticky wrapper — only on xl+ */}
              <div className="xl:sticky xl:top-[81px] space-y-5">
                {!comparison ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center animate-fade-in">
                    <div className="text-5xl mb-4">💰</div>
                    <p className="text-gray-400 text-sm">Enter your income details to see the tax comparison.</p>
                  </div>
                ) : (
                  <>
                    {/* Tab bar */}
                    <div className="flex gap-2 p-1 rounded-xl border border-white/10" style={{ background: 'var(--tab-bg)' }}>
                      {[
                        { id: 'results', label: '📊 Summary' },
                        { id: 'breakdown', label: '🔍 Breakdown' },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id
                              ? 'bg-brand-600 text-white shadow'
                              : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {activeTab === 'results' && <TaxResults comparison={comparison} />}
                    {activeTab === 'breakdown' && <TaxBreakdown comparison={comparison} />}
                  </>
                )}

                {/* Disclaimer */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs text-amber-300 leading-relaxed">
                    ⚠️ <strong>Disclaimer:</strong> This is an estimate tool for planning purposes only.
                    Tax calculations are indicative and based on simplified assumptions.
                    Consult a qualified tax professional or Chartered Accountant before filing returns or making financial decisions.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
          <p>India Tax Regime Comparator Pro · FY 2026-27 · Built with ❤ for Indian taxpayers</p>
          <p className="mt-1">Tax rules as per Finance Act 2025 effective 1 April 2026 · Not affiliated with the Income Tax Department</p>
        </footer>

      </div>
    </div>
  );
}
