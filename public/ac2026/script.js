// handle backend
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Show loading state
    const submitBtn = document.getElementById("submitBtn");
    if (!submitBtn) {
    console.error("Submit button not found");
    return;
    }
const originalText = submitBtn.textContent;

//   collect data FIRST
const data = {
  fullName: document.getElementById("name").value.trim(),
  phoneNumber: document.getElementById("tel").value.trim(),
  email: document.getElementById("email").value.trim(),
  academicYear: document.getElementById("academicyear").value,
  first_preference: document.getElementById("first_preference").value,
  second_preference: document.getElementById("second_preference").value,
  department: document.getElementById("department").value,
};

// 🔥 STEP 2: VALIDATION
if (!data.fullName || !data.email || !data.phoneNumber) {
  alert("Please fill all required fields ⚠️");
  return;
}

if (!data.department) {
  alert("Please select your department ⚠️");
  return;
}

if (data.first_preference === data.second_preference) {
  alert("Preferences must be different ❌");
  return;
}

// 🔥 STEP 3: disable button AFTER validation
submitBtn.disabled = true;
submitBtn.classList.add("loading");

  try {
    
    const res = await fetch("/api/submitForm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
       const result = await res.json();

        if (!result.success) {
        alert(result.message);
        return;
        }

        // ✅ success
        window.location.replace("/success.html");

    
  } catch (error) {
    console.error('Submission failed:', error);
          alert("Something went wrong ❌");

   
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");  
    submitBtn.textContent = originalText;
}
});

// ===== SHOW/HIDE DEPARTMENT =====
document.addEventListener("DOMContentLoaded", () => {


// ===== SHOW/HIDE Duplicated Preferences =====

const firstSelect = document.getElementById("first_preference");
const secondSelect = document.getElementById("second_preference");
if (!firstSelect || !secondSelect) return;

function updateBoth() {
  const firstVal = firstSelect.value;
  const secondVal = secondSelect.value;

  // 🔥 STEP 1: reset ALL options first
  Array.from(firstSelect.options).forEach(opt => opt.disabled = false);
  Array.from(secondSelect.options).forEach(opt => opt.disabled = false);

  // 🔥 STEP 2: disable selected values
  if (firstVal) {
    Array.from(secondSelect.options).forEach(opt => {
      if (opt.value === firstVal) {
        opt.disabled = true;
      }
    });
  }

  if (secondVal) {
    Array.from(firstSelect.options).forEach(opt => {
      if (opt.value === secondVal) {
        opt.disabled = true;
      }
    });
  }}



// listen to BOTH
firstSelect.addEventListener("change", updateBoth);
secondSelect.addEventListener("change", updateBoth);

// run once on load
updateBoth();


});
