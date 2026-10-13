import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Edit3, Trash2, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react';
import { getDayOfWeek, getYear, formatDisplayDate, isToday } from '../utils/dateHelpers';

export default function LectureCard({
  lecture,
  subject,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const isDateToday = isToday(lecture.date);
  const day = getDayOfWeek(lecture.date);
  const year = getYear(lecture.date);

  const getStatusBadge = () => {
    switch (lecture.status) {
      case 'attended':
        return {
          label: 'Attended',
          icon: CheckCircle2,
          className: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
        };
      case 'missed':
        return {
          label: 'Missed',
          icon: XCircle,
          className: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
        };
      default:
        return {
          label: 'Upcoming',
          icon: Clock,
          className: 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/80',
        };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative p-4 rounded-2xl border transition-all ${
        isDateToday
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600 shadow-md ring-2 ring-indigo-400/30'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
      }`}
    >
      {/* Today Pill */}
      {isDateToday && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold mb-2 shadow-xs">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>TODAY'S LECTURE</span>
        </div>
      )}

      {/* Top Header: Subject Badge & Lecture # */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          {subject && (
            <span
              style={{
                backgroundColor: `${subject.color}18`,
                color: subject.color,
                borderColor: `${subject.color}40`,
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border tracking-wide"
            >
              {subject.code || subject.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-100">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            Lec {lecture.lectureNumber}
          </span>
        </div>

        {/* Quick status toggle button */}
        <button
          type="button"
          onClick={() => onToggleStatus(lecture.id)}
          title="Click to cycle status (Upcoming -> Attended -> Missed)"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-transform active:scale-95 cursor-pointer ${statusInfo.className}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusInfo.label}</span>
        </button>
      </div>

      {/* Subject Name if code was displayed */}
      {subject && subject.code && (
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
          {subject.name}
        </h4>
      )}

      {/* Date, Day, Year Row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {formatDisplayDate(lecture.date)}
        </span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span>{day}</span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span>Year {year}</span>
      </div>

      {/* Notes (if any) */}
      {lecture.notes && (
        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-3 leading-relaxed">
          {lecture.notes}
        </p>
      )}

      {/* Bottom Card Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => onEdit(lecture)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Edit lecture"
          title="Edit lecture"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(lecture)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          aria-label="Delete lecture"
          title="Delete lecture"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
