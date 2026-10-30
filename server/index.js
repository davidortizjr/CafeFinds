import express from 'express'
import cors from 'cors'
import { attachUser } from './lib/auth.js'
import authRouter from './routes/auth.js'
import meRouter from './routes/me.js'
import usersRouter from './routes/users.js'
import cafesRouter from './routes/cafes.js'
import reviewsRouter from './routes/reviews.js'
import visitsRouter from './routes/visits.js'
import logRouter from './routes/log.js'

const app = express()

// Behind Vercel's proxy; needed so rate limiting sees the real client IP.
app.set('trust proxy', 1)

app.use(cors())
app.use(express.json({ limit: '20kb' }))

// Reads the session cookie and sets req.user (or null for guests). Routes that
// need an account add requireAuth; browsing routes work for everyone.
app.use('/api', attachUser)

app.use('/api/auth', authRouter)
app.use('/api/me', meRouter)
app.use('/api/users', usersRouter)
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
