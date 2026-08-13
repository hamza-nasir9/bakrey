import { Router } from 'express'
import { authenticate, allowRoles } from '../middleware/auth.js'
import { cancelOrder, createOrder, listOrders, orderDetails, orderOptions, updateOrder } from '../controllers/orderController.js'
const router=Router();router.use(authenticate);router.post('/',allowRoles('ADMIN','CASHIER'),createOrder);router.get('/options',allowRoles('ADMIN','CASHIER'),orderOptions);router.get('/',allowRoles('ADMIN','CASHIER'),listOrders);router.get('/:id',allowRoles('ADMIN','CASHIER'),orderDetails);router.patch('/:id',allowRoles('ADMIN','CASHIER'),updateOrder);router.post('/:id/cancel',allowRoles('ADMIN','CASHIER'),cancelOrder);export default router
