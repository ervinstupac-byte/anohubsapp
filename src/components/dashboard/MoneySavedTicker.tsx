import React, { useState, useEffect } from 'react';
import Decimal from 'decimal.js';

interface MoneySavedTickerProps {
    molecularDebtRateEur: number;
    baselineWearRateEur?: number; // Defaults to 50 EUR/h (Standard Op)
}

export const MoneySavedTicker: React.FC<MoneySavedTickerProps> = ({
    molecularDebtRateEur,
    baselineWearRateEur = 50
}) => {
    const [saved, setSaved] = useState<Decimal>(new Decimal(0));

    useEffect(() => {
        // Calculate saving rate per second
        // Rate = (Baseline - Actual) / 3600
        const savingRatePerSec = new Decimal(baselineWearRateEur - molecularDebtRateEur).div(3600);

        const interval = setInterval(() => {
            setSaved(prev => prev.plus(savingRatePerSec.div(10))); // Update every 100ms
        }, 100);

        return () => clearInterval(interval);
    }, [molecularDebtRateEur, baselineWearRateEur]);

    const isPositive = saved.gte(0);

    return (
        <div style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '10px 20px',
            borderRadius: '8px',
            border: `1px solid ${isPositive ? '#4caf50' : '#f44336'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '150px'
        }}>
            <span style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                System Savings
            </span>
            <div style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: isPositive ? '#4caf50' : '#f44336',
                textShadow: '0 0 10px rgba(76,175,80,0.3)'
            }}>
                {isPositive ? '+' : ''}{saved.toFixed(6)} €
            </div>
            <span style={{ fontSize: '0.7rem', color: '#666' }}>
                vs Standard Baseline
            </span>
        </div>
    );
};
