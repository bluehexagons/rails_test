import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})
