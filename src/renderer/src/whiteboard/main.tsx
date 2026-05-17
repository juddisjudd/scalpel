import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Whiteboard } from './index'
import '../styles.css'
import { bootstrapTheme } from '../shared/apply-theme'

void bootstrapTheme()

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <Whiteboard />
  </StrictMode>,
)
