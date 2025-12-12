import { createFileRoute, Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { authStore } from '../store'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { isAuthenticated } = useStore(authStore)

  return (
    <div className="container text-center">
      <div className="card">
        <h1>Minimal Clicker Game</h1>
        {isAuthenticated ? (
          <>
            <p>Welcome back!</p>
            <div className="nav-links">
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <p>Login to start playing.</p>
            <div className="nav-links">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/signup" className="btn btn-success">
                Sign Up
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
