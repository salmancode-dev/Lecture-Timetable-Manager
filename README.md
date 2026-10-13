# UniSchedule — University Lecture Timetable Manager

A modern, frontend-only Lecture Timetable Manager web app tailored for university students. Replace slow, painful Word document tables with an interactive, mobile-friendly schedule that tracks attendance, numbers lectures automatically, and persists everything locally.

## ✨ Key Features

- **Automated Date Derivation**: Day of the week (e.g. *Monday*) and Year (e.g. *2026*) are computed automatically from the `YYYY-MM-DD` date.
- **Smart Lecture Numbering**: Auto-suggests the next lecture number (`last + 1`) per subject, allows manual overrides, and displays a warning banner if a duplicate number is detected.
- **Bulk Lecture Generator**: Generate entire recurring class schedules in seconds by selecting a start date, active weekdays (e.g., Mon & Wed), and number of sessions with a live preview before saving.
- **Responsive Views**: Clean, organized desktop table and stacked mobile cards optimized for smartphones with zero horizontal scroll.
- **Attendance & Statistics**: Quick status cycling (`Upcoming` ⏳ / `Attended` ✓ / `Missed` ✕) with badges, today highlighting, and dynamic attendance rate meters.
- **Interactive Filtering & Grouping**: Search by topic, subject, or code; filter by month or status; sort by date ascending/descending; and toggle optional **Group by Week**.
- **Print & PDF Support**: Dedicated print stylesheet formatted cleanly for standard paper margins and browser "Save as PDF".
- **Dark & Light Mode**: Seamless theme switching with smooth Framer Motion icon animations, persisting to `localStorage` and respecting OS color preferences.
- **Data Backup & Restore**: Export your entire timetable as a JSON file, import backups with schema validation, or reset/clear sample data with a single click.

## 🛠 Tech Stack

- **React 19** + **Vite**
- **Tailwind CSS v4** with custom class-based dark mode
- **Framer Motion** for animated route transitions, modals, and list staggering
- **React Router DOM v7**
- **Lucide React** for clean, accessible icons
- **LocalStorage** for 100% client-side persistence

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production

```bash
npm run build
```

---

## 🌐 Deploying to Vercel

The repository already includes `vercel.json` configured with SPA rewrites to ensure clean route handling without 404 errors on browser refresh.

### Option A: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B: Deploy via Vercel Dashboard (Git)

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**.
