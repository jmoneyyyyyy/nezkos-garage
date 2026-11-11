import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnGxCydANLT7MPe1FdWObi8Es1LRssHt8",
  authDomain: "nezkos-garage-log.firebaseapp.com",
  projectId: "nezkos-garage-log",
  storageBucket: "nezkos-garage-log.firebasestorage.app",
  messagingSenderId: "895997315399",
  appId: "1:895997315399:web:7cf11b7b93c824f0f3a462",
  measurementId: "G-PHM5B5DWW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default db;