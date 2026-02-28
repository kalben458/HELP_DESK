// Change to:
import { db } from '../firebase';
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



//Compress image to fit within Firestore (1 mb lang)
async function compressImage(file) {
  if (!file || !file.type.startsWith('image/')) return null;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Resize: maintain aspect ratio, max 800px on the longest side
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

      // Output as JPEG with 70% quality (usually results in 100–400 KB)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed – no blob created'));
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result); // returns data:image/jpeg;base64,...
          reader.onerror = () => reject(new Error('Failed to read compressed blob as data URL'));
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.7   // quality: 0.7 = 70%
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

function updateDescriptionPreview() {
  const text = elements.description.value.trim();
  elements.previewText.textContent = text ||
    'Please describe the maintenance issue in the form to the left.';
}

async function updatePhotoPreview() {
  const file = elements.photoInput.files[0];

  if (!file || !file.type.startsWith('image/')) {
    elements.previewImg.src = elements.defaultImage;
    elements.previewImg.alt = 'Maintenance evidence preview';
    return;
  }

  try {
    const compressedBase64 = await compressImage(file);
    if (compressedBase64) {
      elements.previewImg.src = compressedBase64;
      elements.previewImg.alt = file.name || 'Compressed preview';
    } else {
      elements.previewImg.src = elements.defaultImage;
    }
  } catch (err) {
    console.error('Preview compression failed:', err);
    elements.previewImg.src = elements.defaultImage;
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
    const file = elements.photoInput.files[0];
    let photoBase64 = null;

    if (file) {
      photoBase64 = await compressImage(file);
      if (!photoBase64) {
        throw new Error('Failed to compress photo');
      }
    }

    const formData = {
      category:    document.getElementById('category').value,
      location:    document.getElementById('location').value.trim(),
      priority:    document.getElementById('priority').value,
      description: document.getElementById('description').value.trim(),
      photoBase64: photoBase64,          // compressed base64 string (or null)
      createdAt:   serverTimestamp(),
      status:      'open'
    };

    const docRef = await addDoc(collection(db, "maintenance-tickets"), formData);

    alert(`Ticket submitted successfully!\nTicket ID: ${docRef.id}`);

    // Reset form and UI
    elements.form.reset();
    elements.previewImg.src = elements.defaultImage;
    elements.previewText.textContent = 'Please describe the maintenance issue in the form to the left.';

  } catch (err) {
    console.error('Submission error:', err);

    let msg = 'Failed to submit ticket.';
    if (err.message?.includes('size') || err.code?.includes('resource-exhausted')) {
      msg += '\nPhoto might still be too large even after compression. Try a smaller or lower-resolution image.';
    } else if (err.message?.includes('permissions') || err.code === 'permission-denied') {
      msg += '\nPermission denied. Check Firestore security rules — create operation must be allowed.';
    } else {
      msg += `\n${err.message || 'See browser console for details.'}`;
    }

    alert(msg);
  } finally {
    elements.submitBtn.disabled = false;
    elements.submitBtn.textContent = 'Submit Ticket';
  }
}


//Initialize event listeners

function init() {
  if (!elements.form) {
    console.error('Form element not found');
    return;
  }

  elements.description.addEventListener('input', updateDescriptionPreview);
  elements.photoInput.addEventListener('change', updatePhotoPreview);
  elements.form.addEventListener('submit', handleSubmit);

  // Set initial preview states
  updateDescriptionPreview();
  updatePhotoPreview();
}

document.addEventListener('DOMContentLoaded', init);