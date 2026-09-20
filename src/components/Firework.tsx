import { useEffect, useState } from 'react'
import { EMOJIS } from '../domain/emojis'

const SPARKS = 12
const DURATION_MS = 1800

const pickEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]

const makeSparks = () =>
  Array.from({ length: SPARKS }, (_, index) => {
    const angle = (index / SPARKS) * Math.PI * 2 + Math.random() * 0.25
    const distance = 34 + Math.random() * 26
    return {
      x: `${Math.cos(angle) * distance}vmin`,
      y: `${Math.sin(angle) * distance}vmin`,
      delay: `${Math.random() * 0.12}s`,
      spin: `${Math.random() * 540 - 270}deg`,
      scale: `${0.85 + Math.random() * 0.7}`,
    }
  })

export const Firework = ({ onDone }: { onDone(): void }) => {
  const [emoji] = useState(pickEmoji)
  const [sparks] = useState(makeSparks)

  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="firework" aria-hidden="true">
      {sparks.map((spark, index) => (
        <span
          key={index}
          className="spark"
          style={
            {
              '--x': spark.x,
              '--y': spark.y,
              '--delay': spark.delay,
              '--spin': spark.spin,
              '--scale': spark.scale,
            } as React.CSSProperties
          }
        >
          {emoji}
        </span>
      ))}
    </div>
  )
}
