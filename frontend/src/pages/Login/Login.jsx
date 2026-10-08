import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api.js'
import { useSim } from '../../store/SimContext.jsx'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useSim()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { token, user } = await api.login(form.username, form.password)
      localStorage.setItem('token', token)
      setUser(user); nav('/dashboard')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-line bg-panel p-8">
        <h1 className="text-2xl font-semibold">Sign in to the trainer</h1>
        <p className="text-sm text-sand/60">Practise detecting, classifying and responding to drone threats.</p>
        <label className="block text-sm">Username
          <input className="input mt-1" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <label className="block text-sm">Password
          <input className="input mt-1" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <p className="text-sm text-alert" role="alert">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </main>
  )
}
