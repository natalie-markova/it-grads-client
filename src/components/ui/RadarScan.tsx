import { useEffect, useRef } from 'react'

interface RadarScanProps {
  isActive: boolean
}

const RadarScan = ({ isActive }: RadarScanProps) => {
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
    let angle = 0

    const targets = [
      { angle: 0.3, distance: 0.4, detected: false, pulsePhase: 0 },
      { angle: 1.2, distance: 0.6, detected: false, pulsePhase: 0 },
      { angle: 2.5, distance: 0.3, detected: false, pulsePhase: 0 },
      { angle: 3.8, distance: 0.7, detected: false, pulsePhase: 0 },
      { angle: 4.5, distance: 0.5, detected: false, pulsePhase: 0 },
      { angle: 5.1, distance: 0.8, detected: false, pulsePhase: 0 },
      { angle: 0.8, distance: 0.65, detected: false, pulsePhase: 0 },
      { angle: 2.1, distance: 0.45, detected: false, pulsePhase: 0 },
      { angle: 1.8, distance: 0.55, detected: false, pulsePhase: 0 },
      { angle: 3.2, distance: 0.35, detected: false, pulsePhase: 0 },
      { angle: 5.5, distance: 0.72, detected: false, pulsePhase: 0 },
      { angle: 0.5, distance: 0.52, detected: false, pulsePhase: 0 },
      { angle: 4.1, distance: 0.62, detected: false, pulsePhase: 0 },
      { angle: 2.8, distance: 0.48, detected: false, pulsePhase: 0 },
      { angle: 5.8, distance: 0.58, detected: false, pulsePhase: 0 },
      { angle: 1.5, distance: 0.38, detected: false, pulsePhase: 0 },
    ]

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.65

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)'
      ctx.lineWidth = 1

      for (let i = 1; i <= 5; i++) {
        const radius = (maxRadius / 5) * i
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      ctx.lineWidth = 1.5

      ctx.beginPath()
      ctx.moveTo(centerX - maxRadius, centerY)
      ctx.lineTo(centerX + maxRadius, centerY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(centerX, centerY - maxRadius)
      ctx.lineTo(centerX, centerY + maxRadius)
      ctx.stroke()

      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle)

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, maxRadius, -Math.PI / 4, Math.PI / 4)
      ctx.closePath()
      ctx.clip()

      const sweepGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius)
      sweepGradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)')
      sweepGradient.addColorStop(0.4, 'rgba(59, 130, 246, 0.3)')
      sweepGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')

      ctx.fillStyle = sweepGradient
      ctx.fillRect(-maxRadius, -maxRadius, maxRadius * 2, maxRadius * 2)

      ctx.restore()

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle + Math.PI / 4)

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(maxRadius, 0)
      ctx.stroke()

      ctx.restore()

      targets.forEach((target) => {
        const angleDiff = ((target.angle - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        if (angleDiff < 0.1 && !target.detected) {
          target.detected = true
          target.pulsePhase = 0
        }

        if (target.detected) {
          const targetX = centerX + Math.cos(target.angle) * (maxRadius * target.distance)
          const targetY = centerY + Math.sin(target.angle) * (maxRadius * target.distance)

          target.pulsePhase += 0.05
          const pulseScale = 1 + Math.sin(target.pulsePhase) * 0.3

          const glowGradient = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 8 * pulseScale)
          glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
          glowGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)')
          glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')

          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(targetX, targetY, 8 * pulseScale, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = 'rgba(59, 130, 246, 1)'
          ctx.beginPath()
          ctx.arc(targetX, targetY, 3, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = `rgba(59, 130, 246, ${0.6 - (target.pulsePhase % 2) * 0.3})`
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(targetX, targetY, 5 + (target.pulsePhase % 2) * 3, 0, Math.PI * 2)
          ctx.stroke()
        }
      })

      angle += 0.015

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

export default RadarScan
