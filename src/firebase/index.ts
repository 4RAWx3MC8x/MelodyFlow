import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Provides a memoized Firebase app instance.
function getFirebaseApp(config = firebaseConfig): FirebaseApp {
  if (getApps().length) {
    return getApp();
  }
  return initializeApp(config);
}

// Initializes and returns Firebase services.
export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}


// Export hooks and providers
export { FirebaseProvider, useFirebaseApp, useAuth, useFirestore } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
// export { useCollection } from './firestore/use-collection';
// export { useDoc } from './firestore/use-doc';
