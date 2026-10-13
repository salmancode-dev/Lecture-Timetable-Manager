import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { getTodayString, getDayOfWeek, getYear, formatDisplayDate, generateSequenceDates } from '../utils/dateHelpers';
import { getNextLectureNumber } from '../utils/lectureHelpers';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

// Mapping: 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
const WEEKDAYS = [
  { index: 1, label: 'Mon' },
  { index: 2, label: 'Tue' },
  { index: 3, label: 'Wed' },
  { index: 4, label: 'Thu' },
  { index: 5, label: 'Fri' },
  { index: 6, label: 'Sat' },
  { index: 0, label: 'Sun' },
];

export default function BulkLectureForm({ isOpen, onClose }) {
  const { subjects, lectures, bulkAddLectures } = useApp();

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [startDate, setStartDate] = useState(getTodayString());
  const [selectedDays, setSelectedDays] = useState([1, 3]); // Mon & Wed by default
  const [lectureCount, setLectureCount] = useState(8);
  const [startLectureNumber, setStartLectureNumber] = useState(1);
  const [notesTemplate, setNotesTemplate] = useState('');
  const [error, setError] = useState('');

  // Auto set start lecture number when subject changes
  useEffect(() => {
    if (subjectId) {
      const nextNum = getNextLectureNumber(subjectId, lectures);
      setStartLectureNumber(nextNum);
    }
  }, [subjectId, lectures, isOpen]);

  // Toggle weekday selection
  const toggleDay = (dayIndex) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((d) => d !== dayIndex);
      }
      return [...prev, dayIndex].sort((a, b) => a - b);
    });
  };

  // Generate sequence preview
  const previewList = useMemo(() => {
    if (!startDate || selectedDays.length === 0 || lectureCount <= 0) return [];
    const dates = generateSequenceDates(startDate, selectedDays, lectureCount);
    
    return dates.map((dateStr, idx) => {
      const lecNum = Number(startLectureNumber) + idx;
      return {
        subjectId,
        lectureNumber: lecNum,
        date: dateStr,
        dayOfWeek: getDayOfWeek(dateStr),
        year: getYear(dateStr),
        notes: notesTemplate ? `${notesTemplate} (Part ${idx + 1})` : '',
        status: 'upcoming',
      };
    });
  }, [startDate, selectedDays, lectureCount, startLectureNumber, subjectId, notesTemplate]);

  const handleSave = () => {
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (previewList.length === 0) {
      setError('No lectures generated. Check your start date and weekdays.');
      return;
    }

    bulkAddLectures(previewList);
    onClose();
  };

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Add Lectures"
      subtitle="Auto-generate a recurring lecture series with sequential numbers"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Step 1: Subject Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Subject <span className="text-rose-500">*</span>
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `[${s.code}] ` : ''}{s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Number of Lectures */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Lecture Count
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={lectureCount}
              onChange={(e) => setLectureCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Starting Lecture Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Start Lecture #
            </label>
            <input
              type="number"
              min="1"
              value={startLectureNumber}
              onChange={(e) => setStartLectureNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Weekdays Multi-selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Weekly Schedule Days
          </label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const isSelected = selectedDays.includes(day.index);
              return (
                <button
                  key={day.index}
                  type="button"
                  onClick={() => toggleDay(day.index)}
                  className={`flex-1 min-w-[50px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Notes Template */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Default Notes / Topic Prefix <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={notesTemplate}
            onChange={(e) => setNotesTemplate(e.target.value)}
            placeholder="e.g. Unit 3: Distributed Hash Tables"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Live Preview Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Live Preview ({previewList.length} lectures)
            </span>
            {selectedSubject && (
              <span
                style={{ backgroundColor: `${selectedSubject.color}20`, color: selectedSubject.color }}
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              >
                {selectedSubject.code || selectedSubject.name}
              </span>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            {previewList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 min-w-[70px]">
                    Lecture #{item.lectureNumber}
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatDisplayDate(item.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    {item.dayOfWeek}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[10px] font-semibold">
                    Upcoming
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={previewList.length === 0}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Generate & Save ({previewList.length})
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
