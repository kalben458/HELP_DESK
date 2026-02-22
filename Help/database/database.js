//saka na toh HAHAHA
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"; // ← add this for saving tickets

const firebaseConfig = {
  apiKey: "AIzaSyAnLJfajeKTPQJGeWtUDc4dIptJVOx_2oY",
  authDomain: "shs-help-desk-af3c2.firebaseapp.com",
  projectId: "shs-help-desk-af3c2",
  storageBucket: "shs-help-desk-af3c2.firebasestorage.app", // note: .appspot.com also works
  messagingSenderId: "620318497828",
  appId: "1:620318497828:web:51293468261ccc47c0ccb1",
  measurementId: "G-9NNPK8YWGE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app); // 




const form = document.getElementById("ticket-form");
const submitBtn = document.getElementById("submit-btn");
const photoInput = document.getElementById("photo");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); //Stop default form submission

  //Basic client-side check (beyond HTML required)
  if (!photoInput.files || photoInput.files.length === 0) {
    alert("Please attach a photo — it's required.");
    return;
  }

  const file = photoInput.files[0]; 
  //Take the first (and usually only) file
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value.trim();
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value.trim();

  if (!location || !description) {
    alert("Please fill in location and description.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Uploading...";

  try {
    // 1.Define path in Storage — e.g., tickets/2026-02/photos/filename.jpg
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_"); // basic sanitization
    const storagePath = `tickets/${timestamp}_${safeFileName}`;
    const storageRef = ref(storage, storagePath);

    // 2. Upload the file with progress monitoring
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        submitBtn.textContent = `Uploading... ${progress}%`;
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Upload failed: " + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Ticket";
      },
      async () => {
        // 3. Get public download URL after success
        const photoURL = await getDownloadURL(uploadTask.snapshot.ref);

        // 4. Save ticket metadata to Firestore
        await addDoc(collection(db, "maintenance-tickets"), {
          category,
          location,
          priority,
          description,
          photoURL,
          createdAt: serverTimestamp(),
          status: "open",         
        });

        alert("Ticket submitted successfully!");
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Ticket";
      }
    );
  } catch (err) {
    console.error(err);
    alert("Error submitting ticket: " + err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Ticket";
  }
});