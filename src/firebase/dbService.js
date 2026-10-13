import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

/**
 * Subscribe to real-time timetable data for a given user
 */
export function subscribeToUserData(userId, onDataReceived, onError) {
  if (!isFirebaseConfigured || !db || !userId) {
    return () => {};
  }

  const docRef = doc(db, 'timetables', userId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onDataReceived(docSnap.data());
      } else {
        // Document doesn't exist yet in cloud
        onDataReceived(null);
      }
    },
    (error) => {
      console.error('Error listening to timetable data:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save / sync entire timetable payload to cloud for a user
 */
export async function syncUserDataToCloud(userId, data) {
  if (!isFirebaseConfigured || !db || !userId) return;

  const docRef = doc(db, 'timetables', userId);
  await setDoc(
    docRef,
    {
      subjects: data.subjects || [],
      lectures: data.lectures || [],
      settings: data.settings || {},
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * One-time fetch of user timetable
 */
export async function fetchUserDataOnce(userId) {
  if (!isFirebaseConfigured || !db || !userId) return null;
  const docRef = doc(db, 'timetables', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}
