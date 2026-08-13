import { Router } from 'express'
import { dashboardSummary } from '../controllers/dashboardController.js'
import { allowRoles, authenticate } from '../middleware/auth.js'
const router = Router()
router.get('/summary', authenticate, allowRoles('ADMIN', 'CASHIER'), dashboardSummary)
export default router
