import { useEffect, useState } from 'react'

const PIECES = 90
const DURATION_MS = 4000
const COLORS = ['#f59e0b', '#22c55e', '#6366f1', '#ec4899', '#38bdf8']

const makePieces = () =>
  Array.from({ length: PIECES }, (_, index) => ({
    x: `${Math.random() * 100}vw`,
    delay: `${Math.random() * 1.2}s`,
    spin: `${Math.random() * 720 - 360}deg`,
    color: COLORS[index % COLORS.length],
  }))

export const Confetti = ({ onDone }: { onDone(): void }) => {
  const [pieces] = useState(makePieces)

  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="piece"
          style={
            {
              '--x': piece.x,
              '--delay': piece.delay,
              '--spin': piece.spin,
              '--color': piece.color,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
