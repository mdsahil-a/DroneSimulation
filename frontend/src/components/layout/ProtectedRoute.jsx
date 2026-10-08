import { Navigate } from 'react-router-dom'
import { useSim } from '../../store/SimContext.jsx'
export default function ProtectedRoute({ children }) {
  const { user } = useSim()
  return user ? children : <Navigate to="/login" replace />
}
