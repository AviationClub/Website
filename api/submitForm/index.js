const { createClient } = require("@supabase/supabase-js");

module.exports = async function (context, req) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const {
      fullName,
      phoneNumber,
      email,
      academicYear,
      department,
      first_preference,
      second_preference,
    } = req.body || {};

    const cleanName = fullName?.trim();
    const cleanEmail = email?.toLowerCase().trim();
    const cleanPhone = phoneNumber?.trim();

    // =========================
    // ✅ VALIDATION
    // =========================
    if (
      !cleanName ||
      !cleanPhone ||
      !cleanEmail ||
      !academicYear ||
      !department ||
      !first_preference ||
      !second_preference
    ) {
      context.res = {
        status: 400,
        body: { success: false, message: "All fields are required." },
      };
      return;
    }

    if (!/^[a-zA-Z\s'-]+$/.test(cleanName)) {
      context.res = {
        status: 400,
        body: { success: false, message: "Name must contain only letters." },
      };
      return;
    }

    if (!/^\d{11}$/.test(cleanPhone)) {
      context.res = {
        status: 400,
        body: { success: false, message: "Phone must be 11 digits." },
      };
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      context.res = {
        status: 400,
        body: { success: false, message: "Invalid email." },
      };
      return;
    }

    // =========================
    // 🔍 CHECK EXISTING
    // Fix: use .limit(1) instead of .maybeSingle()
    // to avoid 406 error when OR matches multiple rows
    // =========================
    const { data: existingRows, error: checkError } = await supabase
      .from("academy26")
      .select("id")
      .or(`phone_number.eq.${cleanPhone},email.eq.${cleanEmail}`)
      .limit(1);

    if (checkError) throw checkError;

    const existing = existingRows?.[0] ?? null;

    // =========================
    // ✏️ UPDATE
    // =========================
    if (existing) {
      const { error: updateError } = await supabase
        .from("academy26")
        .update({
          full_name: cleanName,
          phone_number: cleanPhone,
          email: cleanEmail,
          academic_year: academicYear,
          department,
          first_preference,
          second_preference,
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      context.res = {
        status: 200,
        body: {
          success: true,
          message: "Your data has been updated successfully ✅",
        },
      };
      return; // 👈 prevent fall-through
    }

    // =========================
    // ➕ INSERT
    // =========================
    const { error: insertError } = await supabase
      .from("academy26")
      .insert([
        {
          full_name: cleanName,
          phone_number: cleanPhone,
          email: cleanEmail,
          academic_year: academicYear,
          department,
          first_preference,
          second_preference,
        },
      ]);

    if (insertError) throw insertError;

    context.res = {
      status: 200,
      body: {
        success: true,
        message: "Registration successful 🎉",
      },
    };

    // =========================
    // 📊 GOOGLE SHEETS (OPTIONAL)
    // Fix: wrapped in try/catch so it never crashes the function
    // =========================
    try {
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

      // Fix: globalThis.fetch is only available on Node 18+
      // Falls back to node-fetch if needed
      const fetchFn = globalThis.fetch ?? require("node-fetch");
      fetchFn(`${googleFormUrl}?${params.toString()}`, {
        method: "GET",
      }).catch(() => {});
    } catch (_) {
      // Google Sheets is optional — never let it break the main response
    }

  } catch (err) {
    console.error("❌ ERROR:", err);

    context.res = {
      status: 500,
      body: {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
    };
  }
};