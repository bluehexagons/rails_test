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
      <div className="root-layout">
        <Outlet />
      </div>
      <Footer />
    </>
  )
}
