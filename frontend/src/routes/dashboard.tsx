import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useEffect, useState } from 'react'
import { authStore, setToken, setUser } from '../store'
import api from '../api'
import { Button } from '../components/Button'
import { ClickButton } from '../components/ClickButton'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({}) => {
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

        <ClickButton onClick={handleIncrement}>
          Click!
        </ClickButton>

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
          <Button onClick={handleLogout} variant="danger">
            Logout
          </Button>
        </div>

        {user.admin && <AdminPanel />}
      </div>
    </div>
  )
}

function AdminPanel() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [includeEntities, setIncludeEntities] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/admin/stats?include_entities=${includeEntities}`)
      setStats(response.data)
    } catch (err) {
      setError('Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-panel" style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
      <h3>Admin Panel</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={includeEntities}
            onChange={(e) => setIncludeEntities(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Fetch User Entities
        </label>
      </div>
      <Button onClick={fetchStats} variant="secondary" disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Stats'}
      </Button>
      {error && <p className="error-message">{error}</p>}
      {stats && (
        <div className="stats-display" style={{ marginTop: '1rem', textAlign: 'left' }}>
          <p><strong>User Count:</strong> {stats.user_count}</p>
          <p><strong>Entity Count:</strong> {stats.entity_count}</p>
          <h4>Recent Users:</h4>
          <ul>
            {stats.recent_users.map((u: any) => (
              <li key={u.id}>
                {u.username} ({u.email || 'No email'}) - {new Date(u.created_at).toLocaleDateString()}
                {u.entities && u.entities.length > 0 && (
                  <ul style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {u.entities.map((e: any) => (
                      <li key={e.id}>{e.kind}: {e.count}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
