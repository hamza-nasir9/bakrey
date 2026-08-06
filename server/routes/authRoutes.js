import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
const issueToken = user => jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' })
const publicUser = user => ({ id: user._id, username: user.username, name: user.name, role: user.role })

router.post('/login', async (req, res, next) => {
  try {
    const { username, password, pin, role } = req.body
    if (!username || !role || !['ADMIN', 'CASHIER'].includes(role)) return res.status(400).json({ message: 'Username and valid role are required.' })
    if (role === 'ADMIN' && !password) return res.status(400).json({ message: 'Password is required.' })
    if (role === 'CASHIER' && (!pin || !/^\d+$/.test(pin))) return res.status(400).json({ message: 'A numeric PIN is required.' })
    const user = await User.findOne({ username: username.trim().toLowerCase(), role, isActive: true }).select('+passwordHash +pinHash')
    const valid = user && await bcrypt.compare(role === 'ADMIN' ? password : pin, role === 'ADMIN' ? user.passwordHash : user.pinHash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' })
    return res.json({ token: issueToken(user), user: publicUser(user) })
  } catch (error) { next(error) }
})
router.get('/me', authenticate, async (req, res, next) => { try { const user = await User.findById(req.auth.sub); if (!user || !user.isActive) return res.status(401).json({ message: 'Session is no longer valid.' }); res.json({ user: publicUser(user) }) } catch (error) { next(error) } })
export default router
