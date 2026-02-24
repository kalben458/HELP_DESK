// admin.js
import { db } from './firebase.js';
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// DOM elements
const tbody = document.getElementById("tickets-body");
const filterButtons = document.querySelectorAll(".filter-btn");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const emptyEl = document.getElementById("empty");

// Priority & Status styling classes
const priorityClasses = {
  "High":   "priority-high",
  "Medium": "priority-medium",
  "Low":    "priority-low",
  "Urgent": "priority-urgent"   // if you use "Urgent"
};

const statusClasses = {
  "open":       "status-open",
  "in-progress": "status-progress",
  "resolved":   "status-resolved"
};

// Current filter
let currentFilter = "open";

// Real-time listener
let unsubscribe = null;

function startListening(filter = "open") {
  // Clean up previous listener
  if (unsubscribe) unsubscribe();

  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  emptyEl.classList.add("hidden");
  tbody.innerHTML = "";

  const q = query(
    collection(db, "maintenance-tickets"),
    orderBy("createdAt", "desc")   // newest first
  );

  unsubscribe = onSnapshot(q, (snapshot) => {
    loadingEl.classList.add("hidden");

    const tickets = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      tickets.push({
        id: doc.id,                     // Firestore doc ID (you can use this instead of numeric ID)
        category: data.category || "—",
        location: data.location || "—",
        priority: data.priority || "Medium",
        status: data.status?.toLowerCase() || "open",
        assigned: data.assignedTo || "—"   // field name can be changed
      });
    });

    if (tickets.length === 0) {
      emptyEl.classList.remove("hidden");
      return;
    }

    renderTickets(tickets, filter);
  }, (err) => {
    console.error("Firestore listener error:", err);
    loadingEl.classList.add("hidden");
    errorEl.textContent = `Error: ${err.message || "Permission denied or network issue"}`;
    errorEl.classList.remove("hidden");
  });
}

function renderTickets(allTickets, filter) {
  tbody.innerHTML = "";

  const filtered = allTickets.filter(ticket => {
    if (filter === "all") return true;
    return ticket.status === filter;
  });

  if (filtered.length === 0) {
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");

  filtered.forEach(ticket => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${ticket.id.substring(0,8)}...</td> <!-- shortened Firestore ID -->
      <td>${ticket.category}</td>
      <td>${ticket.location}</td>
      <td>
        <span class="priority-badge ${priorityClasses[ticket.priority] || 'priority-medium'}">
          ${ticket.priority}
        </span>
      </td>
      <td>
        <span class="status-badge ${statusClasses[ticket.status] || 'status-open'}">
          ${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
        </span>
      </td>
      <td>${ticket.assigned}</td>
      <td><button class="action-btn">View</button></td>
    `;

    tbody.appendChild(row);
  });
}

// Filter button clicks
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.status;
    renderTickets(/* we re-render from cached list or restart listener if needed */);
    // For simplicity we can just call startListening again on filter change
    startListening(currentFilter);
  });
});

// Start with "Open" filter
startListening("open");

// Optional: cleanup on page leave (good practice)
window.addEventListener("beforeunload", () => {
  if (unsubscribe) unsubscribe();
});