import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { attendanceOptions, bulkAttendance, createAttendance, deactivateAttendance, listAttendance, monthlySummary, updateAttendance } from '../controllers/attendanceController.js'
const router=Router();router.use(authenticate);router.get('/options',allowRoles('ADMIN','CASHIER'),attendanceOptions);router.post('/',allowRoles('ADMIN','CASHIER'),createAttendance);router.get('/summary',allowRoles('ADMIN'),monthlySummary);router.get('/',allowRoles('ADMIN'),listAttendance);router.post('/bulk',allowRoles('ADMIN'),bulkAttendance);router.patch('/:id',allowRoles('ADMIN'),updateAttendance);router.delete('/:id',allowRoles('ADMIN'),deactivateAttendance);export default router
