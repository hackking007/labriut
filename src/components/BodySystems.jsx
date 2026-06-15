import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'

// Short extra blurbs shown when a system card is expanded.
const DETAILS = {
  he: {
    cardio: 'כולל את הלב, העורקים, הוורידים והנימים. בדיקות דם רבות (כולסטרול, המוגלובין) קשורות ישירות אליו.',
    respiratory: 'כוללת את הריאות, קנה הנשימה והסרעפת. אחראית על אספקת החמצן לכל תא בגוף.',
    nervous: 'כוללת את המוח, חוט השדרה והעצבים. שולטת בתנועה, בחושים ובמחשבה.',
    digestive: 'כוללת את הקיבה, המעיים, הכבד והלבלב. הופכת מזון לאנרגיה ולחומרי בניין.',
    skeletal: 'כוללת 206 עצמות ומעל 600 שרירים. מאפשרת יציבה, תנועה ומגנה על המוח והלב.',
    immune: 'כוללת תאי דם לבנים, מערכת הלימפה והטחול. קו ההגנה של הגוף מפני מחלות.',
  },
  en: {
    cardio: 'Includes the heart, arteries, veins and capillaries. Many blood tests (cholesterol, hemoglobin) relate directly to it.',
    respiratory: 'Includes the lungs, trachea and diaphragm. Responsible for delivering oxygen to every cell.',
    nervous: 'Includes the brain, spinal cord and nerves. Controls movement, senses and thought.',
    digestive: 'Includes the stomach, intestines, liver and pancreas. Turns food into energy and building blocks.',
    skeletal: 'Includes 206 bones and over 600 muscles. Enables posture and movement, and protects the brain and heart.',
    immune: 'Includes white blood cells, the lymphatic system and the spleen. The body’s line of defense against disease.',
  },
}

export default function BodySystems() {
  const { t, lang } = useLang()
  const [active, setActive] = useState(null)

  return (
    <section className="section systems" id="systems">
      <div className="container">
        <header className="section__head">
          <h2>{t.systems.title}</h2>
          <p>{t.systems.subtitle}</p>
        </header>

        <div className="systems__grid">
          {t.systems.list.map((s) => {
            const open = active === s.key
            return (
              <button
                key={s.key}
                className={`system-card ${open ? 'is-open' : ''}`}
                onClick={() => setActive(open ? null : s.key)}
              >
                <div className="system-card__emoji" aria-hidden="true">{s.emoji}</div>
                <h3>{s.name}</h3>
                <p className="system-card__role">
                  <span className="system-card__label">{t.systems.cardetail}:</span> {s.role}
                </p>
                <div className="system-card__detail" style={{ maxHeight: open ? 160 : 0 }}>
                  <p>{DETAILS[lang][s.key]}</p>
                </div>
                <span className="system-card__chevron">{open ? '−' : '+'}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
