import React from 'react';

interface QrCodeProps {
    value: string;
    size?: number;
    className?: string;
}

/**
 * TACTICAL QR CODE GENERATOR
 * Currently a simulation that generates a unique-looking pattern based on the value string.
 * In a real deployment, this would use 'react-qr-code' or 'qrcode.react'.
 */
export const QrCode: React.FC<QrCodeProps> = ({ value, size = 128, className = '' }) => {

    // Simple pseudo-random generator seeded by value string to make the "QR" look deterministic
    const seed = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Generate a grid of 8x8 blocks (64 bits)
    const blocks = Array.from({ length: 64 }).map((_, i) => {
        // Deterministic random based on seed
        const isFilled = Math.sin(seed + i) > 0;
        return isFilled;
    });

    return (
        <div
            className={`bg-white p-1 rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] ${className}`}
            style={{ width: size, height: size }}
            title={`QR: ${value}`}
        >
            <div className="w-full h-full bg-white grid grid-cols-8 grid-rows-8 gap-0.5 border border-black">
                {blocks.map((filled, i) => (
                    <div
                        key={i}
                        className={`${filled ? 'bg-black' : 'bg-transparent'}`}
                    />
                ))}
            </div>
            {/* Corner Markers (Simulated) */}
            <div className="absolute top-1 left-1 w-[25%] h-[25%] border-2 border-black bg-transparent pointer-events-none" />
            <div className="absolute top-1 right-1 w-[25%] h-[25%] border-2 border-black bg-transparent pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-[25%] h-[25%] border-2 border-black bg-transparent pointer-events-none" />
        </div>
    );
};
