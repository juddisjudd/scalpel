import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { App } from './App'
import '../styles.css'
import { bootstrapTheme } from '../shared/apply-theme'

void bootstrapTheme()

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
