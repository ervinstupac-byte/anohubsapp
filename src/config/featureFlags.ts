// Centralized feature flags. Safe defaults for build/runtime.
// NC-11940: Replaced process.env with import.meta.env for Vite compatibility
export const ENABLE_REAL_TELEMETRY: boolean = (() => {
    const v = import.meta.env.VITE_ENABLE_REAL_TELEMETRY;
    if (!v) return false;
    return v === '1' || v === 'true' || v === 'TRUE' || v === true;
})();

export default { ENABLE_REAL_TELEMETRY };
