// 🔴 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCPRUW1A1GjnQflXlLQYLoJKehfcKN4Pug",
  authDomain: "academy-attendance-7bdcc.firebaseapp.com",
  projectId: "academy-attendance-7bdcc",
  storageBucket: "academy-attendance-7bdcc.firebasestorage.app",
  messagingSenderId: "756693665222",
  appId: "1:756693665222:web:e42c4f52fb798b4de71ec7",
  measurementId: "G-1SM04SCL9G"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔒 MAX SELECTION
const MAX_SELECTION = 6;

// STATE
let user = {};
let allSlots = [];
let selectedSlots = [];

// ELEMENTS
const form = document.getElementById("form");
const name = document.getElementById("name");
const email = document.getElementById("email");
const calendar = document.getElementById("calendar");
const slots = document.getElementById("slots");
const dayFilter = document.getElementById("dayFilter");
const submitBooking = document.getElementById("submitBooking");

// =======================
// 🟢 FORM SUBMIT
// =======================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  user.name = name.value.trim();
  user.email = email.value.toLowerCase().trim();

  form.classList.add("hidden");
  calendar.classList.remove("hidden");

  await loadUserBookings();
  await loadSlots();
});

// =======================
// 🟢 LOAD USER BOOKINGS
// =======================
async function loadUserBookings() {
  const ref = db.collection("bookings").doc(user.email);
  const doc = await ref.get();

  if (doc.exists) {
    const data = doc.data();
    selectedSlots = data.slots.map(s => s.slotId);

    alert("Welcome back! Your previous selections are loaded.");
  }
}

// =======================
// 🟢 LOAD SLOTS
// =======================
async function loadSlots() {
  const snapshot = await db.collection("timeslots").get();

  allSlots = [];
  const daysSet = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    data.id = doc.id;

    allSlots.push(data);
    daysSet.add(data.day);
  });

  populateDays([...daysSet]);
  renderSlots();
}

// =======================
// 🟢 FILTER
// =======================
function populateDays(days) {
  dayFilter.innerHTML = '<option value="All">All Days</option>';

  days.forEach(day => {
    const option = document.createElement("option");
    option.value = day;
    option.textContent = day;
    dayFilter.appendChild(option);
  });

  dayFilter.onchange = renderSlots;
}

// =======================
// 🟢 RENDER SLOTS (FIXED)
// =======================
function renderSlots() {
  slots.innerHTML = "";

  const selectedDay = dayFilter.value;

  const filtered = selectedDay === "All"
    ? allSlots
    : allSlots.filter(s => s.day === selectedDay);

  filtered.forEach(data => {
    const div = document.createElement("div");
    div.classList.add("slot");

    const isSelected = selectedSlots.includes(data.id);
    const isFull = data.booked >= data.max;

    if (isFull && !isSelected) {
      div.classList.add("full");
      div.innerText = `${data.day} - ${data.time} (FULL)`;
    } else {
      div.classList.add("available");

      if (isSelected) div.classList.add("selected");

      div.innerText = `${data.day} - ${data.time} (${data.booked}/${data.max})`;

      div.onclick = () => toggleSelect(data); // ✅ allow deselect
    }

    slots.appendChild(div);
  });
}

// =======================
// 🟢 SELECT / DESELECT
// =======================
function toggleSelect(data) {
  if (selectedSlots.includes(data.id)) {
    selectedSlots = selectedSlots.filter(id => id !== data.id);
  } else {
    if (selectedSlots.length >= MAX_SELECTION) {
      alert(`Max ${MAX_SELECTION} slots`);
      return;
    }
    selectedSlots.push(data.id);
  }

  renderSlots();
}

// =======================
// 🟢 SUBMIT (CORRECT LOGIC)
// =======================
submitBooking.onclick = async () => {
  if (selectedSlots.length === 0) {
    alert("Select at least one slot");
    return;
  }

  const bookingRef = db.collection("bookings").doc(user.email);

  try {
    await db.runTransaction(async (t) => {

      const bookingDoc = await t.get(bookingRef);

      let oldSlots = [];
      if (bookingDoc.exists) {
        oldSlots = bookingDoc.data().slots.map(s => s.slotId);
      }

      // 🔥 READ ALL FIRST
      const allIds = [...new Set([...oldSlots, ...selectedSlots])];
      const slotDocs = {};

      for (let id of allIds) {
        const ref = db.collection("timeslots").doc(id);
        slotDocs[id] = await t.get(ref);
      }

      // 🔥 COMPUTE FINAL COUNTS (IMPORTANT FIX)
      const changes = {};

      // subtract old
      for (let id of oldSlots) {
        changes[id] = (changes[id] || 0) - 1;
      }

      // add new
      for (let id of selectedSlots) {
        changes[id] = (changes[id] || 0) + 1;
      }

      // 🔥 APPLY CHANGES SAFELY
      for (let id in changes) {
        const doc = slotDocs[id];
        const current = doc.data().booked;
        const max = doc.data().max;

        const newCount = current + changes[id];

        if (newCount > max) throw new Error("Slot full");
        if (newCount < 0) continue;

        t.update(db.collection("timeslots").doc(id), {
          booked: newCount
        });
      }

      // 💾 SAVE USER DATA
      const slotObjects = selectedSlots.map(id => {
        const data = allSlots.find(s => s.id === id);
        return {
          slotId: id,
          day: data.day,
          time: data.time
        };
      });

      t.set(bookingRef, {
        name: user.name,
        email: user.email,
        slots: slotObjects,
        updatedAt: new Date()
      });

    });

    alert("Booking saved!");

    // 🔴 LOGOUT
    selectedSlots = [];
    user = {};

    calendar.classList.add("hidden");
    form.classList.remove("hidden");

    name.value = "";
    email.value = "";

  } catch (err) {
    alert(err.message || "Error occurred");
  }
};

// =======================
// 🟢 CREATE SLOTS
// =======================
async function createSlots() {
  const days = ["Tuesday", "Wednesday"];
  const times = [
    "9:00-10:00 AM",
    "10:00-11:00 AM",
    "11:00-12:00 AM",
    "12:00-1:00 PM",
    "1:00-2:00 PM",
    "2:00-3:00 PM",
    "3:00-4:00 PM"
  ];

  for (let day of days) {
    for (let time of times) {
      const id = day + "-" + time;

      await db.collection("timeslots").doc(id).set({
        day,
        time,
        max: 12,
        booked: 0
      });
    }
  }

  alert("Slots created!");
}