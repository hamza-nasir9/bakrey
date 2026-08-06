import jwt from 'jsonwebtoken'

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7)
  if (!token) return res.status(401).json({ message: 'Authentication required.' })
  try { req.auth = jwt.verify(token, process.env.JWT_SECRET); next() } catch { return res.status(401).json({ message: 'Invalid or expired session.' }) }
}

export const allowRoles = (...roles) => (req, res, next) => roles.includes(req.auth.role) ? next() : res.status(403).json({ message: 'You do not have permission for this action.' })
