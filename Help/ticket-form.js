// ticket-form.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
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
const db = getFirestore(app);

console.log("Firebase initialized");

// DOM elements
const form = document.getElementById("ticket-form");
const descriptionInput = document.getElementById("description");
const previewText = document.getElementById("right-description-text");
const previewImg = document.getElementById("right-description-img");
const photoInput = document.getElementById("photo");
const submitBtn = document.getElementById("submit-btn");

// Default image
const defaultImage = "flickering_lights.jpg";

// Live description preview
descriptionInput.addEventListener("input", () => {
  const text = descriptionInput.value.trim();
  previewText.textContent = text || "Please describe the maintenance issue in the form to the left.";
});

// Live photo preview + base64
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.alt = file.name;
    };
    reader.onerror = () => {
      console.error("Failed to read photo");
      previewImg.src = defaultImage;
    };
    reader.readAsDataURL(file);
  } else {
    previewImg.src = defaultImage;
    previewImg.alt = "Maintenance evidence preview";
  }
});

// Compress image to base64 (to fit Firestore 1 MiB limit)
async function getCompressedBase64(file) {
  if (!file || !file.type.startsWith("image/")) return null;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let width = img.width;
      let height = img.height;
      const maxSize = 800;

      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result); // data:image/jpeg;base64,...
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.7  // 70% quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();  // ← this prevents page reload

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value.trim();
    const priority = document.getElementById("priority").value;
    const description = descriptionInput.value.trim();
    const file = photoInput.files[0];

    let photoBase64 = null;

    if (file) {
      photoBase64 = await getCompressedBase64(file);
      if (!photoBase64) {
        throw new Error("Failed to compress photo");
      }
    }

    const formData = {
      category,
      location,
      priority,
      description,
      photoBase64,               // base64 string or null
      createdAt: serverTimestamp(),
      status: "open"
    };

    console.log("Submitting data:", formData);

    const docRef = await addDoc(collection(db, "maintenance-tickets"), formData);

    alert(`Ticket submitted successfully!\nID: ${docRef.id}`);

    // Reset
    form.reset();
    previewImg.src = defaultImage;
    previewText.textContent = "Please describe the maintenance issue in the form to the left.";

  } catch (error) {
    console.error("Submission failed:", error);

    let msg = "Failed to submit ticket.";
    if (error.code === "permission-denied") {
      msg += "\nPermission denied – check Firestore rules (allow create: if true;)";
    } else if (error.message.includes("size") || error.code?.includes("resource-exhausted")) {
      msg += "\nPhoto too large even after compression. Try smaller image.";
    } else {
      msg += `\n${error.message || "See console for details."}`;
    }

    alert(msg);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Ticket";
  }
});