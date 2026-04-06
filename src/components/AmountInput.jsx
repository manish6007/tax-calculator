import React from 'react';

/**
 * Styled number input field with ₹ prefix and optional cap display.
 */
export default function AmountInput({
    label, id, value, onChange, placeholder = '0',
    hint, cap, helpText, required = false,
}) {
    const numVal = parseFloat(value) || 0;
    const isOverCap = cap && numVal > cap;

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {label} {required && <span className="text-rose-400">*</span>}
                {cap && (
                    <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                        (max: ₹{(cap / 100000).toFixed(1)}L)
                    </span>
                )}
            </label>

            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
                <input
                    id={id}
                    type="number"
                    min="0"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`
            w-full pl-7 pr-4 py-2.5 rounded-xl text-sm font-medium
            bg-white/10 dark:bg-white/5
            border transition-all outline-none
            placeholder-gray-500
            focus:ring-2 focus:ring-brand-500/50
            ${isOverCap
                            ? 'border-amber-500/70 focus:border-amber-400'
                            : 'border-white/15 focus:border-brand-400'}
          `}
                    style={{ color: 'var(--text-primary)' }}
                />
            </div>

            {isOverCap && (
                <p className="text-xs text-amber-400 flex items-center gap-1">
                    ⚠ Capped at ₹{(cap / 100000).toFixed(1)}L for tax calculation
                </p>
            )}
            {helpText && !isOverCap && (
                <p className="text-xs text-gray-500 dark:text-gray-500">{helpText}</p>
            )}
            {hint && (
                <p className="text-xs text-brand-400">{hint}</p>
            )}
        </div>
    );
}
