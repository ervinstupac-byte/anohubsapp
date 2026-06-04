import React, { useState, createContext, useContext } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TRANSITIONS } from '../../design-tokens';

interface AccordionContextValue {
  openItem: string | string[] | null;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onChange?: (id: string | string[] | null) => void;
  children: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  type = 'single',
  defaultValue,
  value,
  onChange,
  children,
  className = '',
}) => {
  const [internalOpenItem, setInternalOpenItem] = useState<string | string[] | null>(
    defaultValue ?? null
  );
  const openItem = value ?? internalOpenItem;

  const toggleItem = (id: string) => {
    let newOpenItem: string | string[] | null;

    if (type === 'single') {
      newOpenItem = openItem === id ? null : id;
    } else {
      const current = Array.isArray(openItem) ? openItem : [];
      newOpenItem = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
    }

    if (!value) {
      setInternalOpenItem(newOpenItem);
    }
    onChange?.(newOpenItem);
  };

  return (
    <AccordionContext.Provider value={{ openItem, toggleItem }}>
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  children,
  className = '',
}) => {
  return (
    <div className={`border border-slate-700/50 rounded-lg overflow-hidden ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { itemValue: value });
        }
        return child;
      })}
    </div>
  );
};

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  itemValue?: string;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className = '',
  itemValue,
}) => {
  const context = useContext(AccordionContext);
  if (!context || !itemValue) {
    throw new Error('AccordionTrigger must be used within an AccordionItem');
  }
  const { openItem, toggleItem } = context;
  const isOpen = Array.isArray(openItem) ? openItem.includes(itemValue) : openItem === itemValue;

  return (
    <button
      onClick={() => toggleItem(itemValue)}
      className={`w-full flex items-center justify-between p-4 text-left ${TRANSITIONS.fast} hover:bg-slate-800/50 ${className}`}
    >
      <span className="font-medium text-slate-200">{children}</span>
      {isOpen ? (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronRight className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );
};

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  itemValue?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className = '',
  itemValue,
}) => {
  const context = useContext(AccordionContext);
  if (!context || !itemValue) {
    throw new Error('AccordionContent must be used within an AccordionItem');
  }
  const { openItem } = context;
  const isOpen = Array.isArray(openItem) ? openItem.includes(itemValue) : openItem === itemValue;

  if (!isOpen) return null;

  return (
    <div className={`px-4 pb-4 pt-0 text-slate-300 ${className}`}>
      <div className="animate-slide-down">{children}</div>
    </div>
  );
};
