import { useEffect, useRef } from 'react'

interface SkillsRadarProps {
  isActive: boolean
}

const SkillsRadar = ({ isActive }: SkillsRadarProps) => {
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

    // Навыки для радара (6 осей)
    const skills = [
      { name: 'Frontend', value: 0.85, targetValue: 0.85 },
      { name: 'Backend', value: 0.7, targetValue: 0.7 },
      { name: 'Database', value: 0.65, targetValue: 0.65 },
      { name: 'DevOps', value: 0.75, targetValue: 0.75 },
      { name: 'Testing', value: 0.8, targetValue: 0.8 },
      { name: 'Algorithms', value: 0.6, targetValue: 0.6 },
    ]

    let animationId: number
    let animationProgress = 0
    let skillProgress = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        // Плавное затухание
        animationProgress = Math.max(0, animationProgress - 0.02)
        skillProgress = Math.max(0, skillProgress - 0.03)
        if (animationProgress <= 0) {
          // Сброс
          skillProgress = 0
          return
        }
      } else {
        // Плавное нарастание
        animationProgress = Math.min(1, animationProgress + 0.015)

        // Прогресс заполнения навыков (начинается после появления сетки)
        if (animationProgress > 0.3) {
          skillProgress = Math.min(1, skillProgress + 0.012)
        }
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35
      const numSkills = skills.length
      const angleStep = (Math.PI * 2) / numSkills

      // Рисуем концентрические круги (уровни навыков)
      ctx.save()
      ctx.globalAlpha = animationProgress

      const levels = 5
      for (let level = 1; level <= levels; level++) {
        const radius = (maxRadius / levels) * level

        ctx.beginPath()
        for (let i = 0; i <= numSkills; i++) {
          const angle = i * angleStep - Math.PI / 2
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()

        // Разная прозрачность для разных уровней
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 + level * 0.05})`
        ctx.lineWidth = level === levels ? 2 : 1
        ctx.stroke()
      }

      // Рисуем оси (линии от центра к краям)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)'
      ctx.lineWidth = 1

      for (let i = 0; i < numSkills; i++) {
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + Math.cos(angle) * maxRadius
        const y = centerY + Math.sin(angle) * maxRadius

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(x, y)
        ctx.stroke()
      }

      // Центральная точка
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      // Рисуем заполненную область навыков
      if (skillProgress > 0) {
        ctx.save()
        ctx.globalAlpha = animationProgress * 0.3

        ctx.beginPath()
        for (let i = 0; i <= numSkills; i++) {
          const index = i % numSkills
          const skill = skills[index]
          const angle = index * angleStep - Math.PI / 2
          const currentValue = skill.targetValue * skillProgress
          const radius = maxRadius * currentValue

          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()

        // Градиентная заливка
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.6)')
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.2)')
        ctx.fillStyle = gradient
        ctx.fill()

        // Обводка области
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.restore()

        // Рисуем точки на вершинах
        ctx.save()
        ctx.globalAlpha = animationProgress

        for (let i = 0; i < numSkills; i++) {
          const skill = skills[i]
          const angle = i * angleStep - Math.PI / 2
          const currentValue = skill.targetValue * skillProgress
          const radius = maxRadius * currentValue

          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          // Свечение вокруг точки
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 10)
          glowGradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)')
          glowGradient.addColorStop(1, 'rgba(6, 182, 212, 0)')

          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(x, y, 10, 0, Math.PI * 2)
          ctx.fill()

          // Основная точка
          ctx.fillStyle = 'rgba(6, 182, 212, 1)'
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()

          // Белая обводка
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        ctx.restore()
      }

      // Рисуем подписи навыков
      ctx.save()
      ctx.globalAlpha = animationProgress
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let i = 0; i < numSkills; i++) {
        const skill = skills[i]
        const angle = i * angleStep - Math.PI / 2
        const labelRadius = maxRadius + 25

        let x = centerX + Math.cos(angle) * labelRadius
        const y = centerY + Math.sin(angle) * labelRadius

        // Корректировка положения текста для лучшей читаемости
        if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle) > (3 * Math.PI) / 4) {
          // Левая и правая стороны
          ctx.textAlign = angle > -Math.PI / 2 && angle < Math.PI / 2 ? 'left' : 'right'
          x += angle > -Math.PI / 2 && angle < Math.PI / 2 ? 5 : -5
        } else {
          // Верх и низ
          ctx.textAlign = 'center'
        }

        ctx.fillText(skill.name, x, y)

        // Процент (показывается только когда есть прогресс)
        if (skillProgress > 0) {
          const percentage = Math.round(skill.targetValue * skillProgress * 100)
          ctx.font = '10px sans-serif'
          ctx.fillStyle = 'rgba(6, 182, 212, 0.7)'
          ctx.fillText(`${percentage}%`, x, y + 14)
          ctx.font = '12px sans-serif'
          ctx.fillStyle = 'rgba(6, 182, 212, 0.9)'
        }
      }

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
      style={{ opacity: 0.6 }}
    />
  )
}

export default SkillsRadar
