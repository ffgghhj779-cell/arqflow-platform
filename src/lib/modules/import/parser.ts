import * as XLSX from "xlsx";
import mammoth from "mammoth";
// @ts-ignore
import PDFParser from "pdf2json";

/**
 * Parses raw CSV text into a grid of strings, handling quotes and escaped quotes.
 */
export function parseCSVText(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal.trim());
      lines.push(row);
      row = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    lines.push(row);
  }
  return lines.filter(r => r.length > 0 && r.some(cell => cell !== ""));
}

/**
 * Parses an Excel buffer into a grid of strings.
 */
export function parseExcelText(buffer: Buffer): string[][] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
  return jsonData
    .map(row =>
      Array.isArray(row)
        ? row.map(cell => String(cell === null || cell === undefined ? "" : cell).trim())
        : []
    )
    .filter(r => r.length > 0 && r.some(cell => cell !== ""));
}

/**
 * Extracts plain text from a PDF buffer using MinerU API.
 */
export async function parsePDFText(buffer: Buffer, fileName: string = "document.pdf"): Promise<string> {
  const BASE_URL = "https://mineru.net/api/v1/agent";
  
  // 1. Get signed upload URL
  const initRes = await fetch(`${BASE_URL}/parse/file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_name: fileName,
      language: "ch",
      enable_table: true,
      is_ocr: false,
      enable_formula: false
    })
  });
  
  const initData = await initRes.json();
  if (initData.code !== 0) {
    throw new Error(`MinerU API Error: ${initData.msg}`);
  }
  
  const { task_id, file_url } = initData.data;
  
  // 2. Upload the file
  const putRes = await fetch(file_url, {
    method: "PUT",
    body: buffer as any
  });
  
  if (!putRes.ok) {
    throw new Error(`MinerU Upload Error: ${putRes.status}`);
  }
  
  // 3. Poll for result (Wait up to 45 seconds to prevent Vercel timeout)
  const maxAttempts = 15;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const pollRes = await fetch(`${BASE_URL}/parse/${task_id}`);
    const pollData = await pollRes.json();
    const state = pollData.data?.state;
    
    if (state === "done") {
      const mdUrl = pollData.data.markdown_url;
      const mdRes = await fetch(mdUrl);
      return await mdRes.text();
    } else if (state === "failed") {
      throw new Error(`MinerU Extract Failed: ${pollData.data.err_msg}`);
    }
  }
  
  throw new Error("MinerU Timeout: Extraction took too long");
}

/**
 * Extracts plain text from a Word document (.docx) buffer.
 */
export async function parseDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

/**
 * Extracts plain text from a plain text buffer.
 */
export function parsePlainText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

/**
 * Helper to extract Google Sheet ID from a shareable link.
 */
export function extractGoogleSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Helper to extract Google Doc ID from a shareable link.
 */
export function extractGoogleDocId(url: string): string | null {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}
