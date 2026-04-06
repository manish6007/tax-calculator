import React from 'react';
import InputSection from './InputSection.jsx';
import AmountInput from './AmountInput.jsx';

// 8 metro cities for 50% HRA exemption — expanded w.e.f. 1 April 2026 (FY 2026-27)
const METRO_CITIES = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad'];

export default function HRADetails({ inputs, onChange }) {
    return (
        <InputSection title="HRA Details" icon="🏠" accent="sky" defaultOpen={true}>
            <div className="space-y-5">
                <AmountInput
                    label="Rent Paid (Annual)"
                    id="rentPaid"
                    value={inputs.rentPaid || ''}
                    onChange={(e) => onChange('rentPaid', e.target.value)}
                    helpText="Total rent paid in the financial year. Leave 0 if living in own house."
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        City Type
                        <span className="ml-2 text-xs font-normal text-brand-400">(affects HRA exemption %)</span>
                    </label>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onChange('isMetro', true)}
                            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left
                ${inputs.isMetro === true
                                    ? 'bg-brand-600/30 border-brand-400 text-brand-300'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}
              `}
                        >
                            <div>🏙 Metro City — <span className="font-bold">50%</span></div>
                            <div className="text-xs opacity-60 mt-0.5">8 cities (see below)</div>
                        </button>
                        <button
                            onClick={() => onChange('isMetro', false)}
                            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left
                ${inputs.isMetro === false
                                    ? 'bg-brand-600/30 border-brand-400 text-brand-300'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}
              `}
                        >
                            <div>🌆 Non-Metro — <span className="font-bold">40%</span></div>
                            <div className="text-xs opacity-60 mt-0.5">All other cities</div>
                        </button>
                    </div>

                    {/* Metro city chips */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-gray-400 mb-2">
                            🆕 Metro cities (50%) — expanded from 4 to 8 w.e.f. <span className="text-brand-400 font-semibold">1 April 2026</span>:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {METRO_CITIES.map((city) => {
                                const isNew = ['Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad'].includes(city);
                                return (
                                    <span
                                        key={city}
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isNew
                                                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                                                : 'bg-white/10 text-gray-300 border border-white/10'
                                            }`}
                                    >
                                        {city}{isNew && ' ✨'}
                                    </span>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">✨ = newly added for FY 2026-27</p>
                    </div>
                </div>

                {(inputs.rentPaid > 0 && inputs.hraReceived > 0) && (
                    <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs text-brand-300">
                        ℹ HRA exemption only applies under the <b>Old Regime</b>. Under the New Regime, HRA is fully taxable.
                    </div>
                )}
            </div>
        </InputSection>
    );
}
