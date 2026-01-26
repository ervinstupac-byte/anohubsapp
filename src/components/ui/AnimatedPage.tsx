import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedPageProps {
    /** Page content to animate */
    children: React.ReactNode;
    /** Optional custom className */
    className?: string;
}

/**
 * GPU-accelerated page transition wrapper.
 * Uses opacity and translateY for smooth 60fps animations.
 * Transitions are snappy (0.2s) for industrial responsiveness.
 */
export const AnimatedPage: React.FC<AnimatedPageProps> = ({
    children,
    className = ''
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1] // Snappy cubic-bezier
            }}
            className={className}
            style={{ willChange: 'opacity, transform' }}
        >
            {children}
        </motion.div>
    );
};

AnimatedPage.displayName = 'AnimatedPage';

/**
 * Staggered animation container for lists of items.
 * Each child animates in sequence for a polished cascade effect.
 */
interface AnimatedListProps {
    children: React.ReactNode;
    className?: string;
    /** Delay between each item animation in seconds */
    staggerDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
    children,
    className = '',
    staggerDelay = 0.05
}) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
            className={className}
        >
            {React.Children.map(children, (child, index) => (
                <motion.div
                    key={index}
                    variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.2,
                                ease: [0.4, 0, 0.2, 1]
                            }
                        }
                    }}
                    style={{ willChange: 'opacity, transform' }}
                >
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
};

AnimatedList.displayName = 'AnimatedList';
