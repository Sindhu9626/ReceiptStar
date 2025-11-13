// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOI-wyYMIMHJ5m_Vt9RXa9H7vNeGgccSg",
  authDomain: "receiptstar-cda5b.firebaseapp.com",
  projectId: "receiptstar-cda5b",
  storageBucket: "receiptstar-cda5b.firebasestorage.app",
  messagingSenderId: "566355331775",
  appId: "1:566355331775:web:8253b4abb13da047d0940a",
  measurementId: "G-YTBWRD862P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;