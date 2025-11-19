import { ImageAnnotatorClient } from "@google-cloud/vision";
import cors from "cors";
import express from "express";
import path from "path";
import "dotenv/config";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" })); // accept base64 images

// Auth comes from GOOGLE_APPLICATION_CREDENTIALS env var
const vision = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

console.log("Loaded GAC:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

const MONEY = /(?<!\w)[\$€£]?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})(?!\w)/;
const MONEY_G = new RegExp(MONEY, "g");
const DATE_PATTERNS = [
  /\b(20\d{2}|19\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/,
  /\b(0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])[-/.](\d{2,4})\b/,
  /\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](\d{2,4})\b/
];

// Street suffixes to help guess addresses on the first line
const STREET_SUFFIXES = [
  "st", "street",
  "ave", "avenue",
  "blvd", "boulevard",
  "rd", "road",
  "dr", "drive",
  "ln", "lane",
  "way",
  "ct", "court",
  "hwy", "highway"
];

function toNum(s) {
  if (!s) return null;

  const n = parseFloat(
    s.replace(/\s/g, "").replace(/[€£$]/g, "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function currencyOf(text) {
  if (/\$/.test(text)) return "USD";
  if (/€/.test(text)) return "EUR";
  if (/£/.test(text)) return "GBP";
  return "UNKOWN";
}

function findDate(text) {
  const lines = text.split(/\r?\n/);
  for (const re of DATE_PATTERNS) {
    for (const L of lines){ 
      const m = L.match(re); 
      if (m) return m[0];
    }
  }
  return null;
}

function looksLikeAddress(line) {
  const low = line.toLowerCase();
  if (!/\d/.test(low)) return false; // require a number (street number)
  return STREET_SUFFIXES.some(sfx => new RegExp(`\\b${sfx}\\b`).test(low));
}

function findMerchant(text) {

  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const first = lines[0];

  if (!first) return null;
  if (looksLikeAddress(first)) {
    // if first line is an address, treat merchant as unknown
    return null;
  }
  // Otherwise just use first line as merchant
  return first;

  /*
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const L = lines[i];
    if (!/receipt|tax|total|invoice|order|qty|amount|price|thank/i.test(L)) return L;
  }
  return lines[0] || null;
  */
}

function findAddress(text) {

  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const first = lines[0];

  if (!first) return null;

  if (looksLikeAddress(first)) {
    // if first line looks like an address, take it
    return first;
  }
  // Otherwise unknown
  return null;
}

function totals(text) {

  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  let subtotal=null;
  let tax=null;
  let total=null;

  for (const L of lines) {
    const m = L.match(MONEY); 
    
    if (!m) continue;
      const low = L.toLowerCase();
    if (/(grand\s*)?total\b|amount\s*due\b|balance\s*due\b/.test(low)){
      total = toNum(m[0]) ?? total;
    }
    else if (/sub-?total\b/.test(low)){ 
      subtotal = toNum(m[0]) ?? subtotal;
    }
    else if (/\btax(es)?\b|sales\s*tax/.test(low)){ 
      tax = toNum(m[0]) ?? tax;
    }

  }
  if (total == null) {
    const nums = [...text.matchAll(MONEY_G)].map(x => toNum(x[0])).filter(x=>x!=null);
    if (nums.length) {
      total = nums.sort((a,b)=>b-a)[0];
    }
  }

  return { subtotal, tax, total };
}

function itemLines(text) {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  const items = [];

  for (const L of lines) {
    const low = L.toLowerCase();
    if (/subtotal|tax|total|amount due|grand total|balance|change|cash|credit/.test(low)) 
        continue;

    const prices = [...L.matchAll(MONEY_G)].map(m => m[0]);

    if (!prices.length) continue;

    const lineTotal = toNum(prices[prices.length-1]); 
    if (lineTotal==null) continue;

    const qtyMatch = L.match(/\b(\d+)\s*(x|pcs?|qty\.?)\b|\bx\s*(\d+)\b/i);
    const qty = qtyMatch ? Number(qtyMatch[1] || qtyMatch[3]) : 1;

    let unitPrice = null;
    if (qty>1 && prices.length>=2) {
      const maybe = toNum(prices[0]);
      if (maybe!=null && Math.abs(maybe*qty - lineTotal) < 0.05*lineTotal){
          unitPrice = maybe;
        }
    }

    const name = L.replace(MONEY_G, "").trim().replace(/\s{2,}/g, " ") || "Item";

    items.push({ name, qty, unitPrice, lineTotal });
  }

  return items;
}
function parseReceipt(text) {
  const safeText = text || "";
  const { subtotal, tax, total } = totals(safeText) || {};

  const merchant = findMerchant(safeText) || "UNKNOWN";
  const address = findAddress(safeText) || "UNKNOWN";
  const date = findDate(safeText) || "UNKNOWN";
  const currency = currencyOf(safeText) || "UNKNOWN";
  const items = itemLines(safeText) || [];

  return {
    merchant,
    date,
    address,
    currency,
    subtotal: subtotal ?? "UNKNOWN",
    tax: tax ?? "UNKNOWN",
    total: total ?? "UNKNOWN",
    items,
    rawText: safeText || "UNKNOWN"
  };

}

//Routing
app.post("/ocr", async (req, res) => {
  try {
    const { imageBase64 } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 required" });

    const [result] = await vision.annotateImage({
      image: { content: imageBase64 },
      features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
      imageContext: { languageHints: ["en"] }
    });

    const full = result.fullTextAnnotation?.text || "";
    res.json(parseReceipt(full));

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "OCR failed" });
  }
});

app.get("/health", (_req, res) => res.send("OK"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`OCR server: http://localhost:${PORT}`));
