import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * Collapsible section card used as a container for all input groups.
 */
export default function InputSection({ title, icon, children, defaultOpen = true, accent = 'brand' }) {
    const [open, setOpen] = useState(defaultOpen);

    const accentMap = {
        brand: 'from-brand-500 to-brand-600 border-brand-500/30',
        emerald: 'from-emerald-500 to-emerald-600 border-emerald-500/30',
        rose: 'from-rose-500 to-rose-600 border-rose-500/30',
        amber: 'from-amber-500 to-amber-600 border-amber-500/30',
        sky: 'from-sky-500 to-sky-600 border-sky-500/30',
    };
    const grad = accentMap[accent] || accentMap.brand;

    return (
        <div className={`rounded-2xl border bg-white/5 dark:bg-white/5 light:bg-white backdrop-blur-sm shadow-lg border-white/10 dark:border-white/10 overflow-hidden animate-fade-in`}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className={`text-2xl bg-gradient-to-br ${grad} rounded-xl p-2 flex items-center justify-center`}>
                        {icon}
                    </span>
                    <h2 className="text-lg font-semibold text-white dark:text-white" style={{ color: 'var(--text-primary)' }}>
                        {title}
                    </h2>
                </div>
                <span className="text-gray-400">
                    {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>

            {open && (
                <div className="px-6 pb-6 pt-0 animate-slide-up">
                    <div className="border-t border-white/10 pt-5">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
