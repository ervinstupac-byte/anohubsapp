import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import { Z_INDEX, TRANSITIONS, GLASS } from '../../design-tokens';

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | undefined>(undefined);

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node) && isOpen) {
        const dropdown = document.querySelector('[data-dropdown-content]');
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className={`relative inline-block ${className}`}>{children}</div>
    </DropdownContext.Provider>
  );
};

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  className = '',
  asChild = false,
}) => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');
  }
  const { isOpen, setIsOpen, triggerRef } = context;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: () => setIsOpen(!isOpen),
    });
  }

  return (
    <button
      ref={triggerRef}
      onClick={() => setIsOpen(!isOpen)}
      className={`flex items-center gap-2 px-4 py-2 ${GLASS.base} rounded-lg ${TRANSITIONS.fast} hover:bg-slate-800 ${className}`}
    >
      {children}
      <ChevronDown
        className={`w-4 h-4 text-slate-400 ${TRANSITIONS.fast} ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  );
};

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  className = '',
  align = 'start',
}) => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownMenuContent must be used within a DropdownMenu');
  }
  const { isOpen } = context;

  if (!isOpen) return null;

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      data-dropdown-content
      className={`absolute top-full mt-2 min-w-[200px] ${alignClasses[align]} ${GLASS.floating} rounded-lg shadow-xl ${Z_INDEX.dropdown} animate-slide-down ${className}`}
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
}) => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownMenuItem must be used within a DropdownMenu');
  }
  const { setIsOpen } = context;

  return (
    <button
      onClick={() => {
        if (!disabled) {
          onClick?.();
          setIsOpen(false);
        }
      }}
      disabled={disabled}
      className={`w-full px-4 py-2 text-left text-sm ${TRANSITIONS.fast} ${
        disabled ? 'text-slate-500 cursor-not-allowed' : 'text-slate-200 hover:bg-slate-800'
      } ${className}`}
    >
      {children}
    </button>
  );
};

interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({ className = '' }) => {
  return <div className={`h-px bg-slate-700/50 my-1 ${className}`} />;
};
