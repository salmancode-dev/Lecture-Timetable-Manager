import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  Moon,
  Sun,
  GraduationCap,
  Database,
  FileJson,
  Cloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { exportDataAsJSON, validateImportData } from '../utils/exportImport';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Settings() {
  const {
    subjects,
    lectures,
    settings,
    updateSettings,
    clearSampleData,
    resetData,
    importData,
    addToast,
    currentUser,
    isCloudSyncing,
    isFirebaseConfigured,
    openAuthModal,
  } = useApp();

  const { theme, setTheme } = useTheme();

  const [semesterName, setSemesterName] = useState(settings.semesterName || '');
  const [isSavedSemester, setIsSavedSemester] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [importError, setImportError] = useState('');

  const fileInputRef = useRef(null);

  const handleSaveSemester = (e) => {
    e.preventDefault();
    updateSettings({ semesterName: semesterName.trim() });
    setIsSavedSemester(true);
    setTimeout(() => setIsSavedSemester(false), 2000);
  };

  const handleExport = () => {
    exportDataAsJSON({ subjects, lectures, settings });
    addToast('Timetable backup exported as JSON!', 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target.result);
        const validated = validateImportData(rawJson);
        importData(validated);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setImportError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read selected file.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure semester metadata, appearance, backups, and local storage data
        </p>
      </div>

      {/* Card 1: Semester Info */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Academic Semester
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the semester title shown on your timetable header
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSemester} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            value={semesterName}
            onChange={(e) => setSemesterName(e.target.value)}
            placeholder="e.g. 4th Semester (Computer Science)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSavedSemester ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Name</span>
            )}
          </motion.button>
        </form>
      </div>

      {/* Card 2: Appearance & Theme */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Appearance Theme
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toggle between modern dark mode and light theme
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 max-w-sm">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-400/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 ring-2 ring-indigo-400/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-300" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Card 2.5: Cloud Database & Cross-Device Sync */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Cloud Database (Cross-Device Sync)
                {currentUser && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Synced
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser
                  ? `Signed in as ${currentUser.email} — all changes sync in real-time across your PC, Mobile, and devices.`
                  : 'Connect Google or Email account to keep your timetable automatically synced on both PC and Mobile.'}
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAuthModal}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              currentUser
                ? 'border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>{currentUser ? 'Manage Cloud Account' : 'Connect Cloud Database'}</span>
          </motion.button>
        </div>
      </div>

      {/* Card 3: Data Backup & Restore */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Backup & Restore (JSON)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export your entire timetable to a file or restore from a previous backup
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="px-4.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Data as JSON</span>
          </motion.button>

          {/* Import Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
              id="json-file-input"
            />
            <motion.label
              htmlFor="json-file-input"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>Import Data from JSON</span>
            </motion.label>
          </div>
        </div>

        {importError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-medium text-rose-700 dark:text-rose-300">
            {importError}
          </div>
        )}
      </div>

      {/* Card 4: LocalStorage Management & Reset */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Reset
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Currently storing {subjects.length} subjects and {lectures.length} lectures in your browser
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Clear sample data button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setConfirmClearOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </motion.button>

          {/* Reset to sample data button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setConfirmResetOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-indigo-500" />
            <span>Restore 8 Sample Subjects</span>
          </motion.button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear All Timetable Data?"
        message="This will delete all subjects and lectures from your browser's localStorage. You will start with an empty timetable."
        confirmText="Clear All Data"
        onConfirm={clearSampleData}
      />

      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Restore Sample Data?"
        message="This will replace current subjects and lectures with the 8 default university subjects and example lectures."
        confirmText="Restore Sample Data"
        isDestructive={false}
        onConfirm={resetData}
      />
    </div>
  );
}
