import { app } from 'electron'
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'

function rootDir(): string {
  return join(app.getPath('userData'), 'cheat-sheets')
}

export function categoryDir(categoryId: string): string {
  return join(rootDir(), categoryId)
}

export function sheetFilePath(categoryId: string, sheetId: string, ext: string): string {
  return join(categoryDir(categoryId), `${sheetId}.${ext}`)
}

export function generateSheetId(): string {
  return randomBytes(6).toString('hex')
}

export function generateCategoryId(): string {
  return `cat-${randomBytes(4).toString('hex')}`
}

export function saveSheetBuffer(categoryId: string, sheetId: string, ext: string, data: Buffer): string {
  const dir = categoryDir(categoryId)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const path = sheetFilePath(categoryId, sheetId, ext)
  writeFileSync(path, data)
  return path
}

export function removeSheetFile(categoryId: string, sheetId: string, ext: string): void {
  const path = sheetFilePath(categoryId, sheetId, ext)
  if (existsSync(path)) unlinkSync(path)
}

export function removeCategoryDir(categoryId: string): void {
  const dir = categoryDir(categoryId)
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
}

const ALLOWED_EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function fetchImageBuffer(url: string): Promise<{ buffer: Buffer; ext: string }> {
  if (url.startsWith('data:')) {
    const m = url.match(/^data:([^;]+);base64,(.+)$/)
    if (!m) throw new Error('Invalid data URL')
    const mime = m[1].toLowerCase()
    const ext = ALLOWED_EXT_BY_MIME[mime]
    if (!ext) throw new Error(`URL is not an image (mime: ${mime})`)
    const buffer = Buffer.from(m[2], 'base64')
    if (buffer.byteLength > MAX_IMAGE_BYTES) throw new Error('Image exceeds 10MB')
    return { buffer, ext }
  }
  const res = await fetch(url, { headers: { 'User-Agent': 'Scalpel-CheatSheet' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const mime = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  const ext = ALLOWED_EXT_BY_MIME[mime]
  if (!ext) throw new Error(`URL is not an image (mime: ${mime || 'unknown'})`)
  const arr = await res.arrayBuffer()
  if (arr.byteLength > MAX_IMAGE_BYTES) throw new Error('Image exceeds 10MB')
  return { buffer: Buffer.from(arr), ext }
}
