import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useEffect } from 'react'
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

    if (!user) {
      fetchUser()
    }
  }, [user, navigate])

  const handleLogout = () => {
    setToken(null)
    navigate({ to: '/' })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: '#f9f9f9' }}>
        <h2>Welcome, {user.email}!</h2>
        <p>You are successfully logged in.</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        
        <button 
          onClick={handleLogout}
          style={{ marginTop: '20px', padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
