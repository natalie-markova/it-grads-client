import { useEffect } from 'react'

export const useScrollAnimation = () => {
  useEffect(() => {
    // Intersection Observer для отслеживания видимости элементов
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      {
        threshold: 0.01,
        rootMargin: '0px',
      }
    )

    // Множество для отслеживания уже наблюдаемых элементов
    const observedElements = new Set<Element>()

    // Функция для проверки и добавления элементов к наблюдению
    const observeElements = () => {
      const items = document.querySelectorAll('.scroll-animate-item, .scroll-fade-left, .scroll-fade-right, .scroll-scale')

      items.forEach((item) => {
        // Пропускаем уже наблюдаемые элементы
        if (observedElements.has(item)) {
          return
        }

        // Проверяем начальную видимость
        const rect = item.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100

        if (isVisible && !item.classList.contains('visible')) {
          item.classList.add('visible')
        }

        // Добавляем к наблюдению
        intersectionObserver.observe(item)
        observedElements.add(item)
      })
    }

    // Mutation Observer для отслеживания динамически добавляемых элементов
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Проверяем добавленные ноды
        mutation.addedNodes.forEach((node) => {
          // Проверяем, является ли нода элементом
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element

            // Проверяем, имеет ли элемент нужный класс
            if (element.classList.contains('scroll-animate-item') ||
                element.classList.contains('scroll-fade-left') ||
                element.classList.contains('scroll-fade-right') ||
                element.classList.contains('scroll-scale')) {

              // Немедленно проверяем видимость и добавляем к наблюдению
              const rect = element.getBoundingClientRect()
              const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100

              if (isVisible && !element.classList.contains('visible')) {
                element.classList.add('visible')
              }

              intersectionObserver.observe(element)
              observedElements.add(element)
            }

            // Проверяем дочерние элементы
            const children = element.querySelectorAll('.scroll-animate-item, .scroll-fade-left, .scroll-fade-right, .scroll-scale')
            children.forEach((child) => {
              if (!observedElements.has(child)) {
                const rect = child.getBoundingClientRect()
                const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100

                if (isVisible && !child.classList.contains('visible')) {
                  child.classList.add('visible')
                }

                intersectionObserver.observe(child)
                observedElements.add(child)
              }
            })
          }
        })
      })
    })

    // Начинаем наблюдение за изменениями в DOM
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Первоначальная проверка элементов
    observeElements()

    // Дополнительные проверки с задержкой (на случай медленной загрузки)
    setTimeout(observeElements, 100)
    setTimeout(observeElements, 500)

    // Cleanup при размонтировании
    return () => {
      mutationObserver.disconnect()
      observedElements.forEach((item) => intersectionObserver.unobserve(item))
      observedElements.clear()
    }
  }, [])
}






























