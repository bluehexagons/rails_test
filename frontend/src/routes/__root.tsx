import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <div style={{ paddingBottom: '20px' }}>
        <Outlet />
      </div>
    </>
  ),
})
