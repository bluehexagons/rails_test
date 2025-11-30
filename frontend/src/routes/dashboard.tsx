import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useEffect, useState } from 'react'
import { authStore, setToken, setUser } from '../store'
import api from '../api'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!authStore.state.isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const { user } = useStore(authStore)
  const navigate = useNavigate()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/me')
        setUser(response.data)
      } catch (error) {
        console.error('Failed to fetch user', error)
        setToken(null) // Logout if token is invalid
        navigate({ to: '/login' })
      }
    }

    const fetchCount = async () => {
      try {
        const response = await api.get('/entities/current')
        setCount(response.data.count)
      } catch (error) {
        console.error('Failed to fetch count', error)
      }
    }

    if (!user) {
      fetchUser()
    }
    fetchCount()
  }, [user, navigate])

  const handleLogout = () => {
    setToken(null)
    navigate({ to: '/' })
  }

  const handleIncrement = async () => {
    try {
      const response = await api.post('/entities/increment')
      setCount(response.data.count)
    } catch (error) {
      console.error('Failed to increment count', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div className="card">
        <h2>Welcome, {user.email}!</h2>
        <p>You are successfully logged in.</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        
        <div className="card" style={{ marginTop: '20px', backgroundColor: 'var(--bg-color)' }}>
          <h3>Click Counter</h3>
          <p>Current Count: <strong>{count !== null ? count : 'Loading...'}</strong></p>
          <button
            onClick={handleIncrement}
            className="btn btn-primary"
          >
            Increment Count
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="btn btn-danger"
          style={{ marginTop: '20px' }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
