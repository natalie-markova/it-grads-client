import { useEffect, useRef, useState } from 'react'

interface SkillsRadarProps {
  isActive: boolean
}

const SkillsRadar = ({ isActive }: SkillsRadarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [animationKey, setAnimationKey] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Отслеживание видимости компонента при скролле
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          setAnimationKey(prev => prev + 1)
        }
      },
      {
        threshold: 0.3, // Запускаем анимацию когда видно 30% элемента
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [isVisible])

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

    // 12 навыков по кругу
    const skills = [
      { name: 'DEV', value: 0.85 },
      { name: 'DB', value: 0.7 },
      { name: 'CLOUD', value: 0.65 },
      { name: 'OPS', value: 0.75 },
      { name: 'QA', value: 0.8 },
      { name: 'NET', value: 0.6 },
      { name: 'SEC', value: 0.7 },
      { name: 'AI', value: 0.55 },
      { name: 'DATA', value: 0.75 },
      { name: 'PM', value: 0.65 },
      { name: 'UX', value: 0.8 },
      { name: 'MOB', value: 0.9 },
    ]

    let animationId: number
    let animationProgress = 0
    let segmentProgress = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Всегда показываем анимацию (убираем проверку isActive для затухания)
      // Плавное нарастание
      animationProgress = Math.min(1, animationProgress + 0.008)

      // Прогресс появления сегментов (начинается после появления сетки)
      if (animationProgress > 0.3) {
        segmentProgress = Math.min(1, segmentProgress + 0.006)
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.45
      const numSkills = skills.length
      const angleStep = (Math.PI * 2) / numSkills

      // Темный фон круга
      ctx.save()
      ctx.globalAlpha = animationProgress * 0.8
      ctx.fillStyle = 'rgba(20, 25, 35, 0.9)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Рисуем концентрические круги
      ctx.save()
      ctx.globalAlpha = animationProgress * 0.4

      const levels = 4
      for (let level = 1; level <= levels; level++) {
        const radius = (maxRadius / levels) * level

        ctx.strokeStyle = 'rgba(100, 120, 140, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()

      // Рисуем радиальные линии (оси)
      ctx.save()
      ctx.globalAlpha = animationProgress * 0.3
      ctx.strokeStyle = 'rgba(100, 120, 140, 0.3)'
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

      ctx.restore()

      // Рисуем 3D сегменты (лепестки)
      if (segmentProgress > 0) {
        ctx.save()

        for (let i = 0; i < numSkills; i++) {
          const skill = skills[i]
          const angle = i * angleStep - Math.PI / 2
          const nextAngle = ((i + 1) % numSkills) * angleStep - Math.PI / 2

          // Высота сегмента зависит от значения навыка и прогресса анимации
          const segmentHeight = skill.value * segmentProgress
          const innerRadius = maxRadius * 0.3
          const outerRadius = maxRadius * 0.85

          // Создаем градиент от бирюзового к зеленому
          const gradient = ctx.createLinearGradient(
            centerX + Math.cos(angle) * innerRadius,
            centerY + Math.sin(angle) * innerRadius,
            centerX + Math.cos(angle) * outerRadius,
            centerY + Math.sin(angle) * outerRadius
          )

          // Градиент зависит от высоты сегмента
          const hue1 = 180 + segmentHeight * 20 // От бирюзового
          const hue2 = 160 + segmentHeight * 30 // К зеленому
          gradient.addColorStop(0, `hsla(${hue1}, 70%, 50%, ${0.6 * animationProgress})`)
          gradient.addColorStop(1, `hsla(${hue2}, 60%, 45%, ${0.8 * animationProgress})`)

          // Основной сегмент (верхняя часть)
          ctx.globalAlpha = animationProgress
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(centerX, centerY, innerRadius, angle, nextAngle)
          ctx.arc(
            centerX,
            centerY,
            innerRadius + (outerRadius - innerRadius) * segmentHeight,
            nextAngle,
            angle,
            true
          )
          ctx.closePath()
          ctx.fill()

          // Обводка сегмента для 3D эффекта
          ctx.strokeStyle = `hsla(${hue1}, 70%, 60%, ${0.6 * animationProgress})`
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Темная тень для глубины
          ctx.globalAlpha = animationProgress * 0.3
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.beginPath()
          ctx.arc(centerX, centerY, innerRadius, angle, nextAngle)
          ctx.arc(
            centerX,
            centerY,
            innerRadius + (outerRadius - innerRadius) * segmentHeight * 0.95,
            nextAngle,
            angle,
            true
          )
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      }

      // Центральный круг с числом
      ctx.save()
      ctx.globalAlpha = animationProgress

      // Темный внутренний круг
      ctx.fillStyle = 'rgba(30, 35, 45, 0.95)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, maxRadius * 0.25, 0, Math.PI * 2)
      ctx.fill()

      // Обводка центрального круга
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Вычисляем среднее значение навыков
      if (segmentProgress > 0) {
        const avgValue =
          skills.reduce((sum, skill) => sum + skill.value, 0) / skills.length
        const displayValue = (avgValue * segmentProgress * 5).toFixed(1)

        ctx.fillStyle = 'rgba(6, 182, 212, 1)'
        ctx.font = 'bold 32px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(displayValue, centerX, centerY)
      }

      ctx.restore()

      // Рисуем подписи навыков
      ctx.save()
      ctx.globalAlpha = animationProgress
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let i = 0; i < numSkills; i++) {
        const skill = skills[i]
        const angle = i * angleStep - Math.PI / 2
        const labelRadius = maxRadius + 30

        const x = centerX + Math.cos(angle) * labelRadius
        const y = centerY + Math.sin(angle) * labelRadius

        ctx.fillText(skill.name, x, y)
      }

      ctx.restore()

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [animationKey])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.9 }}
      />
    </div>
  )
}

export default SkillsRadar
