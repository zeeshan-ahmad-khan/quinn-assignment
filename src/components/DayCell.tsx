import React from "react";
import { type JournalEntry } from "../data/journalEntries";

interface DayCellProps {
  day: number;
  entry?: JournalEntry;
  onClick?: () => void;
}

const DayCell: React.FC<DayCellProps> = ({ day, entry, onClick }) => {
  if (!entry) {
    return (
      <div className="day-cell">
        <span className="day-number-simple">{day}</span>
      </div>
    );
  }

  return (
    <div className="day-cell has-entry" onClick={onClick}>
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
