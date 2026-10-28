#!/usr/bin/env node
/**
 * Diagnóstico de acceso a Vercel Edge Config / Global Config.
 * Pide el token por entrada interactiva sin eco — nunca lo guarda ni lo imprime.
 *
 * Lee VERCEL_TEAM_ID y GLOBAL_CONFIG_ID desde .env (si existe) o process.env.
 * Requiere Node ≥ 18 (fetch nativo).
 */

import { readFileSync, existsSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// ── Carga .env sin depender de dotenv ──────────────────────────────────────
function loadEnv() {
  const p = join(ROOT, '.env')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 0) continue
    const key = t.slice(0, eq).trim()
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = val
  }
}

// ── Entrada sin eco (funciona en Windows TTY y Unix) ──────────────────────
async function readSecret(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })

    // _writeToOutput se llama primero con el texto del prompt, luego con cada
    // carácter tecleado. Mostramos solo la primera llamada (el prompt).
    let shown = false
    rl._writeToOutput = (s) => {
      if (!shown) { process.stdout.write(s); shown = true }
    }

    rl.question(prompt, (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}

// ── Sonda HTTP: muestra solo código + mensaje de error ────────────────────
async function probe(label, url, token, opts = {}) {
  const sep = url.includes('?') ? '&' : '?'
  const displayUrl = url.replace(/Bearer\s+\S+/, 'Bearer …')

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...opts.headers,
      },
      ...opts,
    })

    const ct = res.headers.get('content-type') ?? ''
    let info = ''

    if (ct.includes('json')) {
      const json = await res.json().catch(() => null)
      if (res.ok) {
        if (Array.isArray(json)) {
          info = json.length
            ? json.map(i => `${i.id ?? '?'} / ${i.slug ?? i.name ?? '?'}`).join('  |  ')
            : '(lista vacía)'
        } else if (json?.id) {
          info = `id=${json.id}  slug=${json.slug ?? json.name ?? '?'}`
        } else {
          info = 'OK'
        }
      } else {
        info =
          json?.error?.message ??
          json?.error?.code ??
          JSON.stringify(json ?? {}).slice(0, 140)
      }
    } else {
      info = res.ok ? 'OK' : (await res.text().catch(() => ''))?.slice(0, 140)
    }

    const color = res.ok ? '\x1b[32m' : '\x1b[31m'
    console.log(`  ${color}${res.status}\x1b[0m  ${label}`)
    if (info && info !== 'OK') console.log(`       ↳ ${info}`)
  } catch (err) {
    console.log(`  \x1b[33mERR\x1b[0m  ${label}`)
    console.log(`       ↳ ${err.message}`)
  }
}

// ── Utilidad: añade teamId si está disponible ─────────────────────────────
function withTeam(base, teamId) {
  if (!teamId) return null
  const u = new URL(base)
  u.searchParams.set('teamId', teamId)
  return u.toString()
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  loadEnv()

  const teamId  = process.env.VERCEL_TEAM_ID  ?? ''
  const storeId = process.env.GLOBAL_CONFIG_ID ?? 'ecfg_bpzvaceqg5ttp0zs7le67h4ocyac'

  console.log('\n=== Diagnóstico Vercel Edge Config / Global Config ===\n')
  console.log(`  VERCEL_TEAM_ID   : ${teamId  || '(no encontrado)'}`)
  console.log(`  GLOBAL_CONFIG_ID : ${storeId || '(no encontrado)'}`)
  console.log()

  const token = await readSecret('Token de Vercel (entrada oculta): ')
  if (!token.trim()) { console.error('Token vacío — abortando.'); process.exit(1) }

  // ── 1. Validar token ───────────────────────────────────────────────────
  console.log('\n--- 1. Usuario (valida el token) ---')
  await probe('GET /v2/user', 'https://api.vercel.com/v2/user', token)

  // ── 2. Teams ──────────────────────────────────────────────────────────
  console.log('\n--- 2. Teams ---')
  await probe('GET /v2/teams', 'https://api.vercel.com/v2/teams', token)

  // ── 3. Lista de stores ────────────────────────────────────────────────
  console.log('\n--- 3. Lista de stores ---')
  for (const api of ['edge-config', 'global-config']) {
    const base = `https://api.vercel.com/v1/${api}`
    await probe(`GET /v1/${api}                `, base, token)
    const wt = withTeam(base, teamId)
    if (wt) await probe(`GET /v1/${api}?teamId=…   `, wt, token)
  }

  // ── 4. Store individual ────────────────────────────────────────────────
  console.log('\n--- 4. Store individual ---')
  for (const api of ['edge-config', 'global-config']) {
    const base = `https://api.vercel.com/v1/${api}/${storeId}`
    await probe(`GET /v1/${api}/${storeId}`, base, token)
    const wt = withTeam(base, teamId)
    if (wt) await probe(`GET /v1/${api}/${storeId}?teamId=…`, wt, token)
  }

  // ── 5. Items (GET) ─────────────────────────────────────────────────────
  console.log('\n--- 5. GET /items ---')
  for (const api of ['edge-config', 'global-config']) {
    const base = `https://api.vercel.com/v1/${api}/${storeId}/items`
    await probe(`GET /v1/${api}/${storeId}/items`, base, token)
    const wt = withTeam(base, teamId)
    if (wt) await probe(`GET /v1/${api}/${storeId}/items?teamId=…`, wt, token)
  }

  // ── 6. PATCH /items — dos variantes de body ────────────────────────────
  // Variante A: formato actual del código { items: [{ operation, key, value }] }
  // Variante B: formato alternativo        [{ op, key, value }]
  console.log('\n--- 6. PATCH /items (prueba de escritura con clave __diag_test) ---')
  const bodyA = JSON.stringify({ items: [{ operation: 'upsert', key: '__diag_test', value: 'ok' }] })
  const bodyB = JSON.stringify([{ op: 'upsert', key: '__diag_test', value: 'ok' }])

  for (const api of ['edge-config', 'global-config']) {
    const base = `https://api.vercel.com/v1/${api}/${storeId}/items`
    const wt   = withTeam(base, teamId)

    await probe(`PATCH /v1/${api}/…/items  body-A`, base, token, { method: 'PATCH', body: bodyA })
    if (wt) await probe(`PATCH /v1/${api}/…/items?teamId=…  body-A`, wt, token, { method: 'PATCH', body: bodyA })

    await probe(`PATCH /v1/${api}/…/items  body-B`, base, token, { method: 'PATCH', body: bodyB })
    if (wt) await probe(`PATCH /v1/${api}/…/items?teamId=…  body-B`, wt, token, { method: 'PATCH', body: bodyB })
  }

  // ── 7. Limpieza: borrar clave de prueba ────────────────────────────────
  console.log('\n--- 7. DELETE __diag_test (limpieza) ---')
  const delBody = JSON.stringify({ items: [{ operation: 'delete', key: '__diag_test' }] })
  for (const api of ['edge-config', 'global-config']) {
    const base = `https://api.vercel.com/v1/${api}/${storeId}/items`
    const wt   = withTeam(base, teamId)
    const url  = wt ?? base
    await probe(`PATCH /v1/${api}/…/items (delete __diag_test)`, url, token, { method: 'PATCH', body: delBody })
  }

  console.log('\n=== Fin del diagnóstico ===\n')
}

main().catch((err) => {
  console.error('\nError inesperado:', err.message)
  process.exit(1)
})
