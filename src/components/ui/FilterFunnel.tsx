import { useEffect, useRef } from 'react'

interface FilterFunnelProps {
  isActive: boolean
}

const FilterFunnel = ({ isActive }: FilterFunnelProps) => {
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

    interface Target {
      x: number
      y: number
      locked: boolean
      lockProgress: number
      distance: number
    }

    const targets: Target[] = []
    const maxTargets = 12

    for (let i = 0; i < maxTargets; i++) {
      targets.push({
        x: Math.random() * 0.8 + 0.1,
        y: Math.random() * 0.8 + 0.1,
        locked: false,
        lockProgress: 0,
        distance: 0,
      })
    }

    let crosshairX = 0.5
    let crosshairY = 0.5
    let targetIndex = 0

    let animationId: number
    let animationProgress = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        animationProgress = Math.max(0, animationProgress - 0.02)
        if (animationProgress <= 0) {
          targets.forEach(t => {
            t.locked = false
            t.lockProgress = 0
          })
          crosshairX = 0.5
          crosshairY = 0.5
          targetIndex = 0
          return
        }
      } else {
        animationProgress = Math.min(1, animationProgress + 0.012)
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.save()
      ctx.globalAlpha = animationProgress * 0.15
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      ctx.lineWidth = 1

      const gridSpacing = 40
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'
      ctx.lineWidth = 1.5

      ctx.beginPath()
      ctx.moveTo(centerX, 0)
      ctx.lineTo(centerX, canvas.height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(canvas.width, centerY)
      ctx.stroke()

      ctx.restore()

      if (targetIndex < targets.length) {
        const target = targets[targetIndex]
        const targetX = canvas.width * target.x
        const targetY = canvas.height * target.y

        const dx = targetX - crosshairX * canvas.width
        const dy = targetY - crosshairY * canvas.height
        const distance = Math.sqrt(dx * dx + dy * dy)
        target.distance = distance

        if (distance > 2) {
          const speed = 0.05
          crosshairX += (dx / canvas.width) * speed
          crosshairY += (dy / canvas.height) * speed
        } else {
          target.lockProgress = Math.min(1, target.lockProgress + 0.03)

          if (target.lockProgress >= 1) {
            target.locked = true
            targetIndex++
          }
        }
      }

      const currentCrosshairX = crosshairX * canvas.width
      const currentCrosshairY = crosshairY * canvas.height

      targets.forEach((target, index) => {
        const x = canvas.width * target.x
        const y = canvas.height * target.y

        ctx.save()
        ctx.globalAlpha = animationProgress

        if (target.locked) {
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 15)
          glowGradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)')
          glowGradient.addColorStop(1, 'rgba(34, 197, 94, 0)')
          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(x, y, 15, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x, y, 12, 0, Math.PI * 2)
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(x - 10, y)
          ctx.lineTo(x + 10, y)
          ctx.moveTo(x, y - 10)
          ctx.lineTo(x, y + 10)
          ctx.stroke()

          ctx.fillStyle = 'rgba(34, 197, 94, 1)'
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()
        } else if (index === targetIndex) {
          const color = target.lockProgress > 0 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(59, 130, 246, 0.6)'

          if (target.lockProgress > 0) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(x, y, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * target.lockProgress)
            ctx.stroke()
          }

          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x, y, 12, 0, Math.PI * 2)
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.stroke()

          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(x, y, 8, 0, Math.PI * 2)
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.stroke()

          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      })

      ctx.save()
      ctx.globalAlpha = animationProgress

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)'
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(currentCrosshairX - 25, currentCrosshairY)
      ctx.lineTo(currentCrosshairX - 8, currentCrosshairY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(currentCrosshairX + 8, currentCrosshairY)
      ctx.lineTo(currentCrosshairX + 25, currentCrosshairY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(currentCrosshairX, currentCrosshairY - 25)
      ctx.lineTo(currentCrosshairX, currentCrosshairY - 8)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(currentCrosshairX, currentCrosshairY + 8)
      ctx.lineTo(currentCrosshairX, currentCrosshairY + 25)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(currentCrosshairX, currentCrosshairY, 6, 0, Math.PI * 2)
      ctx.stroke()

      const pulsePhase = (Date.now() % 2000) / 2000
      const pulseRadius = 15 + pulsePhase * 5
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.6 - pulsePhase * 0.4})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(currentCrosshairX, currentCrosshairY, pulseRadius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = 'rgba(59, 130, 246, 1)'
      ctx.beginPath()
      ctx.arc(currentCrosshairX, currentCrosshairY, 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

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

export default FilterFunnel
