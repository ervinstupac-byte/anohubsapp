import { EventEmitter } from '../utils/EventEmitter';

export type ServiceStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'DEGRADED';

export interface ServiceMetadata {
    id: string;
    name: string;
    description: string;
    version: string;
    status: ServiceStatus;
    lastHeartbeat: number;
    metrics?: {
        cpuUsage?: number; // Simulated
        memoryUsage?: number; // Simulated
        uptime: number;
        eventsProcessed?: number;
    };
}

class ServiceRegistry extends EventEmitter {
    private static instance: ServiceRegistry;
    private services: Map<string, ServiceMetadata> = new Map();

    private constructor() {
        super();
        this.startHeartbeatLoop();
    }

    public static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    /**
     * Register or update a service
     */
    public register(metadata: ServiceMetadata) {
        this.services.set(metadata.id, {
            ...metadata,
            lastHeartbeat: Date.now(),
            status: 'RUNNING'
        });
        this.emit('update', Array.from(this.services.values()));
    }

    /**
     * Update service metrics
     */
    public heartbeat(id: string, metrics?: Partial<ServiceMetadata['metrics']>) {
        const service = this.services.get(id);
        if (service) {
            this.services.set(id, {
                ...service,
                lastHeartbeat: Date.now(),
                status: 'RUNNING',
                metrics: { ...service.metrics, ...metrics } as any
            });
            this.emit('update', Array.from(this.services.values()));
        }
    }

    /**
     * Report an error for a service
     */
    public reportError(id: string, error: string) {
        const service = this.services.get(id);
        if (service) {
            this.services.set(id, {
                ...service,
                status: 'ERROR',
                description: `${service.description} [ERROR: ${error}]`
            });
            this.emit('update', Array.from(this.services.values()));
        }
    }

    /**
     * Get all services
     */
    public getAll(): ServiceMetadata[] {
        return Array.from(this.services.values());
    }

    /**
     * Background loop to check for dead services
     */
    private startHeartbeatLoop() {
        setInterval(() => {
            const now = Date.now();
            let changed = false;

            this.services.forEach((service, id) => {
                if (now - service.lastHeartbeat > 10000 && service.status === 'RUNNING') {
                    service.status = 'DEGRADED'; // Assume degraded if no heartbeat for 10s
                    changed = true;
                }
            });

            if (changed) {
                this.emit('update', Array.from(this.services.values()));
            }
        }, 5000);
    }
}

export const serviceRegistry = ServiceRegistry.getInstance();
