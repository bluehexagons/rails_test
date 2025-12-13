import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authStore, setToken, setUser } from '../store'
import api, { getErrorMessage } from '../api'
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

interface UserStats {
  user_count: number
  entity_count: number
  recent_users: Array<{
    id: number
    username: string
    email: string
    created_at: string
    entities?: Entity[]
  }>
}

function Dashboard() {
  const { user } = useStore(authStore)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [ping, setPing] = useState<number | null>(null)

  const { data: userData, error: userError } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('/me')
      return response.data
    },
    retry: false,
    enabled: !user, // Only fetch if we don't have the user yet (or to validate session)
  })

  useEffect(() => {
    if (userData) {
      setUser(userData)
    }
  }, [userData])

  useEffect(() => {
    if (userError) {
      console.error('Failed to fetch user', userError)
      setToken(null)
      navigate({ to: '/login' })
    }
  }, [userError, navigate])

  const { data: entities } = useQuery({
    queryKey: ['entities'],
    queryFn: async () => {
      const response = await api.get('/entities/current')
      return response.data
    },
    initialData: {
      click_count: null,
      streak_counter_day: null,
      streak_counter_month: null,
      streak_counter_year: null
    }
  })

  const incrementMutation = useMutation({
    mutationFn: async () => {
      const start = performance.now()
      const response = await api.post('/entities/increment')
      const end = performance.now()
      setPing(Math.round(end - start))
      return response
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['entities'], response.data)
    },
    onError: (error: any) => {
      console.error('Failed to increment count', error)
      if (error.response && error.response.status === 429) {
        setIsRateLimited(true)
        setTimeout(() => setIsRateLimited(false), 2000)
      }
    }
  })

  const handleLogout = () => {
    setToken(null)
    queryClient.clear()
    navigate({ to: '/' })
  }

  const handleIncrement = () => {
    if (!isRateLimited) {
      incrementMutation.mutate()
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

        <ClickButton onClick={handleIncrement} disabled={isRateLimited}>
          {isRateLimited ? 'Cooldown...' : 'Click!'}
        </ClickButton>

        {ping !== null && (
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8em', color: '#666' }}>
            Ping: {ping}ms
          </div>
        )}

        {(streak_counter_day || streak_counter_month || streak_counter_year) && (
          <div className="streak-container">
            {streak_counter_day && streak_counter_day.count > 1 && (
              <div className="streak-badge">
                <h4>Daily Streak</h4>
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
  const [includeEntities, setIncludeEntities] = useState(true)

  const { data: stats, error, isFetching, refetch } = useQuery<UserStats>({
    queryKey: ['admin', 'stats', includeEntities],
    queryFn: async () => {
      const response = await api.get(`/admin/stats?include_entities=${includeEntities}`)
      return response.data
    },
    enabled: false,
  })

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
      <Button onClick={() => refetch()} variant="secondary" disabled={isFetching}>
        {isFetching ? 'Loading...' : 'Fetch Stats'}
      </Button>
      {error && <p className="error-message">{getErrorMessage(error)}</p>}
      {stats && (
        <div className="stats-display" style={{ marginTop: '1rem', textAlign: 'left' }}>
          <p><strong>User Count:</strong> {stats.user_count}</p>
          <p><strong>Entity Count:</strong> {stats.entity_count}</p>
          <h4>Recent Users:</h4>
          <ul>
            {stats.recent_users.map((u) => (
              <li key={u.id}>
                {u.username} ({u.email || 'No email'}) - {new Date(u.created_at).toLocaleDateString()}
                {u.entities && u.entities.length > 0 && (
                  <ul style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {u.entities.map((e) => (
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
