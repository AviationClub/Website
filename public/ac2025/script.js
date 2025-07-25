// handle backend
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    fullName: document.getElementById("fullName").value,
    phoneNumber: document.getElementById("phoneNumber").value,
    email: document.getElementById("email").value,
    academicYear: document.getElementById("academicYear").value,
    department: document.getElementById("department").value,
    first_preference: document.getElementById("first_preference").value,
    second_preference: document.getElementById("second_preference").value,
  };

  const res = await fetch("/api/submitForm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  alert(text);
});

// Handle disclaimer buttons
document.getElementById("agree-btn").addEventListener("click", function () {
  document.getElementById("disclaimer-modal").style.display = "none";
  document.getElementById("main-form").style.display = "block";
});
