import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- TYPES ---
export interface AuditReport {
    id: string;
    date: string;
    title: string;
    summary: string; // "High Cavitation Risk detected..."
    downloadUrl: string; // Mock
}

export interface MaintenanceEvent {
    id: string;
    date: string;
    type: 'PAST' | 'FUTURE';
    description: string;
}

export interface ClientProfile {
    id: string;
    name: string;
    logoUrl: string; // URL or Base64
    activePowerMW: number;
    capacityMW: number;
    locations: string[];
    reports: AuditReport[];
    timeline: MaintenanceEvent[];
}

// --- MOCK DATA ---
const MOCK_CLIENTS: ClientProfile[] = [
    {
        id: 'C-001',
        name: 'HydroBalkans AG',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/2913/2913465.png', // Generic Turbine Icon
        activePowerMW: 12.4,
        capacityMW: 15.0,
        locations: ['Mala Rijeka', 'Ulog'],
        reports: [
            { id: 'R-24-11', date: '2024-11-15', title: 'Q4 Technical Audit', summary: 'Bolt fatigue detected in Unit 2. Recommendation: Replace Grade 4.6 bolts.', downloadUrl: '#' },
            { id: 'R-24-06', date: '2024-06-20', title: 'Mid-Year Inspection', summary: 'All systems nominal. Efficiency optimized via new Hill Chart.', downloadUrl: '#' }
        ],
        timeline: [
            { id: 'E-01', date: '2024-11-15', type: 'PAST', description: 'Annual Audit Completed' },
            { id: 'E-02', date: '2025-05-01', type: 'FUTURE', description: 'Planned Rotor Balancing' }
        ]
    },
    {
        id: 'C-002',
        name: 'AlpineBlue Energy',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/726/726214.png', // Mountain Icon
        activePowerMW: 4.8,
        capacityMW: 6.0,
        locations: ['Tyrol Creek'],
        reports: [
            { id: 'R-25-01', date: '2025-01-10', title: 'Startup Commissioning', summary: 'Successful grid sync. Vibrations within Zone A.', downloadUrl: '#' }
        ],
        timeline: [
            { id: 'E-01', date: '2025-01-10', type: 'PAST', description: 'Commissioning Finalized' },
            { id: 'E-02', date: '2025-07-15', type: 'FUTURE', description: '6-Month Warranty Check' }
        ]
    }
];

// --- CONTEXT ---
interface ClientContextType {
    activeClient: ClientProfile | null;
    loginClient: (id: string) => void;
    logout: () => void;
    clients: ClientProfile[]; // For debug/selector
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeClient, setActiveClient] = useState<ClientProfile | null>(MOCK_CLIENTS[0]); // Default to first for demo

    const loginClient = (id: string) => {
        const client = MOCK_CLIENTS.find(c => c.id === id);
        if (client) setActiveClient(client);
    };

    const logout = () => setActiveClient(null);

    return (
        <ClientContext.Provider value={{ activeClient, loginClient, logout, clients: MOCK_CLIENTS }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClient = () => {
    const context = useContext(ClientContext);
    if (!context) throw new Error("useClient must be used within ClientProvider");
    return context;
};
