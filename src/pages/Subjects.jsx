import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SubjectForm from '../components/SubjectForm';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

export default function Subjects() {
  const { subjects, lectures, addSubject, updateSubject, deleteSubject } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);

  // Subject lecture counts lookup
  const getSubjectCounts = (subjectId) => {
    const list = lectures.filter((l) => l.subjectId === subjectId);
    const total = list.length;
    const attended = list.filter((l) => l.status === 'attended').length;
    const upcoming = list.filter((l) => l.status === 'upcoming').length;
    const missed = list.filter((l) => l.status === 'missed').length;
    return { total, attended, upcoming, missed };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Subjects & Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your registered courses and customized schedule colors
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Subject</span>
        </motion.button>
      </div>

      {/* Grid of Subject Cards */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No subjects registered"
          description="Create your first subject to start scheduling and tracking university lectures."
          actionLabel="Add Subject"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {subjects.map((subj) => {
              const counts = getSubjectCounts(subj.id);

              return (
                <motion.div
                  key={subj.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Color Indicator & Code & Action Buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{ backgroundColor: subj.color }}
                          className="w-4 h-4 rounded-full shadow-xs shrink-0 ring-2 ring-white dark:ring-slate-900"
                        />
                        {subj.code ? (
                          <span
                            style={{
                              backgroundColor: `${subj.color}15`,
                              color: subj.color,
                              borderColor: `${subj.color}30`,
                            }}
                            className="px-2.5 py-0.5 rounded-md text-xs font-bold border"
                          >
                            {subj.code}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">No Code</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingSubject(subj)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit subject"
                          aria-label="Edit subject"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSubject(subj)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete subject"
                          aria-label="Delete subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subject Name */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {subj.name}
                    </h3>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Total
                        </div>
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {counts.total}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-500">
                          Attended
                        </div>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {counts.attended}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-sky-500">
                          Upcoming
                        </div>
                        <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400">
                          {counts.upcoming}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {counts.missed > 0 ? `${counts.missed} missed` : 'No missed lectures'}
                    </span>
                    <span
                      style={{ color: subj.color }}
                      className="font-bold cursor-pointer hover:underline"
                      onClick={() => setEditingSubject(subj)}
                    >
                      Configure →
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <SubjectForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addSubject}
      />

      {/* Edit Modal */}
      <SubjectForm
        isOpen={Boolean(editingSubject)}
        onClose={() => setEditingSubject(null)}
        initialData={editingSubject}
        onSubmit={updateSubject}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingSubject)}
        onClose={() => setDeletingSubject(null)}
        title={`Delete "${deletingSubject?.name}"?`}
        message={`Deleting this subject will permanently remove all of its scheduled lectures (${
          lectures.filter((l) => l.subjectId === deletingSubject?.id).length
        } lectures). Are you sure?`}
        confirmText="Delete Subject & Lectures"
        onConfirm={() => {
          if (deletingSubject) {
            deleteSubject(deletingSubject.id, deletingSubject.name);
            setDeletingSubject(null);
          }
        }}
      />
    </div>
  );
}
