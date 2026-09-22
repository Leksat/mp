import { useEffect, useState } from 'react'
import { EMOJIS } from '../domain/emojis'

const SPARKS = 12
const DURATION_MS = 1800
const BURST_GAP_MS = 420

const pickEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]

const makeSparks = (startSeconds: number) =>
  Array.from({ length: SPARKS }, (_, index) => {
    const angle = (index / SPARKS) * Math.PI * 2 + Math.random() * 0.25
    const distance = 34 + Math.random() * 26
    return {
      x: `${Math.cos(angle) * distance}vmin`,
      y: `${Math.sin(angle) * distance}vmin`,
      delay: `${startSeconds + Math.random() * 0.12}s`,
      spin: `${Math.random() * 540 - 270}deg`,
      scale: `${0.85 + Math.random() * 0.7}`,
    }
  })

const makeBursts = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    emoji: pickEmoji(),
    sparks: makeSparks((index * BURST_GAP_MS) / 1000),
  }))

interface FireworkProps {
  readonly bursts: number
  onDone(): void
}

export const Firework = ({ bursts, onDone }: FireworkProps) => {
  const [flashes] = useState(() => makeBursts(bursts))

  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS + (bursts - 1) * BURST_GAP_MS)
    return () => clearTimeout(timer)
  }, [bursts, onDone])

  return (
    <div className="firework" aria-hidden="true">
      {flashes.flatMap((flash, burst) =>
        flash.sparks.map((spark, index) => (
          <span
            key={`${burst}-${index}`}
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
            {flash.emoji}
          </span>
        )),
      )}
    </div>
  )
}
