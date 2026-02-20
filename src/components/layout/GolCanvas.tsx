'use client'
import { useEffect, useRef } from 'react'

export default function GolCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const CELL = 14
    let cols: number, rows: number
    let grid: Uint8Array, next: Uint8Array
    let animId: number
    let tick = 0

    function resize() {
      canvas!.width  = window.innerWidth
      canvas!.height = window.innerHeight
      cols = Math.floor(canvas!.width  / CELL)
      rows = Math.floor(canvas!.height / CELL)
      grid = new Uint8Array(cols * rows)
      next = new Uint8Array(cols * rows)
      for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.18 ? 1 : 0
    }

    function idx(x: number, y: number) {
      return ((y + rows) % rows) * cols + ((x + cols) % cols)
    }

    function step() {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let n = 0
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            n += grid[idx(x+dx, y+dy)]
          }
          const alive = grid[idx(x, y)]
          next[idx(x, y)] = (alive && (n === 2 || n === 3)) || (!alive && n === 3) ? 1 : 0
        }
      }
      ;[grid, next] = [next, grid]
    }

    function draw() {
      ctx.fillStyle = '#060505'
      ctx.fillRect(0, 0, canvas!.width, canvas!.height)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[idx(x, y)]) {
            ctx.fillStyle = 'rgba(201,147,58,0.45)'
            ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
          }
        }
      }
    }

    function loop() {
      draw()
      if (++tick % 6 === 0) step()
      animId = requestAnimationFrame(loop)
    }

    window.addEventListener('resize', resize)
    resize()
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 1 }}
    />
  )
}
