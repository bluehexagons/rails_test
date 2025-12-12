import React from 'react'
import './Button.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  block?: boolean
}

export function Button({ 
  variant = 'primary', 
  block = false, 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClass = 'btn'
  const variantClass = `btn-${variant}`
  const blockClass = block ? 'btn-block' : ''
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${blockClass} ${className}`.trim()} 
      {...props}
    >
      {children}
    </button>
  )
}
