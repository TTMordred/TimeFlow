
import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type CalendarDay = {
  date: Date;
  completed: boolean;
  progress: number;
};

interface CalendarProps {
  days: CalendarDay[];
  onSelectDay?: (day: CalendarDay) => void;
}

const Calendar: React.FC<CalendarProps> = ({ days, onSelectDay }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Create array of all days in the month
  const calendarDays: (CalendarDay | null)[] = Array(firstDayOfMonth).fill(null);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayData = days.find(d => 
      d.date.getDate() === date.getDate() && 
      d.date.getMonth() === date.getMonth() && 
      d.date.getFullYear() === date.getFullYear()
    );
    
    if (dayData) {
      calendarDays.push(dayData);
    } else {
      calendarDays.push({
        date,
        completed: false,
        progress: 0
      });
    }
  }
  
  // Fill remaining cells to make a complete grid (6 rows of 7 days)
  const remainingCells = 42 - calendarDays.length;
  if (remainingCells > 0 && remainingCells < 7) {
    calendarDays.push(...Array(remainingCells).fill(null));
  }
  
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center mb-6">
        <CalendarIcon className="mr-2 h-5 w-5" />
        <h2 className="text-xl font-medium">
          {format(new Date(currentYear, currentMonth), 'MMMM yyyy')}
        </h2>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="h-10" />;
          }
          
          const isToday = day.date.toDateString() === today.toDateString();
          
          return (
            <button
              key={i}
              onClick={() => onSelectDay && onSelectDay(day)}
              className={cn(
                "h-10 rounded-md flex items-center justify-center relative",
                isToday && "font-bold border border-primary",
                day.completed && "bg-timeflow-green-100",
                !day.completed && day.progress > 0 && "bg-timeflow-green-50",
                "hover:bg-secondary transition-colors"
              )}
            >
              <span>{day.date.getDate()}</span>
              
              {/* Progress indicator */}
              {day.progress > 0 && (
                <div 
                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 bg-timeflow-green-400 rounded-full"
                  style={{ width: `${Math.min(80, day.progress)}%` }}
                />
              )}
              
              {/* Completed indicator */}
              {day.completed && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-timeflow-green-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
