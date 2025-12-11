import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="container text-center">
      <div className="card">
        <h1>Minimal Clicker Game</h1>
        <p>Login to start playing.</p>
        <div className="nav-links">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
