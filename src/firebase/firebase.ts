import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged, 
  updatePassword,
  updateEmail
} from 'firebase/auth';
import { getDatabase, ref, set, get, child, onValue, push, remove } from 'firebase/database';

import { firebaseConfig } from '../config/firebase.config';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateEmail,
  ref,
  set,
  get,
  child,
  onValue,
  push,
  remove
};
