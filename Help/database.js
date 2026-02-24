//saka na toh HAHAHA


/*basta naka base64 (yung string type lang)*/

/// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
