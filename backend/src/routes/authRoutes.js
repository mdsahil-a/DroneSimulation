import { Router } from 'express'
import { MOCK_USERS } from '../data/mockUsers.js'

const router = Router()

// POST /api/auth/login
// Body: { username, password }
// Returns: { token, user: { name, role } }
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' })
  }

  const user = MOCK_USERS.find((u) => u.username === username && u.password === password)
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' })
  }

  // Emit a simple demo token (not production-secure)
  const token = `demo-${user.id}-${Date.now()}`
  return res.json({ token, user: { name: user.name, role: user.role } })
})

export default router
