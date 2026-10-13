import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Plus,
  Layers,
  ArrowRight,
  Sparkles,
  BookOpen,
  CalendarDays,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getTodayString,
  formatDisplayDate,
  getDayOfWeek,
} from '../utils/dateHelpers';
import LectureForm from '../components/LectureForm';
import BulkLectureForm from '../components/BulkLectureForm';

export default function Dashboard() {
  const { subjects, lectures, settings, subjectsMap, toggleLectureStatus, addLecture } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const todayStr = getTodayString();

  // Filter today's lectures
  const todayLectures = useMemo(() => {
    return lectures
      .filter((l) => l.date === todayStr)
      .sort((a, b) => Number(a.lectureNumber) - Number(b.lectureNumber));
  }, [lectures, todayStr]);

  // Next upcoming lectures (future dates or upcoming status today)
  const upcomingLectures = useMemo(() => {
    return lectures
      .filter((l) => l.date >= todayStr && l.status === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date) || Number(a.lectureNumber) - Number(b.lectureNumber))
      .slice(0, 5);
  }, [lectures, todayStr]);

  // Overall Stats
  const stats = useMemo(() => {
    const total = lectures.length;
    const attended = lectures.filter((l) => l.status === 'attended').length;
    const upcoming = lectures.filter((l) => l.status === 'upcoming').length;
    const missed = lectures.filter((l) => l.status === 'missed').length;
    const completedOrMissed = attended + missed;
    const attendanceRate =
      completedOrMissed > 0 ? Math.round((attended / completedOrMissed) * 100) : 100;

    return { total, attended, upcoming, missed, attendanceRate };
  }, [lectures]);

  // Per subject stats
  const subjectStats = useMemo(() => {
    return subjects.map((subj) => {
      const subLectures = lectures.filter((l) => l.subjectId === subj.id);
      const total = subLectures.length;
      const attended = subLectures.filter((l) => l.status === 'attended').length;
      const upcoming = subLectures.filter((l) => l.status === 'upcoming').length;
      const missed = subLectures.filter((l) => l.status === 'missed').length;
      const rate = total > 0 ? Math.round((attended / (attended + missed || 1)) * 100) : 0;
      return {
        ...subj,
        total,
        attended,
        upcoming,
        missed,
        rate,
      };
    });
  }, [subjects, lectures]);

  const statCards = [
    {
      title: 'Total Lectures',
      value: stats.total,
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      border: 'border-indigo-100 dark:border-indigo-900/50',
    },
    {
      title: 'Attended',
      value: stats.attended,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-100 dark:border-emerald-900/50',
    },
    {
      title: 'Upcoming',
      value: stats.upcoming,
      icon: Clock,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/50',
      border: 'border-sky-100 dark:border-sky-900/50',
    },
    {
      title: 'Missed',
      value: stats.missed,
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      border: 'border-rose-100 dark:border-rose-900/50',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{settings.semesterName || 'University Timetable'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to your Schedule Hub
            </h1>
            <p className="text-sm text-indigo-100/80 max-w-xl">
              Track university lectures, monitor subject attendance rates, and manage your weekly classes without manual Word documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAddOpen(true)}
              className="px-4.5 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Lecture</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsBulkOpen(true)}
              className="px-4.5 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-600/80 border border-indigo-500/30 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Bulk Add</span>
            </motion.button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`p-5 rounded-2xl border ${card.border} ${card.bg} transition-transform hover:-translate-y-0.5 shadow-xs`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {card.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Attendance Rate Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Overall Class Attendance
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.attended} attended out of {stats.attended + stats.missed} held classes
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-64">
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              style={{ width: `${stats.attendanceRate}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                stats.attendanceRate >= 75
                  ? 'bg-emerald-500'
                  : stats.attendanceRate >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          </div>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
            {stats.attendanceRate}%
          </span>
        </div>
      </div>

      {/* Two Column Grid: Today's Schedule & Upcoming Lectures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Lectures */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Today's Lectures
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {formatDisplayDate(todayStr)}
            </span>
          </div>

          {todayLectures.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No lectures scheduled for today! 🎉
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Enjoy your free time or prepare for upcoming classes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayLectures.map((lec) => {
                const sub = subjectsMap[lec.subjectId];
                return (
                  <div
                    key={lec.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {sub && (
                        <div
                          style={{ backgroundColor: sub.color }}
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {sub?.code || sub?.name || 'Lecture'}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            #Lec {lec.lectureNumber}
                          </span>
                        </div>
                        {sub?.code && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {sub.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleLectureStatus(lec.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-transform active:scale-95 cursor-pointer ${
                        lec.status === 'attended'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : lec.status === 'missed'
                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                      }`}
                    >
                      {lec.status}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Next Upcoming Lectures */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Next Upcoming
              </h2>
            </div>
            <Link
              to="/timetable"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingLectures.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No upcoming lectures found.
              </p>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Schedule a new lecture
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingLectures.map((lec) => {
                const sub = subjectsMap[lec.subjectId];
                return (
                  <div
                    key={lec.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {sub && (
                        <div
                          style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border"
                        >
                          {sub.code ? sub.code.slice(0, 4) : 'LEC'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {sub?.name || 'Lecture'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Lecture #{lec.lectureNumber} • {formatDisplayDate(lec.date)} ({getDayOfWeek(lec.date)})
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold">
                      Upcoming
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subject Overview & Progress Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Subject Overview ({subjects.length})
            </h2>
          </div>
          <Link
            to="/subjects"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Manage Subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectStats.map((sub) => (
            <div
              key={sub.id}
              className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  style={{
                    backgroundColor: `${sub.color}15`,
                    color: sub.color,
                    borderColor: `${sub.color}30`,
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                >
                  {sub.code || 'COURSE'}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {sub.total} {sub.total === 1 ? 'class' : 'classes'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {sub.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ {sub.attended}
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 font-medium">
                    ⏳ {sub.upcoming}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    ✕ {sub.missed}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>Attendance</span>
                  <span>{sub.rate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    style={{
                      width: `${sub.rate}%`,
                      backgroundColor: sub.color,
                    }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <LectureForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addLecture}
      />

      <BulkLectureForm
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
      />
    </div>
  );
}
