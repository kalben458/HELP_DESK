// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn6U0fQOzfI-1AkFXIU72mJ7h6tkzY7fQ",
  authDomain: "shs-database-a4e09.firebaseapp.com",
  projectId: "shs-database-a4e09",
  storageBucket: "shs-database-a4e09.firebasestorage.app",
  messagingSenderId: "368229659529",
  appId: "1:368229659529:web:b2906d08cfc6811256a758",
  measurementId: "G-VE8JH2JZKJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in production or if you really use it
// (it can be safely removed if not needed)
const analytics = getAnalytics(app);

export const db = getFirestore(app);