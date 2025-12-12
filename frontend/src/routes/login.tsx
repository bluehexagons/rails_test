import { createFileRoute, useNavigate, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import api from '../api'
import { setToken, authStore } from '../store'
import { Button } from '../components/Button'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (authStore.state.isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: Login,
})

function Login() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const response = await api.post('/auth/login', value)
        setToken(response.data.token)
        navigate({ to: '/dashboard' })
      } catch (err) {
        setError('Invalid username or password')
      }
    },
  })

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <div className="card">
        <h2 className="text-center">Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => {
                const res = z.string().min(1, 'Username is required').safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
            children={(field) => (
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username or Email:</label>
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  className="form-input"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? "username-error" : undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <div id="username-error" className="error-message" style={{ fontSize: '0.8em', marginTop: '0.25rem' }} role="alert">
                    {field.state.meta.errors.join(', ')}
                  </div>
                )}
              </div>
            )}
          />
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                const res = z.string().min(1, 'Password is required').safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
            children={(field) => (
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password:</label>
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  className="form-input"
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? "password-error" : undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <div id="password-error" className="error-message" style={{ fontSize: '0.8em', marginTop: '0.25rem' }} role="alert">
                    {field.state.meta.errors.join(', ')}
                  </div>
                )}
              </div>
            )}
          />
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" variant="primary" block disabled={!canSubmit}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            )}
          />
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <p>
            <Link to="/">Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
