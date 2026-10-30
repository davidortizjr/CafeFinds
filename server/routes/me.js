import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { checkPassword, endSession, hashPassword, privateUser, requireAuth, startSession } from '../lib/auth.js'
import { parseBio, parseDisplayName, parseEmail, parsePassword, parseUsername } from '../lib/validate.js'

const router = Router()

// Everything under /api/me is the signed-in person's own account.
router.use(requireAuth)

const fail = (res, status, error, field) => res.status(status).json({ error, ...(field ? { field } : {}) })

router.get('/', (req, res) => res.json({ user: privateUser(req.user) }))

// Profile and account details. Only the fields that are sent get changed.
// Changing the email needs the current password, because the email is what
// "forgot password" trusts.
router.patch('/', async (req, res, next) => {
  try {
    const body = req.body ?? {}
    const data = {}

    if ('name' in body) {
      const name = parseDisplayName(body.name)
      if (!name.value) return fail(res, 400, 'Your display name can’t be empty.', 'name')
      data.name = name.value
    }

    if ('bio' in body) data.bio = parseBio(body.bio).value

    if ('username' in body) {
      const username = parseUsername(body.username)
      if (username.error) return fail(res, 400, username.error, 'username')
      if (username.value !== req.user.username) {
        const taken = await prisma.user.findUnique({ where: { username: username.value } })
        if (taken) return fail(res, 409, 'That username is taken. Try another.', 'username')
        data.username = username.value
      }
    }

    if ('email' in body) {
      const email = parseEmail(body.email)
      if (email.error) return fail(res, 400, email.error, 'email')
      if (email.value !== req.user.email) {
        if (!(await checkPassword(body.currentPassword, req.user.passwordHash))) {
          return fail(res, 403, 'Enter your current password to change your email.', 'currentPassword')
        }
        const taken = await prisma.user.findUnique({ where: { email: email.value } })
        if (taken) return fail(res, 409, 'Another account already uses that email.', 'email')
        data.email = email.value
      }
    }

    const user = Object.keys(data).length
      ? await prisma.user.update({ where: { id: req.user.id }, data })
      : req.user
    res.json({ user: privateUser(user) })
  } catch (err) {
    if (err?.code === 'P2002') return fail(res, 409, 'That username or email is already taken.')
    next(err)
  }
})

router.post('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {}
    if (!(await checkPassword(currentPassword, req.user.passwordHash))) {
      return fail(res, 403, 'Your current password is not right.', 'currentPassword')
    }
    const password = parsePassword(newPassword)
    if (password.error) return fail(res, 400, password.error, 'newPassword')

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: await hashPassword(password.value), tokenVersion: { increment: 1 } }
    })
    // Other devices are signed out; this one gets a fresh session.
    startSession(res, user)
    res.json({ user: privateUser(user) })
  } catch (err) {
    next(err)
  }
})

// Deletes the account and, through cascading deletes, its reviews and visits.
router.delete('/', async (req, res, next) => {
  try {
    if (!(await checkPassword(req.body?.password, req.user.passwordHash))) {
      return fail(res, 403, 'Your password is not right.', 'password')
    }
    await prisma.user.delete({ where: { id: req.user.id } })
    endSession(res)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
