import { Link } from '@tanstack/react-router'
import './Header.css'

export function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          Minimal Clicker
        </Link>
      </div>
    </header>
  )
}
