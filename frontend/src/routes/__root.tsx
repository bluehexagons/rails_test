import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div style={{ paddingBottom: '20px' }}>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})
