// ─────────────────────────────────────────────────────────────
// Mock "AI agent" for iris (iridology-style) analysis.
//
// DEMO ONLY. Iridology is not a scientifically validated method, so this
// deliberately produces gentle, wellness-oriented "insights" and never a
// medical diagnosis. A deterministic pseudo-random pick (seeded from the
// file size) keeps results stable per image without using Math.random.
//
// To use a real vision model later, replace `analyzeEye` with a call that
// returns the same shape ({ zones, insights }).
// ─────────────────────────────────────────────────────────────

const ZONES = {
  he: [
    { key: 'digestive', label: 'אזור העיכול', emoji: '🦠', organs: 'קיבה, מעיים וכבד' },
    { key: 'nervous', label: 'אזור מערכת העצבים', emoji: '🧠', organs: 'מוח, עצבים ומצב נפשי' },
    { key: 'circulation', label: 'אזור מחזור הדם', emoji: '🫀', organs: 'לב וכלי דם' },
    { key: 'detox', label: 'אזור ניקוי רעלים', emoji: '🌿', organs: 'כבד וכליות' },
    { key: 'lymph', label: 'אזור הלימפה', emoji: '💧', organs: 'מערכת הלימפה והחיסון' },
  ],
  en: [
    { key: 'digestive', label: 'Digestive zone', emoji: '🦠', organs: 'stomach, intestines & liver' },
    { key: 'nervous', label: 'Nervous-system zone', emoji: '🧠', organs: 'brain, nerves & mental state' },
    { key: 'circulation', label: 'Circulation zone', emoji: '🫀', organs: 'heart & blood vessels' },
    { key: 'detox', label: 'Detox zone', emoji: '🌿', organs: 'liver & kidneys' },
    { key: 'lymph', label: 'Lymphatic zone', emoji: '💧', organs: 'lymphatic & immune system' },
  ],
}

// Per-zone interpretation, split into score bands:
//   good  (>= 80)  ·  moderate (70–79)  ·  attention (< 70)
// Each band has a short status label + a longer "what it means" explanation.
const ZONE_DETAILS = {
  he: {
    digestive: {
      good: { status: 'מאוזן', text: 'אזור העיכול נראה מאוזן. בגישת האירידולוגיה זה נקשר לספיגת חומרים מזינים טובה ולמעיים תקינים. המשיכו עם תזונה עשירה בסיבים ושתייה מספקת.' },
      moderate: { status: 'סביר', text: 'אזור העיכול במצב סביר. ייתכן שהגוף מבקש תזונה סדירה יותר. שילוב ירקות, קטניות ושתייה לאורך היום נחשב תומך.' },
      attention: { status: 'דורש תשומת לב', text: 'באזור העיכול נצפים סימנים שבגישה זו נקשרים לעומס או לרגישות במערכת העיכול. כדאי לשים לב לארוחות מאוזנות, ללעיסה איטית ולהפחתת מזון מעובד.' },
    },
    nervous: {
      good: { status: 'רגוע', text: 'אזור מערכת העצבים נראה רגוע ומאוזן — סימן שמקובל לקשר לשינה טובה ולרמת מתח נמוכה. שמרו על שגרה יציבה.' },
      moderate: { status: 'סביר', text: 'אזור העצבים במצב סביר. ייתכן צורך באיזון בין עומס למנוחה. תרגול נשימה, הליכה והפסקות קצרות נחשבים מועילים.' },
      attention: { status: 'דורש תשומת לב', text: 'באזור העצבים נראים סימנים הנקשרים בגישה זו למתח או לעייפות מצטברת. שינה איכותית, הפחתת קפאין בערב והרפיה עשויים לעזור.' },
    },
    circulation: {
      good: { status: 'תקין', text: 'אזור מחזור הדם נראה תקין. בגישת האירידולוגיה זה נתפס כסימן לזרימה טובה ולחיוניות. פעילות אירובית קבועה תומכת בכך.' },
      moderate: { status: 'סביר', text: 'אזור מחזור הדם במצב סביר. הוספת פעילות גופנית מתונה ושתייה עשויה לתמוך בתחושת האנרגיה.' },
      attention: { status: 'דורש תשומת לב', text: 'באזור מחזור הדם נצפים סימנים שבגישה זו נקשרים לזרימה איטית יותר. תנועה יומית, חימום הגוף והפחתת ישיבה ממושכת נחשבים תומכים.' },
    },
    detox: {
      good: { status: 'נקי', text: 'אזור ניקוי הרעלים נראה נקי ומאוזן — מקובל לקשר זאת לתפקוד טוב של הכבד והכליות. המשיכו לשתות מים ולהפחית עומס תזונתי.' },
      moderate: { status: 'סביר', text: 'אזור ניקוי הרעלים במצב סביר. הגברת שתיית מים, ירקות עליים והפחתת אלכוהול ומזון מעובד נחשבים תומכים.' },
      attention: { status: 'דורש תשומת לב', text: 'באזור ניקוי הרעלים נראים סימנים שבגישה זו נקשרים לעומס על מערכות הסינון. תמיכה עדינה: שתייה מרובה, שינה והפחתת חומרים מעובדים.' },
    },
    lymph: {
      good: { status: 'פעיל', text: 'אזור הלימפה נראה פעיל ומאוזן — סימן שמקובל לקשר למערכת חיסון תומכת. תנועה ושתייה שומרות על זרימת הלימפה.' },
      moderate: { status: 'סביר', text: 'אזור הלימפה במצב סביר. הליכה, מתיחות ושתייה נחשבים מסייעים לזרימת הלימפה.' },
      attention: { status: 'דורש תשומת לב', text: 'באזור הלימפה נצפים סימנים הנקשרים בגישה זו לזרימה איטית. תנועה קבועה, נשימות עמוקות ושתייה עשויים לתמוך.' },
    },
  },
  en: {
    digestive: {
      good: { status: 'Balanced', text: 'The digestive zone looks balanced. In iridology this is linked to good nutrient absorption and healthy intestines. Keep up a fiber-rich diet and good hydration.' },
      moderate: { status: 'Fair', text: 'The digestive zone is in fair shape. The body may be asking for more regular meals. Vegetables, legumes and steady hydration are considered supportive.' },
      attention: { status: 'Needs attention', text: 'The digestive zone shows signs that, in this approach, are linked to load or sensitivity in the gut. Consider balanced meals, slower chewing and less processed food.' },
    },
    nervous: {
      good: { status: 'Calm', text: 'The nervous-system zone looks calm and balanced — often associated with good sleep and low stress. Keep a steady routine.' },
      moderate: { status: 'Fair', text: 'The nervous zone is fair. A better balance between effort and rest may help. Breathing practice, walks and short breaks are considered beneficial.' },
      attention: { status: 'Needs attention', text: 'The nervous zone shows signs linked here to stress or accumulated fatigue. Quality sleep, less evening caffeine and relaxation may help.' },
    },
    circulation: {
      good: { status: 'Healthy', text: 'The circulation zone looks healthy. In iridology this is read as good flow and vitality. Regular aerobic activity supports it.' },
      moderate: { status: 'Fair', text: 'The circulation zone is fair. Adding moderate exercise and hydration may support your energy levels.' },
      attention: { status: 'Needs attention', text: 'The circulation zone shows signs linked here to slower flow. Daily movement, warming up and less prolonged sitting are considered supportive.' },
    },
    detox: {
      good: { status: 'Clear', text: 'The detox zone looks clear and balanced — associated with good liver and kidney function. Keep drinking water and easing dietary load.' },
      moderate: { status: 'Fair', text: 'The detox zone is fair. More water, leafy greens and less alcohol and processed food are considered supportive.' },
      attention: { status: 'Needs attention', text: 'The detox zone shows signs linked here to load on the filtering systems. Gentle support: plenty of water, sleep and fewer processed substances.' },
    },
    lymph: {
      good: { status: 'Active', text: 'The lymphatic zone looks active and balanced — associated with a supportive immune system. Movement and hydration keep lymph flowing.' },
      moderate: { status: 'Fair', text: 'The lymphatic zone is fair. Walking, stretching and hydration are considered helpful for lymph flow.' },
      attention: { status: 'Needs attention', text: 'The lymphatic zone shows signs linked here to slower flow. Regular movement, deep breathing and hydration may support it.' },
    },
  },
}

// ─────────────────────────────────────────────────────────────
// Iris "topography": where each zone sits on the iris (clock
// position + named area), WHY that spot maps to the organ system,
// and — per score band — the specific iris SIGN that was observed
// and led to the conclusion. This is the "which part of the eye
// caused it" layer. (Demo / iridology-style — not medical.)
// ─────────────────────────────────────────────────────────────
const ZONE_IRIS = {
  he: {
    digestive: {
      clock: 'טבעת מרכזית סביב האישון',
      area: 'הקולרט (טבעת העיכול)',
      why: 'בגישת האירידולוגיה הטבעת הפנימית שמקיפה את האישון ממפה את מערכת העיכול — קיבה ומעיים. המצב שלה נקרא כרמז לאיכות העיכול והספיגה.',
      good: { sign: 'סיבים צפופים ואחידים', observation: 'הקולרט נראה אחיד, חלק וברור — בגישה זו זה נקרא כעיכול וספיגה תקינים.' },
      moderate: { sign: 'התרחבות קלה של הקולרט', observation: 'נצפתה התרחבות מתונה של הטבעת המרכזית — מקובל לקשר זאת לעיכול עצל מעט או לצורך בתזונה סדירה יותר.' },
      attention: { sign: 'Radii Solaris — "קרני שמש"', observation: 'נצפו חריצים רדיאליים (קרני שמש) שיוצאים מהאישון לכיוון אזור העיכול — זהו הסימן שהוביל למסקנה על עומס או רגישות במערכת העיכול.' },
    },
    nervous: {
      clock: 'שעה 11–1 (קודקוד הקשתית)',
      area: 'סקטור המוח והעצבים העליון',
      why: 'החלק העליון של הקשתית, מעל האישון, ממופה בגישה זו למוח ולמערכת העצבים. סימנים בו נקראים כביטוי למתח, שינה ועומס נפשי.',
      good: { sign: 'מרקם חלק ורגוע', observation: 'אזור הקודקוד נראה חלק ואחיד, ללא טבעות בולטות — מקובל לקשר זאת לשינה טובה ולמתח נמוך.' },
      moderate: { sign: 'טבעת עצב חלשה אחת', observation: 'נראתה טבעת התכווצות חלשה אחת בקודקוד — בגישה זו זה רמז לעומס מתון או צורך באיזון בין מאמץ למנוחה.' },
      attention: { sign: 'Nerve Rings — טבעות עצב', observation: 'נצפו מספר טבעות התכווצות קונצנטריות באזור העליון — זהו הסימן שמקושר בגישה זו למתח מצטבר או לעייפות עצבית, והוא שהוביל למסקנה.' },
    },
    circulation: {
      clock: 'שעה 2–3 (אזור החזה)',
      area: 'סקטור הלב וכלי הדם',
      why: 'הסקטור הצדדי-עליון של הקשתית ממופה בגישה זו ללב ולמחזור הדם. בהירות וצפיפות הסיבים בו נקראות כביטוי לחיוניות ולזרימה.',
      good: { sign: 'סיבים בהירים וצפופים', observation: 'סקטור הלב נראה בהיר וצפוף — בגישה זו זה נקרא כזרימה טובה וחיוניות.' },
      moderate: { sign: 'הבהרה קלה מקומית', observation: 'נצפתה הבהרה עדינה בסקטור הלב — מקובל לקשר זאת לצורך בפעילות אירובית ובחיזוק הזרימה.' },
      attention: { sign: 'Lacuna — לאקונה פתוחה', observation: 'נצפתה לאקונה (חלל סגלגל בסיבים) בסקטור הלב — זהו הסימן המבני שהוביל בגישה זו למסקנה על זרימה איטית יותר ולצורך בתשומת לב לאזור.' },
    },
    detox: {
      clock: 'שעה 6–8 (תחתית הקשתית)',
      area: 'סקטור הכבד והכליות',
      why: 'תחתית הקשתית ממופה בגישה זו לאיברי הסינון — כבד וכליות. גוונים כהים בו נקראים כביטוי לעומס על מערכות ניקוי הרעלים.',
      good: { sign: 'גוון נקי ואחיד', observation: 'אזור הסינון נראה נקי ובהיר — בגישה זו זה נקרא כתפקוד טוב של הכבד והכליות.' },
      moderate: { sign: 'גוון מעט כהה', observation: 'נצפה גוון מעט כהה בתחתית הקשתית — מקובל לקשר זאת לעומס קל ולצורך בשתייה ובהפחתת מזון מעובד.' },
      attention: { sign: 'Crypt / כתם פיגמנט', observation: 'נצפתה קריפטה (שקע כהה) או כתם פיגמנט בסקטור הכבד/כליות — זהו הסימן שהוביל בגישה זו למסקנה על עומס על מערכות הסינון.' },
    },
    lymph: {
      clock: 'הטבעת ההיקפית החיצונית',
      area: 'הטבעת הלימפתית (Scurf rim)',
      why: 'הטבעת החיצונית ביותר של הקשתית ממופה בגישה זו למערכת הלימפה ולעור. נקודות וגוונים בה נקראים כביטוי לזרימת הלימפה ולחיסון.',
      good: { sign: 'היקף נקי ואחיד', observation: 'הטבעת ההיקפית נראתה נקייה ואחידה — בגישה זו זה נקרא כמערכת לימפה וחיסון תומכת.' },
      moderate: { sign: 'נקודות לבנות בודדות', observation: 'נצפו מספר נקודות לבנות בהיקף — מקובל לקשר זאת לזרימת לימפה איטית מעט ולצורך בתנועה ושתייה.' },
      attention: { sign: 'Lymphatic Rosary — מחרוזת לימפה', observation: 'נצפתה "מחרוזת" של נקודות לבנות לאורך ההיקף — זהו הסימן שמקושר בגישה זו לעומס לימפתי, והוא שהוביל למסקנה.' },
    },
  },
  en: {
    digestive: {
      clock: 'Central ring around the pupil',
      area: 'The collarette (digestive ring)',
      why: 'In iridology the inner ring around the pupil maps to the digestive system — stomach and intestines. Its state is read as a clue to digestion and absorption quality.',
      good: { sign: 'Dense, even fibers', observation: 'The collarette looks even, smooth and clear — read here as healthy digestion and absorption.' },
      moderate: { sign: 'Slight collarette widening', observation: 'A mild widening of the central ring was seen — often linked to slightly sluggish digestion or a need for more regular meals.' },
      attention: { sign: 'Radii Solaris — "sun rays"', observation: 'Radial furrows ("sun rays") were seen running from the pupil toward the digestive area — this is the sign that led to the conclusion of load or sensitivity in the gut.' },
    },
    nervous: {
      clock: '11–1 o’clock (top of the iris)',
      area: 'Upper brain & nerves sector',
      why: 'The upper iris, above the pupil, maps here to the brain and nervous system. Signs there are read as expressions of stress, sleep and mental load.',
      good: { sign: 'Smooth, calm texture', observation: 'The top sector looks smooth and even with no prominent rings — associated with good sleep and low stress.' },
      moderate: { sign: 'One faint nerve ring', observation: 'A single faint contraction ring was seen at the top — read here as mild load or a need to balance effort and rest.' },
      attention: { sign: 'Nerve Rings', observation: 'Several concentric contraction rings were seen in the upper area — this is the sign linked here to accumulated stress or nervous fatigue, and what led to the conclusion.' },
    },
    circulation: {
      clock: '2–3 o’clock (chest area)',
      area: 'Heart & vessels sector',
      why: 'The upper-side sector maps here to the heart and circulation. Fiber brightness and density there are read as vitality and flow.',
      good: { sign: 'Bright, dense fibers', observation: 'The heart sector looks bright and dense — read here as good flow and vitality.' },
      moderate: { sign: 'Slight local lightening', observation: 'A subtle lightening was seen in the heart sector — often linked to a need for aerobic activity to support flow.' },
      attention: { sign: 'Lacuna — open lacuna', observation: 'A lacuna (an oval gap in the fibers) was seen in the heart sector — this structural sign led here to the read of slower flow and an area worth attention.' },
    },
    detox: {
      clock: '6–8 o’clock (lower iris)',
      area: 'Liver & kidneys sector',
      why: 'The lower iris maps here to the filtering organs — liver and kidneys. Darker tones there are read as load on the detox systems.',
      good: { sign: 'Clean, even tone', observation: 'The filtering area looks clean and bright — read here as good liver and kidney function.' },
      moderate: { sign: 'Slightly darker tone', observation: 'A slightly darker tone was seen at the bottom of the iris — linked to mild load and a need for hydration and less processed food.' },
      attention: { sign: 'Crypt / pigment spot', observation: 'A crypt (dark depression) or pigment spot was seen in the liver/kidney sector — this is the sign that led here to a read of load on the filtering systems.' },
    },
    lymph: {
      clock: 'The outer peripheral ring',
      area: 'The lymphatic ring (scurf rim)',
      why: 'The outermost iris ring maps here to the lymphatic system and skin. Dots and tones there are read as lymph flow and immunity.',
      good: { sign: 'Clean, even rim', observation: 'The peripheral ring looked clean and even — read here as a supportive lymphatic and immune system.' },
      moderate: { sign: 'A few white dots', observation: 'A few white dots were seen at the rim — linked to slightly slow lymph flow and a need for movement and hydration.' },
      attention: { sign: 'Lymphatic Rosary', observation: 'A "rosary" of white dots was seen along the rim — this is the sign linked here to lymphatic load, and what led to the conclusion.' },
    },
  },
}

function bandOf(score) {
  if (score >= 80) return 'good'
  if (score >= 70) return 'moderate'
  return 'attention'
}

const INSIGHTS = {
  he: [
    'מבנה הקשתית נראה צפוף יחסית — בגישת האירידולוגיה זה נקשר לעיתים לצורך במנוחה ובשינה איכותית.',
    'ניכרים גוונים בהירים באזור החיצוני — מקובל לקשר זאת לשתייה מספקת ולתמיכה בתהליכי ניקוי טבעיים.',
    'נצפים סיבים מסודרים יחסית — בגישה זו זה נתפס כסימן לחיוניות כללית טובה.',
    'שימו לב לאיזון בין מנוחה לפעילות; שגרת בוקר רגועה עשויה לתמוך בתחושת האנרגיה.',
    'תזונה עשירה בירקות עליים ובמים נחשבת תומכת לפי גישת האירידולוגיה.',
  ],
  en: [
    'The iris structure looks relatively dense — in iridology this is sometimes linked to a need for rest and quality sleep.',
    'Lighter tones are visible in the outer ring — often associated with good hydration and natural cleansing processes.',
    'The fibers appear fairly orderly — in this approach that is read as a sign of good overall vitality.',
    'Mind the balance between rest and activity; a calm morning routine may support your energy.',
    'A diet rich in leafy greens and water is considered supportive in the iridology approach.',
  ],
}

// Stable string -> int hash (no Math.random; deterministic per image).
function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * Produce iridology-style insights for an image.
 * @param {{ name?: string, size?: number }} fileMeta
 * @param {'he'|'en'} lang
 * @returns {{ zones: Array, insights: string[], overall: object }}
 *   each zone: { key, label, emoji, organs, score, band, status, detail }
 *   overall: { score, level, headline, text, focusAreas: string[] }
 */
export function analyzeEye(fileMeta, lang = 'he') {
  const seed = hashSeed(`${fileMeta?.name || 'eye'}-${fileMeta?.size || 1}`)
  const zoneDefs = ZONES[lang]
  const insightPool = INSIGHTS[lang]
  const details = ZONE_DETAILS[lang]

  // Assign a soft "balance score" to each zone (60–95%) deterministically,
  // then attach the matching status + explanation for that band.
  const irisMap = ZONE_IRIS[lang]
  const zones = zoneDefs.map((z, i) => {
    const score = 60 + ((seed >> (i * 3)) % 36) // 60..95
    const band = bandOf(score)
    const d = details[z.key][band]
    const iz = irisMap[z.key]
    return {
      ...z,
      score,
      band,
      status: d.status,
      detail: d.text,
      // "Which part of the eye" layer:
      iris: {
        clock: iz.clock,
        area: iz.area,
        why: iz.why,
        sign: iz[band].sign,
        observation: iz[band].observation,
      },
    }
  })

  // Pick 3 general insights deterministically.
  const insights = []
  for (let i = 0; i < 3; i++) {
    insights.push(insightPool[(seed >> (i * 4)) % insightPool.length])
  }
  const uniqueInsights = [...new Set(insights)]

  const overall = buildOverall(zones, lang)

  return { zones, insights: uniqueInsights, overall }
}

// Combine all zones into one summarizing read of the whole body.
function buildOverall(zones, lang) {
  const avg = Math.round(zones.reduce((s, z) => s + z.score, 0) / zones.length)
  const level = bandOf(avg)
  const attention = zones.filter((z) => z.band === 'attention')
  const moderate = zones.filter((z) => z.band === 'moderate')
  const focusAreas = [...attention, ...moderate].map((z) => z.label)

  const c = OVERALL[lang]
  let headline = c.headline[level]
  let text

  if (attention.length === 0 && moderate.length === 0) {
    text = c.allGood
  } else if (attention.length > 0) {
    text = c.withAttention(attention.map((z) => z.label).join(c.sep))
  } else {
    text = c.withModerate(moderate.map((z) => z.label).join(c.sep))
  }

  return { score: avg, level, headline, text, focusAreas }
}

const OVERALL = {
  he: {
    sep: ', ',
    headline: {
      good: 'מצב כללי טוב ומאוזן',
      moderate: 'מצב כללי סביר',
      attention: 'כדאי לשים לב לכמה אזורים',
    },
    allGood:
      'לפי גישת האירידולוגיה, כל אזורי הקשתית נראים מאוזנים יחסית — סימן לחיוניות כללית טובה. המשיכו לשמור על שינה, תזונה מאוזנת, פעילות גופנית ושתייה מספקת. זכרו: זהו אינו אבחון רפואי.',
    withAttention: (list) =>
      `התמונה הכללית סבירה, אך בגישה זו בולטים במיוחד האזורים הבאים שכדאי לתת להם תשומת לב: ${list}. תמיכה כללית מומלצת: שינה איכותית, שתיית מים, תנועה יומית ותזונה עשירה בירקות. בכל חשש ממשי — פנו לרופא/ה. זהו אינו אבחון רפואי.`,
    withModerate: (list) =>
      `התמונה הכללית טובה למדי. האזורים ${list} במצב סביר וניתן לחזק אותם עם איזון בין מנוחה לפעילות, שתייה ותזונה מאוזנת. זהו אינו אבחון רפואי.`,
  },
  en: {
    sep: ', ',
    headline: {
      good: 'Good, balanced overall state',
      moderate: 'Fair overall state',
      attention: 'A few zones are worth attention',
    },
    allGood:
      'In the iridology approach, all iris zones look relatively balanced — a sign of good overall vitality. Keep up your sleep, balanced diet, exercise and hydration. Remember: this is not a medical diagnosis.',
    withAttention: (list) =>
      `The overall picture is fair, but in this approach these zones stand out and are worth attention: ${list}. Recommended general support: quality sleep, hydration, daily movement and a vegetable-rich diet. For any real concern — see a physician. This is not a medical diagnosis.`,
    withModerate: (list) =>
      `The overall picture is fairly good. The ${list} zone(s) are in fair shape and can be supported with a balance of rest and activity, hydration and a balanced diet. This is not a medical diagnosis.`,
  },
}
