import React from 'react';

export const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <aside className="w-[280px] bg-slate-950 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl">
            {children}
        </aside>
    );
};
