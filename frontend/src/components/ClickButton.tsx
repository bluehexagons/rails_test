import React from 'react'
import './ClickButton.css'

interface ClickButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
}

export function ClickButton({ onClick, children, className = '', ...props }: ClickButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`click-button-animated ${className}`}
      {...props}
    >
      <span className="click-button-content">{children}</span>
      <div className="click-button-particles"></div>
    </button>
  )
}
