"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export function MonthSelector({ 
  currentMonth, 
  currentYear, 
  monthLabel 
}: { 
  currentMonth: number; 
  currentYear: number; 
  monthLabel: string;
}) {
  const router = useRouter();
  
  const handlePrev = () => {
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 1) { m = 12; y -= 1; }
    const formatted = `${y}-${m.toString().padStart(2, '0')}`;
    router.push(`/?month=${formatted}`);
  };

  const handleNext = () => {
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 12) { m = 1; y += 1; }
    const formatted = `${y}-${m.toString().padStart(2, '0')}`;
    router.push(`/?month=${formatted}`);
  };
  
  const now = new Date();
  // Disable next button if looking at the present month
  const isFuture = (currentYear > now.getFullYear()) || (currentYear === now.getFullYear() && currentMonth >= now.getMonth() + 1);

  return (
    <div className="flex items-center gap-1 bg-surface-2 rounded-md border border-border p-1 shadow-sm">
      <button 
        onClick={handlePrev} 
        className="p-1 hover:bg-white/10 rounded transition-colors text-text-tertiary hover:text-text-primary"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex items-center gap-2 px-3 py-1 min-w-[140px] justify-center">
        <CalendarIcon size={12} className="text-acid" />
        <span className="font-display text-[0.95rem] tracking-wider uppercase text-text-primary mt-0.5">
          {monthLabel}
        </span>
      </div>
      <button 
        onClick={handleNext} 
        disabled={isFuture}
        className="p-1 hover:bg-white/10 rounded transition-colors text-text-tertiary hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}