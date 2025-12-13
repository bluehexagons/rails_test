import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PageContainer } from '../components/PageContainer'

export const Route = createFileRoute('/privacy')({
  component: Privacy,
})

function Privacy() {
  useEffect(() => {
    document.title = 'Privacy Policy - Minimal Clicker'
  }, [])

  return (
    <PageContainer>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Data Collection & Usage</h2>
      <p>
        We collect your email for account management and technical data (IP, browser info) for security and debugging.
        We do not share your data with third parties or use it for marketing.
      </p>

      <h2>2. Infrastructure & Tracking</h2>
      <p>
        We do not use third-party tracking or ads.
        We use Cloudflare for security (which may use essential cookies) and maintain standard server logs for performance and debugging.
      </p>

      <h2>3. Your Rights</h2>
      <p>
        You have the right to access, correct, or delete your data under GDPR and CCPA. Contact us to exercise these rights.
      </p>
    </PageContainer>
  )
}
