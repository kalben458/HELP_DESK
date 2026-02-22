//saka na toh HAHAHA


/*basta naka base64 (yung string type lang)*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnLJfajeKTPQJGeWtUDc4dIptJVOx_2oY",
  authDomain: "shs-help-desk-af3c2.firebaseapp.com",
  projectId: "shs-help-desk-af3c2",
  storageBucket: "shs-help-desk-af3c2.firebasestorage.app",
  messagingSenderId: "620318497828",
  appId: "1:620318497828:web:51293468261ccc47c0ccb1",
  measurementId: "G-9NNPK8YWGE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("ticket-form");
const submitBtn = document.getElementById("submit-btn");
const photoInput = document.getElementById("photo");

form.addEventListener("submit", async (e) => {
  e.preventDefault();  // Stops the native POST → no more 405 error on Vercel

  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value.trim();
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value.trim();

  // Basic validation (browser 'required' already helps, but we add friendly message)
  if (!location || !description) {
    alert("Please fill in location and description.");
    return;
  }

  let photoBase64 = null;

  // Get photo if user selected one
  if (photoInput.files && photoInput.files.length > 0) {
    const file = photoInput.files[0];

    // Optional: prevent very large files (Firestore doc limit ~1 MB total)
    if (file.size > 1500000) {  // ~1.5 MB rough limit
      alert("Photo is too large. Please choose a smaller image (under ~1.5 MB).");
      return;
    }

    // Convert file to Base64
    photoBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);          // "data:image/...;base64,...."
      reader.onerror = () => reject(new Error("Failed to read photo"));
      reader.readAsDataURL(file);
    });
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    await addDoc(collection(db, "maintenance-tickets"), {
      category,
      location,
      priority,
      description,
      photoBase64,              // will be null if no photo, or the full base64 string
      createdAt: serverTimestamp(),
      status: "open"
    });

    alert("Ticket submitted successfully!");
    form.reset();
  } catch (error) {
    console.error("Error submitting to Firestore:", error);
    alert("Failed to submit ticket.\n\nError: " + (error.message || "Check browser console (F12)"));
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Ticket";
  }
});