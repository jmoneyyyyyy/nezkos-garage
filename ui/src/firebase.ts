import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCnGxCydANLT7MPe1FdWObi8Es1LRssHt8",
  authDomain: "nezkos-garage-log.firebaseapp.com",
  projectId: "nezkos-garage-log",
  storageBucket: "nezkos-garage-log.firebasestorage.app",
  messagingSenderId: "895997315399",
  appId: "1:895997315399:web:7cf11b7b93c824f0f3a462",
  measurementId: "G-PHM5B5DWW3"
};

const app = initializeApp(firebaseConfig);
const vehicleCollection = initializeFirestore(app, { ignoreUndefinedProperties: true });
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { vehicleCollection, auth, googleProvider };