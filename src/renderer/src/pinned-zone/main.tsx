import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PoeVersionRoot } from '../shared/PoeVersionRoot'
import { App } from './App'
import '../styles.css'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <PoeVersionRoot>
      <App />
    </PoeVersionRoot>
  </StrictMode>,
)
