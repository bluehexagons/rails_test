import { Link } from '@tanstack/react-router'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div>
        &copy; {new Date().getFullYear()} <a href="https://github.com/bluehexagons" target="_blank" rel="noopener noreferrer">bluehexagons</a>
        <span className="footer-separator">|</span>
        Licensed under Apache 2.0
      </div>
      <div className="footer-links">
        <Link to="/terms">Terms of Service</Link>
        <Link to="/privacy">Privacy Policy</Link>
      </div>
    </footer>
  )
}
