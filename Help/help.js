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