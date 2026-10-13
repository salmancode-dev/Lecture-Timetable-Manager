import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import LectureForm from './components/LectureForm';
import AuthModal from './components/AuthModal';

// Pages
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Subjects from './pages/Subjects';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function MainLayout() {
  const { addLecture, isAuthModalOpen, closeAuthModal, currentUser, isCloudSyncing } = useApp();
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar onOpenAddLecture={() => setIsGlobalAddOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        <AnimatedRoutes />
      </main>

      {/* Mobile Bottom Bar */}
      <BottomNav />

      {/* Global Toast Stack */}
      <Toast />

      {/* Quick Add Lecture from Navbar */}
      <LectureForm
        isOpen={isGlobalAddOpen}
        onClose={() => setIsGlobalAddOpen(false)}
        onSubmit={addLecture}
      />

      {/* Global Cloud Sync / Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        user={currentUser}
        isSyncing={isCloudSyncing}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
