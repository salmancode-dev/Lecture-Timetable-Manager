import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import {
  getDayOfWeek,
  getYear,
  formatDisplayDate,
  isToday,
  getWeekStartKey,
  formatWeekLabel,
} from '../utils/dateHelpers';
import LectureCard from './LectureCard';
import EmptyState from './EmptyState';

export default function TimetableTable({
  lectures,
  subjectsMap,
  groupByWeek = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddFirst,
}) {
  // Always call useMemo unconditionally at the top level
  const groupedData = useMemo(() => {
    if (!groupByWeek) return null;
    const groups = {};
    lectures.forEach((lec) => {
      const weekKey = getWeekStartKey(lec.date);
      if (!groups[weekKey]) {
        groups[weekKey] = [];
      }
      groups[weekKey].push(lec);
    });
    return groups;
  }, [groupByWeek, lectures]);

  if (lectures.length === 0) {
    return (
      <EmptyState
        title="No lectures match your criteria"
        description="Try changing your search, filters, or add a new lecture."
        actionLabel={onAddFirst ? 'Add Lecture' : undefined}
        onAction={onAddFirst}
      />
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'attended':
        return {
          label: 'Attended',
          icon: CheckCircle2,
          className:
            'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
        };
      case 'missed':
        return {
          label: 'Missed',
          icon: XCircle,
          className:
            'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
        };
      default:
        return {
          label: 'Upcoming',
          icon: Clock,
          className:
            'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/80',
        };
    }
  };

  const renderDesktopRows = (lectureList) => (
    <AnimatePresence mode="popLayout">
      {lectureList.map((lec) => {
        const subject = subjectsMap[lec.subjectId];
        const isDateToday = isToday(lec.date);
        const day = getDayOfWeek(lec.date);
        const year = getYear(lec.date);
        const statusInfo = getStatusBadge(lec.status);
        const StatusIcon = statusInfo.icon;

        return (
          <motion.tr
            layout
            key={lec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={`transition-colors border-b border-slate-100 dark:border-slate-800/70 ${
              isDateToday
                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 font-semibold'
                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900'
            }`}
          >
            {/* Date + Today indicator */}
            <td className="py-3.5 px-4 text-sm whitespace-nowrap">
              <div className="flex items-center gap-2">
                {isDateToday && (
                  <span
                    title="Today's Lecture"
                    className="inline-flex items-center justify-center p-1 rounded-full bg-indigo-600 text-white shrink-0"
                  >
                    <Sparkles className="w-3 h-3 animate-pulse" />
                  </span>
                )}
                <span className={isDateToday ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-900 dark:text-slate-100'}>
                  {formatDisplayDate(lec.date)}
                </span>
              </div>
            </td>

            {/* Day of Week */}
            <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {day}
              </span>
            </td>

            {/* Year */}
            <td className="py-3.5 px-4 text-sm text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
              {year}
            </td>

            {/* Subject */}
            <td className="py-3.5 px-4 text-sm">
              <div className="flex items-center gap-2">
                {subject ? (
                  <span
                    style={{
                      backgroundColor: `${subject.color}15`,
                      color: subject.color,
                      borderColor: `${subject.color}35`,
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border"
                  >
                    <span
                      style={{ backgroundColor: subject.color }}
                      className="w-2 h-2 rounded-full shrink-0"
                    />
                    {subject.code ? `${subject.code} · ` : ''}
                    {subject.name}
                  </span>
                ) : (
                  <span className="text-slate-400 italic text-xs">Unknown Subject</span>
                )}
              </div>
              {lec.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md line-clamp-1">
                  {lec.notes}
                </p>
              )}
            </td>

            {/* Lecture No. */}
            <td className="py-3.5 px-4 text-sm whitespace-nowrap">
              <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                {lec.lectureNumber}
              </span>
            </td>

            {/* Status (Clickable Quick Toggle) */}
            <td className="py-3.5 px-4 text-sm whitespace-nowrap no-print">
              <button
                type="button"
                onClick={() => onToggleStatus(lec.id)}
                title="Click to change status"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 cursor-pointer hover:shadow-xs ${statusInfo.className}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{statusInfo.label}</span>
              </button>
            </td>

            {/* Status (Print only static view) */}
            <td className="py-3.5 px-4 text-sm whitespace-nowrap hidden print:table-cell">
              <span className="font-semibold capitalize text-slate-900">{lec.status}</span>
            </td>

            {/* Actions */}
            <td className="py-3.5 px-4 text-sm text-right whitespace-nowrap no-print">
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(lec)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit lecture"
                  aria-label="Edit lecture"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(lec)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Delete lecture"
                  aria-label="Delete lecture"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </motion.tr>
        );
      })}
    </AnimatePresence>
  );

  return (
    <div>
      {/* MOBILE VIEW: Stacked Cards (Hidden on md and up, visible on small screens) */}
      <div className="block md:hidden space-y-3.5 no-print">
        {groupByWeek && groupedData ? (
          Object.keys(groupedData).map((weekKey) => (
            <div key={weekKey} className="space-y-2.5">
              <div className="flex items-center gap-2 pt-2 pb-1 px-1">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {formatWeekLabel(weekKey)}
                </h3>
              </div>
              <AnimatePresence mode="popLayout">
                {groupedData[weekKey].map((lec) => (
                  <LectureCard
                    key={lec.id}
                    lecture={lec}
                    subject={subjectsMap[lec.subjectId]}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                  />
                ))}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {lectures.map((lec) => (
              <LectureCard
                key={lec.id}
                lecture={lec}
                subject={subjectsMap[lec.subjectId]}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* DESKTOP VIEW: Clean Table (Hidden on mobile, visible on desktop / print) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
        <table className="w-full text-left border-collapse print-table">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Day</th>
              <th className="py-3.5 px-4">Year</th>
              <th className="py-3.5 px-4">Subject</th>
              <th className="py-3.5 px-4">Lecture No.</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupByWeek && groupedData ? (
              Object.keys(groupedData).map((weekKey) => (
                <React.Fragment key={weekKey}>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700">
                    <td
                      colSpan={7}
                      className="py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-indigo-500" />
                        <span>{formatWeekLabel(weekKey)}</span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          ({groupedData[weekKey].length} lectures)
                        </span>
                      </div>
                    </td>
                  </tr>
                  {renderDesktopRows(groupedData[weekKey])}
                </React.Fragment>
              ))
            ) : (
              renderDesktopRows(lectures)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
