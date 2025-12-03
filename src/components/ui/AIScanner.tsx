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

    // Параметры анимации
    let animationId: number
    let scanProgress = 0

    const draw = () => {
      // Очищаем канвас
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        // Сбрасываем анимацию
        scanProgress = Math.max(0, scanProgress - 0.02)

        if (scanProgress <= 0) {
          return
        }
      } else {
        // Прогресс сканирования
        if (scanProgress < 1) {
          scanProgress += 0.008
        }
      }

      // Рисуем сканирующую полосу
      if (scanProgress > 0) {
        const scanY = canvas.height * scanProgress

        // Основная полоса с градиентом
        const gradient = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30)
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0)')
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.6)')
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, scanY - 30, canvas.width, 60)

        // Яркая линия в центре
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
