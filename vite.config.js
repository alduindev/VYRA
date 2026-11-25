import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function localJsonDatabase() {
  const file = path.resolve(process.cwd(), 'db.json')
  return {
    name: 'vyra-local-json-database',
    configureServer(server) {
      server.middlewares.use('/api/db', (request, response, next) => {
        if (request.method === 'GET') {
          response.setHeader('Content-Type', 'application/json')
          response.end(fs.readFileSync(file, 'utf8'))
          return
        }
        if (request.method !== 'PUT') return next()
        let body = ''
        request.on('data', chunk => { body += chunk })
        request.on('end', () => {
          try {
            const parsed = JSON.parse(body)
            fs.writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
            response.statusCode = 204
            response.end()
          } catch {
            response.statusCode = 400
            response.end('Invalid JSON')
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), localJsonDatabase()],
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? '/VYRA/' : '/'),
  build: { outDir: 'dist', emptyOutDir: true }
})
