import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { formatINR } from '../lib/formatters.js';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 border border-white/20 rounded-xl p-3 shadow-2xl text-sm">
                <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
                {payload.map((entry) => (
                    <p key={entry.dataKey} style={{ color: entry.fill }}>
                        {entry.name}: {formatINR(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

function SlabTable({ title, slabBreakdown, color, regime, result }) {
    return (
        <div className={`rounded-xl border p-4 ${regime === 'new' ? 'border-brand-500/20 bg-brand-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
            <h3 className={`text-sm font-bold mb-3 ${regime === 'new' ? 'text-brand-300' : 'text-emerald-300'}`}>
                {title}
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-2 pr-4 text-gray-400 font-medium">Slab</th>
                            <th className="text-right py-2 pr-4 text-gray-400 font-medium">Income in Slab</th>
                            <th className="text-right py-2 pr-4 text-gray-400 font-medium">Rate</th>
                            <th className="text-right py-2 text-gray-400 font-medium">Tax</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {slabBreakdown.filter(s => s.taxableAmount > 0).map((slab, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="py-2 pr-4" style={{ color: 'var(--text-secondary)' }}>{slab.label}</td>
                                <td className="py-2 pr-4 text-right" style={{ color: 'var(--text-primary)' }}>{formatINR(slab.taxableAmount)}</td>
                                <td className="py-2 pr-4 text-right text-yellow-400">{(slab.rate * 100).toFixed(0)}%</td>
                                <td className="py-2 text-right" style={{ color: 'var(--text-primary)' }}>{formatINR(slab.tax)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-white/15 font-semibold">
                            <td colSpan={3} className="pt-2 text-gray-300">Slab Tax</td>
                            <td className="pt-2 text-right text-yellow-300">{formatINR(result.taxFromSlabs)}</td>
                        </tr>
                        {result.rebate > 0 && (
                            <tr>
                                <td colSpan={3} className="py-0.5 text-green-400">Rebate u/s 87A</td>
                                <td className="py-0.5 text-right text-green-400">- {formatINR(result.rebate)}</td>
                            </tr>
                        )}
                        {result.surcharge > 0 && (
                            <tr>
                                <td colSpan={3} className="py-0.5 text-gray-300">Surcharge ({(result.surchargeRate * 100).toFixed(0)}%)</td>
                                <td className="py-0.5 text-right" style={{ color: 'var(--text-primary)' }}>{formatINR(result.surcharge)}</td>
                            </tr>
                        )}
                        {result.marginalRelief > 0 && (
                            <tr>
                                <td colSpan={3} className="py-0.5 text-green-400">Marginal Relief</td>
                                <td className="py-0.5 text-right text-green-400">- {formatINR(result.marginalRelief)}</td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={3} className="py-0.5 text-gray-300">Health & Ed. Cess (4%)</td>
                            <td className="py-0.5 text-right" style={{ color: 'var(--text-primary)' }}>{formatINR(result.cess)}</td>
                        </tr>
                        <tr className="border-t border-white/20">
                            <td colSpan={3} className="pt-2 font-bold text-white">Total Tax</td>
                            <td className={`pt-2 text-right font-bold ${regime === 'new' ? 'text-brand-300' : 'text-emerald-300'}`}>
                                {formatINR(result.totalTax)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

export default function TaxBreakdown({ comparison }) {
    if (!comparison) return null;
    const { oldRegime, newRegime } = comparison;

    // Chart data — comparison of key components
    const chartData = [
        {
            name: 'Slab Tax',
            old: oldRegime.taxFromSlabs,
            new: newRegime.taxFromSlabs,
        },
        {
            name: 'Surcharge',
            old: oldRegime.surcharge,
            new: newRegime.surcharge,
        },
        {
            name: 'Cess',
            old: oldRegime.cess,
            new: newRegime.cess,
        },
        {
            name: 'Total Tax',
            old: oldRegime.totalTax,
            new: newRegime.totalTax,
        },
    ];

    // Taxable income comparison
    const deductionData = [
        { name: 'Gross Income', old: oldRegime.grossIncome, new: newRegime.grossIncome },
        { name: 'Taxable Income', old: oldRegime.taxableIncome, new: newRegime.taxableIncome },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Bar Chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    📊 Tax Comparison — Old vs New Regime
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis
                                tickFormatter={(v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
                            />
                            <Bar dataKey="old" name="Old Regime" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="new" name="New Regime" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Income Reduction Chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    📉 Income After Deductions
                </h3>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deductionData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis
                                tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                            <Bar dataKey="old" name="Old Regime" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="new" name="New Regime" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Slab-wise tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <SlabTable
                    title="Old Regime — Slab Breakdown"
                    slabBreakdown={oldRegime.slabBreakdown}
                    regime="old"
                    result={oldRegime}
                />
                <SlabTable
                    title="New Regime — Slab Breakdown"
                    slabBreakdown={newRegime.slabBreakdown}
                    regime="new"
                    result={newRegime}
                />
            </div>

            {/* Old regime deduction summary */}
            {oldRegime.deductions && oldRegime.deductions.total > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        🧾 Old Regime Deductions Claimed
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        {[
                            { label: '80C', val: oldRegime.deductions.sec80C },
                            { label: '80CCD(1B) NPS', val: oldRegime.deductions.nps80CCD1B },
                            { label: '80CCD(2) Emp.NPS', val: oldRegime.deductions.employerNPS },
                            { label: '80D Health', val: oldRegime.deductions.sec80D },
                            { label: 'Sec 24 Home Loan', val: oldRegime.deductions.homeLoan },
                            { label: '80DD Dependent', val: oldRegime.deductions.sec80DD },
                            { label: 'HRA Exemption', val: oldRegime.hraExemption },
                            { label: 'Standard Deduction', val: oldRegime.standardDeduction },
                            { label: 'Other', val: oldRegime.deductions.other },
                        ].filter(d => d.val > 0).map((d) => (
                            <div key={d.label} className="bg-white/5 rounded-xl p-3">
                                <p className="text-xs text-gray-400">{d.label}</p>
                                <p className="font-semibold mt-0.5 text-emerald-300">{formatINR(d.val)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between font-bold">
                        <span className="text-gray-300">Total Deductions</span>
                        <span className="text-emerald-300">{formatINR(oldRegime.deductions.total + oldRegime.hraExemption + oldRegime.standardDeduction)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
