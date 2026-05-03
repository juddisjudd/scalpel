import { describe, it, expect } from 'vitest'
import { placePreview } from './App'

const SCREEN = { width: 1920, height: 1080 }
const PAD = 8

describe('placePreview', () => {
  it('places to the right when there is plenty of room', () => {
    const r = placePreview({ x: 100, y: 100, width: 80, height: 60 }, SCREEN, PAD)
    expect(r.x).toBe(188) // 100 + 80 + 8
    expect(r.y).toBe(8)
    expect(r.maxWidth).toBe(1724) // 1920 - (100+80) - 16
    expect(r.maxHeight).toBe(1064) // 1080 - 16
  })

  it('falls back to left when right has no room', () => {
    // Anchor far right - rightSpace = 1920 - (1700+80) - 16 = 124, not > 200
    // leftSpace = 1700 - 16 = 1684, > 200
    const r = placePreview({ x: 1700, y: 100, width: 80, height: 60 }, SCREEN, PAD)
    expect(r.x).toBe(8)
    expect(r.maxWidth).toBe(1684) // 1700 - 16
    expect(r.maxHeight).toBe(1064)
  })

  it('falls back to below when left and right both squeezed', () => {
    // Screen width 400 - anchor x:200, width:80
    // rightSpace = 400 - 280 - 16 = 104, not > 200
    // leftSpace = 200 - 16 = 184, not > 200
    // belowSpace = 1080 - (100+60) - 16 = 904, > 200
    const r = placePreview({ x: 200, y: 100, width: 80, height: 60 }, { width: 400, height: 1080 }, PAD)
    expect(r.x).toBe(8)
    expect(r.y).toBe(168) // 100 + 60 + 8
    expect(r.maxWidth).toBe(384) // 400 - 16
    expect(r.maxHeight).toBe(904) // 1080 - (100+60) - 16
  })

  it('falls back to above when no other side fits', () => {
    // Screen width 400 - anchor x:200, width:80
    // rightSpace = 400 - 280 - 16 = 104, not > 200
    // leftSpace = 200 - 16 = 184, not > 200
    // belowSpace = 1000 - (800+60) - 16 = 124, not > 200
    // Falls to above: x:8, y:8, maxWidth:384, maxHeight: 800-16 = 784
    const r = placePreview({ x: 200, y: 800, width: 80, height: 60 }, { width: 400, height: 1000 }, PAD)
    expect(r.x).toBe(8)
    expect(r.y).toBe(8)
    expect(r.maxWidth).toBe(384)
    expect(r.maxHeight).toBe(784) // anchor.y - pad*2 = 800 - 16
  })
})
