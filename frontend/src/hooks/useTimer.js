import { useEffect, useState } from 'react'
export function useTimer(running) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => +(s + 0.1).toFixed(1)), 100)
    return () => clearInterval(id)
  }, [running])
  return seconds
}
