export const formatNumber = (value: number | undefined | null, locale: string = 'en', decimals: number = 2): string => {
    if (value === undefined || value === null) return '0';

    // Safety check for locale code (e.g. 'bs-BA' -> 'bs')
    const loc = locale === 'bs' ? 'bs-BA' : locale === 'de' ? 'de-DE' : 'en-US';

    return new Intl.NumberFormat(loc, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};
