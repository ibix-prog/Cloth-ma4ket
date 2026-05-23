import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBp1LNoUnlExdTMwl_QEqpFREbk2SJm0u8",
  authDomain: "e-commerce-346bd.firebaseapp.com",
  projectId: "e-commerce-346bd",
  storageBucket: "e-commerce-346bd.firebasestorage.app",
  messagingSenderId: "406603551592",
  appId: "1:406603551592:web:1776c7be69829b79597cdd",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAIL = "voidfury1527@gmail.com";
