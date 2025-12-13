import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'
  const isHome = location.pathname === '/'

  return (
    <>
      {!isDashboard && !isHome && <Header />}
      <div style={{ paddingBottom: '20px', flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Outlet />
      </div>
      <Footer />
    </>
  )
}
