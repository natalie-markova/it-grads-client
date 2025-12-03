import { useEffect, useRef } from 'react'

interface CheckMarksProps {
  isActive: boolean
}

const CheckMarks = ({ isActive }: CheckMarksProps) => {
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

    // Позиции галочек (вертикальный список) - распределены по всей высоте, смещены вправо
    const checkmarks = [
      { x: 0.95, y: 0.15, delay: 0 },
      { x: 0.95, y: 0.35, delay: 0.15 },
      { x: 0.95, y: 0.55, delay: 0.3 },
      { x: 0.95, y: 0.75, delay: 0.45 },
      { x: 0.95, y: 0.95, delay: 0.6 },
    ]

    // Состояние анимации для каждой галочки
    const checkStates = checkmarks.map(() => ({
      progress: 0,
      opacity: 0,
    }))

    let animationId: number
    let animationProgress = 0

    // Рисование элемента списка с галочкой
    const drawCheck = (x: number, y: number, state: any) => {
      const boxSize = 20
      // Линия занимает большую часть ширины канваса
      const lineWidth = canvas.width * 0.6

      ctx.save()
      ctx.globalAlpha = state.opacity

      // Линия списка (имитация текста) - теперь слева от чекбокса
      if (state.progress > 0) {
        const lineLength = lineWidth * state.progress
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x - boxSize - lineLength, y)
        ctx.lineTo(x - boxSize, y)
        ctx.stroke()
      }

      // Квадратный чекбокс
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize)

      // Рисуем галочку внутри квадрата
      if (state.progress > 0) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Первая линия галочки (короткая часть)
        const line1Progress = Math.min(1, state.progress * 2)
        const line1Length = boxSize * 0.35 * line1Progress

        ctx.beginPath()
        ctx.moveTo(x - boxSize * 0.25, y)
        ctx.lineTo(x - boxSize * 0.25 + line1Length * 0.7, y + line1Length)
        ctx.stroke()

        // Вторая линия галочки (длинная часть)
        if (state.progress > 0.5) {
          const line2Progress = (state.progress - 0.5) * 2
          const line2Length = boxSize * 0.6 * line2Progress

          ctx.beginPath()
          ctx.moveTo(x - boxSize * 0.25 + boxSize * 0.35 * 0.7, y + boxSize * 0.35)
          ctx.lineTo(
            x - boxSize * 0.25 + boxSize * 0.35 * 0.7 + line2Length * 0.7,
            y + boxSize * 0.35 - line2Length
          )
          ctx.stroke()
        }
      }

      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        // Плавное затухание
        animationProgress = Math.max(0, animationProgress - 0.02)
        if (animationProgress <= 0) {
          checkStates.forEach(state => {
            state.progress = 0
            state.opacity = 0
          })
          return
        }
      } else {
        // Плавное нарастание
        animationProgress = Math.min(1, animationProgress + 0.012)
      }

      // Обновление состояния каждой галочки
      checkStates.forEach((state, index) => {
        const check = checkmarks[index]
        const checkProgress = Math.max(0, Math.min(1, (animationProgress - check.delay) / 0.4))

        state.progress = checkProgress
        state.opacity = checkProgress
      })

      // Рисование всех галочек
      checkStates.forEach((state, index) => {
        if (state.opacity > 0) {
          const check = checkmarks[index]
          const x = canvas.width * check.x
          const y = canvas.height * check.y
          drawCheck(x, y, state)
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

export default CheckMarks
