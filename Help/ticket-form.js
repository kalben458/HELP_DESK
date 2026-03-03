//Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

//Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCn6U0fQOzfI-1AkFXIU72mJ7h6tkzY7fQ",
  authDomain: "shs-database-a4e09.firebaseapp.com",
  projectId: "shs-database-a4e09",
  storageBucket: "shs-database-a4e09.firebasestorage.app",
  messagingSenderId: "368229659529",
  appId: "1:368229659529:web:b2906d08cfc6811256a758",
  measurementId: "G-VE8JH2JZKJ"
};

//Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);



//Get form elements
const form = document.getElementById("ticket-form");
const descriptionInput = document.getElementById("description");
const previewText = document.getElementById("right-description-text");
const previewImg = document.getElementById("right-description-img");
const photoInput = document.getElementById("photo");



//Live description preview
descriptionInput.addEventListener("input", () => {
  previewText.textContent = descriptionInput.value || 
  "Please describe the maintenance issue in the form to the left.";
});



//Live image preview
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});



//Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value;
  const priority = document.getElementById("priority").value;
  const description = descriptionInput.value;
  const photoFile = photoInput.files[0];

  if (!photoFile) {
    alert("Photo is required.");
    return;
  }



  try {
    //Upload image to Firebase Storage
    const storageRef = ref(storage, `tickets/${Date.now()}_${photoFile.name}`);
    await uploadBytes(storageRef, photoFile);
    const photoURL = await getDownloadURL(storageRef);

    //Save ticket data to Firestore
    await addDoc(collection(db, "maintenanceTickets"), {
      category,
      location,
      priority,
      description,
      photoURL,
      createdAt: serverTimestamp()
    });

    alert("Ticket submitted successfully!");
    form.reset();
    previewText.textContent = 
    "Please describe the maintenance issue in the form to the left.";
    previewImg.src = "";

  } catch (error) {
    console.error("Error submitting ticket:", error);
    alert("Error submitting ticket. Check console.");
  }
});