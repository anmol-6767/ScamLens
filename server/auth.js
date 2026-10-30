import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import express from 'express'

const scrypt = promisify(scryptCallback)
const COOKIE_NAME = 'sb_session'
const SESSION_LENGTH = 32
const DAY = 24 * 60 * 60 * 1000
const EDUCATION_LEVELS = new Set(['High school', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctorate', 'Other'])

const publicUser = row => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  college: row.college,
  educationLevel: row.education_level,
  emailVerified: Boolean(row.email_verified),
  createdAt: row.created_at,
})

const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const hashToken = token => createHash('sha256').update(token).digest('hex')
const randomToken = () => randomBytes(SESSION_LENGTH).toString('base64url')
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function badRequest(message, status = 400) {
  return Object.assign(new Error(message), { status })
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    throw badRequest('Use a password between 12 and 128 characters.')
  }
}

function passwordScore(password) {
  return typeof password === 'string' && password.length >= 12 ? 1 : 0
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64)
  return `scrypt$${salt}$${Buffer.from(derived).toString('hex')}`
}

async function verifyPassword(password, encoded) {
  const [, salt, digest] = String(encoded).split('$')
  if (!salt || !digest) return false
  const expected = Buffer.from(digest, 'hex')
  const actual = Buffer.from(await scrypt(password, salt, expected.length))
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => part.trim().split(/=(.*)/s).slice(0, 2)).filter(([key, value]) => key && value !== undefined).map(([key, value]) => [key, decodeURIComponent(value)]))
}

function setSessionCookie(res, token, expiresAt) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`)
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`)
}

function createRateLimiter({ limit, windowMs }) {
  const buckets = new Map()
  return (req, res, next) => {
    const now = Date.now()
    const key = `${req.ip}:${req.path}`
    const entry = buckets.get(key)
    const current = entry && entry.expiresAt > now ? entry : { count: 0, expiresAt: now + windowMs }
    current.count += 1
    buckets.set(key, current)
    if (buckets.size > 5000) for (const [bucket, value] of buckets) if (value.expiresAt <= now) buckets.delete(bucket)
    if (current.count > limit) return res.status(429).json({ error: 'Too many attempts. Please wait and try again.' })
    next()
  }
}

export function requireAuth(database) {
  return (req, res, next) => {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME]
    if (!token) return res.status(401).json({ error: 'Sign in to continue.' })
    const tokenHash = hashToken(token)
    const session = database.prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?').get(tokenHash)
    if (!session || session.expires_at <= Date.now()) {
      database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
      clearSessionCookie(res)
      return res.status(401).json({ error: 'Your session has expired. Sign in again.' })
    }
    const user = database.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id)
    if (!user || !user.email_verified) {
      database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
      clearSessionCookie(res)
      return res.status(401).json({ error: 'Verify your email address to continue.' })
    }
    req.user = publicUser(user)
    req.sessionHash = tokenHash
    next()
  }
}

function makeEmailLink(origin, path, token) {
  const url = new URL(path, origin)
  url.searchParams.set('token', token)
  return url.toString()
}

async function createOneTimeToken(database, userId, purpose) {
  database.prepare('DELETE FROM auth_tokens WHERE user_id = ? AND purpose = ?').run(userId, purpose)
  const token = randomToken()
  const expiresAt = Date.now() + 60 * 60 * 1000
  database.prepare('INSERT INTO auth_tokens (token_hash, user_id, purpose, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(hashToken(token), userId, purpose, expiresAt, new Date().toISOString())
  return token
}

export function createAuthRouter(database, { sendEmail, appOrigin }) {
  const router = express.Router()
  const requiredAuth = requireAuth(database)
  const authRateLimit = createRateLimiter({ limit: 12, windowMs: 15 * 60 * 1000 })
  const devLinks = process.env.NODE_ENV !== 'production' && process.env.AUTH_DEV_LINKS === 'true'

  router.post('/register', authRateLimit, asyncRoute(async (req, res) => {
    const { fullName, email, password, phone = '', college = '', educationLevel, acceptedTerms } = req.body || {}
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const name = typeof fullName === 'string' ? fullName.trim() : ''
    if (name.length < 2 || name.length > 120) throw badRequest('Enter your full name (2 to 120 characters).')
    if (!emailPattern.test(normalizedEmail) || normalizedEmail.length > 254) throw badRequest('Enter a valid email address.')
    validatePassword(password)
    if (!EDUCATION_LEVELS.has(educationLevel)) throw badRequest('Choose a supported education level.')
    if (acceptedTerms !== true) throw badRequest('Accept the Terms and Privacy Notice to create an account.')
    if (typeof phone !== 'string' || phone.length > 40 || typeof college !== 'string' || college.length > 180) throw badRequest('Check the optional phone and institution fields.')
    if (!sendEmail && !devLinks) throw badRequest('Email delivery is not configured. Set SMTP settings before creating accounts.', 503)
    if (database.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail)) throw badRequest('An account with that email already exists.', 409)

    const userId = randomUUID()
    const now = new Date().toISOString()
    const passwordHash = await hashPassword(password)
    const verifyToken = randomToken()
    const verificationUrl = makeEmailLink(appOrigin, '/verify-email', verifyToken)
    const expiresAt = Date.now() + DAY

    database.exec('BEGIN IMMEDIATE')
    try {
      database.prepare(`INSERT INTO users (id, full_name, email, password_hash, phone, college, education_level, email_verified, terms_accepted_at, privacy_accepted_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`)
        .run(userId, name, normalizedEmail, passwordHash, phone.trim(), college.trim(), educationLevel, now, now, now, now)
      database.prepare('INSERT INTO auth_tokens (token_hash, user_id, purpose, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(hashToken(verifyToken), userId, 'verify_email', expiresAt, now)
      if (sendEmail) await sendEmail({
        to: normalizedEmail,
        subject: 'Verify your SkillBridge AI account',
        text: `Welcome to SkillBridge AI. Verify your email within 24 hours: ${verificationUrl}`,
        html: `<p>Welcome to SkillBridge AI.</p><p><a href="${verificationUrl}">Verify your email address</a>. This link expires in 24 hours.</p>`,
      })
      database.exec('COMMIT')
    } catch (error) {
      database.exec('ROLLBACK')
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw badRequest('An account with that email already exists.', 409)
      throw error
    }
    res.status(201).json({
      message: 'Account created. Verify your email before signing in.',
      ...(devLinks && !sendEmail ? { developmentVerificationUrl: verificationUrl } : {}),
    })
  }))

  router.post('/verify-email', authRateLimit, asyncRoute(async (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token : ''
    if (!token) throw badRequest('Verification link is missing or invalid.')
    const tokenHash = hashToken(token)
    const record = database.prepare(`SELECT user_id, expires_at FROM auth_tokens
      WHERE token_hash = ? AND purpose = 'verify_email'`).get(tokenHash)
    if (!record || record.expires_at <= Date.now()) throw badRequest('This verification link has expired or was already used.')
    database.exec('BEGIN IMMEDIATE')
    try {
      database.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(new Date().toISOString(), record.user_id)
      database.prepare('DELETE FROM auth_tokens WHERE token_hash = ?').run(tokenHash)
      database.exec('COMMIT')
    } catch (error) {
      database.exec('ROLLBACK')
      throw error
    }
    res.json({ message: 'Email verified. You can now sign in.' })
  }))

  router.post('/login', authRateLimit, asyncRoute(async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    const user = database.prepare('SELECT * FROM users WHERE email = ?').get(email)
    const valid = user ? await verifyPassword(password, user.password_hash) : await hashPassword(password.slice(0, 128)).then(() => false)
    if (!user || !valid) throw badRequest('Email or password is incorrect.', 401)
    if (!user.email_verified) throw badRequest('Verify your email address before signing in.', 403)

    const token = randomToken()
    const lifetime = req.body?.remember ? 30 * DAY : 12 * 60 * 60 * 1000
    const expiresAt = Date.now() + lifetime
    database.prepare('DELETE FROM sessions WHERE user_id = ? AND expires_at <= ?').run(user.id, Date.now())
    database.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
      .run(hashToken(token), user.id, expiresAt, new Date().toISOString())
    setSessionCookie(res, token, expiresAt)
    res.json({ user: publicUser(user) })
  }))

  router.get('/me', (req, res) => {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME]
    if (!token) return res.json({ user: null })
    const tokenHash = hashToken(token)
    const session = database.prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?').get(tokenHash)
    if (!session || session.expires_at <= Date.now()) {
      database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
      clearSessionCookie(res)
      return res.json({ user: null })
    }
    const user = database.prepare('SELECT * FROM users WHERE id = ? AND email_verified = 1').get(session.user_id)
    if (!user) {
      database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
      clearSessionCookie(res)
      return res.json({ user: null })
    }
    res.json({ user: publicUser(user) })
  })

  router.post('/logout', (req, res) => {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME]
    if (token) database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token))
    clearSessionCookie(res)
    res.json({ message: 'Signed out.' })
  })

  router.post('/forgot-password', authRateLimit, asyncRoute(async (req, res) => {
    if (!sendEmail) throw badRequest('Password reset email is not configured. Set SMTP settings to enable secure resets.', 503)
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    if (!emailPattern.test(email)) throw badRequest('Enter a valid email address.')
    const user = database.prepare('SELECT id, email FROM users WHERE email = ? AND email_verified = 1').get(email)
    if (user) {
      const token = await createOneTimeToken(database, user.id, 'reset_password')
      const resetUrl = makeEmailLink(appOrigin, '/reset-password', token)
      await sendEmail({
        to: user.email,
        subject: 'Reset your SkillBridge AI password',
        text: `Reset your password within one hour: ${resetUrl}`,
        html: `<p>A password reset was requested for your account.</p><p><a href="${resetUrl}">Reset your password</a>. This link expires in one hour.</p>`,
      })
    }
    res.json({ message: 'If a verified account exists for that email, a reset link has been sent.' })
  }))

  router.post('/reset-password', authRateLimit, asyncRoute(async (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token : ''
    const password = req.body?.password
    if (!token) throw badRequest('Reset link is missing or invalid.')
    validatePassword(password)
    if (!passwordScore(password)) throw badRequest('Choose a stronger password.')
    const tokenHash = hashToken(token)
    const record = database.prepare(`SELECT user_id, expires_at FROM auth_tokens
      WHERE token_hash = ? AND purpose = 'reset_password'`).get(tokenHash)
    if (!record || record.expires_at <= Date.now()) throw badRequest('This reset link has expired or was already used.')
    const encoded = await hashPassword(password)
    database.exec('BEGIN IMMEDIATE')
    try {
      database.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(encoded, new Date().toISOString(), record.user_id)
      database.prepare('DELETE FROM auth_tokens WHERE user_id = ? AND purpose = ?').run(record.user_id, 'reset_password')
      database.prepare('DELETE FROM sessions WHERE user_id = ?').run(record.user_id)
      database.exec('COMMIT')
    } catch (error) {
      database.exec('ROLLBACK')
      throw error
    }
    clearSessionCookie(res)
    res.json({ message: 'Password updated. Sign in with your new password.' })
  }))

  router.get('/profile', requiredAuth, (req, res) => res.json({ user: req.user }))
  router.put('/profile', requiredAuth, asyncRoute(async (req, res) => {
    const { fullName, phone = '', college = '', educationLevel } = req.body || {}
    const name = typeof fullName === 'string' ? fullName.trim() : ''
    if (name.length < 2 || name.length > 120) throw badRequest('Enter your full name (2 to 120 characters).')
    if (typeof educationLevel !== 'string' || !educationLevel.trim()) throw badRequest('Choose your current education level.')
    if (typeof phone !== 'string' || phone.length > 40 || typeof college !== 'string' || college.length > 180) throw badRequest('Check the phone and institution fields.')
    database.prepare('UPDATE users SET full_name = ?, phone = ?, college = ?, education_level = ?, updated_at = ? WHERE id = ?')
      .run(name, phone.trim(), college.trim(), educationLevel.trim(), new Date().toISOString(), req.user.id)
    const user = database.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    res.json({ user: publicUser(user) })
  }))

  return router
}

export function createResumeRouter(database) {
  const router = express.Router()
  const requiredAuth = requireAuth(database)
  router.use(requiredAuth)

  router.get('/', (req, res) => {
    const resumes = database.prepare(`SELECT id, resume_name AS resumeName, target_role AS targetRole, template, accent, created_at AS createdAt, updated_at AS updatedAt
      FROM resumes WHERE user_id = ? ORDER BY updated_at DESC`).all(req.user.id)
    res.json({ resumes })
  })

  router.post('/', (req, res) => {
    const { resumeName, targetRole = '', template = 'modern', accent = '#397bff', resumeData } = req.body || {}
    if (typeof resumeName !== 'string' || !resumeName.trim() || resumeName.length > 120) throw badRequest('Enter a resume name up to 120 characters.')
    if (typeof targetRole !== 'string' || targetRole.length > 160) throw badRequest('Check the target role.')
    if (!['modern', 'minimal', 'technical', 'data', 'fresher'].includes(template)) throw badRequest('Choose a supported resume template.')
    if (!/^#[0-9a-f]{6}$/i.test(accent)) throw badRequest('Choose a valid accent color.')
    if (!resumeData || typeof resumeData !== 'object' || Array.isArray(resumeData)) throw badRequest('Resume content is missing.')
    const serialized = JSON.stringify(resumeData)
    if (serialized.length > 180_000) throw badRequest('Resume content is too large.')
    const id = randomUUID(), now = new Date().toISOString()
    database.prepare(`INSERT INTO resumes (id, user_id, resume_name, target_role, template, accent, resume_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, req.user.id, resumeName.trim(), targetRole.trim(), template, accent, serialized, now, now)
    res.status(201).json({ resume: { id, resumeName: resumeName.trim(), targetRole: targetRole.trim(), template, accent, resumeData, createdAt: now, updatedAt: now } })
  })

  router.get('/:id', (req, res) => {
    const resume = database.prepare(`SELECT id, resume_name AS resumeName, target_role AS targetRole, template, accent, resume_data AS resumeData, created_at AS createdAt, updated_at AS updatedAt
      FROM resumes WHERE id = ? AND user_id = ?`).get(req.params.id, req.user.id)
    if (!resume) throw badRequest('Resume not found.', 404)
    res.json({ resume: { ...resume, resumeData: JSON.parse(resume.resumeData) } })
  })

  router.put('/:id', (req, res) => {
    const { resumeName, targetRole = '', template = 'modern', accent = '#397bff', resumeData } = req.body || {}
    if (typeof resumeName !== 'string' || !resumeName.trim() || resumeName.length > 120) throw badRequest('Enter a resume name up to 120 characters.')
    if (typeof targetRole !== 'string' || targetRole.length > 160) throw badRequest('Check the target role.')
    if (!['modern', 'minimal', 'technical', 'data', 'fresher'].includes(template)) throw badRequest('Choose a supported resume template.')
    if (!/^#[0-9a-f]{6}$/i.test(accent)) throw badRequest('Choose a valid accent color.')
    if (!resumeData || typeof resumeData !== 'object' || Array.isArray(resumeData)) throw badRequest('Resume content is missing.')
    const serialized = JSON.stringify(resumeData)
    if (serialized.length > 180_000) throw badRequest('Resume content is too large.')
    const now = new Date().toISOString()
    const result = database.prepare(`UPDATE resumes SET resume_name = ?, target_role = ?, template = ?, accent = ?, resume_data = ?, updated_at = ?
      WHERE id = ? AND user_id = ?`).run(resumeName.trim(), targetRole.trim(), template, accent, serialized, now, req.params.id, req.user.id)
    if (!result.changes) throw badRequest('Resume not found.', 404)
    res.json({ resume: { id: req.params.id, resumeName: resumeName.trim(), targetRole: targetRole.trim(), template, accent, resumeData, updatedAt: now } })
  })

  router.post('/:id/duplicate', (req, res) => {
    const original = database.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
    if (!original) throw badRequest('Resume not found.', 404)
    const id = randomUUID(), now = new Date().toISOString(), name = `${original.resume_name} (copy)`.slice(0, 120)
    database.prepare(`INSERT INTO resumes (id, user_id, resume_name, target_role, template, accent, resume_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, req.user.id, name, original.target_role, original.template, original.accent, original.resume_data, now, now)
    res.status(201).json({ id, resumeName: name })
  })

  router.delete('/:id', (req, res) => {
    const result = database.prepare('DELETE FROM resumes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
    if (!result.changes) throw badRequest('Resume not found.', 404)
    res.json({ message: 'Resume deleted.' })
  })

  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    res.status(error.status || 500).json({ error: error.message || 'Request failed.' })
  })

  return router
}