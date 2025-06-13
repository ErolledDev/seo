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

// Validate Firebase configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration keys:', missingKeys);
  console.error('Current config:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
    authDomain: firebaseConfig.authDomain || 'MISSING',
    projectId: firebaseConfig.projectId || 'MISSING',
    appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : 'MISSING',
  });
  
  if (typeof window !== 'undefined') {
    alert(`Firebase configuration error: Missing ${missingKeys.join(', ')}. Please check your environment variables.`);
  }
}

// Initialize Firebase services
let app, auth, db;

try {
  if (missingKeys.length === 0) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Connect to emulators in development only
    if (process.env.NODE_ENV === 'development' && 
        process.env.FIREBASE_USE_EMULATORS === 'true' && 
        typeof window !== 'undefined') {
      
      try {
        if (!(auth as any)._config?.emulator) {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        }
      } catch (error) {
        console.warn('Auth emulator connection failed:', error);
      }

      try {
        const firestoreSettings = (db as any)._delegate?._databaseId;
        if (!firestoreSettings?.projectId.includes('demo-')) {
          connectFirestoreEmulator(db, 'localhost', 8080);
        }
      } catch (error) {
        console.warn('Firestore emulator connection failed:', error);
      }
    }
  } else {
    console.error('Firebase initialization skipped due to missing configuration');
    auth = null as any;
    db = null as any;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  auth = null as any;
  db = null as any;
}

export { auth, db };
export default app;