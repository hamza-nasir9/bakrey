import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { createCustomer, customerProfile, deactivateCustomer, listCustomers, updateCustomer } from '../controllers/customerController.js'
const router=Router();router.use(authenticate,allowRoles('ADMIN'));router.get('/',listCustomers);router.post('/',createCustomer);router.get('/:id',customerProfile);router.patch('/:id',updateCustomer);router.delete('/:id',deactivateCustomer);export default router
