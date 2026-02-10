import { EventLogger } from './EventLogger';

interface TelegramConfig {
    botToken: string;
    chatId: string;
}

export class TelegramNotificationService {
    private static config: TelegramConfig | null = null;

    /**
     * Initialize the Telegram Bridge
     * @param botToken Telegram Bot API Token
     * @param chatId Target Chat ID
     */
    public static initialize(botToken: string, chatId: string) {
        this.config = { botToken, chatId };
    }

    /**
     * Send an immediate alert formatted according to Sovereign Protocol
     */
    public static async sendAlert(
        reason: string,
        metricValue: number | string,
        unit: string,
        activeProtection: string,
        timestamp: number = Date.now()
    ): Promise<boolean> {
        if (!this.config) {
            console.warn('[Telegram] Service not initialized. Skipping alert.');
            return false;
        }

        const dateStr = new Date(timestamp).toLocaleString();
        const message = `⚠️ SOVEREIGN ALERT: ${reason}
📉 Value: ${metricValue} ${unit}
🛡️ Protocol: ${activeProtection}
⏰ Time: ${dateStr}`;

        try {
            const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.config.chatId,
                    text: message
                })
            });

            if (!response.ok) {
                console.error(`[Telegram] Failed to send alert: ${response.statusText}`);
                return false;
            } else {
                console.log(`[Telegram] Alert sent: ${reason}`);
                EventLogger.log('TELEGRAM_ALERT' as any, reason, metricValue, 'SENT');
                return true;
            }
        } catch (error) {
            console.error('[Telegram] Network error:', error);
            return false;
        }
    }

    /**
     * Check conditions and trigger alert if thresholds are breached
     * To be called by Executive Engine or Trust Monitor
     */
    public static async checkAndAlert(
        trustScore: number,
        shutdownActive: boolean,
        shutdownReason: string = 'Unknown'
    ): Promise<void> {
        // 1. SHUTDOWN CHECK
        if (shutdownActive) {
            await this.sendAlert(
                'EMERGENCY SHUTDOWN TRIGGERED',
                0,
                'RPM',
                shutdownReason,
                Date.now()
            );
        }

        // 2. TRUST SCORE CHECK
        if (trustScore < 70) {
            await this.sendAlert(
                'TRUST SCORE DEGRADATION',
                trustScore.toFixed(1),
                '%',
                'SENSOR_INTEGRITY_PROTOCOL',
                Date.now()
            );
        }
    }
}
