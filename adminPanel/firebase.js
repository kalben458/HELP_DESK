// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn6U0fQOzfI-1AkFXIU72mJ7h6tkzY7fQ",
  authDomain: "shs-database-a4e09.firebaseapp.com",
  projectId: "shs-database-a4e09",
  storageBucket: "shs-database-a4e09.firebasestorage.app",
  messagingSenderId: "368229659529",
  appId: "1:368229659529:web:b2906d08cfc6811256a758",
  measurementId: "G-VE8JH2JZKJ"
};
//basta sa inizialize toh
const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);