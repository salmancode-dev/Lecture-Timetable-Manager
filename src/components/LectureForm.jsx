import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { getTodayString, getDayOfWeek, getYear, formatDisplayDate } from '../utils/dateHelpers';
import { getNextLectureNumber, isDuplicateLectureNumber } from '../utils/lectureHelpers';
import { AlertCircle, Calendar, Hash, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LectureForm({
  isOpen,
  onClose,
  initialData = null,
  preselectedSubjectId = null,
  onSubmit,
}) {
  const { subjects, lectures } = useApp();
  const isEditing = Boolean(initialData);

  const defaultSubjectId = preselectedSubjectId || subjects[0]?.id || '';
  const [subjectId, setSubjectId] = useState(defaultSubjectId);
  const [lectureNumber, setLectureNumber] = useState('1');
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [errors, setErrors] = useState({});

  // Reset or populate fields when modal opens
  useEffect(() => {
    if (initialData) {
      setSubjectId(initialData.subjectId || defaultSubjectId);
      setLectureNumber(String(initialData.lectureNumber || '1'));
      setDate(initialData.date || getTodayString());
      setNotes(initialData.notes || '');
      setStatus(initialData.status || 'upcoming');
    } else {
      const activeSubjectId = preselectedSubjectId || subjects[0]?.id || '';
      setSubjectId(activeSubjectId);
      const nextNum = getNextLectureNumber(activeSubjectId, lectures);
      setLectureNumber(String(nextNum));
      setDate(getTodayString());
      setNotes('');
      setStatus('upcoming');
    }
    setErrors({});
  }, [initialData, isOpen, preselectedSubjectId, subjects, lectures]);

  // When subject changes in ADD mode, auto-suggest the next lecture number
  const handleSubjectChange = (newSubId) => {
    setSubjectId(newSubId);
    if (!isEditing) {
      const nextNum = getNextLectureNumber(newSubId, lectures);
      setLectureNumber(String(nextNum));
    }
  };

  // Check for duplicate lecture number warning
  const isDuplicate = useMemo(() => {
    if (!subjectId || !lectureNumber) return false;
    return isDuplicateLectureNumber(
      subjectId,
      lectureNumber,
      initialData?.id,
      lectures
    );
  }, [subjectId, lectureNumber, initialData, lectures]);

  // Derived values from date
  const derivedDay = useMemo(() => getDayOfWeek(date), [date]);
  const derivedYear = useMemo(() => getYear(date), [date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!subjectId) {
      newErrors.subjectId = 'Please select a subject';
    }

    const numVal = parseInt(lectureNumber, 10);
    if (!lectureNumber || isNaN(numVal) || numVal <= 0) {
      newErrors.lectureNumber = 'Lecture number must be a positive integer';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      id: initialData?.id,
      subjectId,
      lectureNumber: numVal,
      date,
      notes: notes.trim(),
      status,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Lecture' : 'Add New Lecture'}
      subtitle={isEditing ? 'Update lecture schedule and status' : 'Enter details for the lecture entry'}
    >
      <form onSubmit={handleSubmit} className="space-y-4.5">
        {/* Subject Select */}
        <div>
          <label
            htmlFor="lecture-subject"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            Subject <span className="text-rose-500">*</span>
          </label>
          {subjects.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
              No subjects found. Please create a subject first in the Subjects page.
            </div>
          ) : (
            <select
              id="lecture-subject"
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code ? `[${s.code}] ` : ''}{s.name}
                </option>
              ))}
            </select>
          )}
          {errors.subjectId && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.subjectId}</p>
          )}
        </div>

        {/* Lecture Number & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lecture Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="lecture-number"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                <Hash className="w-3.5 h-3.5 text-indigo-500" />
                Lecture No. <span className="text-rose-500">*</span>
              </label>
              {!isEditing && (
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  Auto-suggested
                </span>
              )}
            </div>
            <input
              id="lecture-number"
              type="number"
              min="1"
              value={lectureNumber}
              onChange={(e) => {
                setLectureNumber(e.target.value);
                if (errors.lectureNumber) setErrors((prev) => ({ ...prev, lectureNumber: '' }));
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
                errors.lectureNumber
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
              }`}
            />
            {errors.lectureNumber && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.lectureNumber}</p>
            )}
            {isDuplicate && !errors.lectureNumber && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Notice: Lecture #{lectureNumber} already exists for this subject.</span>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label
              htmlFor="lecture-date"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="lecture-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {errors.date && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Auto-derived day of week and year badges */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Derived automatically:</span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold">
            {derivedDay}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
            Year {derivedYear}
          </span>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-500 text-[11px]">
            ({formatDisplayDate(date)})
          </span>
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Attendance Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'upcoming', label: 'Upcoming', activeClass: 'bg-sky-500 text-white' },
              { id: 'attended', label: 'Attended', activeClass: 'bg-emerald-500 text-white' },
              { id: 'missed', label: 'Missed', activeClass: 'bg-rose-500 text-white' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatus(st.id)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  status === st.id
                    ? `${st.activeClass} border-transparent shadow-xs`
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="lecture-notes"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
          >
            Lecture Notes / Topic <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            id="lecture-notes"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Chapter 4: Depth-First Search algorithms & complexity analysis..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={subjects.length === 0}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm transition-colors cursor-pointer"
          >
            {isEditing ? 'Save Changes' : 'Add Lecture'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
