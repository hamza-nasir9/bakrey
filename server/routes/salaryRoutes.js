import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { createSalary, listSalaries, paySalary, previewSalary, salaryDetails, salaryOptions, voidSalary } from '../controllers/salaryController.js'
const router=Router();router.use(authenticate,allowRoles('ADMIN'));router.get('/preview',previewSalary);router.get('/options',salaryOptions);router.get('/',listSalaries);router.post('/',createSalary);router.get('/:id',salaryDetails);router.post('/:id/pay',paySalary);router.delete('/:id',voidSalary);export default router
