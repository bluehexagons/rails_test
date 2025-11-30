import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, FormEvent } from 'react'
import api from '../api'
import { setToken } from '../store'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await api.post('/auth/login', { email, password })
      setToken(response.data.token)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
    </div>
  )
}
