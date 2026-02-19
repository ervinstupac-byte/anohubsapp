type Listener = (...args: any[]) => void;

export class EventEmitter {
    private events: Map<string, Listener[]> = new Map();

    public on(event: string, listener: Listener): this {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)?.push(listener);
        return this;
    }

    public off(event: string, listener: Listener): this {
        const listeners = this.events.get(event);
        if (listeners) {
            this.events.set(event, listeners.filter(l => l !== listener));
        }
        return this;
    }

    public emit(event: string, ...args: any[]): boolean {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(...args));
            return true;
        }
        return false;
    }

    public removeListener(event: string, listener: Listener): this {
        return this.off(event, listener);
    }
}
