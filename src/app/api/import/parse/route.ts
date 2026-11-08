import { NextResponse } from "next/server";
import { parseUploadedFile, parseGoogleDocOrSheet } from "@/lib/modules/import";

/**
 * POST handler for parsing imported files or Google Drive URLs into products/services.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const importType = formData.get("importType") as string;
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    if (!importType || (importType !== "products" && importType !== "services")) {
      return NextResponse.json(
        { error: "Invalid or missing importType. Must be 'products' or 'services'." },
        { status: 400 }
      );
    }

    if (!file && !url) {
      return NextResponse.json(
        { error: "Please provide either a file upload or a Google link." },
        { status: 400 }
      );
    }

    let items: any[] = [];

    if (file) {
      if (file.size === 0) {
        return NextResponse.json(
          { error: "EMPTY_FILE", message: "The uploaded file is empty." },
          { status: 422 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      items = await parseUploadedFile(
        buffer,
        file.name,
        file.type,
        importType as "products" | "services"
      );
    } else if (url) {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        return NextResponse.json(
          { error: "EMPTY_URL", message: "The URL link is empty." },
          { status: 400 }
        );
      }

      items = await parseGoogleDocOrSheet(
        trimmedUrl,
        importType as "products" | "services"
      );
    }

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    console.error("Smart Import route error:", err);

    const msg = err.message || "";

    if (msg === "PASSWORD_PROTECTED") {
      return NextResponse.json({
        error: "PASSWORD_PROTECTED",
        message: "The PDF file is password-protected. Please upload a decrypted version."
      }, { status: 422 });
    }

    if (msg === "UNSUPPORTED_FORMAT") {
      return NextResponse.json({
        error: "UNSUPPORTED_FORMAT",
        message: "Unsupported file format. Please upload Excel (.xlsx) or CSV."
      }, { status: 422 });
    }

    if (msg === "EMPTY_FILE_CONTENT") {
      return NextResponse.json({
        error: "EMPTY_CONTENT",
        message: "We could not find any text inside the uploaded document. Please make sure the file is not empty or scanned without OCR."
      }, { status: 422 });
    }

    if (msg === "INVALID_GOOGLE_URL") {
      return NextResponse.json({
        error: "INVALID_GOOGLE_URL",
        message: "Invalid Google Drive link. Please provide a standard shareable link to a Google Doc or Google Sheet."
      }, { status: 422 });
    }

    if (msg.startsWith("FAILED_TO_FETCH_GOOGLE")) {
      return NextResponse.json({
        error: "GOOGLE_FETCH_FAILED",
        message: "Failed to download document from Google. Please make sure the link is shareable ('anyone with the link can view')."
      }, { status: 422 });
    }

    if (msg === "ROOYA_API_KEY_MISSING") {
      return NextResponse.json({
        error: "ROOYA_CONFIG_ERROR",
        message: "Server configuration error: RooyaLLM API key is missing. Please add ROOYA_API_KEY to your .env file."
      }, { status: 422 });
    }

    if (msg === "AI_TIMEOUT") {
      return NextResponse.json({
        error: "AI_TIMEOUT",
        message: "The AI analysis timed out. Please try again with a smaller document or verify your connection."
      }, { status: 504 });
    }

    if (msg === "INVALID_AI_JSON") {
      return NextResponse.json({
        error: "INVALID_AI_RESPONSE",
        message: "Failed to structure the document data. The AI returned an invalid response structure. Please try again."
      }, { status: 422 });
    }

    // Handle specific API response errors from RooyaLLM
    if (msg.startsWith("API_RESPONSE_ERROR_")) {
      return NextResponse.json({
        error: "AI_API_ERROR",
        message: `AI Provider Error: ${msg.split(": ")[1] || msg}. Please check your API key and model.`
      }, { status: 422 });
    }

    // Default catch-all error (using 422 to prevent Next.js dev server from intercepting 500s with HTML)
    return NextResponse.json({
      error: "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred during parsing. Please try again."
    }, { status: 422 });
  }
}

