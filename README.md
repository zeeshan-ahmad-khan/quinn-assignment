Quinn Assignment: Infinite Scrollable Calendar
This is a React application that displays an infinitely scrollable calendar with journal entries, built to be mobile-optimized and performant.

Features
Infinite Vertical Scrolling: Seamlessly scroll through months, both into the past and future.

Dynamic Header: The header always displays the month and year that is most visible in the viewport.

Journal Entries: Displays journal entries from a dataset on the correct dates.

Swipable Card UI: Clicking an entry opens a modal where you can swipe or click to navigate between adjacent entries.

Performant: Uses virtualization (IntersectionObserver) and precise scroll adjustments (flushSync) to ensure smooth, lag-free scrolling, even on mobile devices.

Responsive Design: The layout adapts to different screen sizes.

Tech Stack
Framework: React with Vite

Language: TypeScript

Date Management: date-fns

Styling: Vanilla CSS

How to Run Locally
Clone the repository:

git clone <your-repo-url>
cd <repo-name>

Install dependencies:
This project requires date-fns.

npm install
npm install date-fns

Start the development server:

npm run dev

The application will now be running on http://localhost:5173 (or the next available port).

Design Choices
The core challenge of this assignment is creating a smooth infinite scroll experience without performance degradation.

Virtualization: Instead of rendering all months, we only keep a small "window" of 7 months in the DOM at any given time.

Intersection Observer: We use the IntersectionObserver API to detect when the user scrolls near the top or bottom of the rendered list, triggering a function to load more months.

Precise Scroll Adjustment: To solve the common issue of "jitter" when prepending new items to a scrollable list, this project uses a combination of flushSync from react-dom and direct DOM measurements. This forces React to render the new month and allows us to calculate and apply the correct scroll offset in a single, synchronous step, making the backward scroll perfectly smooth and unnoticeable to the user.
