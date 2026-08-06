import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 50 },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  role: { type: String, required: true, enum: ['ADMIN', 'CASHIER'] },
  passwordHash: { type: String, select: false },
  pinHash: { type: String, select: false },
  isActive: { type: Boolean, default: true },
  forceCredentialChange: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

userSchema.index({ username: 1 }, { unique: true })
export default mongoose.model('User', userSchema)
