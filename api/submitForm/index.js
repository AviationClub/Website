const sql = require("mssql");
module.exports = async function (context, req) {
  const {
    fullName,
    phoneNumber,
    email,
    academicYear,
    department,
    first_preference,
    second_preference,
  } = req.body;
  const cleanName = fullName.trim();
  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = phoneNumber.trim();
  // Validation
if (
  !cleanName ||
  !cleanPhone ||
  !cleanEmail ||
  !academicYear ||
  !department ||   // ✅ now always required
  !first_preference ||
  !second_preference
) {
  context.res = {
    status: 400,
    headers: { "Content-Type": "application/json" },
    body: { success: false, message: "All fields are required." },
  };
  return;
}
  if (!/^[a-zA-Z\s'-]+$/.test(cleanName)) {
  context.res = {
    status: 400,
    headers: { "Content-Type": "application/json" },
    body: { success: false, message: "Name must contain only letters." },
  };
  return;
}

  if (!/^\d{11}$/.test(cleanPhone)) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { success: false, message: "Phone number must be 11 digits." },
    };
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { success: false, message: "Invalid email format." },
    };
    return;
  }
  

  // Database connection
  try {
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      options: {
        encrypt: true,
      },
    };

    await sql.connect(config);

    // Check if phone number or email already exists
    const check = await sql.query`
  SELECT id, phone_number, email 
  FROM academy26 
  WHERE phone_number = ${cleanPhone} OR email = ${cleanEmail}
`;

    const existing = check.recordset[0];

if (existing) {
  if (existing.phone_number === cleanPhone) {
    await sql.query`
      UPDATE academy26 SET 
        full_name = ${cleanName},
        phone_number = ${cleanPhone},
        email = ${cleanEmail},
        academic_year = ${academicYear},
        department = ${department},
        first_preference = ${first_preference},
        second_preference = ${second_preference}
      WHERE phone_number = ${cleanPhone}
    `;
  } else {
    await sql.query`
      UPDATE academy26 SET 
        full_name = ${cleanName},
        phone_number = ${cleanPhone},
        email = ${cleanEmail},
        academic_year = ${academicYear},
        department = ${department},
        first_preference = ${first_preference},
        second_preference = ${second_preference}
      WHERE email = ${cleanEmail}
    `;
  }

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { success: true, message: "Your data has been updated successfully ✅" },
  };
}

else {
  // ✅ INSERT
  await sql.query`
    INSERT INTO academy26 
      (full_name, phone_number, email, academic_year, department, first_preference, second_preference, registration_date)
    VALUES 
      (${cleanName}, ${cleanPhone}, ${cleanEmail}, ${academicYear}, ${department}, ${first_preference}, ${second_preference}, GETDATE())
  `;

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { success: true, message: "Registration successful 🎉" },
  };
}
if (context.res?.body?.success) {
  // send to Google Form

    // Send to Google Form

    const googleFormUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSfTVyP5p6T0JIssfHCm-FpEJ9Fs_JSvGbBUKHXVA9k_APTsyg/formResponse";

    const params = new URLSearchParams({
      "entry.768381184": cleanName,
      "entry.815813477": cleanPhone,
      "entry.961742770": cleanEmail,
      "entry.542029883": academicYear,
      "entry.1919273035": department,
      "entry.1004628121": first_preference,
      "entry.1232000012": second_preference,
    });
    const fullUrl = `${googleFormUrl}?${params.toString()}`;
    try {
      await fetch(fullUrl, {
        method: "GET",
        mode: "no-cors",
      });
    } catch (err) {
      console.error("❌ Google Form submission failed:", err.message);
    }
  } }
  catch (err) {
  console.error("❌ Database error:", err);
  context.res = {
    status: 500,
    headers: { "Content-Type": "application/json" },
    body: {
      success: false,
      message: "Something went wrong. Please try again later.",
    },
  };
  } finally {
    sql.close();
  }
};
