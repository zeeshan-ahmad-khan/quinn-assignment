import React from "react";
import { type JournalEntry } from "../data/journalEntries";

interface DayCellProps extends React.HTMLAttributes<HTMLDivElement> {
  day: number;
  entry?: JournalEntry;
  onClick?: () => void;
  isFirstDayOfMonth?: boolean;
  monthLabel?: string;
  dayId: string;
  monthKey: string;
}

const DayCell: React.FC<DayCellProps> = ({
  day,
  entry,
  onClick,
  isFirstDayOfMonth,
  monthLabel,
  dayId,
  monthKey,
  ...rest
}) => {
  const dayCellClasses = `day-cell ${isFirstDayOfMonth ? "first-day" : ""}`;

  if (!entry) {
    return (
      <div
        className={dayCellClasses}
        data-day-id={dayId}
        data-month-key={monthKey}
        {...rest}
      >
        {isFirstDayOfMonth && (
          <div className="day-cell-month-label">{monthLabel}</div>
        )}
        <span className="day-number-simple">{day}</span>
      </div>
    );
  }

  return (
    <div
      className={`${dayCellClasses} has-entry`}
      onClick={onClick}
      data-day-id={dayId}
      data-month-key={monthKey}
      {...rest}
    >
      {isFirstDayOfMonth && (
        <div className="day-cell-month-label">{monthLabel}</div>
      )}
      <span className="day-number">{day}</span>
      <img
        src={entry.imgUrl}
        alt="Journal Entry"
        className="entry-image"
        onError={(e) => {
          e.currentTarget.src =
            "https://placehold.co/100x100/eee/ccc?text=Image";
        }}
      />
      <div className="entry-rating">
        {"⭐".repeat(Math.round(entry.rating))}
      </div>
    </div>
  );
};

export default DayCell;
