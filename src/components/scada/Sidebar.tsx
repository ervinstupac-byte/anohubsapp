import React from 'react';

interface SidebarProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ children, isOpen, onClose }) => {
    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-[280px] bg-slate-950/95 backdrop-blur-3xl border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl
                ring-1 ring-white/5 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {children}
            </aside>
        </>
    );
};
