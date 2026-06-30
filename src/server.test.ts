import request from 'supertest'
import { app, server } from './server'

afterAll(() => server.close())

describe('Notification Service', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('POST /notifications creates notification', async () => {
    const res = await request(app)
      .post('/notifications')
      .send({ message: 'Test notification', type: 'info' })
    expect(res.status).toBe(201)
    expect(res.body.id).toBeTruthy()
    expect(res.body.message).toBe('Test notification')
    expect(res.body.read).toBe(false)
  })

  it('POST /notifications requires message', async () => {
    const res = await request(app)
      .post('/notifications')
      .send({ type: 'info' })
    expect(res.status).toBe(400)
  })

  it('GET /notifications returns list', async () => {
    const res = await request(app).get('/notifications')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})
