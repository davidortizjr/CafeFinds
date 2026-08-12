import express from 'express'
import cors from 'cors'
import { prisma } from './lib/prisma.js'
import cafesRouter from './routes/cafes.js'
import reviewsRouter from './routes/reviews.js'
import visitsRouter from './routes/visits.js'
import logRouter from './routes/log.js'

const app = express()

app.use(cors())
app.use(express.json())

// Every request carries an anonymous device id (generated client-side and
// stored in localStorage — see src/lib/user.js). We upsert a matching User
// row and attach it to the request so route handlers never touch prisma
// user lookups themselves.
app.use('/api', async (req, res, next) => {
  try {
    const deviceId = req.header('x-device-id')
    if (!deviceId) {
      return res.status(400).json({ error: 'Missing x-device-id header' })
    }
    const user = await prisma.user.upsert({
      where: { deviceId },
      update: {},
      create: { deviceId }
    })
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
})

app.get('/api/me', (req, res) => res.json({ user: req.user }))

app.patch('/api/me', async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim().slice(0, 40)
    if (!name) return res.status(400).json({ error: 'name is required' })
    const user = await prisma.user.update({ where: { id: req.user.id }, data: { name } })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})
app.use('/api/cafes', cafesRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/visits', visitsRouter)
app.use('/api/log', logRouter)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
})

export default app
