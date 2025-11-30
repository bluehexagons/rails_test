import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to Ruby on Rails + React App</h1>
      <p>This is the public home page.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/login" style={{ marginRight: '10px', padding: '10px 20px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Login
        </Link>
        <Link to="/signup" style={{ padding: '10px 20px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Sign Up
        </Link>
      </div>
    </div>
  )
}
