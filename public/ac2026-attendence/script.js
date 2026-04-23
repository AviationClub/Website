// 🔴 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

//  MAX SELECTION
const MAX_SELECTION = 20;

// STATE
let userId = null;
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

//  Name / Email submit

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  user.name = name.value.trim();
  user.email = email.value.toLowerCase().trim();
  user.committee = document.getElementById("committee").value;
  if (!user.committee) {
  alert("Please select a committee");
  return;
}

  // ✅ GET OR CREATE ID
  userId = await getOrCreateUserId(user.email);

  form.classList.add("hidden");
  calendar.classList.remove("hidden");

  await loadUserBookings();
  await loadSlots();
});
// GET OR CREATE USER ID
async function getOrCreateUserId(email) {
  const counterRef = db.collection("meta").doc("counter");
  const userRef = db.collection("bookings").doc(email);

  return db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);

    // ✅ If user already has ID → return it
    if (userDoc.exists && userDoc.data().userId) {
      return userDoc.data().userId;
    }

    // 🔢 Get counter
    const counterDoc = await t.get(counterRef);

    let current = 0;
    if (counterDoc.exists) {
      current = counterDoc.data().value;
    }

    const newIdNumber = current + 1;
const newId = "A" + newIdNumber;

// ✅ Update counter
t.set(counterRef, { value: newIdNumber });

// ✅ SAVE USER ID (THIS IS THE FIX)
t.set(userRef, { userId: newId }, { merge: true });

return newId;
  });
}
//  LOAD USER BOOKINGS
async function loadUserBookings() {
  const ref = db.collection("bookings").doc(user.email);
  const doc = await ref.get();

  if (doc.exists) {
if (doc.exists) {
  const data = doc.data();
if (data.slots) {
  selectedSlots = (data.slots || []).map(s => s.slotId || s);
} else {
  selectedSlots = [];
}
  // ✅ LOAD EXISTING ID
  if (data.userId) {
    userId = data.userId;
  }

  alert(`Welcome back!\nYour ID: ${userId}`);
}
  }
}
// ✅ SORT SLOTS BY TIME
function convertTo24(timeStr) {
  // ✅ Take only the start time (before "-")
  const start = timeStr.split("-")[0]; // "9:00"

  // Get AM/PM
  const modifier = timeStr.includes("PM") ? "PM" : "AM";

  let [hours, minutes] = start.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

//  LOAD SLOTS
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


allSlots.sort((a, b) => {
  const dayOrder = {
  "Tuesday": 1,
  "Wednesday": 2,
  "Thursday": 3
};
  // sort by day first
  if (dayOrder[a.day] !== dayOrder[b.day]) {
    return dayOrder[a.day] - dayOrder[b.day];
  }

  // then by time
  return convertTo24(a.time) - convertTo24(b.time);
});
populateDays([...daysSet]);
renderSlots();
}

//  FILTER
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

// 🟢 RENDER SLOTS 
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
const booked = data.booked || 0;
const max = data.max || 0;
const isFull = booked >= max;

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


// SELECT / DESELECT
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

// 🟢 SUBMIT 
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
  const data = bookingDoc.data();
  oldSlots = (data.slots || []).map(s => s.slotId || s);
}

      //  READ ALL FIRST
      const allIds = [...new Set([...oldSlots, ...selectedSlots])];
      const slotDocs = {};

      for (let id of allIds) {
        const ref = db.collection("timeslots").doc(id);
        slotDocs[id] = await t.get(ref);
      }

      //  COMPUTE FINAL COUNTS (IMPORTANT FIX)
      const changes = {};

      // subtract old
      for (let id of oldSlots) {
        changes[id] = (changes[id] || 0) - 1;
      }

      // add new
      for (let id of selectedSlots) {
        changes[id] = (changes[id] || 0) + 1;
      }

      //  APPLY CHANGES SAFELY
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

      //  SAVE USER DATA
   const slotObjects = selectedSlots
  .map(id => {
    const data = allSlots.find(s => s.id === id);
    if (!data) return null;

    return {
      slotId: id,
      day: data.day,
      time: data.time
    };
  })
  .filter(Boolean);

t.set(bookingRef, {
  name: user.name,
  email: user.email,
  committee: user.committee,
  userId: userId,
  slots: slotObjects,
  updatedAt: new Date()
});

    });

alert(`✅ Booking saved!\n\nYour ID: ${userId}`);

    //  LOGOUT
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

// 🟡 CREATE SLOTS
