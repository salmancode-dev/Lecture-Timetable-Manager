import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PRESET_COLORS } from '../utils/sampleData';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubjectForm({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
}) {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setColor(initialData.color || PRESET_COLORS[0].value);
    } else {
      setName('');
      setCode('');
      setColor(PRESET_COLORS[0].value);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Subject name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      color,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Subject' : 'Add New Subject'}
      subtitle="Configure subject details and color theme"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Subject Name */}
        <div>
          <label
            htmlFor="subject-name"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
          >
            Subject Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="subject-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Distributed Systems"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 ${
              errors.name
                ? 'border-rose-400 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Subject Code (Optional) */}
        <div>
          <label
            htmlFor="subject-code"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
          >
            Course Code <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            id="subject-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CS401"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase"
          />
        </div>

        {/* Color Palette Picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Badge Color Theme
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-5 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            {PRESET_COLORS.map((preset) => {
              const isSelected = color.toLowerCase() === preset.value.toLowerCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setColor(preset.value)}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div
                    style={{ backgroundColor: preset.value }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-transform duration-150 ${
                      isSelected
                        ? 'scale-110 ring-3 ring-offset-2 ring-indigo-500 ring-offset-white dark:ring-offset-slate-900 shadow-md'
                        : 'group-hover:scale-105 opacity-85 group-hover:opacity-100'
                    }`}
                  >
                    {isSelected && <Check className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            {isEditing ? 'Save Changes' : 'Create Subject'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
