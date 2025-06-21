import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parse, isValid } from "date-fns";
import { Clock } from "lucide-react";

interface TimeSelectorProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customTime, setCustomTime] = useState<string>("");
  const [customTimeError, setCustomTimeError] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Common time slots
  const timeSlots: string[] = [
    "08:00", "08:30", 
    "09:00", "09:30", 
    "10:00", "10:30", 
    "11:00", "11:30", 
    "12:00", "12:30",
    "13:00", "13:30", 
    "14:00", "14:30", 
    "15:00", "15:30", 
    "16:00", "16:30",
    "17:00", "17:30"
  ];

  // Format displayed time
  const displayTime = (timeString: string): string => {
    if (!timeString) return "Select time";
    try {
      const date = parse(timeString, "HH:mm", new Date());
      return format(date, "hh:mm a");
    } catch (e) {
      return timeString;
    }
  };
  
  // Handle custom time input
  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const input = e.target.value;
    setCustomTime(input);
    
    // Clear error message when input changes
    if (customTimeError) {
      setCustomTimeError("");
    }
  };
  
  // Apply custom time
  const applyCustomTime = (): void => {
    // Try to parse in 12-hour format (e.g. "2:30 pm")
    let date = parse(customTime, "h:mm a", new Date());
    
    // If invalid, try 24-hour format (e.g. "14:30")
    if (!isValid(date)) {
      date = parse(customTime, "HH:mm", new Date());
    }
    
    if (isValid(date)) {
      const formattedTime = format(date, "HH:mm");
      onChange(formattedTime);
      setIsOpen(false);
      setCustomTimeError("");
    } else {
      setCustomTimeError("Please enter a valid time (e.g., 2:30 pm or 14:30)");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        className={`w-full justify-between bg-white/90 text-gray-600 ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayTime(value)}
        <Clock className="ml-auto h-4 w-4 opacity-50" />
      </Button>
      
      {isOpen && (
        <div className="absolute mt-1 z-50 w-full bg-white rounded-md border border-gray-200 shadow-lg">
          <div className="max-h-60 overflow-y-auto p-1">
            <div className="grid grid-cols-2 gap-1">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${
                    value === time ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700"
                  }`}
                  onClick={() => {
                    onChange(time);
                    setIsOpen(false);
                  }}
                >
                  {displayTime(time)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom time section */}
          <div className="p-3 border-t border-gray-200">
            <label className="block text-xs font-medium text-gray-700 mb-1">Custom Time</label>
            <div className="flex space-x-2">
              <Input
                placeholder="e.g. 2:45 pm or 14:45"
                value={customTime}
                onChange={handleCustomTimeChange}
                className="text-sm"
              />
              <Button 
                type="button" 
                size="sm"
                onClick={applyCustomTime}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Apply
              </Button>
            </div>
            {customTimeError && (
              <p className="text-xs text-red-500 mt-1">{customTimeError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelector;