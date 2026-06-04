const DEFAULT_TTL = 1000; // ms

const _lastTimestamps: Map<string, number> = new Map();

export function dedupWarn(msg: string, ttl = DEFAULT_TTL) {
  try {
    const now = Date.now();
    const last = _lastTimestamps.get(msg) || 0;
    if (now - last > ttl) {
      console.warn(msg);
      _lastTimestamps.set(msg, now);
    }

    // If this looks like a sensor fallback message, emit DOM events for UI
    if (msg.includes('using fallback') || msg.includes('Sensor fallback')) {
      try {
        (window as any).__sensorFallbackActive = true;
        window.dispatchEvent(
          new CustomEvent('sensorFallback', { detail: { message: msg, timestamp: now } })
        );
        if ((window as any).__sensorFallbackClearTimer)
          clearTimeout((window as any).__sensorFallbackClearTimer);
        (window as any).__sensorFallbackClearTimer = setTimeout(() => {
          (window as any).__sensorFallbackActive = false;
          window.dispatchEvent(new CustomEvent('sensorFallbackCleared'));
          (window as any).__sensorFallbackClearTimer = null;
        }, 5000);
      } catch (e) {
        // ignore in non-browser environments
      }
    }
  } catch (e) {
    try {
      console.warn(msg);
    } catch (_) {}
  }
}

export function clearDeduper() {
  _lastTimestamps.clear();
}

export default dedupWarn;
