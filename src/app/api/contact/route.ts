import { type NextRequest, NextResponse } from "next/server";
import { submitContactForm } from "@/lib/actions/forms";

/**
 * POST /api/contact
 * API route endpoint for submitting contact form messages.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await submitContactForm(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
