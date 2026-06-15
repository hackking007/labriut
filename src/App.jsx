import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import CreditBar from './components/CreditBar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import BloodTest from './pages/BloodTest.jsx'
import EyeDiagnosis from './pages/EyeDiagnosis.jsx'
import NutritionCalc from './pages/NutritionCalc.jsx'
import Articles from './pages/Articles.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <CreditBar />
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blood" element={<BloodTest />} />
          <Route path="/eye" element={<EyeDiagnosis />} />
          <Route path="/nutrition" element={<NutritionCalc />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
