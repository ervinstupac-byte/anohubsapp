import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    speed = 30,
    delay = 0,
    className = ""
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const startTyping = () => {
            let i = 0;
            const timer = setInterval(() => {
                setDisplayedText(text.slice(0, i + 1));
                i++;
                if (i >= text.length) {
                    clearInterval(timer);
                    setIsComplete(true);
                }
            }, speed);
            return timer;
        };

        timeout = setTimeout(() => {
            const timer = startTyping();
            return () => clearInterval(timer);
        }, delay);

        return () => clearTimeout(timeout);
    }, [text, speed, delay]);

    return (
        <span className={className}>
            {displayedText}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-1.5 h-4 ml-0.5 bg-cyan-500 align-middle"
                />
            )}
        </span>
    );
};
