import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/global.css'
import App from './App'

const rootEl = document.getElementById('root')
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
