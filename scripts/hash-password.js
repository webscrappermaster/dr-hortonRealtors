#!/usr/bin/env node
// Genera el hash de la contraseña del admin para ADMIN_PASSWORD_HASH
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

function readPasswordHidden() {
  return new Promise((resolve) => {
    process.stdout.write('Contraseña: ')
    const chars = []

    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    process.stdin.on('data', (char) => {
      if (char === '\r' || char === '\n') {
        process.stdin.setRawMode(false)
        process.stdin.pause()
        process.stdout.write('\n')
        resolve(chars.join(''))
      } else if (char === '') {
        process.stdout.write('\n')
        process.exit(0)
      } else if (char === '') {
        chars.pop()
      } else {
        chars.push(char)
      }
    })
  })
}

const password = await readPasswordHidden()

if (!password) {
  console.error('La contraseña no puede estar vacía.')
  process.exit(1)
}

const salt = randomBytes(16).toString('hex')
const key = await scryptAsync(password, salt, 64)
const hash = `${salt}:${key.toString('hex')}`

console.log('\nHash generado — copia el siguiente valor en ADMIN_PASSWORD_HASH:')
console.log(hash)
