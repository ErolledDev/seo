import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we're in a build environment without Firebase config
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Validate required config only if not in build time
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0 && !isBuildTime) {
  console.error('Missing Firebase configuration keys:', missingKeys);
  throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}`);
}

// Initialize Firebase only if config is available
let app;
let auth;
let db;

if (!isBuildTime && missingKeys.length === 0) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize Firebase Authentication
  auth = getAuth(app);

  // Initialize Cloud Firestore
  db = getFirestore(app);

  // Only connect to emulators if explicitly enabled, in development, and in browser environment
  const useEmulators = process.env.FIREBASE_USE_EMULATORS === 'true';

  if (process.env.NODE_ENV === 'development' && useEmulators && typeof window !== 'undefined') {
    try {
      // Check if Auth emulator is already connected by checking the config
      if (!(auth as any)._config?.emulator) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('Connected to Firebase Auth emulator');
      }
    } catch (error) {
      console.warn('Failed to connect to Auth emulator:', error);
    }

    try {
      // Check if Firestore emulator is already connected
      const firestoreSettings = (db as any)._delegate?._databaseId;
      if (!firestoreSettings || !firestoreSettings.projectId.includes('demo-')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('Connected to Firestore emulator');
      }
    } catch (error) {
      console.warn('Failed to connect to Firestore emulator:', error);
    }
  } else if (!isBuildTime) {
    console.log('Using production Firebase services');
  }
} else if (isBuildTime) {
  console.log('Build time: Firebase initialization skipped');
  // Create mock objects for build time
  auth = null as any;
  db = null as any;
} else {
  console.error('Firebase configuration incomplete');
  auth = null as any;
  db = null as any;
}

export { auth, db };
export default app;