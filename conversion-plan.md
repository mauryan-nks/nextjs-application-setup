# Conversion Plan for React+TypeScript to HTML, CSS, and JS

## Information Gathered
- The project is a React + TypeScript app using react-router-dom for routing.
- Pages are in `src/pages/` directory, components in `src/components/`.
- Uses Tailwind CSS for styling.
- Uses lucide-react icons.
- Uses recharts for charts.
- Uses React Query, context providers, and custom hooks.
- Pages have complex stateful logic and interactivity.

## Conversion Approach

### General
- Convert React JSX to static HTML structure.
- Use Tailwind CSS via CDN for styling to minimize CSS extraction effort.
- Replace React state and hooks with vanilla JS state management.
- Replace react-router-dom routing with vanilla JS routing or multi-page static HTML with links.
- Replace lucide-react icons with SVG or font icons.
- Replace recharts charts with Chart.js or static images.
- Convert custom components to reusable HTML+JS components or inline HTML.

### Dashboard Page and Components
- Convert `Dashboard.tsx` JSX to HTML.
- Convert `DashboardLayout.tsx` to HTML layout with sidebar and content area.
- Convert `Card` components to divs with Tailwind classes.
- Convert `BrandSwitcher` dropdown to HTML select or custom dropdown with JS.
- Convert `DateRangePicker` to two date input fields with JS.
- Convert `FilterBar` to tabbed filter UI with JS.
- Convert `AnalyticsCharts` to Chart.js charts or static images.
- Convert `ExportOptions` to dropdown with export functionality using vanilla JS.
- Convert `Button` component to HTML button with Tailwind classes.

### Other Pages
- Follow similar approach for other pages in `src/pages/`.
- Convert page-specific components similarly.

## Dependent Files to Convert
- All pages in `src/pages/`
- Components in `src/components/` used by pages
- CSS files: `src/index.css`, `src/App.css`, `tailwind.config.ts`
- Assets and icons

## Follow-up Steps
- Convert pages and components incrementally.
- Test each page in browser for layout and interactivity.
- Adjust JS for state and routing as needed.
- Optimize CSS and assets.

---

Please confirm if you approve this detailed conversion plan so I can proceed with the conversion of all pages to HTML, CSS, and JS.
