import crypto from 'node:crypto'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma.js'
import { checkPassword, endSession, hashPassword, privateUser, startSession } from '../lib/auth.js'
import { appUrl, sendPasswordResetEmail } from '../lib/mail.js'
import { parseDisplayName, parseEmail, parsePassword, parseUsername } from '../lib/validate.js'

const router = Router()

// Best-effort brute-force protection. On serverless each instance keeps its
// own counter, so treat this as a speed bump and put a shared store (or the
// host's firewall) behind it if the app gets real traffic.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Wait a few minutes and try again.' }
})

const fail = (res, status, error, field) => res.status(status).json({ error, ...(field ? { field } : {}) })

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

router.get('/me', (req, res) => {
  res.json({ user: req.user ? privateUser(req.user) : null })
})

router.post('/register', limiter, async (req, res, next) => {
  try {
    const body = req.body ?? {}
    const email = parseEmail(body.email)
    if (email.error) return fail(res, 400, email.error, 'email')
    const username = parseUsername(body.username)
    if (username.error) return fail(res, 400, username.error, 'username')
    const password = parsePassword(body.password)
    if (password.error) return fail(res, 400, password.error, 'password')
    const name = parseDisplayName(body.name, username.value)

    const taken = await prisma.user.findFirst({
      where: { OR: [{ email: email.value }, { username: username.value }] }
    })
    if (taken) {
      return taken.email === email.value
        ? fail(res, 409, 'An account with this email already exists. Try signing in.', 'email')
        : fail(res, 409, 'That username is taken. Try another.', 'username')
    }

    const passwordHash = await hashPassword(password.value)
    const data = { email: email.value, username: username.value, name: name.value, passwordHash }

    // Someone who used the app before accounts existed still has a device id.
    // If that anonymous profile is unclaimed, turn it into this account so
    // their visited list and reviews carry over.
    let legacy = null
    if (typeof body.deviceId === 'string' && body.deviceId) {
      const found = await prisma.user.findUnique({ where: { deviceId: body.deviceId } })
      if (found && !found.passwordHash) legacy = found
    }

    const user = legacy
      ? await prisma.user.update({ where: { id: legacy.id }, data: { ...data, deviceId: null } })
      : await prisma.user.create({ data })

    startSession(res, user)
    res.status(201).json({ user: privateUser(user), claimedLegacy: Boolean(legacy) })
  } catch (err) {
    // Two people registering the same email or username at once.
    if (err?.code === 'P2002') return fail(res, 409, 'That email or username is already taken.')
    next(err)
  }
})

router.post('/login', limiter, async (req, res, next) => {
  try {
    const identifier = typeof req.body?.identifier === 'string' ? req.body.identifier.trim().toLowerCase().replace(/^@/, '') : ''
    const password = req.body?.password
    if (!identifier || typeof password !== 'string' || !password) {
      return fail(res, 400, 'Enter your email or username and your password.')
    }

    const user = await prisma.user.findUnique({
      where: identifier.includes('@') ? { email: identifier } : { username: identifier }
    })

    if (!(await checkPassword(password, user?.passwordHash))) {
      return fail(res, 401, 'That email, username or password is not right.')
    }

    startSession(res, user)
    res.json({ user: privateUser(user) })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', (req, res) => {
  endSession(res)
  res.status(204).end()
})

// Always answers the same way, whether or not the email has an account, so
// the form can't be used to find out who is registered.
router.post('/forgot', limiter, async (req, res, next) => {
  try {
    const email = parseEmail(req.body?.email)
    if (email.error) return fail(res, 400, email.error, 'email')

    const user = await prisma.user.findUnique({ where: { email: email.value } })
    if (user?.passwordHash) {
      const token = crypto.randomBytes(32).toString('base64url')
      await prisma.passwordReset.deleteMany({ where: { userId: user.id } })
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      })
      await sendPasswordResetEmail(user.email, `${appUrl()}/reset-password?token=${token}`)
    }

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.post('/reset', limiter, async (req, res, next) => {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token : ''
    const password = parsePassword(req.body?.password)
    if (password.error) return fail(res, 400, password.error, 'password')

    const invalid = () => fail(res, 400, 'This reset link has expired or was already used. Request a new one.')
    if (!token) return invalid()

    const reset = await prisma.passwordReset.findUnique({ where: { tokenHash: sha256(token) } })
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) return invalid()

    // Claim the token atomically so a link can only ever be used once, even
    // if two requests race.
    const claimed = await prisma.passwordReset.updateMany({
      where: { id: reset.id, usedAt: null },
      data: { usedAt: new Date() }
    })
    if (claimed.count !== 1) return invalid()

    // Bumping tokenVersion signs out every other session on this account.
    const user = await prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: await hashPassword(password.value), tokenVersion: { increment: 1 } }
    })
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } })

    startSession(res, user)
    res.json({ user: privateUser(user) })
  } catch (err) {
    next(err)
  }
})

export default router
