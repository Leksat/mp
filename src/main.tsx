import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { seedProgressFromUrl } from './devSeed'
import { holdPortrait } from './orientation'
import { trackViewport } from './viewport'

seedProgressFromUrl()
holdPortrait()
trackViewport()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
