import React from 'react';
import InputSection from './InputSection.jsx';
import AmountInput from './AmountInput.jsx';
import { DEDUCTION_CAPS } from '../lib/constants.js';

export default function DeductionsOldRegime({ inputs, onChange }) {
    const field = (key) => ({
        value: inputs[key] || '',
        onChange: (e) => onChange(key, e.target.value),
    });

    return (
        <InputSection title="Deductions (Old Regime Only)" icon="📋" accent="emerald" defaultOpen={true}>
            <div className="space-y-5">

                {/* 80C */}
                <AmountInput
                    label="Section 80C"
                    id="sec80C"
                    cap={DEDUCTION_CAPS.SEC_80C}
                    helpText="LIC premium, PPF, ELSS, EPF, NSC, tuition fees etc."
                    {...field('sec80C')}
                />

                {/* 80CCD(1B) — NPS self */}
                <AmountInput
                    label="Section 80CCD(1B) — NPS Self Contribution"
                    id="secNPSSelf"
                    cap={DEDUCTION_CAPS.SEC_80CCD_1B}
                    helpText="Additional NPS self contribution (over & above 80C limit)"
                    {...field('secNPSSelf')}
                />

                {/* 80D — Health insurance */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Section 80D — Health Insurance Premium
                    </p>
                    <AmountInput
                        label="Self + Family Premium"
                        id="sec80DSelf"
                        cap={DEDUCTION_CAPS.SEC_80D_SELF}
                        helpText={`Max ₹25,000 for self/spouse/children`}
                        {...field('sec80DSelf')}
                    />
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <AmountInput
                                label="Parents' Premium"
                                id="sec80DParents"
                                cap={inputs.parentsAreSenior ? DEDUCTION_CAPS.SEC_80D_PARENTS_SENIOR : DEDUCTION_CAPS.SEC_80D_PARENTS_NORMAL}
                                helpText={inputs.parentsAreSenior ? 'Max ₹50,000 (senior citizen)' : 'Max ₹25,000 (non-senior)'}
                                {...field('sec80DParents')}
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div
                                onClick={() => onChange('parentsAreSenior', !inputs.parentsAreSenior)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${inputs.parentsAreSenior ? 'bg-brand-500' : 'bg-white/20'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inputs.parentsAreSenior ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                            <span className="text-sm text-gray-400">Parents are senior citizens (60+ years)</span>
                        </label>
                    </div>
                </div>

                {/* Section 24(b) — Home Loan Interest */}
                <AmountInput
                    label="Home Loan Interest — Section 24(b)"
                    id="homeLoanInterest"
                    cap={DEDUCTION_CAPS.SEC_24_HOME_LOAN}
                    helpText="Interest on self-occupied property (max ₹2L, let-out property no cap)"
                    {...field('homeLoanInterest')}
                />

                {/* 80DD — Disabled dependent */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Section 80DD — Disabled Dependent
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div
                            onClick={() => onChange('sec80DD', inputs.sec80DD > 0 ? 0 : 1)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${inputs.sec80DD > 0 ? 'bg-brand-500' : 'bg-white/20'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inputs.sec80DD > 0 ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-sm text-gray-400">I have a disabled dependent</span>
                    </label>

                    {inputs.sec80DD > 0 && (
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer select-none mt-2">
                                <div
                                    onClick={() => onChange('sec80DDSevere', !inputs.sec80DDSevere)}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${inputs.sec80DDSevere ? 'bg-rose-500' : 'bg-white/20'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inputs.sec80DDSevere ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </div>
                                <span className="text-sm text-gray-400">
                                    Severe disability (&gt;80%) — ₹1,25,000 deduction
                                    {!inputs.sec80DDSevere && ' (normal: ₹75,000)'}
                                </span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Other deductions */}
                <AmountInput
                    label="Other Deductions"
                    id="otherDeductions"
                    helpText="80G (donations), 80TTA (savings interest), etc."
                    {...field('otherDeductions')}
                />
            </div>
        </InputSection>
    );
}
