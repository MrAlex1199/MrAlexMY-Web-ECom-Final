import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Password validation function
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (password.length < minLength) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!hasUpperCase) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!hasLowerCase) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!hasNumbers) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  
  return { isValid: true };
};

// Define role hierarchy and permissions
const ROLES = {
  'Admin (Owner Master ID)': {
    level: 10,
    permissions: ['all'],
    description: 'ผู้ดูแลระบบสูงสุด, จัดการผู้ใช้, ตั้งค่าระบบ, การเงิน'
  },
  'Seller': {
    level: 7,
    permissions: ['products', 'orders', 'inventory'],
    description: 'จัดการสินค้าคงคลัง, รายละเอียดสินค้า, รับคำสั่งซื้อ, จัดส่งเบื้องต้น'
  },
  'Warehouse Manager': {
    level: 6,
    permissions: ['inventory', 'products', 'orders'],
    description: 'จัดการการรับเข้า/เบิกจ่ายสินค้า, ตรวจนับสต็อก, พื้นที่เก็บสินค้า'
  },
  'Marketing Specialist': {
    level: 5,
    permissions: ['promotions', 'analytics', 'products'],
    description: 'สร้างแคมเปญโปรโมชั่น, โฆษณา, วิเคราะห์ข้อมูลการขาย'
  },
  'Customer Support Agent': {
    level: 4,
    permissions: ['orders', 'customers', 'support'],
    description: 'ตอบคำถามลูกค้า, จัดการการคืน/เปลี่ยนสินค้า, ยกเลิกคำสั่งซื้อ'
  },
  'Finance Analyst': {
    level: 5,
    permissions: ['finance', 'orders', 'analytics'],
    description: 'ตรวจสอบบัญชี, จัดการการชำระเงิน, กระทบยอด, รายงานการเงิน'
  },
  'Content Creator': {
    level: 3,
    permissions: ['products', 'content'],
    description: 'สร้างคำอธิบายสินค้า, รูปภาพ/วิดีโอ, จัดการเนื้อหาบล็อก'
  },
  'Developer (Junior)': {
    level: 4,
    permissions: ['system', 'analytics'],
    description: 'แก้ไขบั๊กพื้นฐาน, ดูแลการอัปเดตฟีเจอร์เล็กน้อย'
  },
  'Data Entry Clerk': {
    level: 2,
    permissions: ['products', 'customers'],
    description: 'ป้อนข้อมูลสินค้าใหม่, อัปเดตข้อมูลลูกค้า, บันทึกคำสั่งซื้อ'
  },
  'Logistics Coordinator': {
    level: 4,
    permissions: ['orders', 'shipping'],
    description: 'ติดตามสถานะจัดส่ง, ประสานงานบริษัทขนส่ง, จัดการเอกสารขนส่ง'
  }
};

// Admin schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  masterID: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{6}$/.test(v);
      },
      message: 'Master ID must be exactly 6 characters (letters and numbers only)'
    }
  },
  phoneNumber: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: Object.keys(ROLES),
    default: "Data Entry Clerk"
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  lastLogin: { type: Date },
  permissions: [{
    type: String,
    enum: ['all', 'products', 'orders', 'inventory', 'promotions', 'analytics', 'customers', 'support', 'finance', 'content', 'system', 'shipping', 'users']
  }]
}, { timestamps: true });

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // Validate password strength
    const validation = validatePassword(this.password);
    if (!validation.isValid) {
      const error = new Error(validation.message);
      error.name = 'ValidationError';
      return next(error);
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Set permissions based on role before saving
adminSchema.pre("save", function(next) {
  if (this.isModified("role")) {
    const roleData = ROLES[this.role];
    if (roleData) {
      this.permissions = roleData.permissions;
    }
  }
  next();
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check permissions
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes('all') || this.permissions.includes(permission);
};

// Instance method to get role level
adminSchema.methods.getRoleLevel = function() {
  return ROLES[this.role]?.level || 0;
};

// Instance method to can manage user (check if current admin can manage target admin)
adminSchema.methods.canManage = function(targetAdmin) {
  const currentLevel = this.getRoleLevel();
  const targetLevel = ROLES[targetAdmin.role]?.level || 0;
  return currentLevel >= targetLevel && this.hasPermission('all');
};

// Static method to find by email
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by Master ID
adminSchema.statics.findByMasterID = function(masterID) {
  return this.findOne({ masterID: masterID.toUpperCase() });
};

// Export ROLES for use in other files
adminSchema.statics.ROLES = ROLES;

export default mongoose.model("Admin", adminSchema);