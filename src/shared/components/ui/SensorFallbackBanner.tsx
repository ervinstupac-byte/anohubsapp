import React, { useEffect, useState } from 'react';

export const SensorFallbackBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onFallback = (e: any) => {
      setMessage(e?.detail?.message || 'Sensor fallback active');
      setVisible(true);
    };
    const onCleared = () => setVisible(false);

    window.addEventListener('sensorFallback', onFallback as EventListener);
    window.addEventListener('sensorFallbackCleared', onCleared as EventListener);

    // If already flagged, show briefly
    try {
      if ((window as any).__sensorFallbackActive) {
        setVisible(true);
        setMessage('Sensor fallback active');
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('sensorFallback', onFallback as EventListener);
      window.removeEventListener('sensorFallbackCleared', onCleared as EventListener);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      id="sensor-fallback-banner"
      className="fixed top-4 right-4 z-[9999] px-3 py-2 bg-red-600 text-white rounded-md shadow-md font-semibold text-sm"
    >
      {message || 'Sensor fallback active'}
    </div>
  );
};

export default SensorFallbackBanner;
