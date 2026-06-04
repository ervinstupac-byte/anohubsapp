import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { TRANSITIONS, GLASS, Z_INDEX } from '../../design-tokens';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value || new Date()
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onChange?.(newDate);
    setIsOpen(false);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 ${GLASS.base} rounded-lg ${TRANSITIONS.fast} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'
        }`}
      >
        <span className={value ? 'text-slate-200' : 'text-slate-500'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarIcon className="w-5 h-5 text-slate-400" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className={`absolute top-full mt-2 w-72 ${GLASS.floating} rounded-xl shadow-xl ${Z_INDEX.dropdown} animate-slide-down`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <button
              onClick={handlePrevMonth}
              className={`p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded ${TRANSITIONS.fast}`}
            >
              ←
            </button>
            <h3 className="font-semibold text-slate-200">
              {currentMonth.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <button
              onClick={handleNextMonth}
              className={`p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded ${TRANSITIONS.fast}`}
            >
              →
            </button>
          </div>

          {/* Days Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs text-slate-500 font-semibold py-1"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before first day of month */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {/* Days */}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                );
                const isSelected = value && isSameDay(date, value);
                const isToday = isSameDay(date, new Date());

                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDay(day)}
                    className={`h-8 w-full text-sm rounded ${TRANSITIONS.fast} ${
                      isSelected
                        ? 'bg-cyan-600 text-white font-semibold'
                        : isToday
                        ? 'text-cyan-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
