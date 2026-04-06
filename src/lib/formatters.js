/** Format a number as Indian currency (₹1,23,456) */
export const formatINR = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
    const n = Math.abs(Math.round(amount));
    const str = n.toString();
    let result = '';
    if (str.length <= 3) {
        result = str;
    } else {
        result = str.slice(-3);
        let rem = str.slice(0, -3);
        while (rem.length > 2) {
            result = rem.slice(-2) + ',' + result;
            rem = rem.slice(0, -2);
        }
        result = rem + ',' + result;
    }
    return (amount < 0 ? '-₹' : '₹') + result;
};

/** Format a number as Lakhs with 2 decimal places */
export const formatLakhs = (amount) => {
    const L = Math.abs(amount) / 100_000;
    return (amount < 0 ? '-₹' : '₹') + L.toFixed(2) + 'L';
};

/** Convert a numeric input string to number, defaulting to 0 */
export const toNum = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : Math.max(0, n);
};
