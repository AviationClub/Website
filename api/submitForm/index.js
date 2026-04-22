const { createClient } = require("@supabase/supabase-js");

module.exports = async function (context, req) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const {
    fullName,
    phoneNumber,
    email,
    academicYear,
    department,
    first_preference,
    second_preference,
  } = req.body;

  const cleanName = fullName?.trim();
  const cleanEmail = email?.toLowerCase().trim();
  const cleanPhone = phoneNumber?.trim();

  // ✅ Validation
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
      body: { success: false, message: "All fields are required" },
    };
    return;
  }

  if (!/^[a-zA-Z\s'-]+$/.test(cleanName)) {
    context.res = {
      status: 400,
      body: { success: false, message: "Invalid name" },
    };
    return;
  }

  if (!/^\d{11}$/.test(cleanPhone)) {
    context.res = {
      status: 400,
      body: { success: false, message: "Phone must be 11 digits" },
    };
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    context.res = {
      status: 400,
      body: { success: false, message: "Invalid email" },
    };
    return;
  }

  try {
    // 🔍 Check existing
    const { data: existing, error: checkError } = await supabase
      .from("academy26")
      .select("id")
      .or(`phone_number.eq.${cleanPhone},email.eq.${cleanEmail}`)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // 🔄 Update
      const { error } = await supabase
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

      if (error) throw error;

      context.res = {
        status: 200,
        body: { success: true, message: "Updated successfully ✅" },
      };
      return;
    }

    // ➕ Insert
    const { error } = await supabase.from("academy26").insert([
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

    if (error) throw error;

    context.res = {
      status: 200,
      body: { success: true, message: "Registration successful 🎉" },
    };
  } catch (err) {
    console.error(err);

    context.res = {
      status: 500,
      body: { success: false, message: "Server error" },
    };
  }
};