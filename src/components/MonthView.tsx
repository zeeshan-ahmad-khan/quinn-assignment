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
          <div
            className="month-label"
            style={{ gridColumnStart: startingDayIndex + 1 }}
          >
            {format(monthDate, "MMM yyyy")}
          </div>

          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`padding-${index}`} className="day-cell empty"></div>
          ))}

          {daysInMonth.map((day, index) => {
            const entry = journalEntries.find((e) => {
              const entryDate = parse(e.date, "dd/MM/yyyy", new Date());
              return isSameDay(entryDate, day);
            });
            return (
              <DayCell
                key={index}
                day={day.getDate()}
                entry={entry}
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
