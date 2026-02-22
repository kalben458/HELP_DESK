const descriptionInput = document.getElementById('description');

const rightDescriptionText = document.getElementById('right-description-text');

const photoInput = document.getElementById('photo');

const rightDescriptionImg = document.getElementById('right-description-img');


descriptionInput.addEventListener('input', () => {
  const text = descriptionInput.value.trim();
  rightDescriptionText.textContent = text.length > 0 
    ? text 
    : 'Please describe the maintenance issue in the form to the left.';
});


photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      rightDescriptionImg.src = e.target.result;
    }
    reader.readAsDataURL(file);
  } else {
   
    
    //Reset to default image
    rightDescriptionImg.src = 'flickering_lights.jpg';
  }
});





/*database*/
//saka na toh HAHAHA

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
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
  const storage = getStorage(app);
  const db = getFirestore(app);

  const form = document.getElementById("ticket-form");
  const submitBtn = document.getElementById("submit-btn");
  const photoInput = document.getElementById("photo");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();           // ← This prevents the 405 error

    if (!photoInput.files?.length) {
      alert("Please attach a photo (required).");
      return;
    }

    const file = photoInput.files[0];
    const category  = document.getElementById("category").value;
    const location  = document.getElementById("location").value.trim();
    const priority  = document.getElementById("priority").value;
    const description = document.getElementById("description").value.trim();

    if (!location || !description) {
      alert("Location and description are required.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      // Upload photo
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storageRef = ref(storage, `tickets/${timestamp}_${safeName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on("state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          submitBtn.textContent = `Uploading... ${progress}%`;
        }
      );

      await uploadTask;

      const photoURL = await getDownloadURL(uploadTask.snapshot.ref);

      // Save ticket data
      await addDoc(collection(db, "maintenance-tickets"), {
        category,
        location,
        priority,
        description,
        photoURL,
        createdAt: serverTimestamp(),
        status: "open"
      });

      alert("Ticket submitted successfully!");
      form.reset();
    } catch (error) {
      console.error(error);
      alert("Error: " + (error.message || "Failed to submit ticket"));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Ticket";
    }
  });

