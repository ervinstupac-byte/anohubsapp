import React, { ComponentType, ReactNode } from 'react';

interface ComposeProvidersProps {
    components: Array<ComponentType<{ children: ReactNode }>>;
    children: ReactNode;
}

/**
 * Utility component to compose multiple providers and avoid the "Pyramid of Doom".
 * Renders providers from right to left (bottom to top).
 */
export const ComposeProviders: React.FC<ComposeProvidersProps> = ({ components, children }) => {
    return (
        <>
            {components.reduceRight((acc, Comp) => {
                return <Comp>{acc}</Comp>;
            }, children)}
        </>
    );
};
