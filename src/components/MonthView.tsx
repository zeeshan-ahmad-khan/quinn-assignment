import React, { forwardRef } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isSameDay,
  parse,
} from "date-fns";
import DayCell from "./DayCell";
import { type JournalEntry } from "../data/journalEntries";

interface MonthViewProps extends React.HTMLAttributes<HTMLDivElement> {
  monthDate: Date;
  journalEntries: JournalEntry[];
  onEntryClick: (entry: JournalEntry) => void;
}

const MonthView = forwardRef<HTMLDivElement, MonthViewProps>(
  ({ monthDate, journalEntries, onEntryClick, ...rest }, ref) => {
    const firstDayOfMonth = startOfMonth(monthDate);
    const lastDayOfMonth = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    });
    const startingDayIndex = getDay(firstDayOfMonth);

    return (
      <div className="month-view" ref={ref} {...rest}>
        <div className="calendar-grid">
          {/* The old month-label div is removed from here */}

          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`padding-${index}`} className="day-cell empty"></div>
          ))}

          {daysInMonth.map((day, index) => {
            const entry = journalEntries.find((e) => {
              const entryDate = parse(e.date, "dd/MM/yyyy", new Date());
              return isSameDay(entryDate, day);
            });

            // Check if this is the first day of the month
            const isFirst = day.getDate() === 1;

            return (
              <DayCell
                key={index}
                day={day.getDate()}
                entry={entry}
                // Pass new props to the DayCell component
                isFirstDayOfMonth={isFirst}
                monthLabel={isFirst ? format(monthDate, "MMM") : undefined}
                onClick={entry ? () => onEntryClick(entry) : undefined}
              />
            );
          })}
        </div>
      </div>
    );
  }
);

export default MonthView;
