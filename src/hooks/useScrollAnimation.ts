import { useEffect } from 'react'

export const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
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

    // Check for elements that are already visible on load
    const checkInitialVisibility = () => {
      const items = document.querySelectorAll('.scroll-animate-item, .scroll-fade-left, .scroll-fade-right, .scroll-scale')
      items.forEach((item) => {
        const rect = item.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100
        if (isVisible && !item.classList.contains('visible')) {
          item.classList.add('visible')
        }
        observer.observe(item)
      })
    }

    // Check immediately and after a short delay to catch elements that load later
    checkInitialVisibility()
    setTimeout(checkInitialVisibility, 100)
    setTimeout(checkInitialVisibility, 500)

    return () => {
      const items = document.querySelectorAll('.scroll-animate-item, .scroll-fade-left, .scroll-fade-right, .scroll-scale')
      items.forEach((item) => observer.unobserve(item))
    }
  }, [])
}





















