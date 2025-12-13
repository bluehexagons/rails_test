import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { authStore } from '../store'
import { Button } from '../components/Button'
import { PageContainer } from '../components/PageContainer'

export const Route = createFileRoute('/')({
  component: Index,
})

const greetings = ['Welcome back!', 'Hi again!', 'Thanks for coming by.']

function Index() {
  const { isAuthenticated } = useStore(authStore)
  const navigate = useNavigate()

  return (
    <PageContainer className="text-center">
      <h1>Minimal Clicker Game</h1>
        {isAuthenticated ? (
          <>
            <p>{greetings[Math.floor((Math.random() ** 2) * greetings.length)]}</p>
            <div className="nav-links">
              <Button variant="primary" onClick={() => navigate({ to: '/dashboard' })}>
                Go Click.
              </Button>
            </div>
          </>
        ) : (
          <>
            <p>Login to Click.</p>
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

      <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        <h3>About</h3>
        <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }}>
          Minimal Clicker is a learning project using:
          React (frontend), Ruby on Rails (API backend), TypeScript, and various bits of TanStack.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="https://github.com/bluehexagons/rails_test" target="_blank" rel="noopener noreferrer">
            GitHub Repository
          </a>
          <a href="https://github.com/sponsors/bluehexagons" target="_blank" rel="noopener noreferrer">
            Sponsor bluehexagons
          </a>
        </div>
      </div>
    </PageContainer>
  )
}
