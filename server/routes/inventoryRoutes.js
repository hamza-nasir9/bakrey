import { Router } from 'express'
import { allowRoles, authenticate } from '../middleware/auth.js'
import { createAdjustment, createItem, createPurchase, createUsage, history, listItems, removeItem, updateItem } from '../controllers/inventoryController.js'
const router=Router();router.use(authenticate,allowRoles('ADMIN'));router.get('/items',listItems);router.post('/items',createItem);router.patch('/items/:id',updateItem);router.delete('/items/:id',removeItem);router.get('/items/:id/history',history);router.post('/purchases',createPurchase);router.post('/usage',createUsage);router.post('/adjustments',createAdjustment);export default router
