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

interface Entity {
  id: number
  kind: string
  count: number
  created_time: string
  modified_time: string
}

function Dashboard() {
  const { user } = useStore(authStore)
  const navigate = useNavigate()
  const [entities, setEntities] = useState<{ 
    click_count: Entity | null, 
    streak_counter_day: Entity | null,
    streak_counter_month: Entity | null,
    streak_counter_year: Entity | null
  }>({ 
    click_count: null, 
    streak_counter_day: null,
    streak_counter_month: null,
    streak_counter_year: null
  })

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

    const fetchEntities = async () => {
      try {
        const response = await api.get('/entities/current')
        setEntities(response.data)
      } catch (error) {
        console.error('Failed to fetch entities', error)
      }
    }

    if (!user) {
      fetchUser()
    }
    fetchEntities()
  }, [user, navigate])

  const handleLogout = () => {
    setToken(null)
    navigate({ to: '/' })
  }

  const handleIncrement = async () => {
    try {
      const response = await api.post('/entities/increment')
      setEntities(response.data)
    } catch (error) {
      console.error('Failed to increment count', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const { click_count, streak_counter_day, streak_counter_month, streak_counter_year } = entities

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
          <p>Current Count: <strong>{click_count ? click_count.count : 0}</strong></p>
          {click_count?.created_time && <p>Created: {new Date(click_count.created_time).toLocaleString()}</p>}
          {click_count?.modified_time && <p>Last Modified: {new Date(click_count.modified_time).toLocaleString()}</p>}
          
          {streak_counter_day && streak_counter_day.count > 1 && (
            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <h4>Daily Streak 🔥</h4>
              <p>Current Streak: <strong>{streak_counter_day.count} days</strong></p>
            </div>
          )}

          {streak_counter_month && streak_counter_month.count > 1 && (
            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <h4>Monthly Streak 📅</h4>
              <p>Current Streak: <strong>{streak_counter_month.count} months</strong></p>
            </div>
          )}

          {streak_counter_year && streak_counter_year.count > 1 && (
            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <h4>Yearly Streak 🗓️</h4>
              <p>Current Streak: <strong>{streak_counter_year.count} years</strong></p>
            </div>
          )}

          <button
            onClick={handleIncrement}
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
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
