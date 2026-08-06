import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { attendanceOptions, bulkAttendance, createAttendance, deactivateAttendance, listAttendance, monthlySummary, updateAttendance } from '../controllers/attendanceController.js'
const router=Router();router.use(authenticate,allowRoles('ADMIN'));router.get('/options',attendanceOptions);router.get('/summary',monthlySummary);router.get('/',listAttendance);router.post('/',createAttendance);router.post('/bulk',bulkAttendance);router.patch('/:id',updateAttendance);router.delete('/:id',deactivateAttendance);export default router
