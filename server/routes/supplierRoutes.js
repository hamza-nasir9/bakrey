import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { addPayment, createSupplier, deactivateSupplier, listSuppliers, supplierProfile, updateSupplier } from '../controllers/supplierController.js'
const router=Router();router.use(authenticate,allowRoles('ADMIN'));router.get('/',listSuppliers);router.post('/',createSupplier);router.get('/:id',supplierProfile);router.patch('/:id',updateSupplier);router.delete('/:id',deactivateSupplier);router.post('/:id/payments',addPayment);export default router
