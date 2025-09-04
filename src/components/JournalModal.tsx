import React from "react";
import { format, parse } from "date-fns";
import { type JournalEntry } from "../data/journalEntries";

interface JournalModalProps {
  entry: JournalEntry;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const JournalModal: React.FC<JournalModalProps> = ({
  entry,
  onClose,
  onNext,
  onPrev,
  isFirst,
  isLast,
}) => {
  const entryDate = parse(entry.date, "dd/MM/yyyy", new Date());

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        <div className="modal-card">
          <img
            src={entry.imgUrl}
            alt="Journal entry"
            className="modal-image"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/350x300/eee/ccc?text=Image";
            }}
          />
          <div className="modal-details">
            <div className="modal-date-container">
              <p className="modal-date">{format(entryDate, "dd MMMM")}</p>
              <p className="modal-rating">
                {"⭐".repeat(Math.round(entry.rating))}
              </p>
            </div>

            <div className="modal-categories">
              {entry.categories.map((category) => (
                <div key={category} className="category-pill">
                  {category.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>

            <p className="modal-description">{entry.description}</p>
          </div>
        </div>

        {!isFirst && (
          <button className="modal-nav-btn prev" onClick={onPrev}>
            ‹
          </button>
        )}
        {!isLast && (
          <button className="modal-nav-btn next" onClick={onNext}>
            ›
          </button>
        )}
      </div>
    </div>
  );
};

export default JournalModal;
