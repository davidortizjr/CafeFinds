import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma.js'

// Sessions are a signed JWT in an httpOnly cookie. The cookie is SameSite=Lax
// and every write endpoint expects a JSON body, so other sites cannot forge
// requests with it. `tv` (tokenVersion) lets us invalidate every session at
// once by bumping the number on the user row, which is what a password
// change or reset does.

const COOKIE_NAME = 'cf_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days
const isProd = process.env.NODE_ENV === 'production'

function jwtSecret() {
  const secret = process.env.JWT_SECRET
  if (secret) return secret
  if (isProd) throw new Error('JWT_SECRET must be set in production')
  return 'dev-only-insecure-secret' // local development only
}

// ---- passwords -------------------------------------------------------------

const BCRYPT_ROUNDS = 10
// Compared against when no account matches, so a miss takes as long as a hit.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS)

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS)

export async function checkPassword(password, hash) {
  return bcrypt.compare(typeof password === 'string' ? password : '', hash || DUMMY_HASH).then((ok) => ok && Boolean(hash))
}

// ---- cookies ---------------------------------------------------------------

function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i < 0) continue
    try {
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
    } catch {
      // ignore malformed cookie values
    }
  }
  return out
}

function cookieString(value, maxAge) {
  const attrs = [`${COOKIE_NAME}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`]
  if (isProd) attrs.push('Secure')
  return attrs.join('; ')
}

export function startSession(res, user) {
  const token = jwt.sign({ sub: user.id, tv: user.tokenVersion }, jwtSecret(), { expiresIn: MAX_AGE_SECONDS })
  res.setHeader('Set-Cookie', cookieString(token, MAX_AGE_SECONDS))
}

export function endSession(res) {
  res.setHeader('Set-Cookie', cookieString('', 0))
}

// ---- middleware ------------------------------------------------------------

// Sets req.user to the signed-in user, or null for guests. Never rejects, so
// public routes (browsing cafes) can use it too.
export async function attachUser(req, res, next) {
  req.user = null
  try {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME]
    if (token) {
      const payload = jwt.verify(token, jwtSecret())
      const user = await prisma.user.findUnique({ where: { id: payload.sub } })
      if (user && user.tokenVersion === payload.tv) req.user = user
    }
  } catch (err) {
    // An expired or tampered token just means "guest". Anything else is a real error.
    if (!(err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError)) return next(err)
  }
  next()
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Sign in to do that.', code: 'auth_required' })
  next()
}

// ---- serializers -----------------------------------------------------------

// What the signed-in person sees about themselves.
export function privateUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    bio: user.bio,
    createdAt: user.createdAt
  }
}
