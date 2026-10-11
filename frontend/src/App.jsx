import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import Login from './pages/Login/Login.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import ScenarioSetup from './pages/ScenarioSetup/ScenarioSetup.jsx'
import LiveSimulation from './pages/LiveSimulation/LiveSimulation.jsx'
import AIAnalysis from './pages/AIAnalysis/AIAnalysis.jsx'
import Results from './pages/Results/Results.jsx'
import History from './pages/History/History.jsx'

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>

export default function App() {
  return (
    <div className="min-h-screen bg-[#07080B] text-slate-100 font-sans selection:bg-red-500/30 selection:text-white">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={guard(<Dashboard />)} />
        <Route path="/setup" element={guard(<ScenarioSetup />)} />
        <Route path="/simulation" element={guard(<LiveSimulation />)} />
        <Route path="/analysis" element={guard(<AIAnalysis />)} />
        <Route path="/results" element={guard(<Results />)} />
        <Route path="/history" element={guard(<History />)} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}
