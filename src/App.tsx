import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { flushSync } from "react-dom";
import {
  addMonths,
  subMonths,
  format,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parse,
} from "date-fns";
import "./App.css";
import DayCell from "./components/DayCell";
import { journalEntries, type JournalEntry } from "./data/journalEntries";
import JournalModal from "./components/JournalModal";

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

  const scrollMetrics = useRef<{
    scrollTop: number;
    scrollHeight: number;
  } | null>(null);

  // --- Logic to create a single, flat array of all days ---
  const allDays = useMemo(() => {
    const days: Date[] = [];
    visibleMonths.forEach((monthDate) => {
      const firstDay = startOfMonth(monthDate);
      const lastDay = endOfMonth(monthDate);
      const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
      days.push(...daysInMonth);
    });
    return days;
  }, [visibleMonths]);

  // --- Scrolling Logic ---
  const loadPrevious = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    const container = scrollContainerRef.current;
    if (!container) {
      setIsLoading(false);
      return;
    }
    scrollMetrics.current = {
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
    };
    flushSync(() => {
      setVisibleMonths((prevMonths) => [
        subMonths(prevMonths[0], 1),
        ...prevMonths.slice(0, 6),
      ]);
    });
  }, [isLoading]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && scrollMetrics.current) {
      const newScrollHeight = container.scrollHeight;
      const oldMetrics = scrollMetrics.current;
      container.scrollTop =
        oldMetrics.scrollTop + (newScrollHeight - oldMetrics.scrollHeight);
      scrollMetrics.current = null;
    }
    setIsLoading(false);
  }, [allDays]);

  const loadNext = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    setVisibleMonths((prevMonths) => [
      ...prevMonths.slice(1),
      addMonths(prevMonths[prevMonths.length - 1], 1),
    ]);
  }, [isLoading]);

  // --- Other Hooks ---
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const today = new Date();
      const firstDayOfCurrentMonth = startOfMonth(today);
      const currentMonthEl = container.querySelector(
        `[data-day-id="${format(firstDayOfCurrentMonth, "yyyy-MM-dd")}"]`
      ) as HTMLElement;
      if (currentMonthEl) {
        const headerHeight = 90;
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

    const dayObserver = new IntersectionObserver(
      (entries) => {
        const monthCounts: Record<string, number> = {};
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const monthKey = (entry.target as HTMLElement).dataset.monthKey;
            if (monthKey) {
              monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
            }
          }
        });

        let mostVisibleMonthKey = "";
        let maxCount = 0;
        for (const monthKey in monthCounts) {
          if (monthCounts[monthKey] > maxCount) {
            maxCount = monthCounts[monthKey];
            mostVisibleMonthKey = monthKey;
          }
        }

        if (mostVisibleMonthKey) {
          const newHeaderDate = new Date(mostVisibleMonthKey + "-02");
          if (!isSameMonth(newHeaderDate, headerDate))
            setHeaderDate(newHeaderDate);
        }
      },
      { root: container, threshold: 0.5 }
    );

    const dayElements = container.querySelectorAll(".day-cell");
    dayElements.forEach((el) => dayObserver.observe(el));

    return () => {
      sentinelObserver.disconnect();
      dayObserver.disconnect();
    };
  }, [allDays, headerDate, loadPrevious, loadNext, isLoading]);

  // --- Modal Logic ---
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
          <button className="back-button" aria-label="Go back">
            ‹
          </button>
          <h1>my hair diary</h1>
        </div>
        <div className="header-right">
          <span>{format(headerDate, "MMM yyyy")}</span>
        </div>
      </header>

      <div className="weekday-bar">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div key={day} className="weekday-header-fixed">
            {day}
          </div>
        ))}
      </div>

      <main
        ref={scrollContainerRef}
        className="calendar-scroll-area calendar-grid"
      >
        <div
          ref={topSentinelRef}
          className="sentinel top"
          style={{ gridColumn: "1 / -1" }}
        ></div>

        {allDays.map((day, index) => {
          const entry = journalEntries.find((e) => {
            const entryDate = parse(e.date, "dd/MM/yyyy", new Date());
            return isSameDay(entryDate, day);
          });

          const isFirstOfMonth = day.getDate() === 1;
          const style = index === 0 ? { gridColumnStart: getDay(day) + 1 } : {};

          return (
            <DayCell
              key={day.toISOString()}
              day={day.getDate()}
              entry={entry}
              isFirstDayOfMonth={isFirstOfMonth}
              monthLabel={isFirstOfMonth ? format(day, "MMM") : undefined}
              dayId={format(day, "yyyy-MM-dd")}
              monthKey={format(day, "yyyy-MM")}
              style={style}
              onClick={entry ? () => handleEntryClick(entry) : undefined}
            />
          );
        })}

        <div
          ref={bottomSentinelRef}
          className="sentinel bottom"
          style={{ gridColumn: "1 / -1" }}
        ></div>
      </main>

      {/* <footer className="app-footer">
        <div className="footer-icon">🏠</div>
        <div className="footer-icon">🔍</div>
        <div className="footer-add-button">+</div>
        <div className="footer-icon">❤️</div>
        <div className="footer-icon">👤</div>
      </footer> */}

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
