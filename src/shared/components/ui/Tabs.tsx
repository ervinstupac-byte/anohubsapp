import React, { useState, createContext, useContext } from 'react';
import { TRANSITIONS } from '../../design-tokens';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onChange?: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onChange,
  children,
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || '');
  const activeTab = value ?? internalActiveTab;

  const setActiveTab = (id: string) => {
    if (!value) {
      setInternalActiveTab(id);
    }
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex border-b border-slate-700/50 ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = '',
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${TRANSITIONS.fast} ${
        isActive
          ? 'text-cyan-400 border-cyan-400'
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-500'
      } ${className}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = '',
}) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  const { activeTab } = context;

  if (activeTab !== value) return null;

  return <div className={`pt-4 ${className}`}>{children}</div>;
};
