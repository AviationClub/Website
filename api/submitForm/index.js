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
      <img src="imgs/qr.svg" alt="QR Code" width="100" height="100">
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
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
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

    const params = new URLSearchParams({
      "entry.2098490856": fullName,
      "entry.824023913": phoneNumber,
      "entry.1569261934": email,
      "entry.1996635909": academicYear,
      "entry.1561298937": department,
      "entry.920172784": first_preference,
      "entry.1456972979": second_preference,
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
