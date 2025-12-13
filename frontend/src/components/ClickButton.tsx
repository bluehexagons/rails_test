import React, { useRef, useState, useEffect, useCallback } from 'react'
import './ClickButton.css'

interface ClickButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
}

export function ClickButton({ onClick, children, className = '', ...props }: ClickButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const sheenRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const lastMousePos = useRef<{ x: number, y: number } | null>(null)
  const [isPressed, setIsPressed] = useState(false)

  const updateButtonTransform = useCallback((clientX: number, clientY: number) => {
    if (!buttonRef.current || !wrapperRef.current) return

    const rect = wrapperRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const deltaX = x - centerX
    const deltaY = y - centerY

    const normX = Math.max(-1, Math.min(1, deltaX / centerX))
    const normY = Math.max(-1, Math.min(1, deltaY / centerY))
    const taperedX = Math.sin((normX ** 3) * Math.PI)
    const taperedY = Math.sin((normY ** 3) * Math.PI)

    const rotateY = taperedX * 18
    const rotateX = -taperedY * 10

    const translateX = taperedX * 8
    const translateY = taperedY * 8
    
    const translateZ = isPressed ? -5 : 10

    const duration = '0.1s'
    buttonRef.current.style.transition = `transform ${duration} ease-out`
    buttonRef.current.style.transform = `scale(var(--button-scale, 1)) translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

    const lighting = taperedX - taperedY
    
    if (sheenRef.current && shadowRef.current) {
      sheenRef.current.style.transition = `opacity ${duration} ease-out`
      shadowRef.current.style.transition = `opacity ${duration} ease-out`
      
      if (lighting > 0) {
        sheenRef.current.style.opacity = Math.min(1, lighting * 0.5).toString()
        shadowRef.current.style.opacity = '0'
      } else {
        sheenRef.current.style.opacity = '0'
        shadowRef.current.style.opacity = Math.min(1, -lighting * 0.5).toString()
      }
    }
  }, [isPressed])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (props.disabled) return
    lastMousePos.current = { x: e.clientX, y: e.clientY }
    updateButtonTransform(e.clientX, e.clientY)
  }

  useEffect(() => {
    if (lastMousePos.current && !props.disabled) {
      updateButtonTransform(lastMousePos.current.x, lastMousePos.current.y)
    }
  }, [isPressed, updateButtonTransform, props.disabled])

  const handleMouseLeave = () => {
    if (!buttonRef.current) return
    lastMousePos.current = null
    setIsPressed(false)
    
    buttonRef.current.style.transition = 'transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)'
    buttonRef.current.style.transform = 'scale(var(--button-scale, 1)) translate3d(0, 0, 0) rotateX(0) rotateY(0)'
    
    if (sheenRef.current && shadowRef.current) {
      sheenRef.current.style.transition = 'opacity 1.5s cubic-bezier(0.19, 1, 0.22, 1)'
      shadowRef.current.style.transition = 'opacity 1.5s cubic-bezier(0.19, 1, 0.22, 1)'
      sheenRef.current.style.opacity = '0'
      shadowRef.current.style.opacity = '0'
    }
  }

  return (
    <div 
      ref={wrapperRef}
      className={`click-button-wrapper ${props.disabled ? 'disabled' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => !props.disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{ opacity: props.disabled ? 0.6 : 1, cursor: props.disabled ? 'not-allowed' : 'pointer' }}
    >
      <button
        ref={buttonRef}
        onClick={onClick}
        className={`click-button-animated ${className} ${isPressed ? 'pressed' : ''}`}
        {...props}
      >
        <div className="click-button-sheen" ref={sheenRef}></div>
        <div className="click-button-shadow" ref={shadowRef}></div>
        <span className="click-button-content">{children}</span>
        <div className="click-button-particles"></div>
      </button>
    </div>
  )
}
