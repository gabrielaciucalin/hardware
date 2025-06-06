// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZ_ASLYClZg2wuDrrYtQ_BKcYh_3XvRqY",
  authDomain: "hardware-app-70d57.firebaseapp.com",
  projectId: "hardware-app-70d57",
  storageBucket: "hardware-app-70d57.firebasestorage.app",
  messagingSenderId: "1045498097455",
  appId: "1:1045498097455:web:6ef9092185168b93b63bda",
  measurementId: "G-1M43PJYC33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore();
export const storage = getStorage(app); 
