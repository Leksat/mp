import 'react'

declare module 'react' {
  interface CSSProperties {
    '--columns'?: number
    '--streak-progress'?: number
  }
}
