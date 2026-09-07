import './setupPublicAssets'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/global.css'
import './styles/hunt.css'
import { publicUrl } from './lib/publicUrl'
import App from './App'

const rootEl = document.getElementById('root')
document.documentElement.style.setProperty('--hunt-world-image', `url("${publicUrl('assets/game-scene-bg.png')}")`)
if (!rootEl) {
  throw new Error('Element #root fehlt in index.html')
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
