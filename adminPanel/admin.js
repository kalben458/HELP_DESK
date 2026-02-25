// admin.js
import { db, auth } from './firebase.js';
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// DOM
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

// Classes
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

// Auth state
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
  }
});

// Login
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
    else msg += err.message;
    loginError.textContent = msg;
  } finally {
    loginBtn.disabled = false;
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout failed:", err);
    alert("Logout failed.");
  }
});

// Tickets
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
        assigned: data.assignedTo || "—"
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
      <td><button class="action-btn">View</button></td>
    `;

    tbody.appendChild(row);
  });
}

// Filters
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.status;
    renderTickets(currentFilter);
  });
});
//pang alis lang ng red lines