import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Layers,
  Printer,
  ArrowUpDown,
  CalendarDays,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { filterAndSortLectures } from '../utils/lectureHelpers';
import { formatMonthLabel } from '../utils/dateHelpers';
import TimetableTable from '../components/TimetableTable';
import LectureForm from '../components/LectureForm';
import BulkLectureForm from '../components/BulkLectureForm';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Timetable() {
  const {
    subjects,
    lectures,
    subjectsMap,
    addLecture,
    updateLecture,
    deleteLecture,
    toggleLectureStatus,
  } = useApp();

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [groupByWeek, setGroupByWeek] = useState(false);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [deletingLecture, setDeletingLecture] = useState(null);

  // Available unique months for filtering dropdown
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    lectures.forEach((l) => {
      if (l.date) {
        monthsSet.add(l.date.slice(0, 7)); // YYYY-MM
      }
    });
    return Array.from(monthsSet).sort();
  }, [lectures]);

  // Filtered and sorted lectures
  const filteredLectures = useMemo(() => {
    return filterAndSortLectures(lectures, {
      subjectId: selectedSubject,
      month: selectedMonth,
      status: selectedStatus,
      search,
      sortOrder,
      subjectsMap,
    });
  }, [
    lectures,
    selectedSubject,
    selectedMonth,
    selectedStatus,
    search,
    sortOrder,
    subjectsMap,
  ]);

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSubject('all');
    setSelectedMonth('all');
    setSelectedStatus('all');
    setSortOrder('asc');
  };

  const hasActiveFilters =
    search || selectedSubject !== 'all' || selectedMonth !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Lecture Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Displaying {filteredLectures.length} of {lectures.length} total scheduled lectures
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            title="Download PDF via browser print view"
          >
            <Printer className="w-4 h-4 text-indigo-500" />
            <span>Print / PDF</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsBulkOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Bulk Add</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Lecture</span>
          </motion.button>
        </div>
      </div>

      {/* Printable Heading (Only visible in Print stylesheet) */}
      <div className="hidden print-only mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">University Lecture Timetable</h1>
        <p className="text-sm text-gray-600">
          Generated schedule • {filteredLectures.length} classes listed
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 no-print">
        {/* Top search & quick toggles */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, code, topic, or lecture number..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Group by Week & Sort Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Group by week button */}
            <button
              type="button"
              onClick={() => setGroupByWeek(!groupByWeek)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                groupByWeek
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
              title="Toggle Group By Week"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Group by Week</span>
            </button>

            {/* Sort order button */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title={`Sort by Date: currently ${sortOrder === 'asc' ? 'Oldest to Newest' : 'Newest to Oldest'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span>{sortOrder === 'asc' ? 'Date (Asc)' : 'Date (Desc)'}</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Subjects ({subjects.length})</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code ? `[${s.code}] ` : ''}{s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Months</option>
              {availableMonths.map((mKey) => (
                <option key={mKey} value={mKey}>
                  {formatMonthLabel(mKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming only</option>
              <option value="attended">Attended only</option>
              <option value="missed">Missed only</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table / Cards view */}
      <TimetableTable
        lectures={filteredLectures}
        subjectsMap={subjectsMap}
        groupByWeek={groupByWeek}
        onEdit={(lec) => setEditingLecture(lec)}
        onDelete={(lec) => setDeletingLecture(lec)}
        onToggleStatus={toggleLectureStatus}
        onAddFirst={() => setIsAddOpen(true)}
      />

      {/* Edit Lecture Modal */}
      <LectureForm
        isOpen={Boolean(editingLecture)}
        onClose={() => setEditingLecture(null)}
        initialData={editingLecture}
        onSubmit={updateLecture}
      />

      {/* Add Single Lecture Modal */}
      <LectureForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addLecture}
      />

      {/* Bulk Add Lectures Modal */}
      <BulkLectureForm
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingLecture)}
        onClose={() => setDeletingLecture(null)}
        title="Delete Lecture"
        message={`Are you sure you want to delete Lecture #${deletingLecture?.lectureNumber} for ${
          subjectsMap[deletingLecture?.subjectId]?.name || 'this subject'
        }?`}
        confirmText="Delete Lecture"
        onConfirm={() => {
          if (deletingLecture) {
            deleteLecture(deletingLecture.id);
            setDeletingLecture(null);
          }
        }}
      />
    </div>
  );
}
