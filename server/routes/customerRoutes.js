import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { createCustomer, customerProfile, deactivateCustomer, listCustomers, updateCustomer } from '../controllers/customerController.js'
const router=Router();router.use(authenticate);router.get('/',allowRoles('ADMIN','CASHIER'),listCustomers);router.post('/',allowRoles('ADMIN'),createCustomer);router.get('/:id',allowRoles('ADMIN','CASHIER'),customerProfile);router.patch('/:id',allowRoles('ADMIN'),updateCustomer);router.delete('/:id',allowRoles('ADMIN'),deactivateCustomer);export default router
