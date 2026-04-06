import React from 'react';
import InputSection from './InputSection.jsx';
import AmountInput from './AmountInput.jsx';

export default function NewRegimeInputs({ inputs, onChange }) {
    const basic = parseFloat(inputs.basic) || 0;
    const da = parseFloat(inputs.da) || 0;
    const maxNPS = 0.10 * (basic + da);

    return (
        <InputSection title="New Regime — Employer NPS" icon="🔵" accent="amber" defaultOpen={true}>
            <div className="space-y-4">
                <AmountInput
                    label="Employer NPS Contribution — Section 80CCD(2)"
                    id="employerNPS"
                    value={inputs.employerNPS || ''}
                    onChange={(e) => onChange('employerNPS', e.target.value)}
                    cap={maxNPS > 0 ? maxNPS : undefined}
                    helpText="Employer's NPS contribution. Allowed deduction in BOTH old and new regimes."
                    hint={maxNPS > 0 ? `Max allowed: 10% of Basic+DA = ₹${maxNPS.toLocaleString('en-IN')}` : undefined}
                />

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
                    <p className="font-semibold">ℹ New Regime — What's allowed?</p>
                    <ul className="list-disc list-inside space-y-0.5 opacity-90">
                        <li>Standard Deduction: ₹75,000</li>
                        <li>Employer's NPS (80CCD(2)): up to 10% of Basic+DA</li>
                        <li>All other deductions (80C, HRA, 80D, Home Loan etc.) are NOT allowed</li>
                    </ul>
                </div>
            </div>
        </InputSection>
    );
}
