// ticket-form.js
import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const elements = {
  form: document.getElementById('ticket-form'),
  submitBtn: document.getElementById('submit-btn'),
  description: document.getElementById('description'),
  previewText: document.getElementById('right-description-text'),
  photoInput: document.getElementById('photo'),
  previewImg: document.getElementById('right-description-img'),
  defaultImage: 'flickering_lights.jpg'
};

function updateDescriptionPreview() {
  const text = elements.description.value.trim();
  elements.previewText.textContent = text || 
    'Please describe the maintenance issue in the form to the left.';
}

function updatePhotoPreview() {
  const file = elements.photoInput.files[0];
  
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.previewImg.src = e.target.result;
      elements.previewImg.alt = file.name;
    };
    reader.onerror = () => {
      console.error('Failed to read file');
      elements.previewImg.src = elements.defaultImage;
    };
    reader.readAsDataURL(file);
  } else {
    elements.previewImg.src = elements.defaultImage;
    elements.previewImg.alt = 'Maintenance evidence preview';
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  if (!elements.form.checkValidity()) {
    elements.form.reportValidity();
    return;
  }

  elements.submitBtn.disabled = true;
  elements.submitBtn.textContent = 'Submitting...';

  try {
    const formData = {
      category:    document.getElementById('category').value,
      location:    document.getElementById('location').value.trim(),
      priority:    document.getElementById('priority').value,
      description: document.getElementById('description').value.trim(),
      createdAt:   serverTimestamp(),
      status:      'open',
      // photoURL:    // ← add later when implementing Storage
    };

    const docRef = await addDoc(collection(db, "maintenance-tickets"), formData);

    alert(`Ticket submitted successfully!\nID: ${docRef.id}`);
    
    // Reset form & UI
    elements.form.reset();
    elements.previewImg.src = elements.defaultImage;
    elements.previewText.textContent = 'Please describe the maintenance issue in the form to the left.';
    
  } catch (err) {
    console.error('Error submitting ticket:', err);
    alert('Failed to submit ticket.\n' + (err.message || 'Check console for details.'));
  } finally {
    elements.submitBtn.disabled = false;
    elements.submitBtn.textContent = 'Submit Ticket';
  }
}

// ────────────────────────────────────────────────
// Initialize event listeners
// ────────────────────────────────────────────────
function init() {
  if (!elements.form) {
    console.error('Form element not found');
    return;
  }

  elements.description.addEventListener('input', updateDescriptionPreview);
  elements.photoInput.addEventListener('change', updatePhotoPreview);
  elements.form.addEventListener('submit', handleSubmit);

  // Initial preview states
  updateDescriptionPreview();
  updatePhotoPreview();
}

document.addEventListener('DOMContentLoaded', init);