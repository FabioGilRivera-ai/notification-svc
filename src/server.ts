import express, { Request, Response } from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'

const app = express()
app.use(express.json())

// In-memory notification store
interface Notification {
  id: string
  type: string
  message: string
  channel: string
  read: boolean
  createdAt: string
}

const notifications: Notification[] = []
const clients: Set<WebSocket> = new Set()

// REST endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'notification-svc', version: '1.0.0', clients: clients.size })
})

app.get('/notifications', (_req: Request, res: Response) => {
  res.json(notifications)
})

app.post('/notifications', (req: Request, res: Response) => {
  const { type = 'info', message, channel = 'general' } = req.body
  if (!message) {
    return res.status(400).json({ error: 'message is required' })
  }
  const notification: Notification = {
    id: Math.random().toString(36).slice(2),
    type,
    message,
    channel,
    read: false,
    createdAt: new Date().toISOString(),
  }
  notifications.push(notification)

  // Broadcast to all WebSocket clients
  const payload = JSON.stringify({ event: 'notification', data: notification })
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  })

  res.status(201).json(notification)
})

app.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const n = notifications.find(n => n.id === req.params.id)
  if (!n) return res.status(404).json({ error: 'not found' })
  n.read = true
  res.json(n)
})

app.delete('/notifications', (_req: Request, res: Response) => {
  notifications.length = 0
  res.json({ cleared: true })
})

// Bootstrap
const PORT = parseInt(process.env.PORT || '8082', 10)
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws)
  ws.send(JSON.stringify({ event: 'connected', clients: clients.size }))
  ws.on('close', () => clients.delete(ws))
})

server.listen(PORT, () => {
  console.log(`Notification Service v1.0.0 on port ${PORT}`)
})

export { app, server }
