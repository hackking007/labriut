// ─────────────────────────────────────────────────────────────
// Mock "AI" nutrition agent.
//
// DEMO brain for the calorie & nutrition calculator. It estimates
// calories + macros for what you ate (typed or "from a photo"),
// computes your daily target from age/height/weight/sex (Mifflin-
// St Jeor), tells you whether you're in deficit/surplus, and raises
// alerts that cross-reference your last blood test (e.g. high sodium
// in food + high sodium in blood → warning).
//
// To use a real model later, replace parseFoods/estimateFromPhoto
// with a call to a vision/LLM backend that returns the same item
// shape ({ name, qty, kcal, protein, carbs, fat, sodium, sugar }).
// ─────────────────────────────────────────────────────────────

// Per-typical-portion nutrition. sodium in mg, sugar/macros in grams.
// Each food carries he/en synonyms for fuzzy text matching.
const FOOD_DB = [
  { id: 'bread', he: ['לחם', 'פרוסת לחם', 'פרוסה'], en: ['bread', 'slice of bread', 'toast'], label_he: 'פרוסת לחם', label_en: 'Slice of bread', kcal: 80, protein: 3, carbs: 15, fat: 1, sodium: 150, sugar: 1 },
  { id: 'pita', he: ['פיתה'], en: ['pita'], label_he: 'פיתה', label_en: 'Pita', kcal: 165, protein: 6, carbs: 33, fat: 1, sodium: 320, sugar: 1 },
  { id: 'egg', he: ['ביצה', 'ביצים', 'חביתה'], en: ['egg', 'eggs', 'omelet', 'omelette'], label_he: 'ביצה', label_en: 'Egg', kcal: 78, protein: 6, carbs: 1, fat: 5, sodium: 62, sugar: 0 },
  { id: 'cheese_yellow', he: ['גבינה צהובה', 'צהובה'], en: ['yellow cheese', 'cheddar'], label_he: 'גבינה צהובה', label_en: 'Yellow cheese', kcal: 110, protein: 7, carbs: 1, fat: 9, sodium: 180, sugar: 0 },
  { id: 'cottage', he: ['קוטג', 'קוטג׳', 'גבינה לבנה'], en: ['cottage', 'white cheese'], label_he: 'קוטג׳', label_en: 'Cottage cheese', kcal: 90, protein: 11, carbs: 4, fat: 4, sodium: 330, sugar: 4 },
  { id: 'yogurt', he: ['יוגורט', 'יופלה'], en: ['yogurt', 'yoghurt'], label_he: 'יוגורט', label_en: 'Yogurt', kcal: 100, protein: 6, carbs: 12, fat: 3, sodium: 60, sugar: 12 },
  { id: 'milk', he: ['חלב', 'כוס חלב'], en: ['milk', 'glass of milk'], label_he: 'כוס חלב', label_en: 'Glass of milk', kcal: 105, protein: 8, carbs: 12, fat: 4, sodium: 100, sugar: 12 },
  { id: 'chicken', he: ['עוף', 'חזה עוף', 'שניצל'], en: ['chicken', 'chicken breast', 'schnitzel'], label_he: 'חזה עוף', label_en: 'Chicken breast', kcal: 165, protein: 31, carbs: 0, fat: 4, sodium: 75, sugar: 0 },
  { id: 'beef', he: ['בשר', 'בקר', 'סטייק', 'המבורגר'], en: ['beef', 'steak', 'burger', 'hamburger'], label_he: 'בשר בקר', label_en: 'Beef', kcal: 250, protein: 26, carbs: 0, fat: 17, sodium: 72, sugar: 0 },
  { id: 'fish', he: ['דג', 'סלמון', 'טונה'], en: ['fish', 'salmon', 'tuna'], label_he: 'דג', label_en: 'Fish', kcal: 200, protein: 22, carbs: 0, fat: 12, sodium: 60, sugar: 0 },
  { id: 'rice', he: ['אורז', 'אורז מלא'], en: ['rice', 'brown rice'], label_he: 'אורז (מנה)', label_en: 'Rice (serving)', kcal: 205, protein: 4, carbs: 45, fat: 0, sodium: 2, sugar: 0 },
  { id: 'pasta', he: ['פסטה', 'ספגטי', 'מקרוני'], en: ['pasta', 'spaghetti', 'macaroni'], label_he: 'פסטה (מנה)', label_en: 'Pasta (serving)', kcal: 220, protein: 8, carbs: 43, fat: 1, sodium: 5, sugar: 1 },
  { id: 'potato', he: ['תפוח אדמה', 'תפו"א', 'פירה'], en: ['potato', 'mashed potato'], label_he: 'תפוח אדמה', label_en: 'Potato', kcal: 130, protein: 3, carbs: 30, fat: 0, sodium: 10, sugar: 1 },
  { id: 'fries', he: ['צ׳יפס', "צ'יפס", 'צ’יפס', 'טוגנים'], en: ['fries', 'french fries', 'chips'], label_he: 'צ׳יפס (מנה)', label_en: 'French fries', kcal: 320, protein: 4, carbs: 41, fat: 16, sodium: 210, sugar: 0 },
  { id: 'salad', he: ['סלט', 'סלט ירקות'], en: ['salad', 'vegetable salad'], label_he: 'סלט ירקות', label_en: 'Vegetable salad', kcal: 70, protein: 2, carbs: 8, fat: 4, sodium: 200, sugar: 4 },
  { id: 'hummus', he: ['חומוס', 'חומוס מנה'], en: ['hummus'], label_he: 'חומוס (מנה)', label_en: 'Hummus', kcal: 180, protein: 6, carbs: 16, fat: 10, sodium: 380, sugar: 0 },
  { id: 'tahini', he: ['טחינה'], en: ['tahini'], label_he: 'טחינה', label_en: 'Tahini', kcal: 90, protein: 3, carbs: 3, fat: 8, sodium: 15, sugar: 0 },
  { id: 'lentils', he: ['עדשים', 'מרק עדשים'], en: ['lentils', 'lentil soup'], label_he: 'עדשים (מנה)', label_en: 'Lentils', kcal: 160, protein: 12, carbs: 27, fat: 1, sodium: 240, sugar: 2 },
  { id: 'avocado', he: ['אבוקדו'], en: ['avocado'], label_he: 'אבוקדו', label_en: 'Avocado', kcal: 160, protein: 2, carbs: 9, fat: 15, sodium: 7, sugar: 1 },
  { id: 'apple', he: ['תפוח', 'תפוח עץ'], en: ['apple'], label_he: 'תפוח', label_en: 'Apple', kcal: 95, protein: 0, carbs: 25, fat: 0, sodium: 2, sugar: 19 },
  { id: 'banana', he: ['בננה'], en: ['banana'], label_he: 'בננה', label_en: 'Banana', kcal: 105, protein: 1, carbs: 27, fat: 0, sodium: 1, sugar: 14 },
  { id: 'fruit', he: ['פרי', 'פירות'], en: ['fruit'], label_he: 'פרי', label_en: 'Fruit', kcal: 90, protein: 1, carbs: 22, fat: 0, sodium: 2, sugar: 16 },
  { id: 'nuts', he: ['אגוזים', 'שקדים', 'אגוזי מלך'], en: ['nuts', 'almonds', 'walnuts'], label_he: 'אגוזים (חופן)', label_en: 'Nuts (handful)', kcal: 180, protein: 6, carbs: 6, fat: 16, sodium: 1, sugar: 1 },
  { id: 'oil', he: ['שמן זית', 'כף שמן'], en: ['olive oil', 'oil'], label_he: 'שמן זית (כף)', label_en: 'Olive oil (tbsp)', kcal: 120, protein: 0, carbs: 0, fat: 14, sodium: 0, sugar: 0 },
  { id: 'pizza', he: ['פיצה', 'משולש פיצה'], en: ['pizza', 'pizza slice'], label_he: 'פיצה (משולש)', label_en: 'Pizza (slice)', kcal: 285, protein: 12, carbs: 36, fat: 10, sodium: 640, sugar: 4 },
  { id: 'sandwich', he: ['סנדוויץ', "סנדוויץ'", 'כריך', 'בורקס'], en: ['sandwich', 'burekas'], label_he: 'כריך', label_en: 'Sandwich', kcal: 300, protein: 12, carbs: 35, fat: 12, sodium: 520, sugar: 3 },
  { id: 'chocolate', he: ['שוקולד', 'חטיף שוקולד'], en: ['chocolate', 'chocolate bar'], label_he: 'שוקולד', label_en: 'Chocolate', kcal: 230, protein: 3, carbs: 25, fat: 13, sodium: 35, sugar: 23 },
  { id: 'cookie', he: ['עוגיה', 'עוגייה', 'עוגיות', 'ביסקוויט'], en: ['cookie', 'biscuit'], label_he: 'עוגייה', label_en: 'Cookie', kcal: 140, protein: 2, carbs: 19, fat: 7, sodium: 90, sugar: 11 },
  { id: 'cake', he: ['עוגה', 'פרוסת עוגה'], en: ['cake', 'slice of cake'], label_he: 'עוגה (פרוסה)', label_en: 'Cake (slice)', kcal: 350, protein: 4, carbs: 50, fat: 15, sodium: 300, sugar: 35 },
  { id: 'icecream', he: ['גלידה'], en: ['ice cream', 'icecream'], label_he: 'גלידה', label_en: 'Ice cream', kcal: 210, protein: 4, carbs: 24, fat: 11, sodium: 80, sugar: 21 },
  { id: 'soda', he: ['קולה', 'משקה מתוק', 'משקה ממותק', 'ספרייט', 'מיץ'], en: ['cola', 'coke', 'soda', 'soft drink', 'juice'], label_he: 'משקה ממותק', label_en: 'Sweet drink', kcal: 140, protein: 0, carbs: 39, fat: 0, sodium: 15, sugar: 39 },
  { id: 'coffee', he: ['קפה', 'קפה הפוך', 'נס קפה'], en: ['coffee', 'latte', 'cappuccino'], label_he: 'קפה', label_en: 'Coffee', kcal: 50, protein: 2, carbs: 5, fat: 2, sodium: 40, sugar: 4 },
  { id: 'sugar_spoon', he: ['כפית סוכר', 'סוכר'], en: ['sugar', 'teaspoon of sugar'], label_he: 'סוכר (כפית)', label_en: 'Sugar (tsp)', kcal: 16, protein: 0, carbs: 4, fat: 0, sodium: 0, sugar: 4 },
  { id: 'snack_salty', he: ['חטיף', 'במבה', 'ביסלי', 'צ׳יפס שקית'], en: ['snack', 'crisps', 'salty snack'], label_he: 'חטיף מלוח', label_en: 'Salty snack', kcal: 250, protein: 4, carbs: 28, fat: 14, sodium: 400, sugar: 2 },
  { id: 'pickles', he: ['חמוצים', 'מלפפון חמוץ', 'זיתים'], en: ['pickles', 'olives'], label_he: 'חמוצים/זיתים', label_en: 'Pickles/olives', kcal: 40, protein: 0, carbs: 2, fat: 3, sodium: 700, sugar: 0 },
]

const MACRO_KEYS = ['kcal', 'protein', 'carbs', 'fat', 'sodium', 'sugar']

function normalize(s) {
  return String(s).toLowerCase().replace(/["'’״׳]/g, '').trim()
}

// Find a food in the DB matching a free-text item.
function matchFood(text, lang) {
  const n = normalize(text)
  if (!n) return null
  const langKeys = lang === 'en' ? 'en' : 'he'
  // Prefer the longest matching synonym (so "גבינה צהובה" beats "גבינה").
  let best = null
  let bestLen = 0
  for (const food of FOOD_DB) {
    for (const syn of [...food.he, ...food.en]) {
      const ns = normalize(syn)
      if (n.includes(ns) && ns.length > bestLen) {
        best = food
        bestLen = ns.length
      }
    }
  }
  return best ? { food: best, langKeys } : null
}

// Parse a leading quantity like "2 ביצים" / "3 slices".
function parseQty(text) {
  const m = String(text).trim().match(/^(\d+(?:\.\d+)?)/)
  return m ? Math.min(20, Math.max(0.25, parseFloat(m[1]))) : 1
}

function scaleItem(food, qty, lang) {
  const item = {
    id: food.id,
    name: lang === 'en' ? food.label_en : food.label_he,
    qty,
  }
  MACRO_KEYS.forEach((k) => { item[k] = Math.round(food[k] * qty) })
  return item
}

/**
 * Parse typed food input (one item per line or comma-separated).
 * @returns {{ items: Array, unmatched: string[] }}
 */
export function parseFoods(text, lang = 'he') {
  const lines = String(text || '')
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const items = []
  const unmatched = []
  for (const line of lines) {
    const match = matchFood(line, lang)
    if (match) {
      items.push(scaleItem(match.food, parseQty(line), lang))
    } else {
      unmatched.push(line)
    }
  }
  return { items, unmatched }
}

// Stable hash (no Math.random) for deterministic "photo recognition".
function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * DEMO "vision" estimate from a photo: deterministically pick a few
 * plausible plate items from the file metadata. Swap for a real model.
 */
export function estimateFromPhoto(fileMeta, lang = 'he') {
  const seed = hashSeed(`${fileMeta?.name || 'plate'}-${fileMeta?.size || 1}`)
  const count = 2 + (seed % 3) // 2..4 items
  const items = []
  const used = new Set()
  for (let i = 0; i < count; i++) {
    const idx = (seed >> (i * 4)) % FOOD_DB.length
    if (used.has(idx)) continue
    used.add(idx)
    const qty = 1 + ((seed >> (i * 2)) % 2) // 1..2
    items.push(scaleItem(FOOD_DB[idx], qty, lang))
  }
  return items
}

// Mifflin-St Jeor BMR + activity → TDEE (maintenance calories).
const ACTIVITY = { low: 1.2, medium: 1.45, high: 1.7 }

export function calcTargets({ sex, age, height, weight, activity }) {
  const a = Number(age), h = Number(height), w = Number(weight)
  if (!a || !h || !w) return null
  const base = 10 * w + 6.25 * h - 5 * a
  const bmr = Math.round(sex === 'female' ? base - 161 : base + 5)
  const tdee = Math.round(bmr * (ACTIVITY[activity] || 1.2))
  return { bmr, tdee }
}

const DAILY_LIMITS = { sodium: 2300, sugar: 50 } // mg / g

/**
 * Full daily analysis.
 * @param {Array} items     parsed food items
 * @param {object} profile  { sex, age, height, weight, activity }
 * @param {object} bloodFlags  e.g. { sodium:'high', glucose:'high' }
 * @param {'he'|'en'} lang
 */
export function analyzeDay(items, profile, bloodFlags = {}, lang = 'he') {
  const T = TEXT[lang]
  const totals = {}
  MACRO_KEYS.forEach((k) => { totals[k] = items.reduce((s, it) => s + (it[k] || 0), 0) })

  const targets = calcTargets(profile)

  // Energy balance vs maintenance.
  let balance = null
  if (targets) {
    const diff = totals.kcal - targets.tdee
    let status = 'balanced'
    if (diff <= -150) status = 'deficit'
    else if (diff >= 150) status = 'surplus'
    const weeklyKg = Math.abs((diff * 7) / 7700)
    balance = { diff, status, weeklyKg: Math.round(weeklyKg * 10) / 10, ...targets }
  }

  // Macro split as % of energy (4/4/9 kcal per g).
  const macroKcal = {
    protein: totals.protein * 4,
    carbs: totals.carbs * 4,
    fat: totals.fat * 9,
  }
  const macroSum = macroKcal.protein + macroKcal.carbs + macroKcal.fat || 1
  const macroPct = {
    protein: Math.round((macroKcal.protein / macroSum) * 100),
    carbs: Math.round((macroKcal.carbs / macroSum) * 100),
    fat: Math.round((macroKcal.fat / macroSum) * 100),
  }

  // Alerts — cross-reference blood flags.
  const alerts = []
  // Sodium
  if (totals.sodium > DAILY_LIMITS.sodium) {
    if (bloodFlags.sodium === 'high') {
      alerts.push({ severity: 'high', icon: '🧂', text: T.alertSodiumBlood(totals.sodium) })
    } else {
      alerts.push({ severity: 'warn', icon: '🧂', text: T.alertSodium(totals.sodium) })
    }
  } else if (bloodFlags.sodium === 'high') {
    alerts.push({ severity: 'warn', icon: '🧂', text: T.bloodSodiumOnly })
  }
  // Sugar
  if (totals.sugar > DAILY_LIMITS.sugar) {
    if (bloodFlags.glucose === 'high') {
      alerts.push({ severity: 'high', icon: '🍬', text: T.alertSugarBlood(totals.sugar) })
    } else {
      alerts.push({ severity: 'warn', icon: '🍬', text: T.alertSugar(totals.sugar) })
    }
  } else if (bloodFlags.glucose === 'high') {
    alerts.push({ severity: 'warn', icon: '🍬', text: T.bloodGlucoseOnly })
  }
  // Fat vs cholesterol
  if (bloodFlags.cholesterol === 'high' && (macroPct.fat > 38 || totals.fat > 70)) {
    alerts.push({ severity: 'high', icon: '🧈', text: T.alertFatBlood })
  }
  // Positive note
  if (alerts.length === 0 && items.length > 0) {
    alerts.push({ severity: 'good', icon: '✅', text: T.allClear })
  }

  return { totals, targets, balance, macroPct, alerts }
}

const TEXT = {
  he: {
    alertSodium: (mg) => `צריכת הנתרן היומית גבוהה (כ-${mg} מ"ג, מעל המומלץ ~2300). כדאי להפחית מלח ומזון מעובד.`,
    alertSodiumBlood: (mg) => `שים/י לב! צרכת הרבה נתרן (כ-${mg} מ"ג) וגם בבדיקת הדם שלך הנתרן יצא גבוה — מומלץ מאוד להפחית מלח ולהקפיד על שתייה.`,
    bloodSodiumOnly: 'בבדיקת הדם שלך הנתרן יצא גבוה — שמור/י על צריכת מלח מתונה גם בימים הבאים.',
    alertSugar: (g) => `צריכת הסוכר היומית גבוהה (כ-${g} גרם, מעל המומלץ ~50). כדאי להפחית ממתקים ומשקאות ממותקים.`,
    alertSugarBlood: (g) => `שים/י לב! צרכת הרבה סוכר (כ-${g} גרם) וגם הגלוקוז בבדיקת הדם שלך יצא גבוה — מומלץ מאוד להפחית סוכרים ומשקאות מתוקים.`,
    bloodGlucoseOnly: 'הגלוקוז בבדיקת הדם שלך יצא גבוה — כדאי לשמור על צריכת סוכר נמוכה.',
    alertFatBlood: 'הכולסטרול בבדיקת הדם שלך גבוה והיום צרכת הרבה שומן — כדאי להעדיף שומנים בריאים ולהפחית שומן רווי ומטוגן.',
    allClear: 'הצריכה שלך היום נראית מאוזנת ביחס למדדים — כל הכבוד! המשך/י כך.',
  },
  en: {
    alertSodium: (mg) => `Your daily sodium is high (~${mg} mg, above the ~2300 recommendation). Consider cutting salt and processed food.`,
    alertSodiumBlood: (mg) => `Heads up! You ate a lot of sodium (~${mg} mg) and your blood test also showed high sodium — strongly consider reducing salt and staying hydrated.`,
    bloodSodiumOnly: 'Your blood test showed high sodium — keep salt intake moderate in the coming days too.',
    alertSugar: (g) => `Your daily sugar is high (~${g} g, above the ~50 recommendation). Consider cutting sweets and sugary drinks.`,
    alertSugarBlood: (g) => `Heads up! You ate a lot of sugar (~${g} g) and your blood glucose was also high — strongly consider reducing sugars and sweet drinks.`,
    bloodGlucoseOnly: 'Your blood glucose was high — try to keep sugar intake low.',
    alertFatBlood: 'Your blood cholesterol is high and you ate a lot of fat today — prefer healthy fats and cut saturated/fried fat.',
    allClear: 'Your intake today looks balanced relative to your markers — well done! Keep it up.',
  },
}
