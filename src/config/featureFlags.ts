// Centralized feature flags. Safe defaults for build/runtime.
const env = (typeof process !== 'undefined' && (process.env as any)) ? (process.env as any) : {};

export const ENABLE_REAL_TELEMETRY: boolean = (() => {
    const v = env.ENABLE_REAL_TELEMETRY || env.VITE_ENABLE_REAL_TELEMETRY || env.REACT_APP_ENABLE_REAL_TELEMETRY;
    if (!v) return false;
    return v === '1' || v === 'true' || v === 'TRUE' || v === true;
})();

export default { ENABLE_REAL_TELEMETRY };
