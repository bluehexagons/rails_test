import { createFileRoute, useNavigate, redirect, Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authStore, setToken, setUser } from '../store'
import api from '../api'
import { Button } from '../components/Button'
import { ClickButton } from '../components/ClickButton'
import { AdminPanel } from '../components/AdminPanel'
import { PageContainer } from '../components/PageContainer'
import './dashboard.css'

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

  useEffect(() => {
    document.title = 'Dashboard - Minimal Clicker'
  }, [])

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
    <PageContainer>
      <nav className="back-link-container" aria-label="Navigation">
        <Link to="/" className="back-link">
          &larr; Home
        </Link>
      </nav>
      <header className="game-header">
        <h1>Minimal Clicker</h1>
        <p>Hello, {user.username}</p>
      </header>

      <main className="game-main">
        <section className="game-stats" aria-label="Click Statistics">
          <div className="stat-box">
            <div className="stat-label">Clicks</div>
            <div className="stat-value" aria-live="polite" aria-atomic="true">
              {click_count?.count ?? "..."}
            </div>
          </div>
        </section>

        <div className="click-area">
          <ClickButton 
            onClick={handleIncrement} 
            disabled={isRateLimited}
            aria-label={isRateLimited ? "Button on cooldown" : "Click to increment score"}
            aria-disabled={isRateLimited}
          >
            {isRateLimited ? 'Cooldown...' : 'Click!'}
          </ClickButton>
        </div>

        <section className="dashboard-metrics" aria-label="Performance and Streaks">
          <div className="metric-item">
            <span className="metric-label">Ping</span>
            <span className="metric-value" role="status">{ping !== null ? `${ping}ms` : '--'}</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Last Click</span>
            <span className="metric-value">
              {click_count?.modified_time 
                ? new Date(click_count.modified_time).toLocaleTimeString() 
                : '--:--:--'}
            </span>
          </div>

          <div className="metric-item streaks-item">
            <span className="metric-label">Streaks</span>
            <div className="streaks-row">
              <span className={`streak-pill ${streak_counter_day?.count > 1 ? 'active' : 'inactive'}`} title="Daily Streak">
                D: <strong>{streak_counter_day?.count ?? 0}</strong>
              </span>
              <span className={`streak-pill ${streak_counter_month?.count > 1 ? 'active' : 'inactive'}`} title="Monthly Streak">
                M: <strong>{streak_counter_month?.count ?? 0}</strong>
              </span>
              <span className={`streak-pill ${streak_counter_year?.count > 1 ? 'active' : 'inactive'}`} title="Yearly Streak">
                Y: <strong>{streak_counter_year?.count ?? 0}</strong>
              </span>
            </div>
          </div>
        </section>

        <div className="game-actions">
          <Button onClick={handleLogout} variant="danger">
            Logout
          </Button>
        </div>

        {user.admin && <AdminPanel />}
      </main>
    </PageContainer>
  )
}
