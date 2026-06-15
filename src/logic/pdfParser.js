// Real (client-side) PDF text extraction for blood-test reports.
// Uses pdf.js to pull the text layer out of digital lab PDFs, then
// matches known marker names/abbreviations and grabs the value next
// to each. No backend or API key needed — runs in the browser, so it
// works on a static host like Render.
//
// Note: this reads DIGITAL (text-based) PDFs. Scanned/photographed
// PDFs without a text layer won't contain extractable text — those
// need OCR, which can be added later (e.g. Tesseract.js).

import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { BLOOD_MARKERS } from './bloodAnalysis.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

// Name / abbreviation synonyms per marker (Hebrew + English + lab codes).
const SYNONYMS = {
  hemoglobin: ['hemoglobin', 'haemoglobin', 'hgb', 'hb', 'המוגלובין'],
  wbc: ['wbc', 'white blood cell', 'leukocyte', 'leucocyte', 'תאי דם לבנים', 'כדוריות לבנות', 'לויקוציטים'],
  glucose: ['glucose', 'glu', 'fasting glucose', 'גלוקוז', 'סוכר בצום', 'סוכר'],
  cholesterol: ['total cholesterol', 'cholesterol', 'chol', 'כולסטרול כללי', 'כולסטרול'],
  vitaminD: ['25-oh vitamin d', '25-hydroxy', 'vitamin d', 'vit d', 'ויטמין d', 'ויטמין די'],
  ferritin: ['ferritin', 'פריטין'],
  sodium: ['sodium', 'na+', 'na ', 'נתרן'],
}

// Pull all text from the PDF, page by page.
async function extractText(file) {
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  let text = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    text += ' ' + content.items.map((it) => it.str).join(' ')
  }
  return text.replace(/\s+/g, ' ')
}

// For a marker, find a synonym in the text and grab the first plausible
// number that appears right after it.
function valueNear(text, lower, marker) {
  const span = marker.max - marker.min || 1
  const lo = marker.min - span * 1.5 // tolerate values a bit outside range
  const hi = marker.max + span * 3

  for (const syn of SYNONYMS[marker.key]) {
    let from = 0
    let idx
    while ((idx = lower.indexOf(syn, from)) !== -1) {
      const window = text.slice(idx + syn.length, idx + syn.length + 40)
      const m = window.match(/(-?\d+(?:[.,]\d+)?)/)
      if (m) {
        const v = parseFloat(m[1].replace(',', '.'))
        if (!Number.isNaN(v) && v >= lo && v <= hi) {
          const factor = Math.pow(10, marker.decimals)
          return Math.round(v * factor) / factor
        }
      }
      from = idx + syn.length
    }
  }
  return null
}

/**
 * Parse a blood-test PDF.
 * @returns {Promise<{ values: Record<string, number>, found: string[], hadText: boolean }>}
 */
export async function parseBloodPdf(file) {
  const text = await extractText(file)
  const hadText = text.trim().length > 10
  const lower = text.toLowerCase()

  const values = {}
  const found = []
  for (const marker of BLOOD_MARKERS) {
    const v = valueNear(text, lower, marker)
    if (v != null) {
      values[marker.key] = v
      found.push(marker.key)
    }
  }
  return { values, found, hadText }
}
