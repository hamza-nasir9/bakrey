import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { addPayment, createSupplier, deactivateSupplier, listSuppliers, supplierProfile, updateSupplier } from '../controllers/supplierController.js'
const router=Router();router.use(authenticate);router.get('/',allowRoles('ADMIN','CASHIER'),listSuppliers);router.post('/',allowRoles('ADMIN'),createSupplier);router.get('/:id',allowRoles('ADMIN','CASHIER'),supplierProfile);router.patch('/:id',allowRoles('ADMIN'),updateSupplier);router.delete('/:id',allowRoles('ADMIN'),deactivateSupplier);router.post('/:id/payments',allowRoles('ADMIN'),addPayment);export default router
