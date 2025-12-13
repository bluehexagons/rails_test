import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PageContainer } from '../components/PageContainer'

export const Route = createFileRoute('/terms')({
  component: Terms,
})

function Terms() {
  useEffect(() => {
    document.title = 'Terms of Service - Minimal Clicker'
  }, [])

  return (
    <PageContainer>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Usage Agreement</h2>
      <p>
        By using Minimal Clicker Game, you agree to these terms. The service is provided "as is" for entertainment purposes.
      </p>

      <h2>2. Accounts & Security</h2>
      <p>
        You are responsible for maintaining the security of your account and password. You must provide accurate information when registering.
      </p>

      <h2>3. Prohibited Conduct</h2>
      <p>
        You agree not to use the service for any illegal purposes, harassment, spam, or to compromise the service's security.
      </p>

      <h2>4. Termination & Liability</h2>
      <p>
        We reserve the right to terminate accounts for violations. We are not liable for any damages resulting from the use of this service.
      </p>

      <h2>5. General</h2>
      <p>
        These terms are governed by US and EU laws. We may modify these terms at any time; continued use constitutes agreement.
      </p>
    </PageContainer>
  )
}
