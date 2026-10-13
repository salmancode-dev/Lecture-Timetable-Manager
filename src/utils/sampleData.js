import { getTodayString } from './dateHelpers';

export const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500' },
  { name: 'Violet', value: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500' },
  { name: 'Emerald', value: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-500' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500' },
  { name: 'Rose', value: '#f43f5e', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500' },
  { name: 'Purple', value: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
];

export const INITIAL_SETTINGS = {
  semesterName: '4th Semester (Computer Science)',
  theme: 'system', // 'light' | 'dark' | 'system'
};

export const INITIAL_SUBJECTS = [
  {
    id: 'subj-1',
    name: 'Algorithms & Data Structures',
    code: 'CS301',
    color: '#3b82f6', // Blue
  },
  {
    id: 'subj-2',
    name: 'Database Management Systems',
    code: 'CS302',
    color: '#10b981', // Emerald
  },
  {
    id: 'subj-3',
    name: 'Operating Systems',
    code: 'CS303',
    color: '#8b5cf6', // Violet
  },
  {
    id: 'subj-4',
    name: 'Computer Networks',
    code: 'CS304',
    color: '#06b6d4', // Cyan
  },
  {
    id: 'subj-5',
    name: 'Software Engineering',
    code: 'CS305',
    color: '#f59e0b', // Amber
  },
  {
    id: 'subj-6',
    name: 'Artificial Intelligence',
    code: 'CS306',
    color: '#f43f5e', // Rose
  },
  {
    id: 'subj-7',
    name: 'Web Technologies',
    code: 'CS307',
    color: '#6366f1', // Indigo
  },
  {
    id: 'subj-8',
    name: 'Probability & Statistics',
    code: 'MA301',
    color: '#14b8a6', // Teal
  },
];

export function getInitialLectures() {
  const today = getTodayString(); // e.g. 2026-10-12

  // Derive dynamic dates relative to today
  const d = new Date();
  
  const formatDateOffset = (daysOffset) => {
    const target = new Date(d);
    target.setDate(target.getDate() + daysOffset);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return [
    {
      id: 'lec-1',
      subjectId: 'subj-1',
      lectureNumber: 1,
      date: formatDateOffset(-7),
      notes: 'Asymptotic notation, Big-O, recurrence relations.',
      status: 'attended',
    },
    {
      id: 'lec-2',
      subjectId: 'subj-2',
      lectureNumber: 1,
      date: formatDateOffset(-6),
      notes: 'Relational model, primary & foreign keys, ER diagrams.',
      status: 'attended',
    },
    {
      id: 'lec-3',
      subjectId: 'subj-3',
      lectureNumber: 1,
      date: formatDateOffset(-5),
      notes: 'Process scheduling, PCB structure, context switching.',
      status: 'attended',
    },
    {
      id: 'lec-4',
      subjectId: 'subj-4',
      lectureNumber: 1,
      date: formatDateOffset(-4),
      notes: 'OSI 7-layer reference model vs TCP/IP stack.',
      status: 'attended',
    },
    {
      id: 'lec-5',
      subjectId: 'subj-5',
      lectureNumber: 1,
      date: formatDateOffset(-3),
      notes: 'Agile vs Waterfall methodologies overview.',
      status: 'missed',
    },
    {
      id: 'lec-6',
      subjectId: 'subj-1',
      lectureNumber: 2,
      date: today, // TODAY!
      notes: 'Divide and Conquer: Merge Sort and Quick Sort complexities.',
      status: 'upcoming',
    },
    {
      id: 'lec-7',
      subjectId: 'subj-2',
      lectureNumber: 2,
      date: today, // TODAY!
      notes: 'SQL DDL & DML deep dive: joins, subqueries, grouping.',
      status: 'upcoming',
    },
    {
      id: 'lec-8',
      subjectId: 'subj-6',
      lectureNumber: 1,
      date: formatDateOffset(1),
      notes: 'Search algorithms: BFS, DFS, heuristic search intro.',
      status: 'upcoming',
    },
    {
      id: 'lec-9',
      subjectId: 'subj-3',
      lectureNumber: 2,
      date: formatDateOffset(2),
      notes: 'Thread synchronization, mutexes, semaphores and deadlocks.',
      status: 'upcoming',
    },
    {
      id: 'lec-10',
      subjectId: 'subj-7',
      lectureNumber: 1,
      date: formatDateOffset(3),
      notes: 'Modern DOM, Event loop, ES6+ async/await.',
      status: 'upcoming',
    },
    {
      id: 'lec-11',
      subjectId: 'subj-8',
      lectureNumber: 1,
      date: formatDateOffset(4),
      notes: 'Conditional probability, Bayes theorem applications.',
      status: 'upcoming',
    },
    {
      id: 'lec-12',
      subjectId: 'subj-1',
      lectureNumber: 3,
      date: formatDateOffset(7),
      notes: 'Dynamic programming: Knapsack, Longest Common Subsequence.',
      status: 'upcoming',
    },
  ];
}
