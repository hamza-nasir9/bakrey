import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { connectDatabase } from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import supplierRoutes from './routes/supplierRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import attendanceRoutes from './routes/attendanceRoutes.js'
import salaryRoutes from './routes/salaryRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import shiftRoutes from './routes/shiftRoutes.js'
import dailyClosingRoutes from './routes/dailyClosingRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import systemRoutes from './routes/systemRoutes.js'
import userRoutes from './routes/userRoutes.js'
dotenv.config()

const app = express()
const allowedOrigins = process.env.CLIENT_URL?.split(',').map(origin => origin.trim()).filter(Boolean) || ['http://localhost:5173']
app.use(helmet())
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('Origin is not allowed by CORS.')) }, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
app.use(express.json({ limit: '1mb' }))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false }), authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/salaries', salaryRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/shifts', shiftRoutes)
app.use('/api/daily-closings', dailyClosingRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/system', systemRoutes)
app.use('/api/users', userRoutes)
app.get('/api/health', (_, res) => res.json({ status: 'ok', database: 'mongodb', apiConfigured: true }))
app.use((error, _, res, __) => { console.error(error); res.status(500).json({ message: 'An unexpected server error occurred.' }) })

const port = Number(process.env.PORT || 4000)
connectDatabase().then(() => app.listen(port, () => console.log(`API running on port ${port}`))).catch(error => { console.error('MongoDB connection failed:', error.message); process.exit(1) })
