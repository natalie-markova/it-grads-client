import { useEffect } from 'react'

export const useScrollAnimation = () => {
  useEffect(() => {
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

    const observedElements = new Set<Element>()

    const observeElements = () => {
      const items = document.querySelectorAll('.scroll-animate-item, .scroll-fade-left, .scroll-fade-right, .scroll-scale')

      items.forEach((item) => {
        if (observedElements.has(item)) {
          return
        }

        const rect = item.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100

        if (isVisible && !item.classList.contains('visible')) {
          item.classList.add('visible')
        }

        intersectionObserver.observe(item)
        observedElements.add(item)
      })
    }

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element

            if (element.classList.contains('scroll-animate-item') ||
                element.classList.contains('scroll-fade-left') ||
                element.classList.contains('scroll-fade-right') ||
                element.classList.contains('scroll-scale')) {

              const rect = element.getBoundingClientRect()
              const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100

              if (isVisible && !element.classList.contains('visible')) {
                element.classList.add('visible')
              }

              intersectionObserver.observe(element)
              observedElements.add(element)
            }

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

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })

    observeElements()

    setTimeout(observeElements, 100)
    setTimeout(observeElements, 500)

    return () => {
      mutationObserver.disconnect()
      observedElements.forEach((item) => intersectionObserver.unobserve(item))
      observedElements.clear()
    }
  }, [])
}


































