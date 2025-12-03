import { useEffect, useRef } from 'react'

interface RatingStarsProps {
  isActive: boolean
}

const RatingStars = ({ isActive }: RatingStarsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Устанавливаем размеры канваса
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
    let progress = 0
    const animationSpeed = 0.01

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        // Сбрасываем анимацию
        progress = Math.max(0, progress - 0.02)
        if (progress <= 0) {
          return
        }
      } else {
        // Увеличиваем прогресс
        progress = Math.min(1, progress + animationSpeed)
      }

      // Параметры звезд
      const starSize = 30
      const starSpacing = starSize + 15
      const totalWidth = starSpacing * 5 - 15
      const startX = (canvas.width - totalWidth) / 2
      const startY = canvas.height / 2

      // Рисуем 5 звезд
      const rating = 4.5
      for (let i = 0; i < 5; i++) {
        const starProgress = Math.max(0, Math.min(1, (progress - i * 0.15) / 0.15))
        const x = startX + i * starSpacing
        const y = startY

        // Определяем, должна ли звезда быть заполнена
        const isFilled = i < Math.floor(rating)
        const isHalf = i === Math.floor(rating) && rating % 1 !== 0

        if (starProgress > 0) {
          // Рисуем звезду
          drawStar(ctx, x, y, starSize, isFilled, isHalf, starProgress)

          // Пульсирующий эффект для только что заполненных звезд
          if (starProgress > 0.8 && starProgress < 1) {
            const pulseRadius = starSize * 0.8 + (1 - starProgress) * 15
            ctx.strokeStyle = `rgba(6, 182, 212, ${(1 - starProgress) * 0.5})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(x, y, pulseRadius, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    // Функция для рисования звезды
    const drawStar = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      filled: boolean,
      half: boolean,
      progress: number
    ) => {
      const spikes = 5
      const outerRadius = size / 2
      const innerRadius = size / 4

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((-Math.PI / 2))

      // Контур звезды
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes
        const px = Math.cos(angle) * radius
        const py = Math.sin(angle) * radius
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.closePath()

      // Заливка звезды
      if (filled || half) {
        if (half) {
          // Половина звезды
          ctx.save()
          ctx.clip()
          ctx.fillStyle = `rgba(6, 182, 212, ${0.8 * progress})`
          ctx.fillRect(-outerRadius, -outerRadius, outerRadius, outerRadius * 2)
          ctx.restore()
        } else {
          // Полная звезда
          ctx.fillStyle = `rgba(6, 182, 212, ${0.8 * progress})`
          ctx.fill()
        }
      }

      // Контур звезды
      ctx.strokeStyle = `rgba(6, 182, 212, ${progress})`
      ctx.lineWidth = 2
      ctx.stroke()

      // Свечение
      if (filled || half) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius * 1.5)
        gradient.addColorStop(0, `rgba(6, 182, 212, ${0.3 * progress})`)
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')
        ctx.fillStyle = gradient
        ctx.fill()
      }

      ctx.restore()
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

export default RatingStars
