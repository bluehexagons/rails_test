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
      <div className="card">
        <div className="game-header">
          <h1>Minimal Clicker</h1>
          <p>Hello, {user.username}</p>
        </div>

        <div className="game-stats">
          <div className="stat-box">
            <div className="stat-label">Score</div>
            <div className="stat-value">{click_count?.count ?? "..."}</div>
          </div>
        </div>

        <button
          onClick={handleIncrement}
          className="btn btn-primary click-button"
        >
          Click!
        </button>

        {(streak_counter_day || streak_counter_month || streak_counter_year) && (
          <div className="streak-container">
            {streak_counter_day && streak_counter_day.count > 1 && (
              <div className="streak-badge">
                <h4>Daily Streak 🔥</h4>
                <p>Current Streak: <strong>{streak_counter_day.count} days</strong></p>
              </div>
            )}

            {streak_counter_month && streak_counter_month.count > 1 && (
              <div className="streak-badge">
                <h4>Monthly Streak</h4>
                <p>Current Streak: <strong>{streak_counter_month.count} months</strong></p>
              </div>
            )}

            {streak_counter_year && streak_counter_year.count > 1 && (
              <div className="streak-badge">
                <h4>Yearly Streak️</h4>
                <p>Current Streak: <strong>{streak_counter_year.count} years</strong></p>
              </div>
            )}
          </div>
        )}

        {click_count?.modified_time && (
          <div className="timestamp-info">
            Last click: {new Date(click_count.modified_time).toLocaleString()}
          </div>
        )}

        <div className="game-actions">
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
