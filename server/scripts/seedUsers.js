import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { connectDatabase } from '../config/database.js'
import User from '../models/User.js'
dotenv.config()
const accounts = [{ username:'admin', name:'Admin Owner', role:'ADMIN', password:'Admin@123' }, { username:'cashier1', name:'Cashier 1', role:'CASHIER', pin:'1234' }, { username:'cashier2', name:'Cashier 2', role:'CASHIER', pin:'2345' }, { username:'cashier3', name:'Cashier 3', role:'CASHIER', pin:'3456' }, { username:'cashier4', name:'Cashier 4', role:'CASHIER', pin:'4567' }]
await connectDatabase()
for (const account of accounts) { const hashKey = account.role === 'ADMIN' ? 'passwordHash' : 'pinHash'; const secret = account.password || account.pin; await User.findOneAndUpdate({ username: account.username }, { name:account.name, role:account.role, [hashKey]:await bcrypt.hash(secret, 12), isActive:true }, { upsert:true, new:true, setDefaultsOnInsert:true }) }
console.log('Authentication users seeded. Change demo credentials before production.')
process.exit(0)
