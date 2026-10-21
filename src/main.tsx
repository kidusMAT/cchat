import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './context/ToastContext'
import { ShareProvider } from './context/ShareContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ShareProvider>
        <App />
      </ShareProvider>
    </ToastProvider>
  </StrictMode>,
)


