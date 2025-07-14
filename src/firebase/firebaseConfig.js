import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBnUC_VtAQQPyErBxL5HO716RifhP74t1Y",
  authDomain: "hcp-erp-d1d5f.firebaseapp.com",
  projectId: "hcp-erp-d1d5f",
  storageBucket: "hcp-erp-d1d5f.firebasestorage.app",
  messagingSenderId: "1019857725442",
  appId: "1:1019857725442:web:9c4807dbab90c466a81f1b",
  measurementId: "G-2735XQMBWW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
