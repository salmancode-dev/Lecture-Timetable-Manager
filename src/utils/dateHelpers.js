/**
 * Utility functions for date manipulation and formatting
 * Day of week and year are always computed from date (YYYY-MM-DD)
 */

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns today's date in YYYY-MM-DD format based on local time
 */
export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a localized Date object at midnight
 */
export function parseDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

/**
 * Derive Day of Week (e.g., 'Monday') from YYYY-MM-DD
 */
export function getDayOfWeek(dateStr) {
  const d = parseDateString(dateStr);
  if (!d) return 'Unknown';
  return DAYS_OF_WEEK[d.getDay()];
}

/**
 * Derive Year (e.g., '2026') from YYYY-MM-DD
 */
export function getYear(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts[0] || '';
}

/**
 * Format date for friendly display, e.g. "Oct 12, 2026"
 */
export function formatDisplayDate(dateStr) {
  const d = parseDateString(dateStr);
  if (!d) return dateStr || '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr) {
  return dateStr === getTodayString();
}

/**
 * Check if a date string is in the past
 */
export function isPastDate(dateStr) {
  const today = getTodayString();
  return dateStr < today;
}

/**
 * Get month key for filtering, e.g., "2026-10" and label "October 2026"
 */
export function getMonthKey(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 7);
}

export function formatMonthLabel(monthKey) {
  if (!monthKey) return 'All Months';
  const [year, month] = monthKey.split('-');
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Group key for week grouping: Returns the Monday date of the week
 */
export function getWeekStartKey(dateStr) {
  const d = parseDateString(dateStr);
  if (!d) return 'Unknown Week';
  const day = d.getDay();
  // Adjust so Monday is 0, Sunday is 6
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const dt = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

export function formatWeekLabel(weekMondayStr) {
  const start = parseDateString(weekMondayStr);
  if (!start) return weekMondayStr;
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  const sStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const eStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `Week of ${sStr} – ${eStr}`;
}

/**
 * Generate sequential lecture dates given a start date, selected weekday indices (0=Sun..6=Sat),
 * and target count.
 */
export function generateSequenceDates(startDateStr, activeWeekdays, count) {
  const result = [];
  let current = parseDateString(startDateStr);
  if (!current || !activeWeekdays || activeWeekdays.length === 0 || count <= 0) return result;

  // Max search safety: 365 days
  let safetyCount = 0;
  while (result.length < count && safetyCount < 365) {
    safetyCount++;
    const dayOfWeek = current.getDay();
    if (activeWeekdays.includes(dayOfWeek)) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      result.push(`${y}-${m}-${d}`);
    }
    // Move to next day
    current.setDate(current.getDate() + 1);
  }
  return result;
}
