import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
    } = await req.json();

    const cleanName = fullName?.trim();
    const cleanEmail = email?.toLowerCase().trim();
    const cleanPhone = phoneNumber?.trim();

    // Validation
    if (
      !cleanName ||
      !cleanPhone ||
      !cleanEmail ||
      !academicYear ||
      !department ||
      !first_preference ||
      !second_preference
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z\s'-]+$/.test(cleanName)) {
      return NextResponse.json(
        { success: false, message: "Name must contain only letters." },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: "Phone must be 11 digits." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email." },
        { status: 400 }
      );
    }

    // Check for existing entry by phone or email
    const { data: existingRows, error: checkError } = await supabase
      .from("academy26")
      .select("id")
      .or(`phone_number.eq.${cleanPhone},email.eq.${cleanEmail}`)
      .limit(1);

    if (checkError) throw checkError;

    const existing = existingRows?.[0] ?? null;

    //  Update if exists, otherwise Insert
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

      // Fire google sheets (optional, non-blocking)
      fireGoogleSheet({ cleanName, cleanPhone, cleanEmail, academicYear, department, first_preference, second_preference });

      return NextResponse.json({
        success: true,
        message: "Your data has been updated successfully ✅",
      });
    }

    //  Insert new entry
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

    // fire google sheets (optional, non-blocking)
    fireGoogleSheet({ cleanName, cleanPhone, cleanEmail, academicYear, department, first_preference, second_preference });

    return NextResponse.json({
      success: true,
      message: "Registration successful 🎉",
    });

  } catch (err) {
    console.error("❌ ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

// GOOGLE SHEETS (fire and forget)
function fireGoogleSheet({
  cleanName,
  cleanPhone,
  cleanEmail,
  academicYear,
  department,
  first_preference,
  second_preference,
}: {
  cleanName: string;
  cleanPhone: string;
  cleanEmail: string;
  academicYear: string;
  department: string;
  first_preference: string;
  second_preference: string;
}) {
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

    fetch(`${googleFormUrl}?${params.toString()}`, { method: "GET" }).catch(() => {});
  } catch (_) {
    // never let Google Sheets break the main response
  }
}