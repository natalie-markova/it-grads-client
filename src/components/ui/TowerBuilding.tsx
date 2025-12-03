import { useEffect, useRef, useState } from 'react'
import { Award } from 'lucide-react'

interface TowerBuildingProps {
  isActive: boolean
}

const TowerBuilding = ({ isActive }: TowerBuildingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [trophyOpacity, setTrophyOpacity] = useState(0)

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

    // Параметры башни
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const blockHeight = 20
    const blockGap = 4

    // Структура башни - 4 уровня + награда
    const levels = [
      { width: 150, y: 0 },
      { width: 120, y: 1 },
      { width: 90, y: 2 },
      { width: 60, y: 3 },
    ]

    // Состояние анимации для каждого уровня
    const levelStates = levels.map(() => ({
      progress: 0,
      opacity: 0,
    }))

    // Состояние кубка
    const trophyState = {
      progress: 0,
      opacity: 0,
    }

    let animationId: number
    let animationProgress = 0

    // Рисование одного уровня
    const drawLevel = (level: any, index: number, state: any) => {
      const blockY = centerY + 60 - index * (blockHeight + blockGap)
      const currentY = blockY + (1 - state.progress) * 30

      ctx.save()
      ctx.globalAlpha = state.opacity

      // Основной прямоугольник
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.fillRect(
        centerX - level.width / 2,
        currentY,
        level.width,
        blockHeight
      )

      // Тонкая граница
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
      ctx.lineWidth = 1
      ctx.strokeRect(
        centerX - level.width / 2,
        currentY,
        level.width,
        blockHeight
      )

      ctx.restore()
    }


    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        // Плавное затухание
        animationProgress = Math.max(0, animationProgress - 0.02)
        if (animationProgress <= 0) {
          levelStates.forEach(state => {
            state.progress = 0
            state.opacity = 0
          })
          trophyState.progress = 0
          trophyState.opacity = 0
          setTrophyOpacity(0)
          return
        }
      } else {
        // Плавное нарастание
        animationProgress = Math.min(1, animationProgress + 0.01)
      }

      // Обновление состояния каждого уровня
      levelStates.forEach((state, index) => {
        const delay = index * 0.15
        const levelProgress = Math.max(0, Math.min(1, (animationProgress - delay) / 0.3))

        state.progress = levelProgress
        state.opacity = levelProgress
      })

      // Обновление состояния кубка (появляется последним)
      const trophyDelay = levels.length * 0.15
      const trophyProgress = Math.max(0, Math.min(1, (animationProgress - trophyDelay) / 0.3))
      trophyState.progress = trophyProgress
      trophyState.opacity = trophyProgress

      // Обновляем opacity для React компонента
      setTrophyOpacity(trophyState.opacity)

      // Рисование всех уровней (от нижнего к верхнему)
      levels.forEach((level, index) => {
        if (levelStates[index].opacity > 0) {
          drawLevel(level, index, levelStates[index])
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
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.5 }}
      />

      {/* Иконка награды поверх башни */}
      <div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300"
        style={{
          opacity: trophyOpacity * 0.8,
          transform: `translate(-50%, ${(1 - trophyOpacity) * 30}px)`
        }}
      >
        <Award className="w-10 h-10 text-accent-blue" strokeWidth={1.5} />
      </div>
    </>
  )
}

export default TowerBuilding
