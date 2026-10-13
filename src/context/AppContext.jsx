import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { INITIAL_SUBJECTS, getInitialLectures, INITIAL_SETTINGS } from '../utils/sampleData';
import { subscribeToAuthChanges } from '../firebase/authService';
import { subscribeToUserData, syncUserDataToCloud } from '../firebase/dbService';
import { isFirebaseConfigured } from '../firebase/config';

const AppContext = createContext();

const STORAGE_KEYS = {
  SUBJECTS: 'timetable_subjects_v1',
  LECTURES: 'timetable_lectures_v1',
  SETTINGS: 'timetable_settings_v1',
  INITIALIZED: 'timetable_seeded_v1',
};

// Initial state loader
function getInitialState() {
  try {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized) {
      // First time user: seed sample data!
      const initialSubs = INITIAL_SUBJECTS;
      const initialLecs = getInitialLectures();
      const initialSets = INITIAL_SETTINGS;
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(initialSubs));
      localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(initialLecs));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSets));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return {
        subjects: initialSubs,
        lectures: initialLecs,
        settings: initialSets,
      };
    }

    const savedSubs = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    const savedLecs = localStorage.getItem(STORAGE_KEYS.LECTURES);
    const savedSets = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    return {
      subjects: savedSubs ? JSON.parse(savedSubs) : [],
      lectures: savedLecs ? JSON.parse(savedLecs) : [],
      settings: savedSets ? JSON.parse(savedSets) : INITIAL_SETTINGS,
    };
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return {
      subjects: INITIAL_SUBJECTS,
      lectures: getInitialLectures(),
      settings: INITIAL_SETTINGS,
    };
  }
}

// Reducer actions
function appReducer(state, action) {
  switch (action.type) {
    // SUBJECTS
    case 'ADD_SUBJECT': {
      const newSubject = {
        ...action.payload,
        id: action.payload.id || `subj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      return {
        ...state,
        subjects: [...state.subjects, newSubject],
      };
    }

    case 'UPDATE_SUBJECT': {
      return {
        ...state,
        subjects: state.subjects.map((sub) =>
          sub.id === action.payload.id ? { ...sub, ...action.payload } : sub
        ),
      };
    }

    case 'DELETE_SUBJECT': {
      const subjectId = action.payload;
      return {
        ...state,
        subjects: state.subjects.filter((sub) => sub.id !== subjectId),
        // Cascade delete: remove all associated lectures
        lectures: state.lectures.filter((lec) => lec.subjectId !== subjectId),
      };
    }

    // LECTURES
    case 'ADD_LECTURE': {
      const newLecture = {
        ...action.payload,
        id: action.payload.id || `lec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        lectureNumber: Number(action.payload.lectureNumber),
        status: action.payload.status || 'upcoming',
      };
      return {
        ...state,
        lectures: [...state.lectures, newLecture],
      };
    }

    case 'BULK_ADD_LECTURES': {
      const newLectures = action.payload.map((lec) => ({
        ...lec,
        id: lec.id || `lec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        lectureNumber: Number(lec.lectureNumber),
        status: lec.status || 'upcoming',
      }));
      return {
        ...state,
        lectures: [...state.lectures, ...newLectures],
      };
    }

    case 'UPDATE_LECTURE': {
      return {
        ...state,
        lectures: state.lectures.map((lec) =>
          lec.id === action.payload.id
            ? { ...lec, ...action.payload, lectureNumber: Number(action.payload.lectureNumber) }
            : lec
        ),
      };
    }

    case 'TOGGLE_LECTURE_STATUS': {
      const { id, nextStatus } = action.payload;
      return {
        ...state,
        lectures: state.lectures.map((lec) => {
          if (lec.id !== id) return lec;
          let status = nextStatus;
          if (!status) {
            // Cycle: upcoming -> attended -> missed -> upcoming
            if (lec.status === 'upcoming') status = 'attended';
            else if (lec.status === 'attended') status = 'missed';
            else status = 'upcoming';
          }
          return { ...lec, status };
        }),
      };
    }

    case 'DELETE_LECTURE': {
      return {
        ...state,
        lectures: state.lectures.filter((lec) => lec.id !== action.payload),
      };
    }

    // SETTINGS
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    }

    // BULK DATA MANAGEMENT
    case 'CLEAR_SAMPLE_DATA': {
      return {
        ...state,
        subjects: [],
        lectures: [],
      };
    }

    case 'RESET_DATA': {
      const defaultSubs = INITIAL_SUBJECTS;
      const defaultLecs = getInitialLectures();
      const defaultSets = INITIAL_SETTINGS;
      return {
        subjects: defaultSubs,
        lectures: defaultLecs,
        settings: defaultSets,
      };
    }

    case 'IMPORT_DATA': {
      const { subjects, lectures, settings } = action.payload;
      return {
        subjects: subjects || [],
        lectures: lectures || [],
        settings: { ...state.settings, ...(settings || {}) },
      };
    }

    case 'SET_FULL_STATE': {
      const { subjects, lectures, settings } = action.payload;
      return {
        subjects: Array.isArray(subjects) ? subjects : [],
        lectures: Array.isArray(lectures) ? lectures : [],
        settings: settings ? { ...state.settings, ...settings } : state.settings,
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, getInitialState);
  const [toasts, setToasts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isReceivingFromCloudRef = useRef(false);

  // Sync to localStorage whenever state changes (offline cache)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(state.subjects));
      localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(state.lectures));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    } catch (e) {
      console.error('Failed to sync to localStorage:', e);
    }
  }, [state]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore real-time timetable data when user is logged in
  useEffect(() => {
    if (!currentUser?.uid) return;

    setIsCloudSyncing(true);
    const unsubscribeDb = subscribeToUserData(
      currentUser.uid,
      (cloudData) => {
        setIsCloudSyncing(false);
        if (cloudData) {
          isReceivingFromCloudRef.current = true;
          dispatch({ type: 'SET_FULL_STATE', payload: cloudData });
          setTimeout(() => {
            isReceivingFromCloudRef.current = false;
          }, 400);
        } else {
          // Cloud doc doesn't exist yet for this account: upload local state to cloud!
          syncUserDataToCloud(currentUser.uid, {
            subjects: state.subjects,
            lectures: state.lectures,
            settings: state.settings,
          });
        }
      },
      (err) => {
        setIsCloudSyncing(false);
        console.error('Cloud sync error:', err);
      }
    );

    return () => unsubscribeDb();
  }, [currentUser?.uid]);

  // Push local updates to Firestore whenever state changes (if logged in)
  useEffect(() => {
    if (!currentUser?.uid || isReceivingFromCloudRef.current) return;

    const timer = setTimeout(() => {
      syncUserDataToCloud(currentUser.uid, {
        subjects: state.subjects,
        lectures: state.lectures,
        settings: state.settings,
      }).catch((err) => {
        console.error('Failed to auto-sync to cloud:', err);
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [state, currentUser?.uid]);

  // Toast notification helper
  const addToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Subject actions
  const addSubject = useCallback((subjectData) => {
    dispatch({ type: 'ADD_SUBJECT', payload: subjectData });
    addToast(`Subject "${subjectData.name}" added successfully!`, 'success');
  }, [addToast]);

  const updateSubject = useCallback((subjectData) => {
    dispatch({ type: 'UPDATE_SUBJECT', payload: subjectData });
    addToast(`Subject updated successfully!`, 'success');
  }, [addToast]);

  const deleteSubject = useCallback((subjectId, subjectName = 'Subject') => {
    dispatch({ type: 'DELETE_SUBJECT', payload: subjectId });
    addToast(`Deleted "${subjectName}" and its related lectures.`, 'info');
  }, [addToast]);

  // Lecture actions
  const addLecture = useCallback((lectureData) => {
    dispatch({ type: 'ADD_LECTURE', payload: lectureData });
    addToast(`Lecture #${lectureData.lectureNumber} added successfully!`, 'success');
  }, [addToast]);

  const bulkAddLectures = useCallback((lecturesList) => {
    dispatch({ type: 'BULK_ADD_LECTURES', payload: lecturesList });
    addToast(`Successfully added ${lecturesList.length} lectures!`, 'success');
  }, [addToast]);

  const updateLecture = useCallback((lectureData) => {
    dispatch({ type: 'UPDATE_LECTURE', payload: lectureData });
    addToast(`Lecture updated successfully!`, 'success');
  }, [addToast]);

  const toggleLectureStatus = useCallback((id, nextStatus) => {
    dispatch({ type: 'TOGGLE_LECTURE_STATUS', payload: { id, nextStatus } });
    addToast(`Lecture status updated.`, 'info');
  }, [addToast]);

  const deleteLecture = useCallback((id) => {
    dispatch({ type: 'DELETE_LECTURE', payload: id });
    addToast(`Lecture removed from timetable.`, 'info');
  }, [addToast]);

  // Settings actions
  const updateSettings = useCallback((settingsData) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settingsData });
    addToast(`Settings saved successfully!`, 'success');
  }, [addToast]);

  const clearSampleData = useCallback(() => {
    dispatch({ type: 'CLEAR_SAMPLE_DATA' });
    addToast(`All sample data cleared. Ready for your subjects!`, 'info');
  }, [addToast]);

  const resetData = useCallback(() => {
    dispatch({ type: 'RESET_DATA' });
    addToast(`Reset to default sample data!`, 'success');
  }, [addToast]);

  const importData = useCallback((data) => {
    dispatch({ type: 'IMPORT_DATA', payload: data });
    addToast(`Imported ${data.subjects.length} subjects & ${data.lectures.length} lectures!`, 'success');
  }, [addToast]);

  // Quick lookup dictionary for subject by ID
  const subjectsMap = React.useMemo(() => {
    const map = {};
    state.subjects.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [state.subjects]);

  return (
    <AppContext.Provider
      value={{
        subjects: state.subjects,
        lectures: state.lectures,
        settings: state.settings,
        subjectsMap,
        toasts,
        addToast,
        removeToast,
        addSubject,
        updateSubject,
        deleteSubject,
        addLecture,
        bulkAddLectures,
        updateLecture,
        toggleLectureStatus,
        deleteLecture,
        updateSettings,
        clearSampleData,
        resetData,
        importData,
        currentUser,
        isCloudSyncing,
        isFirebaseConfigured,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
