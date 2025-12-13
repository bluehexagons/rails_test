import { createFileRoute, useNavigate, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import api, { getErrorMessage } from '../api'
import { setToken, authStore } from '../store'
import { Button } from '../components/Button'
import { PageContainer } from '../components/PageContainer'

export const Route = createFileRoute('/signup')({
  beforeLoad: () => {
    if (authStore.state.isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: Signup,
})

function Signup() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/signup', data),
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
      email: '',
      password: '',
      passwordConfirmation: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
      await mutation.mutateAsync({ 
        username: value.username,
        email: value.email,
        password: value.password,
        password_confirmation: value.passwordConfirmation
      })
    },
  })

  return (
    <PageContainer style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2 className="text-center">Sign Up</h2>
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
                const res = z.string().min(3, 'Username must be at least 3 characters').safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              }
            }}
            children={(field) => (
              <div className="form-group">
                <label htmlFor="signup-username" className="form-label">Username:</label>
                <input
                  id="signup-username"
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
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined
                const res = z.string().email('Invalid email').safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              }
            }}
            children={(field) => (
              <div className="form-group">
                <label htmlFor="signup-email" className="form-label">Email (Optional):</label>
                <input
                  id="signup-email"
                  name="email"
                  autoComplete="email"
                  className="form-input"
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? "email-error" : undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <div id="email-error" className="error-message" style={{ fontSize: '0.8em', marginTop: '0.25rem' }} role="alert">
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
                const res = z.string().min(6, 'Password must be at least 6 characters').safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              }
            }}
            children={(field) => (
              <div className="form-group">
                <label htmlFor="signup-password" className="form-label">Password:</label>
                <input
                  id="signup-password"
                  name="password"
                  autoComplete="new-password"
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
          <form.Field
            name="passwordConfirmation"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) => {
                if (value !== fieldApi.form.getFieldValue('password')) {
                  return 'Passwords do not match'
                }
                return undefined
              }
            }}
            children={(field) => (
              <div className="form-group">
                <label htmlFor="signup-password-confirmation" className="form-label">Confirm Password:</label>
                <input
                  id="signup-password-confirmation"
                  name="passwordConfirmation"
                  autoComplete="new-password"
                  className="form-input"
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? "password-confirmation-error" : undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <div id="password-confirmation-error" className="error-message" style={{ fontSize: '0.8em', marginTop: '0.25rem' }} role="alert">
                    {field.state.meta.errors.join(', ')}
                  </div>
                )}
              </div>
            )}
          />
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" variant="success" block disabled={!canSubmit}>
                {isSubmitting ? 'Signing up...' : 'Sign Up'}
              </Button>
            )}
          />
          <div style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
            By signing up, you agree to our <Link to="/terms" target="_blank">Terms of Service</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.
          </div>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <p>
            <Link to="/">Back Home</Link>
          </p>
        </div>
    </PageContainer>
  )
}
