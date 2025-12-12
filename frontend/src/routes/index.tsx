import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { authStore } from '../store'
import { Button } from '../components/Button'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { isAuthenticated } = useStore(authStore)
  const navigate = useNavigate()

  return (
    <div className="container text-center">
      <div className="card">
        <h1>Minimal Clicker Game</h1>
        {isAuthenticated ? (
          <>
            <p>Welcome back!</p>
            <div className="nav-links">
              <Button variant="primary" onClick={() => navigate({ to: '/dashboard' })}>
                Go to Dashboard
              </Button>
            </div>
          </>
        ) : (
          <>
            <p>Login to start playing.</p>
            <div className="nav-links">
              <Button variant="primary" onClick={() => navigate({ to: '/login' })}>
                Login
              </Button>
              <Button variant="success" onClick={() => navigate({ to: '/signup' })}>
                Sign Up
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
