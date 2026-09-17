import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const BACKGROUND = [67, 56, 202]
const FOREGROUND = [255, 255, 255]
const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }
  return value >>> 0
})

const crc32 = (buffer) => {
  let value = 0xffffffff
  for (const byte of buffer) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8)
  return (value ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const payload = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(payload))
  return Buffer.concat([length, payload, checksum])
}

const encodePng = (size, colorAt) => {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 2

  const scanlines = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 3 + 1)
    scanlines[rowStart] = 0
    for (let x = 0; x < size; x += 1) {
      const [red, green, blue] = colorAt(x, y)
      const offset = rowStart + 1 + x * 3
      scanlines[offset] = red
      scanlines[offset + 1] = green
      scanlines[offset + 2] = blue
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(scanlines, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const distanceToSegment = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

const crossIcon = (size, extentRatio, strokeRatio) => {
  const center = size / 2
  const extent = size * extentRatio
  const halfStroke = (size * strokeRatio) / 2
  const segments = [
    [center - extent, center - extent, center + extent, center + extent],
    [center - extent, center + extent, center + extent, center - extent],
  ]

  return (x, y) => {
    const px = x + 0.5
    const py = y + 0.5
    const distance = Math.min(...segments.map((segment) => distanceToSegment(px, py, ...segment)))
    const coverage = Math.max(0, Math.min(1, halfStroke + 0.5 - distance))
    return BACKGROUND.map((channel, index) =>
      Math.round(channel + (FOREGROUND[index] - channel) * coverage),
    )
  }
}

const icons = [
  { name: 'icon-192.png', size: 192, extent: 0.26, stroke: 0.11 },
  { name: 'icon-512.png', size: 512, extent: 0.26, stroke: 0.11 },
  { name: 'icon-maskable-512.png', size: 512, extent: 0.19, stroke: 0.08 },
  { name: 'apple-touch-icon-180.png', size: 180, extent: 0.26, stroke: 0.11 },
]

mkdirSync(PUBLIC_DIR, { recursive: true })

for (const { name, size, extent, stroke } of icons) {
  writeFileSync(join(PUBLIC_DIR, name), encodePng(size, crossIcon(size, extent, stroke)))
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="rgb(${BACKGROUND.join(',')})"/>
  <path d="M21 21 L43 43 M43 21 L21 43" stroke="rgb(${FOREGROUND.join(',')})" stroke-width="7" stroke-linecap="round"/>
</svg>
`

writeFileSync(join(PUBLIC_DIR, 'favicon.svg'), favicon)
