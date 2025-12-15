import { useEffect, useRef } from 'react'

interface AIScannerProps {
  isActive: boolean
}

const AIScanner = ({ isActive }: AIScannerProps) => {
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

    let animationId: number
    let scanProgress = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        scanProgress = Math.max(0, scanProgress - 0.02)

        if (scanProgress <= 0) {
          return
        }
      } else {
        if (scanProgress < 1) {
          scanProgress += 0.008
        }
      }

      if (scanProgress > 0) {
        const scanY = canvas.height * scanProgress

        const gradient = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30)
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0)')
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.6)')
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, scanY - 30, canvas.width, 60)

        ctx.strokeStyle = '#06b6d4'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, scanY)
        ctx.lineTo(canvas.width, scanY)
        ctx.stroke()
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isActive])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}

export default AIScanner
