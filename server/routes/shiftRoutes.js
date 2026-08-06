import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { closeShift, currentShift, listShifts, reopenShift, shiftDetails, startShift } from '../controllers/shiftController.js'
const router=Router();router.use(authenticate);router.get('/current',currentShift);router.post('/start',allowRoles('ADMIN','CASHIER'),startShift);router.post('/close',allowRoles('ADMIN','CASHIER'),closeShift);router.get('/',allowRoles('ADMIN'),listShifts);router.get('/:id',allowRoles('ADMIN'),shiftDetails);router.post('/:id/reopen',allowRoles('ADMIN'),reopenShift);export default router
