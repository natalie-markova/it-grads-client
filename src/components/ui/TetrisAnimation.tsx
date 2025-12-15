import { useEffect, useRef } from 'react'

interface TetrisAnimationProps {
  isActive: boolean
}

const TetrisAnimation = ({ isActive }: TetrisAnimationProps) => {
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

    const blockSize = 24
    const cols = Math.floor(canvas.width / blockSize)
    const rows = Math.floor(canvas.height / blockSize)

    const tetrominoes = [
      { shape: [[1, 1, 1, 1]], color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
      { shape: [[1, 1], [1, 1]], color: '#60a5fa', gradient: ['#60a5fa', '#3b82f6'] },
      { shape: [[0, 1, 0], [1, 1, 1]], color: '#93c5fd', gradient: ['#93c5fd', '#60a5fa'] },
      { shape: [[1, 0, 0], [1, 1, 1]], color: '#2563eb', gradient: ['#2563eb', '#1d4ed8'] },
      { shape: [[0, 0, 1], [1, 1, 1]], color: '#1e40af', gradient: ['#1e40af', '#1e3a8a'] },
      { shape: [[0, 1, 1], [1, 1, 0]], color: '#60a5fa', gradient: ['#60a5fa', '#3b82f6'] },
      { shape: [[1, 1, 0], [0, 1, 1]], color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] }
    ]

    interface FallingPiece {
      shape: number[][]
      color: string
      gradient: string[]
      x: number
      y: number
      speed: number
      rotation: number
    }

    const fallingPieces: FallingPiece[] = []

    const grid: { filled: boolean; color: string; gradient: string[] }[][] = []
    for (let i = 0; i < rows; i++) {
      grid[i] = []
      for (let j = 0; j < cols; j++) {
        grid[i][j] = { filled: false, color: '', gradient: [] }
      }
    }

    const createPiece = () => {
      const tetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)]
      return {
        shape: tetromino.shape,
        color: tetromino.color,
        gradient: tetromino.gradient,
        x: Math.floor(Math.random() * (cols - tetromino.shape[0].length)),
        y: -tetromino.shape.length,
        speed: 0.3 + Math.random() * 0.3,
        rotation: 0,
      }
    }

    const checkCollision = (piece: FallingPiece, offsetY = 0) => {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const newY = Math.floor(piece.y) + row + offsetY
            const newX = piece.x + col

            if (newY >= rows || (newY >= 0 && grid[newY][newX].filled)) {
              return true
            }
          }
        }
      }
      return false
    }

    const placePiece = (piece: FallingPiece) => {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const gridY = Math.floor(piece.y) + row
            const gridX = piece.x + col
            if (gridY >= 0 && gridY < rows && gridX >= 0 && gridX < cols) {
              grid[gridY][gridX] = { filled: true, color: piece.color, gradient: piece.gradient }
            }
          }
        }
      }
    }

    const clearLines = () => {
      for (let row = rows - 1; row >= 0; row--) {
        let isFull = true
        for (let col = 0; col < cols; col++) {
          if (!grid[row][col].filled) {
            isFull = false
            break
          }
        }

        if (isFull) {
          for (let r = row; r > 0; r--) {
            for (let c = 0; c < cols; c++) {
              grid[r][c] = grid[r - 1][c]
            }
          }
          for (let c = 0; c < cols; c++) {
            grid[0][c] = { filled: false, color: '', gradient: [] }
          }
          row++
        }
      }
    }

    const drawBlock = (x: number, y: number, color: string, gradientColors?: string[]) => {
      const px = x * blockSize
      const py = y * blockSize
      const size = blockSize - 2

      if (gradientColors && gradientColors.length === 2) {
        const gradient = ctx.createLinearGradient(px, py, px + size, py + size)
        gradient.addColorStop(0, gradientColors[0])
        gradient.addColorStop(1, gradientColors[1])
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = color
      }

      ctx.beginPath()
      const radius = 3
      ctx.moveTo(px + radius, py)
      ctx.lineTo(px + size - radius, py)
      ctx.arcTo(px + size, py, px + size, py + radius, radius)
      ctx.lineTo(px + size, py + size - radius)
      ctx.arcTo(px + size, py + size, px + size - radius, py + size, radius)
      ctx.lineTo(px + radius, py + size)
      ctx.arcTo(px, py + size, px, py + size - radius, radius)
      ctx.lineTo(px, py + radius)
      ctx.arcTo(px, py, px + radius, py, radius)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.fillRect(px + 2, py + 2, size - 4, 3)

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(px + 2, py + size - 4, size - 4, 2)

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    let animationId: number
    let lastSpawnTime = 0
    const spawnInterval = 2000

    const draw = (currentTime: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActive) {
        return
      }

      if (currentTime - lastSpawnTime > spawnInterval && fallingPieces.length < 3) {
        fallingPieces.push(createPiece())
        lastSpawnTime = currentTime
      }

      for (let i = fallingPieces.length - 1; i >= 0; i--) {
        const piece = fallingPieces[i]
        piece.y += piece.speed * 0.1

        if (checkCollision(piece, 1)) {
          placePiece(piece)
          fallingPieces.splice(i, 1)
          clearLines()
        }
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (grid[row][col].filled) {
            drawBlock(col, row, grid[row][col].color, grid[row][col].gradient)
          }
        }
      }

      fallingPieces.forEach((piece) => {
        for (let row = 0; row < piece.shape.length; row++) {
          for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
              const drawY = piece.y + row
              if (drawY >= 0) {
                drawBlock(piece.x + col, drawY, piece.color, piece.gradient)
              }
            }
          }
        }
      })

      animationId = requestAnimationFrame(draw)
    }

    draw(0)

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

export default TetrisAnimation
