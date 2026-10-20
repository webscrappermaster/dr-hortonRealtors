#!/usr/bin/env node
/**
 * optimize-images.js
 *
 * Convierte imágenes a .webp con sharp. Reutilizable para futuros módulos.
 *
 * Uso:
 *   node scripts/optimize-images.js <entrada> <salida> [--width=N] [--quality=N]
 *
 * - <entrada>  ruta a un archivo o a una carpeta (recorre .jpg/.jpeg/.png)
 * - <salida>   ruta al .webp destino (si entrada es archivo) o carpeta destino (si entrada es carpeta)
 * - --width    ancho máximo en px (opcional); mantiene aspect ratio
 * - --quality  calidad webp 1-100 (default 82)
 */

import sharp from 'sharp'
import { readdir, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png'])

const args = process.argv.slice(2)
const positional = args.filter(a => !a.startsWith('--'))
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => a.replace(/^--/, '').split('=')),
)

const [input, output] = positional
if (!input || !output) {
  console.error('Uso: node scripts/optimize-images.js <entrada> <salida> [--width=N] [--quality=N]')
  process.exit(1)
}

const width = flags.width ? Number(flags.width) : null
const quality = flags.quality ? Number(flags.quality) : 82

async function convert(src, dest) {
  const dir = path.dirname(dest)
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  const pipeline = sharp(src)
  if (width) pipeline.resize({ width, withoutEnlargement: true })
  await pipeline.webp({ quality }).toFile(dest)
  console.log(`  ✓ ${src}  →  ${dest}`)
}

async function run() {
  const stats = await stat(input)
  if (stats.isDirectory()) {
    const entries = await readdir(input)
    const targets = entries.filter(f => SUPPORTED.has(path.extname(f).toLowerCase()))
    if (!targets.length) {
      console.log('No se encontraron imágenes .jpg/.jpeg/.png en', input)
      return
    }
    for (const file of targets) {
      const src = path.join(input, file)
      const base = path.basename(file, path.extname(file))
      const dest = path.join(output, `${base}.webp`)
      await convert(src, dest)
    }
  } else {
    await convert(input, output)
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
