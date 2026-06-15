// ─────────────────────────────────────────────────────────────
// Mock "AI agent" for blood-test analysis.
//
// This is a DEMO brain. It applies reference ranges and produces a
// human-readable summary + recommendations. To switch to a real model
// later, replace `analyzeBloodTest` with a call to your backend / LLM
// API that returns the same shape ({ markers, summary, recommendations }).
// ─────────────────────────────────────────────────────────────

// Reference ranges (adult, general). Kept simple for the demo.
export const BLOOD_MARKERS = [
  { key: 'hemoglobin', min: 12, max: 17.5, decimals: 1 },
  { key: 'wbc', min: 4, max: 11, decimals: 1 },
  { key: 'glucose', min: 70, max: 100, decimals: 0 },
  { key: 'cholesterol', min: 0, max: 200, decimals: 0 },
  { key: 'vitaminD', min: 30, max: 100, decimals: 0 },
  { key: 'ferritin', min: 30, max: 300, decimals: 0 },
  { key: 'sodium', min: 135, max: 145, decimals: 0 },
]

export const SAMPLE_VALUES = {
  hemoglobin: 11.2,
  wbc: 6.5,
  glucose: 108,
  cholesterol: 215,
  vitaminD: 18,
  ferritin: 22,
  sodium: 148,
}

// Stable string -> int hash (no Math.random; deterministic per file).
function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * DEMO "OCR": deterministically derive blood values from an uploaded
 * file's metadata, so the upload flow produces a result. Values land
 * mostly in-range with a few out-of-range, for a realistic demo.
 * Replace with a real OCR/LLM backend that reads the actual file.
 * @returns {Record<string, number>}
 */
export function extractValuesFromFile(fileMeta) {
  const seed = hashSeed(`${fileMeta?.name || 'blood'}-${fileMeta?.size || 1}`)
  const values = {}
  BLOOD_MARKERS.forEach((m, i) => {
    const span = (m.max - m.min) || 1
    const lo = m.min - span * 0.25
    const hi = m.max + span * 0.25
    const frac = ((seed >> (i * 3)) % 1000) / 1000 // 0..1, deterministic
    const raw = lo + frac * (hi - lo)
    const factor = Math.pow(10, m.decimals)
    values[m.key] = Math.round(raw * factor) / factor
  })
  return values
}

function statusOf(value, marker) {
  if (value == null || value === '' || Number.isNaN(Number(value))) return null
  const v = Number(value)
  if (v < marker.min) return 'low'
  if (v > marker.max) return 'high'
  return 'normal'
}

// Plain-language notes per marker & direction, in both languages.
const NOTES = {
  he: {
    hemoglobin: {
      low: 'המוגלובין נמוך עשוי להעיד על אנמיה (לרוב מחוסר ברזל). ייתכנו עייפות וחיוורון.',
      high: 'המוגלובין גבוה יכול לנבוע מהתייבשות או מסיבות אחרות שכדאי לברר.',
    },
    wbc: {
      low: 'ספירת תאים לבנים נמוכה עשויה להופיע לאחר זיהום ויראלי או מסיבות נוספות.',
      high: 'ספירת תאים לבנים גבוהה מופיעה לרוב בזיהום או דלקת פעילה.',
    },
    glucose: {
      low: 'סוכר נמוך בצום — שימו לב לתסמינים כמו רעב, רעד או חולשה.',
      high: 'סוכר גבוה בצום עשוי להעיד על טרום-סוכרת או סוכרת — מומלץ מעקב.',
    },
    cholesterol: {
      high: 'כולסטרול כללי גבוה הוא גורם סיכון לב-וכלי דם. תזונה ופעילות גופנית עוזרות.',
    },
    vitaminD: {
      low: 'חוסר בוויטמין D נפוץ מאוד, במיוחד בחורף. קשור לעייפות ולבריאות העצם.',
    },
    ferritin: {
      low: 'פריטין נמוך מעיד על מאגרי ברזל דלים — לעיתים עוד לפני אנמיה ממשית.',
      high: 'פריטין גבוה יכול להופיע בדלקת או בעומס ברזל — כדאי לברר.',
    },
    sodium: {
      low: 'נתרן נמוך בדם עשוי לנבוע משתייה מרובה מאוד או מסיבות אחרות שכדאי לברר.',
      high: 'נתרן גבוה בדם נקשר לרוב לצריכת מלח גבוהה או להתייבשות — מומלץ להפחית מלח ולהקפיד על שתייה.',
    },
  },
  en: {
    hemoglobin: {
      low: 'Low hemoglobin may indicate anemia (often iron-deficiency). Fatigue and pallor are common.',
      high: 'High hemoglobin can result from dehydration or other causes worth checking.',
    },
    wbc: {
      low: 'A low white-cell count can follow a viral infection, among other causes.',
      high: 'A high white-cell count usually appears with active infection or inflammation.',
    },
    glucose: {
      low: 'Low fasting glucose — watch for symptoms like hunger, shakiness or weakness.',
      high: 'High fasting glucose may suggest pre-diabetes or diabetes — monitoring is advised.',
    },
    cholesterol: {
      high: 'High total cholesterol is a cardiovascular risk factor. Diet and exercise help.',
    },
    vitaminD: {
      low: 'Vitamin D deficiency is very common, especially in winter. Linked to fatigue and bone health.',
    },
    ferritin: {
      low: 'Low ferritin reflects depleted iron stores — sometimes before true anemia appears.',
      high: 'High ferritin can occur with inflammation or iron overload — worth investigating.',
    },
    sodium: {
      low: 'Low blood sodium can result from very high fluid intake or other causes worth checking.',
      high: 'High blood sodium is usually linked to high salt intake or dehydration — reduce salt and stay hydrated.',
    },
  },
}

const RECS = {
  he: {
    iron: 'שלבו מקורות ברזל (קטניות, בשר אדום רזה, ירקות עליים) יחד עם ויטמין C לספיגה טובה.',
    sugar: 'הפחיתו סוכרים פשוטים ומשקאות ממותקים, והוסיפו פעילות אירובית קבועה.',
    chol: 'העדיפו שומנים בריאים (אגוזים, אבוקדו, שמן זית) והגבירו סיבים תזונתיים.',
    vitd: 'חשיפה מתונה לשמש ושקילת תוסף ויטמין D בהתייעצות עם רופא.',
    salt: 'הפחיתו מלח ומזון מעובד/משומר, והעדיפו תיבול בעשבי תיבול. הקפידו על שתייה.',
    hydrate: 'הקפידו על שתייה מספקת לאורך היום.',
    general: 'שמרו על שינה איכותית, פעילות גופנית סדירה ותזונה מאוזנת.',
    followup: 'מומלץ להציג את הבדיקה לרופא/ה לקבלת פרשנות אישית ומעקב.',
  },
  en: {
    iron: 'Add iron sources (legumes, lean red meat, leafy greens) together with vitamin C for absorption.',
    sugar: 'Cut simple sugars and sweet drinks, and add regular aerobic activity.',
    chol: 'Prefer healthy fats (nuts, avocado, olive oil) and increase dietary fiber.',
    vitd: 'Moderate sun exposure and consider a vitamin D supplement with your doctor.',
    salt: 'Cut salt and processed/canned food, prefer herbs for seasoning, and stay hydrated.',
    hydrate: 'Make sure to stay well hydrated throughout the day.',
    general: 'Maintain quality sleep, regular exercise and a balanced diet.',
    followup: 'Bring this test to your physician for personal interpretation and follow-up.',
  },
}

/**
 * Analyze a set of blood values.
 * @param {Record<string, number|string>} values
 * @param {'he'|'en'} lang
 * @returns {{ markers: Array, summary: string, recommendations: string[], abnormalCount: number }}
 */
export function analyzeBloodTest(values, lang = 'he') {
  const notes = NOTES[lang]
  const recs = RECS[lang]

  const markers = BLOOD_MARKERS.map((m) => {
    const raw = values[m.key]
    const status = statusOf(raw, m)
    const note = status && status !== 'normal' ? notes[m.key]?.[status] : null
    return {
      key: m.key,
      value: raw === '' || raw == null ? null : Number(raw),
      min: m.min,
      max: m.max,
      status,
      note: note || null,
    }
  }).filter((m) => m.value != null)

  const abnormal = markers.filter((m) => m.status && m.status !== 'normal')

  // Build recommendations from what's abnormal.
  const recommendations = []
  const has = (key, dir) => abnormal.some((m) => m.key === key && (!dir || m.status === dir))
  if (has('hemoglobin', 'low') || has('ferritin', 'low')) recommendations.push(recs.iron)
  if (has('glucose', 'high')) recommendations.push(recs.sugar)
  if (has('cholesterol', 'high')) recommendations.push(recs.chol)
  if (has('vitaminD', 'low')) recommendations.push(recs.vitd)
  if (has('sodium', 'high')) recommendations.push(recs.salt)
  if (has('hemoglobin', 'high')) recommendations.push(recs.hydrate)
  recommendations.push(recs.general)
  recommendations.push(recs.followup)

  // Compose a short narrative summary.
  let summary
  if (markers.length === 0) {
    summary =
      lang === 'he'
        ? 'לא הוזנו ערכים לניתוח. הזינו לפחות ערך אחד או מלאו ערכי דוגמה.'
        : 'No values were entered. Enter at least one value or fill the sample values.'
  } else if (abnormal.length === 0) {
    summary =
      lang === 'he'
        ? `כל ${markers.length} הערכים שהוזנו נמצאים בטווח התקין. המשיכו לשמור על אורח חיים בריא.`
        : `All ${markers.length} entered values are within the normal range. Keep up the healthy lifestyle.`
  } else {
    const list = abnormal
      .map((m) => m.key)
      .map((k) => (lang === 'he' ? hebFieldName(k) : enFieldName(k)))
      .join(lang === 'he' ? ', ' : ', ')
    summary =
      lang === 'he'
        ? `זוהו ${abnormal.length} ערכים החורגים מהטווח התקין (${list}). מדובר בניתוח ראשוני בלבד — ראו פירוט והמלצות למטה, וכדאי להיוועץ ברופא/ה.`
        : `Detected ${abnormal.length} value(s) outside the normal range (${list}). This is a first-pass analysis only — see details and recommendations below, and consider consulting a physician.`
  }

  return { markers, summary, recommendations, abnormalCount: abnormal.length }
}

// ─────────────────────────────────────────────────────────────
// Personalized menu ("meal plan") builder.
//
// Given the analyzed markers, it composes a tailored nutrition plan
// for the values that are OUT of range — foods to favor, foods to
// limit, practical tips and a sample day. Like the analysis above,
// this is demo guidance only (see disclaimer), not medical advice.
// ─────────────────────────────────────────────────────────────

// Per-condition dietary guidance, keyed by `${marker}:${status}`.
const DIETS = {
  he: {
    'glucose:high': {
      label: 'סוכר גבוה / סוכרת',
      favor: [
        'ירקות לא עמילניים: ברוקולי, מלפפון, עגבנייה, חסה, פלפל',
        'דגנים מלאים בכמות מבוקרת: קינואה, שיבולת שועל, אורז מלא',
        'חלבון רזה: עוף, דג, טופו, ביצים',
        'קטניות: עדשים, חומוס, שעועית',
        'שומנים בריאים: אבוקדו, אגוזים, שמן זית',
      ],
      avoid: [
        'סוכר לבן, ממתקים ודברי מאפה מתוקים',
        'משקאות ממותקים ומיצים טבעיים מרוכזים',
        'לחם לבן, פסטה לבנה ואורז לבן',
        'דבש, סילאן וסירופ בכמות גדולה',
        'חטיפים מעובדים ודגני בוקר ממותקים',
      ],
      tips: [
        'חלקו את האוכל ל-3 ארוחות + נשנוש קטן כדי לייצב את הסוכר',
        'שלבו סיבים וחלבון בכל ארוחה — הם מאיטים את עליית הסוכר',
        'הליכה של 10–15 דק׳ אחרי הארוחה מורידה את עליית הסוכר',
      ],
    },
    'cholesterol:high': {
      label: 'כולסטרול גבוה',
      favor: [
        'שיבולת שועל וסיבים מסיסים (תפוח, שעורה)',
        'דגים עשירים באומגה 3: סלמון, מקרל, סרדינים',
        'שמן זית, אבוקדו ואגוזים במידה',
        'הרבה ירקות וקטניות',
      ],
      avoid: [
        'שומן רווי: בשר שמן, חמאה, גבינות שמנות',
        'שומן טראנס ומזון מטוגן',
        'מאפים תעשייתיים ומזון מעובד',
      ],
      tips: [
        'החליפו חמאה בשמן זית',
        'הוסיפו פעילות אירובית 30 דק׳ ברוב ימות השבוע',
      ],
    },
    'iron:low': {
      label: 'ברזל / המוגלובין נמוך',
      favor: [
        'בשר אדום רזה, הודו ועוף',
        'קטניות: עדשים, שעועית, חומוס',
        'ירקות עליים ירוקים: תרד, מנגולד',
        'מקור ויטמין C לצד הברזל (פלפל, הדרים) לספיגה טובה',
      ],
      avoid: [
        'קפה ותה בדיוק בזמן הארוחה (פוגעים בספיגת ברזל)',
        'מוצרי חלב יחד עם מקור הברזל העיקרי',
      ],
      tips: [
        'שלבו מקור ברזל + ויטמין C באותה ארוחה',
        'הרחיקו קפה/תה לכשעה אחרי הארוחה',
      ],
    },
    'vitaminD:low': {
      label: 'ויטמין D נמוך',
      favor: [
        'דגים שמנים: סלמון, טונה, סרדינים',
        'ביצים (החלמון) ומוצרים מועשרים בוויטמין D',
        'פטריות שנחשפו לשמש',
      ],
      avoid: [],
      tips: [
        'חשיפה מתונה לשמש 10–20 דק׳ ביום',
        'שקלו תוסף ויטמין D בהתייעצות עם רופא/ה',
      ],
    },
  },
  en: {
    'glucose:high': {
      label: 'High sugar / diabetes',
      favor: [
        'Non-starchy vegetables: broccoli, cucumber, tomato, lettuce, pepper',
        'Whole grains in controlled portions: quinoa, oats, brown rice',
        'Lean protein: chicken, fish, tofu, eggs',
        'Legumes: lentils, chickpeas, beans',
        'Healthy fats: avocado, nuts, olive oil',
      ],
      avoid: [
        'White sugar, sweets and sugary pastries',
        'Sweetened drinks and concentrated juices',
        'White bread, white pasta and white rice',
        'Honey, date syrup and syrups in large amounts',
        'Processed snacks and sugary cereals',
      ],
      tips: [
        'Split food into 3 meals + a small snack to stabilize sugar',
        'Combine fiber and protein in every meal — they slow sugar spikes',
        'A 10–15 min walk after a meal lowers the post-meal spike',
      ],
    },
    'cholesterol:high': {
      label: 'High cholesterol',
      favor: [
        'Oats and soluble fiber (apple, barley)',
        'Omega-3 rich fish: salmon, mackerel, sardines',
        'Olive oil, avocado and nuts in moderation',
        'Plenty of vegetables and legumes',
      ],
      avoid: [
        'Saturated fat: fatty meat, butter, full-fat cheese',
        'Trans fat and fried food',
        'Industrial pastries and processed food',
      ],
      tips: [
        'Swap butter for olive oil',
        'Add 30 min of aerobic activity most days of the week',
      ],
    },
    'iron:low': {
      label: 'Low iron / hemoglobin',
      favor: [
        'Lean red meat, turkey and chicken',
        'Legumes: lentils, beans, chickpeas',
        'Leafy greens: spinach, chard',
        'A vitamin C source with the iron (pepper, citrus) for absorption',
      ],
      avoid: [
        'Coffee and tea right at mealtime (they impair iron absorption)',
        'Dairy together with the main iron source',
      ],
      tips: [
        'Pair an iron source + vitamin C in the same meal',
        'Keep coffee/tea about an hour after the meal',
      ],
    },
    'vitaminD:low': {
      label: 'Low vitamin D',
      favor: [
        'Fatty fish: salmon, tuna, sardines',
        'Eggs (the yolk) and vitamin-D fortified products',
        'Sun-exposed mushrooms',
      ],
      avoid: [],
      tips: [
        'Moderate sun exposure, 10–20 min a day',
        'Consider a vitamin D supplement with your doctor',
      ],
    },
  },
}

// Sample one-day menu per primary condition (chosen by priority below).
const DAY_MENUS = {
  he: {
    'glucose:high': {
      breakfast: 'חביתת ירק עם פרוסת לחם מלא + עגבנייה ומלפפון',
      lunch: 'חזה עוף בגריל, קינואה וסלט ירקות גדול בשמן זית',
      dinner: 'דג אפוי עם ברוקולי ובטטה קטנה',
      snack: 'יוגורט טבעי ללא סוכר עם אגוזים',
    },
    'cholesterol:high': {
      breakfast: 'דייסת שיבולת שועל עם תפוח ומעט אגוזי מלך',
      lunch: 'סלמון אפוי, אורז מלא וסלט עלים ירוקים',
      dinner: 'מרק עדשים עם ירקות ופרוסת לחם מלא',
      snack: 'חופן שקדים או תפוח',
    },
    'iron:low': {
      breakfast: 'ביצה קשה, פלפל אדום ולחם מלא',
      lunch: 'בשר רזה או עדשים עם תרד מוקפץ וטחינה, לצד מיץ לימון',
      dinner: 'מרק שעועית עשיר עם ירקות',
      snack: 'פרי הדר + חופן גרעיני דלעת',
    },
    'vitaminD:low': {
      breakfast: 'חביתת 2 ביצים עם ירקות',
      lunch: 'סלמון או טונה עם תפוח אדמה וסלט',
      dinner: 'מאפה פטריות עם ביצה וירקות',
      snack: 'יוגורט מועשר בוויטמין D',
    },
    default: {
      breakfast: 'יוגורט עם פירות וגרנולה ביתית',
      lunch: 'חלבון רזה, דגן מלא וסלט ירקות צבעוני',
      dinner: 'מרק ירקות עם קטניות ולחם מלא',
      snack: 'פרי + חופן אגוזים',
    },
  },
  en: {
    'glucose:high': {
      breakfast: 'Veggie omelet with a slice of whole-grain bread + tomato & cucumber',
      lunch: 'Grilled chicken breast, quinoa and a big salad with olive oil',
      dinner: 'Baked fish with broccoli and a small sweet potato',
      snack: 'Plain unsweetened yogurt with nuts',
    },
    'cholesterol:high': {
      breakfast: 'Oat porridge with apple and a few walnuts',
      lunch: 'Baked salmon, brown rice and a leafy green salad',
      dinner: 'Lentil soup with vegetables and a slice of whole-grain bread',
      snack: 'A handful of almonds or an apple',
    },
    'iron:low': {
      breakfast: 'Hard-boiled egg, red pepper and whole-grain bread',
      lunch: 'Lean meat or lentils with sautéed spinach and tahini, plus lemon juice',
      dinner: 'Hearty bean soup with vegetables',
      snack: 'A citrus fruit + a handful of pumpkin seeds',
    },
    'vitaminD:low': {
      breakfast: '2-egg omelet with vegetables',
      lunch: 'Salmon or tuna with potato and salad',
      dinner: 'Mushroom bake with egg and vegetables',
      snack: 'Vitamin-D fortified yogurt',
    },
    default: {
      breakfast: 'Yogurt with fruit and homemade granola',
      lunch: 'Lean protein, a whole grain and a colorful salad',
      dinner: 'Vegetable soup with legumes and whole-grain bread',
      snack: 'A fruit + a handful of nuts',
    },
  },
}

// Map an abnormal marker to a diet key (iron is shared by Hb-low / ferritin-low).
function dietKeyFor(marker) {
  if (marker.status !== 'high' && marker.status !== 'low') return null
  if ((marker.key === 'hemoglobin' || marker.key === 'ferritin') && marker.status === 'low')
    return 'iron:low'
  return `${marker.key}:${marker.status}`
}

// Priority for which condition drives the sample day menu.
const DAY_PRIORITY = ['glucose:high', 'cholesterol:high', 'iron:low', 'vitaminD:low']

/**
 * Build a personalized menu from analyzed markers.
 * @param {Array} markers   markers array from analyzeBloodTest
 * @param {'he'|'en'} lang
 * @returns {null | { conditions: string[], favor: string[], avoid: string[], tips: string[], day: object }}
 *          returns null when nothing is out of range.
 */
export function buildMealPlan(markers, lang = 'he') {
  const diets = DIETS[lang]
  const days = DAY_MENUS[lang]

  // Collect unique diet keys from abnormal markers, preserving order.
  const keys = []
  for (const m of markers) {
    const k = dietKeyFor(m)
    if (k && diets[k] && !keys.includes(k)) keys.push(k)
  }
  if (keys.length === 0) return null

  const uniq = (arr) => [...new Set(arr)]
  const conditions = keys.map((k) => diets[k].label)
  const favor = uniq(keys.flatMap((k) => diets[k].favor))
  const avoid = uniq(keys.flatMap((k) => diets[k].avoid))
  const tips = uniq(keys.flatMap((k) => diets[k].tips))

  // Pick the day menu by priority; fall back to the first key, then default.
  const dayKey = DAY_PRIORITY.find((k) => keys.includes(k)) || keys[0]
  const day = days[dayKey] || days.default

  return { conditions, favor, avoid, tips, day }
}

function hebFieldName(k) {
  return {
    hemoglobin: 'המוגלובין',
    wbc: 'תאים לבנים',
    glucose: 'גלוקוז',
    cholesterol: 'כולסטרול',
    vitaminD: 'ויטמין D',
    ferritin: 'פריטין',
    sodium: 'נתרן',
  }[k] || k
}
function enFieldName(k) {
  return {
    hemoglobin: 'hemoglobin',
    wbc: 'WBC',
    glucose: 'glucose',
    cholesterol: 'cholesterol',
    vitaminD: 'vitamin D',
    ferritin: 'ferritin',
    sodium: 'sodium',
  }[k] || k
}
