import { useEffect, useRef } from 'react'

interface CareerGraphProps {
  isActive: boolean
}

const CareerGraph = ({ isActive }: CareerGraphProps) => {
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

    const points = [
      { x: -0.1, y: 1.1 },
      { x: 0.15, y: 0.7 },
      { x: 0.35, y: 0.5 },
      { x: 0.55, y: 0.35 },
      { x: 0.75, y: 0.2 },
      { x: 1.1, y: -0.1 }
    ]

    let animationId: number
    let progress = 0
    const animationSpeed = 0.008

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        progress = Math.max(0, progress - 0.02)
        if (progress <= 0) {
          return
        }
      } else {
        progress = Math.min(1, progress + animationSpeed)
      }

      const absolutePoints = points.map(p => ({
        x: p.x * canvas.width,
        y: p.y * canvas.height
      }))

      const totalSegments = points.length - 1
      const currentProgress = progress * totalSegments
      const currentSegment = Math.floor(currentProgress)
      const segmentProgress = currentProgress - currentSegment

      ctx.beginPath()
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 0; i < currentSegment && i < absolutePoints.length - 1; i++) {
        if (i === 0) {
          ctx.moveTo(absolutePoints[i].x, absolutePoints[i].y)
        }
        ctx.lineTo(absolutePoints[i + 1].x, absolutePoints[i + 1].y)
      }

      if (currentSegment < absolutePoints.length - 1) {
        const start = absolutePoints[currentSegment]
        const end = absolutePoints[currentSegment + 1]
        const currentX = start.x + (end.x - start.x) * segmentProgress
        const currentY = start.y + (end.y - start.y) * segmentProgress

        if (currentSegment === 0) {
          ctx.moveTo(start.x, start.y)
        }
        ctx.lineTo(currentX, currentY)
      }

      ctx.stroke()

      absolutePoints.forEach((point, index) => {
        const pointProgress = index / totalSegments

        const isVisible = point.x >= 0 && point.x <= canvas.width &&
                         point.y >= 0 && point.y <= canvas.height

        if (progress >= pointProgress && isVisible) {
          const glowRadius = 12
          const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, glowRadius)
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.6)')
          gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)')
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')

          ctx.beginPath()
          ctx.fillStyle = gradient
          ctx.arc(point.x, point.y, glowRadius, 0, Math.PI * 2)
          ctx.fill()

          ctx.beginPath()
          ctx.fillStyle = '#06b6d4'
          ctx.arc(point.x, point.y, 6, 0, Math.PI * 2)
          ctx.fill()

          ctx.beginPath()
          ctx.fillStyle = '#ffffff'
          ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
          ctx.fill()

          if (index === currentSegment || (index === points.length - 1 && progress >= 0.99)) {
            const pulseRadius = 8 + Math.sin(Date.now() / 200) * 2
            ctx.beginPath()
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)'
            ctx.lineWidth = 2
            ctx.arc(point.x, point.y, pulseRadius, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      })

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
      style={{ opacity: 0.5 }}
    />
  )
}

export default CareerGraph
