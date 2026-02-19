import { useState, useEffect } from 'react';
import { serviceRegistry, ServiceMetadata } from '../services/ServiceRegistry';

/**
 * Hook to monitor system services
 */
export const useServiceMonitor = () => {
    const [services, setServices] = useState<ServiceMetadata[]>([]);

    useEffect(() => {
        // Initial load
        setServices(serviceRegistry.getAll());

        // Subscribe to updates
        const handler = (updatedServices: ServiceMetadata[]) => {
            setServices(updatedServices);
        };

        serviceRegistry.on('update', handler);

        return () => {
            serviceRegistry.off('update', handler);
        };
    }, []);

    return services;
};
