const { createClient } = require("@supabase/supabase-js");

module.exports = async function (context, req) {
  context.log("🔥 Function started");

  try {
    // 🔑 Check env variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      context.res = {
        status: 500,
        body: {
          success: false,
          message: "Missing environment variables",
        },
      };
      return;
    }

    // 🧪 Create client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 🧪 SIMPLE INSERT (hardcoded)
    const { error } = await supabase.from("academy26").insert([
      {
        full_name: "TEST USER",
        phone_number: "01234567890",
        email: "test@test.com",
        academic_year: "3",
        department: "IT",
        first_preference: "A",
        second_preference: "B",
      },
    ]);

    if (error) {
      context.log("❌ Supabase error:", error);

      context.res = {
        status: 500,
        body: {
          success: false,
          message: error.message,
        },
      };
      return;
    }

    // ✅ SUCCESS
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        success: true,
        message: "TEST INSERT WORKED",
      },
    };
  } catch (err) {
    context.log("❌ Server crash:", err);

    context.res = {
      status: 500,
      body: {
        success: false,
        message: "Server crashed",
      },
    };
  }
};