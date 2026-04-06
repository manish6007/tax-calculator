import React from 'react';
import InputSection from './InputSection.jsx';
import AmountInput from './AmountInput.jsx';

export default function IncomeInputs({ inputs, onChange }) {
    const field = (key) => ({
        value: inputs[key] || '',
        onChange: (e) => onChange(key, e.target.value),
    });

    return (
        <InputSection title="Income Details" icon="💼" accent="brand">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AmountInput
                    label="Basic Salary (Annual)"
                    id="basic"
                    required
                    helpText="Your basic pay component per year"
                    {...field('basic')}
                />
                <AmountInput
                    label="Dearness Allowance (DA)"
                    id="da"
                    helpText="DA from employer (included in salary for HRA)"
                    {...field('da')}
                />
                <AmountInput
                    label="HRA Received (Annual)"
                    id="hraReceived"
                    helpText="House Rent Allowance from employer"
                    {...field('hraReceived')}
                />
                <AmountInput
                    label="Special Allowance"
                    id="specialAllowance"
                    helpText="Any other special allowances (fully taxable)"
                    {...field('specialAllowance')}
                />
                <AmountInput
                    label="Bonus / Incentive"
                    id="bonus"
                    helpText="Annual bonus, performance pay etc."
                    {...field('bonus')}
                />
                <AmountInput
                    label="Other Income"
                    id="otherIncome"
                    helpText="Interest income, freelance, FD interest etc."
                    {...field('otherIncome')}
                />
            </div>
        </InputSection>
    );
}
