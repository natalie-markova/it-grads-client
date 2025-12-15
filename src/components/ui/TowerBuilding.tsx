import { useEffect, useRef } from 'react'

interface TowerBuildingProps {
  isActive: boolean
}

const TowerBuilding = ({ isActive }: TowerBuildingProps) => {
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
    let animationProgress = 0

    const bars = [
      { value: 0.3 },
      { value: 0.4 },
      { value: 0.6 },
      { value: 0.85 },
      { value: 1.0 },
      { value: 1.5 },
      { value: 4.7 },
    ]

    const barStates = bars.map(() => ({
      progress: 0,
      opacity: 0,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        animationProgress = Math.max(0, animationProgress - 0.025)
        if (animationProgress <= 0) {
          barStates.forEach(state => {
            state.progress = 0
            state.opacity = 0
          })
          return
        }
      } else {
        animationProgress = Math.min(1, animationProgress + 0.012)
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const barWidth = 25
      const barSpacing = 38
      const maxBarHeight = canvas.height * 0.5
      const totalWidth = bars.length * barSpacing - (barSpacing - barWidth)
      const startX = centerX - totalWidth / 2 + canvas.width * 0.25

      barStates.forEach((state, index) => {
        const delay = index * 0.15
        const barProgress = Math.max(0, Math.min(1, (animationProgress - delay) / 0.3))

        state.progress = barProgress
        state.opacity = barProgress
      })

      ctx.save()
      ctx.globalAlpha = animationProgress * 0.3
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(startX - 10, centerY + maxBarHeight * 0.6)
      ctx.lineTo(startX + totalWidth + 10, centerY + maxBarHeight * 0.6)
      ctx.stroke()
      ctx.restore()

      barStates.forEach((state, index) => {
        if (state.opacity > 0) {
          const bar = bars[index]
          const x = startX + index * barSpacing
          const baseY = centerY + maxBarHeight * 0.6
          const barHeight = maxBarHeight * bar.value * state.progress
          const barTop = baseY - barHeight

          ctx.save()
          ctx.globalAlpha = state.opacity

          ctx.fillStyle = 'rgba(59, 130, 246, 0.6)'
          ctx.fillRect(x, barTop, barWidth, barHeight)

          ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
          ctx.lineWidth = 1
          ctx.strokeRect(x, barTop, barWidth, barHeight)

          ctx.restore()
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

export default TowerBuilding
