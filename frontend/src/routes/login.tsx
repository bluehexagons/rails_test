import { createFileRoute, useNavigate, Link, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import api, { getErrorMessage } from '../api'
import { setToken, authStore } from '../store'
import { Button } from '../components/Button'
import { PageContainer } from '../components/PageContainer'

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

  useEffect(() => {
    document.title = 'Login - Minimal Clicker'
  }, [])

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/login', data),
    onSuccess: (response) => {
      setToken(response.data.token)
      navigate({ to: '/dashboard' })
    },
    onError: (err) => {
      setError(getErrorMessage(err))
    }
  })

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
      await mutation.mutateAsync(value)
    },
  })

  return (
    <PageContainer className="auth-container">
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
                  <div id="username-error" className="error-message field-error" role="alert">
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
                  <div id="password-error" className="error-message field-error" role="alert">
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
        <div className="auth-links">
          <p>
            Want an account? <Link to="/signup">Sign up</Link>
          </p>
          <p>
            <Link to="/">Back Home</Link>
          </p>
        </div>
    </PageContainer>
  )
}
