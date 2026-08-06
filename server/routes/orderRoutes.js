import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { cancelOrder, createOrder, listOrders, orderDetails, orderOptions, updateOrder } from '../controllers/orderController.js'
const router=Router();router.use(authenticate);router.post('/',allowRoles('ADMIN','CASHIER'),createOrder);router.get('/options',allowRoles('ADMIN'),orderOptions);router.get('/',allowRoles('ADMIN'),listOrders);router.get('/:id',allowRoles('ADMIN'),orderDetails);router.patch('/:id',allowRoles('ADMIN'),updateOrder);router.post('/:id/cancel',allowRoles('ADMIN'),cancelOrder);export default router
