# לבריאות · LaBriut

פלטפורמת בריאות חכמה (פרויקט הדגמה) — ניתוח בדיקות דם ואבחון לפי העין בעזרת "סוכן AI", עם כתבות רפואיות ותצוגת מערכות הגוף. דו-לשוני (עברית RTL / אנגלית LTR).

> ⚕️ **הבהרה:** האתר נועד למידע והעשרה בלבד ואינו תחליף לייעוץ רפואי מקצועי.
> אבחון לפי העין (אירידולוגיה) אינו שיטה מוכחת מדעית ומוצג ככלי עניין בלבד.

## הרצה

```bash
npm install
npm run dev      # פיתוח — נפתח אוטומטית ב-http://localhost:5173
npm run build    # בנייה לפרודקשן (תיקיית dist)
npm run preview  # תצוגה מקדימה של ה-build
```

## מבנה הפרויקט

```
src/
  main.jsx                 נקודת כניסה
  App.jsx                  ניתוב (React Router)
  i18n/                    מערכת דו-לשונית
    translations.js        כל הטקסטים (he / en)
    LanguageContext.jsx    קונטקסט שפה + RTL/LTR
  components/              קומפוננטות משותפות (Navbar, Footer, UploadZone…)
  pages/                   Home · BloodTest · EyeDiagnosis · Articles
  logic/                   "מוח" הסוכן (mock)
    bloodAnalysis.js       ניתוח בדיקות דם
    eyeAnalysis.js         אבחון אירידולוגיה
  styles/index.css         עיצוב גלובלי (theme רפואי)
```

## חיבור ל-AI אמיתי

הניתוח כרגע הוא **mock** (דמו). כדי לחבר מודל אמיתי (Claude / OpenAI):

1. הקימו backend קטן שמחזיק את מפתח ה-API (אסור לחשוף מפתח בצד לקוח).
2. החליפו את `analyzeBloodTest` ב-[src/logic/bloodAnalysis.js](src/logic/bloodAnalysis.js)
   ואת `analyzeEye` ב-[src/logic/eyeAnalysis.js](src/logic/eyeAnalysis.js)
   בקריאת `fetch` לשרת — שמרו על אותו מבנה תוצאה.

## טכנולוגיות

React 18 · Vite · React Router · CSS טהור (ללא ספריות UI).
