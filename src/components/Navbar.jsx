import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Settings,
  LayoutDashboard,
  Plus,
  Cloud,
  CheckCircle2,
  Loader2,
  User,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

export default function Navbar({ onOpenAddLecture }) {
  const { settings, currentUser, isCloudSyncing, isFirebaseConfigured, openAuthModal } = useApp();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/timetable', label: 'Timetable', icon: Calendar },
    { to: '/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                UniSchedule
              </span>
              {settings.semesterName && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {settings.semesterName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Lecture Timetable Manager
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Cloud Sync / Profile Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={openAuthModal}
            title={
              currentUser
                ? `Logged in as ${currentUser.email} (Cloud Synced)`
                : isFirebaseConfigured
                ? 'Sign in to sync across devices'
                : 'Connect Cloud Database'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              currentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isCloudSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
            ) : currentUser ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            ) : (
              <Cloud className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            )}
            <span className="hidden sm:inline">
              {currentUser
                ? currentUser.displayName
                  ? currentUser.displayName.split(' ')[0]
                  : 'Synced'
                : 'Cloud Sync'}
            </span>
          </motion.button>

          {onOpenAddLecture && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAddLecture}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Lecture</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
