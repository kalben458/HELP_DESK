// admin.js
import { db, auth } from './firebase.js';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  deleteDoc,
  doc 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// ── DOM Elements ────────────────────────────────────────────────
const loginContainer   = document.getElementById("login-container");
const dashboardContent = document.getElementById("dashboard-content");
const emailInput       = document.getElementById("email");
const passwordInput    = document.getElementById("password");
const loginBtn         = document.getElementById("login-btn");
const loginError       = document.getElementById("login-error");
const logoutBtn        = document.getElementById("logout-btn");

const tbody         = document.getElementById("tickets-body");
const filterButtons = document.querySelectorAll(".filter-btn");
const loadingEl     = document.getElementById("loading");
const errorEl       = document.getElementById("error");
const emptyEl       = document.getElementById("empty");

// Modal elements
const modal             = document.getElementById("ticket-modal");
const closeModal        = document.getElementById("close-modal");
const closeModalBtn     = document.getElementById("close-modal-btn");
const deleteTicketBtn   = document.getElementById("delete-ticket-btn");
const modalId           = document.getElementById("modal-id");
const modalCategory     = document.getElementById("modal-category");
const modalLocation     = document.getElementById("modal-location");
const modalPriority     = document.getElementById("modal-priority");
const modalStatus       = document.getElementById("modal-status");
const modalAssigned     = document.getElementById("modal-assigned");
const modalDescription  = document.getElementById("modal-description");
const modalPhoto        = document.getElementById("modal-photo");
const modalNoPhoto      = document.getElementById("modal-no-photo");

// Styling classes
const priorityClasses = {
  "High":   "priority-high",
  "Medium": "priority-medium",
  "Low":    "priority-low",
  "Urgent": "priority-urgent"
};

const statusClasses = {
  "open":        "status-open",
  "in-progress": "status-progress",
  "resolved":    "status-resolved"
};

// State
let allTickets = [];
let unsubscribe = null;
let currentFilter = "open";
let currentTicketId = null;

// ── Auth Listener ───────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginContainer.style.display = "none";
    dashboardContent.style.display = "block";
    startListening();
  } else {
    loginContainer.style.display = "block";
    dashboardContent.style.display = "none";
    if (unsubscribe) unsubscribe();
    tbody.innerHTML = "";
    modal.style.display = "none";
    emailInput.value = "";
    passwordInput.value = "";
    loginError.textContent = "";
  }
});

// ── Login ───────────────────────────────────────────────────────
loginBtn.addEventListener("click", async () => {
  const email    = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    loginError.textContent = "Enter email and password";
    return;
  }

  loginBtn.disabled = true;
  loginError.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    let msg = "Login failed. ";
    if (err.code === "auth/wrong-password")       msg += "Wrong password.";
    else if (err.code === "auth/user-not-found")  msg += "No account found.";
    else if (err.code === "auth/invalid-email")   msg += "Invalid email.";
    else msg += err.message || "";
    loginError.textContent = msg;
  } finally {
    loginBtn.disabled = false;
  }
});

// ── Logout ──────────────────────────────────────────────────────
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout failed:", err);
    alert("Logout failed.");
  }
});

// ── Real-time Tickets ───────────────────────────────────────────
function startListening() {
  if (unsubscribe) unsubscribe();

  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  emptyEl.classList.add("hidden");
  tbody.innerHTML = "";

  const q = query(collection(db, "maintenance-tickets"), orderBy("createdAt", "desc"));

  unsubscribe = onSnapshot(q, (snapshot) => {
    loadingEl.classList.add("hidden");
    allTickets = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      allTickets.push({
        id: doc.id,
        category: data.category || "—",
        location: data.location || "—",
        priority: data.priority || "Medium",
        status: (data.status || "open").toLowerCase(),
        assigned: data.assignedTo || "—",
        description: data.description || "No description",
        photoBase64: data.photoBase64 || null
      });
    });

    renderTickets(currentFilter);
  }, err => {
    console.error("Firestore error:", err);
    loadingEl.classList.add("hidden");
    errorEl.textContent = `Error: ${err.message}`;
    errorEl.classList.remove("hidden");
  });
}

// ── Render Tickets Table ────────────────────────────────────────
function renderTickets(filter) {
  tbody.innerHTML = "";

  const filtered = allTickets.filter(t => filter === "all" || t.status === filter);

  if (filtered.length === 0) {
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");

  filtered.forEach(ticket => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${ticket.id.substring(0,8)}...</td>
      <td>${ticket.category}</td>
      <td>${ticket.location}</td>
      <td><span class="priority-badge ${priorityClasses[ticket.priority] || ''}">${ticket.priority}</span></td>
      <td><span class="status-badge ${statusClasses[ticket.status] || ''}">${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span></td>
      <td>${ticket.assigned}</td>
      <td><button class="action-btn view-btn" data-id="${ticket.id}">View</button></td>
    `;

    tbody.appendChild(row);
  });

  // Add click listeners to View buttons
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const ticketId = btn.dataset.id;
      showTicketModal(ticketId);
    });
  });
}

// ── Show Modal ──────────────────────────────────────────────────
function showTicketModal(ticketId) {
  const ticket = allTickets.find(t => t.id === ticketId);
  if (!ticket) return;

  currentTicketId = ticketId;

  document.getElementById("modal-id").textContent          = ticket.id;
  document.getElementById("modal-category").textContent    = ticket.category;
  document.getElementById("modal-location").textContent    = ticket.location;
  document.getElementById("modal-priority").textContent    = ticket.priority;
  document.getElementById("modal-status").textContent      = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
  document.getElementById("modal-assigned").textContent    = ticket.assigned;
  document.getElementById("modal-description").textContent = ticket.description;

  const photoEl = document.getElementById("modal-photo");
  const noPhotoEl = document.getElementById("modal-no-photo");

  if (ticket.photoBase64) {
    photoEl.src = ticket.photoBase64;
    photoEl.style.display = "block";
    noPhotoEl.style.display = "none";
  } else {
    photoEl.style.display = "none";
    noPhotoEl.style.display = "block";
  }

  // Only show Delete button if status is In Progress or Resolved
  if (ticket.status === "in-progress" || ticket.status === "resolved") {
    deleteTicketBtn.style.display = "inline-block";
    deleteTicketBtn.disabled = false;
  } else {
    deleteTicketBtn.style.display = "none";
    // Or disable instead: deleteTicketBtn.disabled = true;
  }

  modal.style.display = "flex";
}

// ── Close Modal ─────────────────────────────────────────────────
closeModal.addEventListener("click", () => modal.style.display = "none");
closeModalBtn.addEventListener("click", () => modal.style.display = "none");

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// ── Delete Ticket ───────────────────────────────────────────────
deleteTicketBtn.addEventListener("click", async () => {
  if (!currentTicketId) return;

  if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
    return;
  }

  try {
    await deleteDoc(doc(db, "maintenance-tickets", currentTicketId));
    alert("Ticket deleted successfully.");
    modal.style.display = "none";
    // onSnapshot will automatically refresh the table
  } catch (err) {
    console.error("Delete failed:", err);
    alert(`Failed to delete ticket.\n${err.message || "Check console for details."}`);
  }
});

// ── Filter Buttons ──────────────────────────────────────────────
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    currentFilter = btn.dataset.status;
    renderTickets(currentFilter);
  });
});