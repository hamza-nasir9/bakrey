import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { createPayment, listPayments, paymentDetails, paymentOptions, voidPayment } from '../controllers/paymentController.js'
const router=Router();router.use(authenticate);router.get('/options',allowRoles('ADMIN','CASHIER'),paymentOptions);router.post('/',allowRoles('ADMIN','CASHIER'),createPayment);router.get('/',allowRoles('ADMIN','CASHIER'),listPayments);router.get('/:id',allowRoles('ADMIN','CASHIER'),paymentDetails);router.delete('/:id',allowRoles('ADMIN'),voidPayment);export default router
