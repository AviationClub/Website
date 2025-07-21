const mysql = require("mysql2/promise");
const axios = require("axios");

module.exports = async function (context, req) {
  if (req.method !== "POST") {
    context.res = {
      status: 405,
      body: "Method not allowed",
    };
    return;
  }

  const {
    fullName,
    phoneNumber,
    email,
    academicYear,
    department,
    first_preference,
    second_preference,
  } = req.body;

  // Validate required fields
  if (
    ![
      fullName,
      phoneNumber,
      email,
      academicYear,
      department,
      first_preference,
      second_preference,
    ].every(Boolean)
  ) {
    return sendHTML(context, false, "All fields are required.");
  }

  if (!/^\d{11}$/.test(phoneNumber)) {
    return sendHTML(context, false, "Phone number must be 11 digits.");
  }

  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return sendHTML(context, false, "Invalid email format.");
  }

  // DB credentials (NEVER commit sensitive info to GitHub)
  const db_host = "aviationclub.database.windows.net";
  const db_name = "aviationclub";
  const db_user = "Aviationclub2";
  const db_pass = "Aviation@Mazen2024";

  try {
    console.log("Connecting to DB...");
    const conn = await mysql.createConnection({
      host: db_host,
      user: db_user,
      password: db_pass,
      database: db_name,
    });
    console.log("DB connection successful");
    const [existing] = await conn.execute(
      "SELECT id FROM academy25 WHERE phone_number = ?",
      [phoneNumber],
    );

    if (existing.length > 0) {
      await conn.execute(
        `UPDATE academy25 SET 
          full_name = ?, email = ?, academic_year = ?, department = ?, 
          first_preference = ?, second_preference = ? 
          WHERE phone_number = ?`,
        [
          fullName,
          email,
          academicYear,
          department,
          first_preference,
          second_preference,
          phoneNumber,
        ],
      );
    } else {
      await conn.execute(
        `INSERT INTO academy25 
          (full_name, phone_number, email, academic_year, department, first_preference, second_preference)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          fullName,
          phoneNumber,
          email,
          academicYear,
          department,
          first_preference,
          second_preference,
        ],
      );
    }

    await conn.end();

    // Submit to Google Form
    const googleFormUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLScaNVeoHs3wzfk9ejnXprVjsZGcnnH8ZpSsN8ab-q32cC7sjw/formResponse";
    const formFields = {
      "entry.2098490856": fullName,
      "entry.824023913": phoneNumber,
      "entry.1569261934": email,
      "entry.1996635909": academicYear,
      "entry.1561298937": department,
      "entry.920172784": first_preference,
      "entry.1456972979": second_preference,
    };

    try {
      await axios.post(googleFormUrl, new URLSearchParams(formFields));
    } catch (err) {
      context.log("Google Form error: ", err.message);
    }

    return sendHTML(
      context,
      true,
      existing.length > 0 ? "Update successful!" : "Registration successful!",
    );
  } catch (err) {
    context.log("Error:", err);
    return sendHTML(context, false, "Please try again.");
  }
};

function sendHTML(context, success, message) {
  const title = success ? "Success" : "Registration Failed";
  const header = success ? "" : "or Contact us on Facebook";
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body {
        display: flex;
        height: 100vh;
        justify-content: center;
        align-items: center;
        background: url(/imgs/main_bg7.jpg) no-repeat center center / cover;
        margin: 0;
      }
      .container {
        background: rgba(0, 0, 0, 0.6);
        padding: 28px;
        border-radius: 10px;
        box-shadow: inset -2px 2px 2px #9b9b9b;
        text-align: center;
        color: white;
        max-width: 600px;
      }
      .logo {
        width: 60%;
        margin: 0 auto 20px;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
      }
      .message {
        margin-top: 15px;
        font-size: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img class="logo" src="/imgs/logo_mons.png" alt="logo" />
      <h1 class="title">${title}</h1>
      <p class="message">${message}</p>
      <p class="message">${header}</p>
    </div>
  </body>
  </html>`;
  context.res = {
    headers: { "Content-Type": "text/html" },
    body: html,
  };
}
