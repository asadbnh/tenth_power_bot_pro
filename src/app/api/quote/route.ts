import { type NextRequest, NextResponse } from "next/server";
import { submitQuoteRequest } from "@/lib/actions/forms";

/**
 * POST /api/quote
 * API route endpoint for submitting quote requests.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await submitQuoteRequest(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
