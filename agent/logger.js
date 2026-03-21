import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG_FILE = path.join(__dirname, '../action-log.json')

if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2))
}

export function logAction(entry) {
  const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
  const newEntry = { id: Date.now(), timestamp: new Date().toISOString(), ...entry }
  logs.unshift(newEntry)
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs.slice(0, 100), null, 2))
  console.log(`📝 Logged: [${newEntry.action}] ${newEntry.reasoning?.slice(0, 80)}`)
  return newEntry
}

export function getLogs(limit = 20) {
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')).slice(0, limit)
  } catch { return [] }
}
