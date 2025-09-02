import React, { useState, useRef, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { addMonths, subMonths, format, isSameMonth } from "date-fns";
import "./styles/App.css";
import MonthView from "./components/MonthView";
import { journalEntries, type JournalEntry } from "./data/journalEntries";
import JournalModal from "./components/JournalModal";

const getMonthKey = (date: Date) => format(date, "yyyy-MM");

function App() {
  const [headerDate, setHeaderDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const [visibleMonths, setVisibleMonths] = useState(() => {
    const today = new Date();
    return [-3, -2, -1, 0, 1, 2, 3].map((offset) => addMonths(today, offset));
  });

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const monthVisibility = useRef(new Map<string, number>());
  const firstMonthRef = useRef<HTMLDivElement>(null);

  const loadPrevious = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    const container = scrollContainerRef.current;
    const firstMonthEl = firstMonthRef.current;
    if (!container || !firstMonthEl) {
      setIsLoading(false);
      return;
    }
    const previousHeight = firstMonthEl.offsetHeight;
    flushSync(() => {
      setVisibleMonths((prevMonths) => [
        subMonths(prevMonths[0], 1),
        ...prevMonths.slice(0, 6),
      ]);
    });
    const newScrollTop =
      container.scrollTop +
      (firstMonthRef?.current?.offsetHeight ?? 0 - previousHeight);
    container.scrollTop = newScrollTop;
    setIsLoading(false);
  }, [isLoading]);

  const loadNext = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    setVisibleMonths((prevMonths) => [
      ...prevMonths.slice(1),
      addMonths(prevMonths[prevMonths.length - 1], 1),
    ]);
    setTimeout(() => setIsLoading(false), 50);
  }, [isLoading]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const today = new Date();
      const currentMonthKey = getMonthKey(today);
      const currentMonthEl = container.querySelector(
        `[data-month-key="${currentMonthKey}"]`
      ) as HTMLElement;
      if (currentMonthEl) {
        const headerHeight = 70;
        const topPos = currentMonthEl.offsetTop - headerHeight;
        container.scrollTo({ top: topPos, behavior: "instant" });
      }
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const sentinelObserver = new IntersectionObserver((entries) => {
      if (isLoading) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === topSentinelRef.current) loadPrevious();
          else if (entry.target === bottomSentinelRef.current) loadNext();
        }
      });
    });
    if (topSentinelRef.current)
      sentinelObserver.observe(topSentinelRef.current);
    if (bottomSentinelRef.current)
      sentinelObserver.observe(bottomSentinelRef.current);

    const monthObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const monthKey = (entry.target as HTMLElement).dataset.monthKey;
          if (monthKey)
            monthVisibility.current.set(monthKey, entry.intersectionRatio);
        });
        let mostVisibleMonthKey = "";
        let maxRatio = 0;
        monthVisibility.current.forEach((ratio, key) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisibleMonthKey = key;
          }
        });
        if (mostVisibleMonthKey) {
          const newHeaderDate = new Date(mostVisibleMonthKey + "-02");
          if (!isSameMonth(newHeaderDate, headerDate))
            setHeaderDate(newHeaderDate);
        }
      },
      {
        root: container,
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    const monthElements = container.querySelectorAll(".month-view");
    monthElements.forEach((el) => monthObserver.observe(el));

    return () => {
      sentinelObserver.disconnect();
      monthObserver.disconnect();
    };
  }, [visibleMonths, headerDate, loadPrevious, loadNext, isLoading]);

  const handleEntryClick = (entry: JournalEntry) => setSelectedEntry(entry);
  const handleCloseModal = () => setSelectedEntry(null);
  const selectedEntryIndex = selectedEntry
    ? journalEntries.findIndex((e) => e.date === selectedEntry.date)
    : -1;
  const handleNextEntry = () => {
    if (
      selectedEntryIndex !== -1 &&
      selectedEntryIndex < journalEntries.length - 1
    ) {
      setSelectedEntry(journalEntries[selectedEntryIndex + 1]);
    }
  };
  const handlePrevEntry = () => {
    if (selectedEntryIndex > 0) {
      setSelectedEntry(journalEntries[selectedEntryIndex - 1]);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <button className="back-button">‹</button>
          <h1>my hair diary</h1>
        </div>
        <div className="header-right">
          <span>{format(headerDate, "MMM yyyy")}</span>
        </div>
      </header>

      <div className="weekday-bar">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
      </div>

      <main ref={scrollContainerRef} className="calendar-scroll-area">
        <div ref={topSentinelRef} className="sentinel top"></div>
        {visibleMonths.map((monthDate, index) => (
          <MonthView
            ref={index === 0 ? firstMonthRef : null}
            key={getMonthKey(monthDate)}
            monthDate={monthDate}
            data-month-key={getMonthKey(monthDate)}
            journalEntries={journalEntries}
            onEntryClick={handleEntryClick}
          />
        ))}
        <div ref={bottomSentinelRef} className="sentinel bottom"></div>
      </main>

      {selectedEntry && (
        <JournalModal
          entry={selectedEntry}
          onClose={handleCloseModal}
          onNext={handleNextEntry}
          onPrev={handlePrevEntry}
          isFirst={selectedEntryIndex === 0}
          isLast={selectedEntryIndex === journalEntries.length - 1}
        />
      )}
    </div>
  );
}

export default App;
