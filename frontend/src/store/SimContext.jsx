import { createContext, useContext, useState, useEffect } from 'react'

const SimContext = createContext(null)
export const useSim = () => useContext(SimContext)

export function SimProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [scenario, setScenario] = useState(null)   // config chosen in Scenario Setup
  const [session, setSession] = useState(null)     // data recorded during Live Simulation
  const [analysis, setAnalysis] = useState(null)   // response from AI service

  useEffect(() => {
    user ? localStorage.setItem('user', JSON.stringify(user)) : localStorage.removeItem('user')
  }, [user])

  const logout = () => { setUser(null); setScenario(null); setSession(null); setAnalysis(null) }

  return (
    <SimContext.Provider value={{ user, setUser, logout, scenario, setScenario, session, setSession, analysis, setAnalysis }}>
      {children}
    </SimContext.Provider>
  )
}
