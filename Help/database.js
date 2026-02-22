//saka na toh HAHAHA


/*basta naka base64 (yung string type lang)*/

// database.js (or help.js) — Firestore only + Base64 photo + edit/delete support

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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
const auth = getAuth(app);

// Automatically sign in anonymously when the page loads
signInAnonymously(auth)
  .then(() => console.log("Signed in anonymously"))
  .catch((error) => {
    console.error("Anonymous sign-in failed:", error);
  });

// Optional: log when auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
  } else {
    console.log("No user signed in");
  }
});

// =============================================
// SUBMIT NEW TICKET (your existing form)
// =============================================

const form = document.getElementById("ticket-form");
const submitBtn = document.getElementById("submit-btn");
const photoInput = document.getElementById("photo");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value.trim();
    const priority = document.getElementById("priority").value;
    const description = document.getElementById("description").value.trim();
    
    if (!location || !description) {
      alert("Location and description are required.");
      return;
    }
    
    let photoBase64 = null;
    
    if (photoInput.files && photoInput.files.length > 0) {
      const file = photoInput.files[0];
      
      if (file.size > 1500000) {
        alert("Photo is too large (max ~1.5 MB).");
        return;
      }
      
      photoBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    
    try {
      const docRef = await addDoc(collection(db, "maintenance-tickets"), {
        category,
        location,
        priority,
        description,
        photoBase64,
        createdAt: serverTimestamp(),
        status: "open",
        owner: auth.currentUser?.uid || null // who created it
      });
      
      alert("Ticket submitted successfully! (ID: " + docRef.id + ")");
      form.reset();
      // Optional: reset preview image if you have one
      document.getElementById("right-description-img").src = "flickering_lights.jpg";
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit ticket.\n\n" + (error.message || "Check console"));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Ticket";
    }
  });
}

// =============================================
// EXAMPLE FUNCTIONS: Edit & Delete (for admin panel)
// Call these from your admin page or console
// =============================================

// Delete a ticket (only owner can do this)
async function deleteTicket(ticketId) {
  if (!confirm("Are you sure you want to delete this ticket?")) return;
  
  try {
    await deleteDoc(doc(db, "maintenance-tickets", ticketId));
    alert("Ticket deleted successfully.");
    // You can remove the row from UI here
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Cannot delete ticket.\n" +
      (error.message.includes("permissions") ?
        "You are not the owner of this ticket." :
        error.message));
  }
}

// Update a ticket (only owner can do this)
async function updateTicket(ticketId, updates) {
  // Example usage: updateTicket("abc123", { status: "in-progress", description: "Updated text" })
  try {
    await updateDoc(doc(db, "maintenance-tickets", ticketId), updates);
    alert("Ticket updated successfully.");
  } catch (error) {
    console.error("Update failed:", error);
    alert("Cannot update ticket.\n" +
      (error.message.includes("permissions") ?
        "You are not the owner of this ticket." :
        error.message));
  }
}

// Optional: Export functions if you have a separate admin script
// window.deleteTicket = deleteTicket;
// window.updateTicket = updateTicket;