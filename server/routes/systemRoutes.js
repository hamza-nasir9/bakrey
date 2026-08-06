import { Router } from 'express'
import { authenticate,allowRoles } from '../middleware/auth.js'
import { changeCredentials,createBackup,exportBackup,getSettings,listBackups,markNotification,notifications,saveSettings } from '../controllers/systemController.js'
const router=Router();router.use(authenticate);router.get('/notifications',notifications);router.patch('/notifications/:id',markNotification);router.patch('/credentials',changeCredentials);router.get('/settings',allowRoles('ADMIN'),getSettings);router.put('/settings',allowRoles('ADMIN'),saveSettings);router.get('/backups',allowRoles('ADMIN'),listBackups);router.post('/backups',allowRoles('ADMIN'),createBackup);router.get('/backups/:id/export',allowRoles('ADMIN'),exportBackup);export default router
