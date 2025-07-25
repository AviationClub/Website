const sql = require("mssql");
function failureResponse(message = "") {
  const title = "Registration failed";
  const header = "or Contact us on Facebook";
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>${title}</title>
      <style>
      * {
padding: 0;
margin: 0;
box-sizing: border-box;
font-family: sans-serif;
}
         body {
                display: flex;
                height: 100vh;
                justify-content: center;
                align-items: center;
                background: url(imgs/main_bg7.jpg);
                background-size: cover;
                background-position: center;
          }
          .container {
                width: 100%;
                max-width: 700px;
                background: rgba(0, 0, 0, 0.6);
                padding: 28px;
                margin: 0 28px;
                border-radius: 10px;
                box-shadow: inset -2px 2px 2px #9b9b9b;
              }
              
              .logo {
                display: block;
                margin-left: auto;
                margin-right: auto;
                width: 60%;
              }
              
              .form-title {
                font-size: 26px;
                font-weight: 600;
                text-align: center;
                padding-bottom: 6px;
                color: #fafafa;
                text-shadow: 2px 2px 2px #101010;
                border-bottom: solid 1px #9b9b9b;
              }

              .title{
                font-size: 24px;
                font-weight: 600;
                text-align: center;
                padding: 6px;
                color: #fafafa;
              }
              .message {
                color: white;
                text-align: center;
                margin-top: 20px;
                font-size: 22px;
              }
         @media (max-width: 700px) {
            .container, .logo {
              min-width: 300px;
            }
          }
          @media (max-width: 415px) {
                .logo {
                  min-width: 250px;
                }
              }
              @media (max-width: 375px) {
                .logo {
                  min-width: 200px;
                }
                .form-title {
                  font-size: 20px;
                }
              }
      </style>
  </head>
  <body>
      <div class="container">
       <div>
        <img class="logo" src="imgs/logo_mons.png" alt="logo">
        <h1 class="form-title">Aviation Club</h1>
      </div>
      <h1 class="title">${title}</h1>
      <p class="message">${message}</p>
      <p class="message">${header}</p>
      </div>
  </body>
  </html>`;
}
function successResponse(message = "") {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Succeed</title>
        <style>
        * {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}
           body {
                  display: flex;
                  height: 100vh;
                  justify-content: center;
                  align-items: center;
                  background: url(imgs/main_bg7.jpg);
                  background-size: cover;
                  background-position: center;
            }
            .container {
                  width: 100%;
                  max-width: 700px;
                  background: rgba(0, 0, 0, 0.6);
                  padding: 28px;
                  margin: 0 28px;
                  border-radius: 10px;
                  box-shadow: inset -2px 2px 2px #9b9b9b;
                }
                
                .logo {
                  display: block;
                  margin-left: auto;
                  margin-right: auto;
                  width: 60%;
                }
                
                .form-title {
                  font-size: 26px;
                  font-weight: 600;
                  text-align: center;
                  padding-bottom: 6px;
                  color: #fafafa;
                  text-shadow: 2px 2px 2px #101010;
                  border-bottom: solid 1px #9b9b9b;
                }

                .title{
                  font-size: 24px;
                  font-weight: 600;
                  text-align: center;
                  padding: 6px;
                  color: #fafafa;
                }
                .message {
                  color: white;
                  text-align: center;
                  margin-top: 20px;
                  font-size: 22px;
                }
           @media (max-width: 700px) {
              .container, .logo {
                min-width: 300px;
              }
            }
            @media (max-width: 415px) {
                  .logo {
                    min-width: 250px;
                  }
                }
                @media (max-width: 375px) {
                  .logo {
                    min-width: 200px;
                  }
                  .form-title {
                    font-size: 20px;
                  }
                }
        </style>
    </head>
    <body>
        <div class="container">
         <div>
          <img class="logo" src="imgs/logo_mons.png" alt="logo">
          <h1 class="form-title">Aviation Club</h1>
        </div>
        <p class="message">${message}</p>
      <p class="message">Assessment QR</p>
      <img src="qr.svg" alt="Description" width="100" height="100">
      <a class="message" href="https://forms.office.com/r/BSYeQMVKen">Or Click Here</a>
        </div>
    </body>
    </html>`;
}
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
  // Validation
  if (
    !fullName ||
    !phoneNumber ||
    !email ||
    !academicYear ||
    !department ||
    !first_preference ||
    !second_preference
  ) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "text/html" },
      body: failureResponse("All fields are required."),
    };
    return;
  }

  if (!/^\d{11}$/.test(phoneNumber)) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "text/html" },
      body: failureResponse("Phone number must be 11 digits."),
    };
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "text/html" },
      body: failureResponse("Invalid email format."),
    };
    return;
  }

  // Database connection
  try {
    const config = {
      user: "Aviationclub2",
      password: "Aviation@Mazen2024",
      server: "aviationclub.database.windows.net", // e.g. yourserver.database.windows.net
      database: "aviationclub",
      options: {
        encrypt: true,
      },
    };

    await sql.connect(config);

    // Check if phone number already exists
    const check =
      await sql.query`SELECT id FROM academy25 WHERE phone_number = ${phoneNumber}`;

    if (check.recordset.length > 0) {
      // Update existing entry
      await sql.query`
        UPDATE academy25 SET 
          full_name = ${fullName},
          email = ${email},
          academic_year = ${academicYear},
          department = ${department},
          first_preference = ${first_preference},
          second_preference = ${second_preference}
        WHERE phone_number = ${phoneNumber}
      `;
      context.res = {
        status: 200,
        headers: { "Content-Type": "text/html" },
        body: successResponse("Update successful!"),
      };
    } else {
      // Insert new entry
      await sql.query`
        INSERT INTO academy25 
          (full_name, phone_number, email, academic_year, department, first_preference, second_preference, registration_date)
        VALUES 
          (${fullName}, ${phoneNumber}, ${email}, ${academicYear}, ${department}, ${first_preference}, ${second_preference}, GETDATE())
      `;
      context.res = {
        status: 200,
        headers: { "Content-Type": "text/html" },
        body: successResponse("Registration successful!"),
      };
    }

    // Send to Google Form
    const googleFormUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLScaNVeoHs3wzfk9ejnXprVjsZGcnnH8ZpSsN8ab-q32cC7sjw/formResponse";
    const googleData = new URLSearchParams({
      "entry.2098490856": fullName,
      "entry.824023913": phoneNumber,
      "entry.1569261934": email,
      "entry.1996635909": academicYear,
      "entry.1561298937": department,
      "entry.920172784": first_preference,
      "entry.1456972979": second_preference,
    }).toString();

    try {
      await axios.post(googleFormUrl, googleData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    } catch (err) {
      console.error("❌ Google Form submission failed:", err.message);
    }
  } catch (err) {
    console.error("❌ Database error:", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "text/html" },
      body: failureResponse("Please Try Again" + err.message),
    };
  } finally {
    sql.close();
  }
};

// const mysql = require("mysql2/promise");
// const axios = require("axios");

// module.exports = async function (context, req) {
//   context.log("Function started");

//   if (req.method !== "POST") {
//     context.res = {
//       status: 405,
//       body: "Method not allowed",
//     };
//     return;
//   }

//   const {
//     fullName,
//     phoneNumber,
//     email,
//     academicYear,
//     department,
//     first_preference,
//     second_preference,
//   } = req.body;

//   context.log("Request body received:", req.body);

//   if (
//     ![
//       fullName,
//       phoneNumber,
//       email,
//       academicYear,
//       department,
//       first_preference,
//       second_preference,
//     ].every(Boolean)
//   ) {
//     return sendHTML(context, false, "All fields are required.");
//   }

//   if (!/^\d{11}$/.test(phoneNumber)) {
//     return sendHTML(context, false, "Phone number must be 11 digits.");
//   }

//   if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
//     return sendHTML(context, false, "Invalid email format.");
//   }

//   const db_host = "aviationclub.database.windows.net";
//   const db_name = "aviationclub";
//   const db_user = "Aviationclub2";
//   const db_pass = "Aviation@Mazen2024";

//   let conn;

//   try {
//     context.log("Connecting to DB...");
//     conn = await mysql.createConnection({
//       host: db_host,
//       user: db_user,
//       password: db_pass,
//       database: db_name,
//       ssl: { rejectUnauthorized: false }, // Important for Azure
//     });
//     context.log("DB connection successful");

//     const [existing] = await conn.execute(
//       "SELECT id FROM academy25 WHERE phone_number = ?",
//       [phoneNumber],
//     );

//     context.log("Query executed. Existing record count:", existing.length);

//     if (existing.length > 0) {
//       context.log("Updating existing record...");
//       await conn.execute(
//         `UPDATE academy25 SET
//           full_name = ?, email = ?, academic_year = ?, department = ?,
//           first_preference = ?, second_preference = ?
//           WHERE phone_number = ?`,
//         [
//           fullName,
//           email,
//           academicYear,
//           department,
//           first_preference,
//           second_preference,
//           phoneNumber,
//         ],
//       );
//       context.log("Update completed.");
//     } else {
//       context.log("Inserting new record...");
//       await conn.execute(
//         `INSERT INTO academy25
//           (full_name, phone_number, email, academic_year, department, first_preference, second_preference,registration_date)
//           VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           fullName,
//           phoneNumber,
//           email,
//           academicYear,
//           department,
//           first_preference,
//           second_preference,
//           new Date(),
//         ],
//       );
//       context.log("Insert completed.");
//     }

//     await conn.end();
//     context.log("DB connection closed.");

//     const googleFormUrl =
//       "https://docs.google.com/forms/d/e/1FAIpQLScaNVeoHs3wzfk9ejnXprVjsZGcnnH8ZpSsN8ab-q32cC7sjw/formResponse";
//     const formFields = {
//       "entry.2098490856": fullName,
//       "entry.824023913": phoneNumber,
//       "entry.1569261934": email,
//       "entry.1996635909": academicYear,
//       "entry.1561298937": department,
//       "entry.920172784": first_preference,
//       "entry.1456972979": second_preference,
//     };

//     try {
//       context.log("Submitting to Google Form...");
//       await axios.post(googleFormUrl, new URLSearchParams(formFields));
//       context.log("Google Form submission successful.");
//     } catch (err) {
//       context.log("Google Form error: ", err.message);
//     }

//     return sendHTML(
//       context,
//       true,
//       existing.length > 0 ? "Update successful!" : "Registration successful!",
//     );
//   } catch (err) {
//     const errorMessage = `Internal server error: ${err.message}`;
//     context.log("Caught error:", err.stack || err.message);
//     return sendHTML(context, false, errorMessage);
//   }
// };

// function sendHTML(context, success, message) {
//   const title = success ? "Success" : "Registration Failed";
//   const header = success ? "" : "or Contact us on Facebook";
//   const html = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>${title}</title>
//     <style>
//       body {
//         display: flex;
//         height: 100vh;
//         justify-content: center;
//         align-items: center;
//         background: url(/imgs/main_bg7.jpg) no-repeat center center / cover;
//         margin: 0;
//       }
//       .container {
//         background: rgba(0, 0, 0, 0.6);
//         padding: 28px;
//         border-radius: 10px;
//         box-shadow: inset -2px 2px 2px #9b9b9b;
//         text-align: center;
//         color: white;
//         max-width: 600px;
//       }
//       .logo {
//         width: 60%;
//         margin: 0 auto 20px;
//       }
//       .title {
//         font-size: 24px;
//         font-weight: bold;
//       }
//       .message {
//         margin-top: 15px;
//         font-size: 20px;
//         word-wrap: break-word;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="container">
//       <img class="logo" src="/imgs/logo_mons.png" alt="logo" />
//       <h1 class="title">${title}</h1>
//       <p class="message">${message}</p>
//       <p class="message">${header}</p>
//     </div>
//   </body>
//   </html>`;
//   context.res = {
//     headers: { "Content-Type": "text/html" },
//     body: html,
//   };
// }
// api/SubmitFormAC25.js
/*module.exports = async function (context, req) {
  context.log("Function running...");
  const body = req.body;
  context.log("Form submission:", body);
  context.res = {
    status: 200,
    body: { message: "Received!", data: body },
  };
};
*/
