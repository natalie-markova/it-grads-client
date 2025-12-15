import { useEffect, useRef } from 'react'

interface MatrixRainProps {
  isActive: boolean
}

const MatrixRain = ({ isActive }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.offsetWidth
        canvas.height = parent.offsetHeight
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const matrixChars = '0123456789'
    const chars = matrixChars.split('')

    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    let animationId: number
    let lastFrameTime = 0
    const frameDelay = 80

    const draw = (currentTime: number) => {
      if (!isActive) {
        ctx.fillStyle = 'rgba(18, 18, 18, 0.1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        return
      }

      if (currentTime - lastFrameTime < frameDelay) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastFrameTime = currentTime

      ctx.fillStyle = 'rgba(18, 18, 18, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]

        const y = drops[i] * fontSize
        const opacity = Math.min(1, (canvas.height - y) / canvas.height)

        if (y < fontSize * 2) {
          ctx.fillStyle = '#06b6d4'
        } else {
          ctx.fillStyle = `rgba(6, 182, 212, ${opacity * 0.6})`
        }

        ctx.fillText(char, i * fontSize, y)

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }

      animationId = requestAnimationFrame(draw)
    }

    draw(0)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isActive])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: isActive ? 0.4 : 0, transition: 'opacity 0.3s ease' }}
    />
  )
}

export default MatrixRain
