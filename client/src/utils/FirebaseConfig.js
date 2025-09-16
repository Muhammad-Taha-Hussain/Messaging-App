// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCU7DvtW2wnA3PFgbGJ1XDZmzs2Ck3etIE",
  authDomain: "whatsapp-clone-366e0.firebaseapp.com",
  projectId: "whatsapp-clone-366e0",
  storageBucket: "whatsapp-clone-366e0.firebasestorage.app",
  messagingSenderId: "815309965472",
  appId: "1:815309965472:web:61c2c870f612f2a10ee1c5",
  measurementId: "G-D54W10SZ36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); 
export const firebaseAuth = getAuth(app);