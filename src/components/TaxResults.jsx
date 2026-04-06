import React from 'react';
import { formatINR } from '../lib/formatters.js';
import { TrendingDown, TrendingUp, Award } from 'lucide-react';

function RegimeCard({ label, result, isBetter, regime }) {
    const color = regime === 'new'
        ? 'from-brand-500/20 to-brand-700/10 border-brand-500/30'
        : 'from-emerald-500/20 to-emerald-700/10 border-emerald-500/30';

    const textColor = regime === 'new' ? 'text-brand-300' : 'text-emerald-300';

    return (
        <div className={`relative rounded-2xl border bg-gradient-to-br ${color} p-6 transition-all ${isBetter ? 'ring-2 ring-offset-0 ' + (regime === 'new' ? 'ring-brand-400' : 'ring-emerald-400') : ''}`}>
            {isBetter && (
                <div className={`absolute -top-3 right-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${regime === 'new' ? 'bg-brand-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    <Award size={12} /> RECOMMENDED
                </div>
            )}

            <div className="mb-4">
                <span className={`text-xs font-semibold uppercase tracking-widest ${textColor}`}>
                    {label}
                </span>
                <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {formatINR(result.totalTax)}
                </h3>
                <p className="text-sm text-gray-400 mt-1">Effective Rate: {result.effectiveRate}%</p>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">Gross Income</span>
                    <span style={{ color: 'var(--text-primary)' }}>{formatINR(result.grossIncome)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Taxable Income</span>
                    <span style={{ color: 'var(--text-primary)' }}>{formatINR(result.taxableIncome)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Tax (on slabs)</span>
                        <span style={{ color: 'var(--text-primary)' }}>{formatINR(result.taxFromSlabs)}</span>
                    </div>
                    {result.rebate > 0 && (
                        <div className="flex justify-between text-green-400">
                            <span>Rebate u/s 87A</span>
                            <span>- {formatINR(result.rebate)}</span>
                        </div>
                    )}
                    {result.surcharge > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-400">Surcharge ({(result.surchargeRate * 100).toFixed(0)}%)</span>
                            <span style={{ color: 'var(--text-primary)' }}>{formatINR(result.surcharge)}</span>
                        </div>
                    )}
                    {result.marginalRelief > 0 && (
                        <div className="flex justify-between text-green-400">
                            <span>Marginal Relief</span>
                            <span>- {formatINR(result.marginalRelief)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-400">Cess (4%)</span>
                        <span style={{ color: 'var(--text-primary)' }}>{formatINR(result.cess)}</span>
                    </div>
                </div>
                <div className="border-t border-white/20 pt-2 flex justify-between font-bold text-base">
                    <span style={{ color: 'var(--text-primary)' }}>Total Tax</span>
                    <span className={textColor}>{formatINR(result.totalTax)}</span>
                </div>
            </div>
        </div>
    );
}

export default function TaxResults({ comparison }) {
    if (!comparison) return null;
    const { oldRegime, newRegime, betterRegime, savedAmount } = comparison;

    const isEqual = betterRegime === 'equal';
    const savingsColor = betterRegime === 'new' ? 'text-brand-400' : 'text-emerald-400';

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Savings Banner */}
            {!isEqual && (
                <div className={`rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4
          ${betterRegime === 'new'
                        ? 'bg-brand-600/20 border border-brand-500/30'
                        : 'bg-emerald-600/20 border border-emerald-500/30'}
        `}>
                    <div className="flex items-center gap-3">
                        {betterRegime === 'new' ? <TrendingDown size={28} className="text-brand-400" /> : <TrendingDown size={28} className="text-emerald-400" />}
                        <div>
                            <p className="text-sm text-gray-400">You save</p>
                            <p className={`text-2xl font-bold ${savingsColor}`}>{formatINR(savedAmount)}</p>
                        </div>
                    </div>
                    <div className={`px-5 py-2 rounded-xl font-bold text-sm
            ${betterRegime === 'new' ? 'bg-brand-500 text-white' : 'bg-emerald-500 text-white'}
          `}>
                        ✓ {betterRegime === 'new' ? 'NEW REGIME' : 'OLD REGIME'} is better
                    </div>
                </div>
            )}

            {isEqual && (
                <div className="rounded-2xl p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-center font-semibold">
                    Both regimes result in equal tax — choose based on your preference.
                </div>
            )}

            {/* Side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <RegimeCard
                    label="Old Tax Regime"
                    result={oldRegime}
                    isBetter={betterRegime === 'old'}
                    regime="old"
                />
                <RegimeCard
                    label="New Tax Regime"
                    result={newRegime}
                    isBetter={betterRegime === 'new'}
                    regime="new"
                />
            </div>
        </div>
    );
}
