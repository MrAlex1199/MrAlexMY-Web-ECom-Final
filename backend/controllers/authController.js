import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';
import { User, Admin } from '../models/index.js';

// User Registration
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, fname, lname } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const user = new User({ email: email.toLowerCase(), password, fname, lname });
    await user.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(chalk.red('Registration error:', error));
    next(error);
  }
};

// User Login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Use the comparePassword method from the User model
    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const userPayload = { id: existingUser._id, email: existingUser.email };
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: existingUser._id,
        fname: existingUser.fname,
        lname: existingUser.lname,
        email: existingUser.email,
      }
    });
  } catch (error) {
    console.error(chalk.red('Login error:', error));
    next(error);
  }
};

// Admin Registration
export const registerAdmin = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, masterID, phoneNumber, role } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({ success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    // Check if Master ID already exists
    const existingMasterID = await Admin.findOne({ masterID: masterID.toUpperCase() });
    if (existingMasterID) {
      return res.status(409).json({ success: false, message: "Master ID นี้ถูกใช้งานแล้ว" });
    }

    // For role-based registration, check if current user has permission (except for first admin)
    const adminCount = await Admin.countDocuments();
    let createdBy = null;

    if (adminCount > 0) {
      // If not the first admin, check permissions
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: "ต้องเข้าสู่ระบบเพื่อสร้างแอดมินใหม่" });
      }

      const currentAdmin = await Admin.findById(req.user.id);
      if (!currentAdmin || !currentAdmin.hasPermission('all')) {
        return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ในการสร้างแอดมินใหม่" });
      }

      // Check if current admin can create this role level
      const targetRoleLevel = Admin.ROLES[role]?.level || 0;
      const currentRoleLevel = currentAdmin.getRoleLevel();
      
      if (currentRoleLevel < targetRoleLevel) {
        return res.status(403).json({ success: false, message: "คุณไม่สามารถสร้างแอดมินที่มีระดับสูงกว่าคุณได้" });
      }

      createdBy = currentAdmin._id;
    }

    const admin = new Admin({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      masterID: masterID.toUpperCase(),
      phoneNumber,
      role: role || 'Data Entry Clerk',
      createdBy
    });

    await admin.save();

    res.status(201).json({ 
      success: true, 
      message: "สร้างแอดมินสำเร็จ",
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        masterID: admin.masterID,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error(chalk.red('Admin registration error:', error));
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// Admin Login
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Try to find admin by email first, then by Master ID
    let existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!existingAdmin) {
      // If not found by email, try Master ID
      existingAdmin = await Admin.findOne({ masterID: email.toUpperCase() });
    }

    if (!existingAdmin) {
      return res.status(401).json({ success: false, message: "อีเมลหรือ Master ID ไม่ถูกต้อง" });
    }

    // Check if admin is active
    if (!existingAdmin.isActive) {
      return res.status(401).json({ success: false, message: "บัญชีถูกระงับการใช้งาน" });
    }

    const isMatch = await existingAdmin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
    }

    // Update last login
    existingAdmin.lastLogin = new Date();
    await existingAdmin.save();

    const adminPayload = { 
      id: existingAdmin._id, 
      email: existingAdmin.email, 
      role: existingAdmin.role,
      masterID: existingAdmin.masterID,
      permissions: existingAdmin.permissions
    };
    const token = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      admin: {
        id: existingAdmin._id,
        email: existingAdmin.email,
        firstName: existingAdmin.firstName,
        lastName: existingAdmin.lastName,
        masterID: existingAdmin.masterID,
        role: existingAdmin.role,
        permissions: existingAdmin.permissions,
        roleLevel: existingAdmin.getRoleLevel()
      }
    });
  } catch (error) {
    console.error(chalk.red('Admin login error:', error));
    next(error);
  }
};

// Get User Data
export const getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      userId: user._id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      address: user.address,
    });
  } catch (error) {
    console.error(chalk.red('Get user data error:', error));
    next(error);
  }
};

// Get Admin Data
export const getAdminData = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลแอดมิน" });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        masterID: admin.masterID,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
        permissions: admin.permissions,
        roleLevel: admin.getRoleLevel(),
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error(chalk.red('Get admin data error:', error));
    next(error);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Use the comparePassword method from the User model
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" 
      });
    }

    // Set new password - hashing will be handled by pre-save hook
    user.password = newPassword;
    await user.save();

    console.log(chalk.green(`Password changed successfully for user: ${user.email}`));

    res.status(200).json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จ",
    });
  } catch (error) {
    console.error(chalk.red('Change password error:', error));
    
    // Handle validation errors from the User model
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};

// Logout endpoints
export const logoutUser = (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const logoutAdmin = (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Request Password Reset
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        success: true, 
        message: "หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้" 
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real application, you would send this via email
    // For now, we'll just return it (for development/testing)
    console.log(chalk.yellow(`Password reset token for ${email}: ${resetToken}`));
    
    res.status(200).json({
      success: true,
      message: "หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้",
      // Remove this in production - only for development
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error(chalk.red('Password reset request error:', error));
    next(error);
  }
};

// Reset Password with Token
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Token และรหัสผ่านใหม่จำเป็นต้องระบุ" 
      });
    }

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ 
        success: false, 
        message: "Token ไม่ถูกต้อง" 
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "ไม่พบผู้ใช้" 
      });
    }

    // Update password
    user.password = newPassword; // Hashing handled by pre-save hook
    await user.save();

    res.status(200).json({
      success: true,
      message: "รีเซ็ตรหัสผ่านสำเร็จ"
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false, 
        message: "Token ไม่ถูกต้องหรือหมดอายุ" 
      });
    }
    console.error(chalk.red('Password reset error:', error));
    next(error);
  }
};

// Change Email
export const changeEmail = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" 
      });
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(409).json({ 
        success: false, 
        message: "อีเมลนี้ถูกใช้งานแล้ว" 
      });
    }

    user.email = newEmail.toLowerCase();
    await user.save();

    res.status(200).json({
      success: true,
      message: "เปลี่ยนอีเมลสำเร็จ",
      newEmail: user.email
    });
  } catch (error) {
    console.error(chalk.red('Change email error:', error));
    next(error);
  }
};

// Delete Account
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    // Verify password before deletion
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "รหัสผ่านไม่ถูกต้อง" 
      });
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "ลบบัญชีสำเร็จ"
    });
  } catch (error) {
    console.error(chalk.red('Delete account error:', error));
    next(error);
  }
};

// Create Master Admin (for initial setup)
export const createMasterAdmin = async (req, res, next) => {
  try {
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ success: false, message: "Master Admin already exists" });
    }

    // Create the master admin with predefined credentials
    const masterAdmin = new Admin({
      email: 'erogun@admin.com',
      password: 'ErogunMaster123',
      firstName: 'EROGUN',
      lastName: 'MASTER',
      masterID: 'EROGUN',
      phoneNumber: '+66999999999',
      role: 'Admin (Owner Master ID)',
      isActive: true
    });

    await masterAdmin.save();

    res.status(201).json({ 
      success: true, 
      message: "Master Admin created successfully",
      admin: {
        masterID: masterAdmin.masterID,
        email: masterAdmin.email,
        role: masterAdmin.role
      }
    });
  } catch (error) {
    console.error(chalk.red('Create master admin error:', error));
    next(error);
  }
};

// Get all roles (for frontend dropdown)
export const getRoles = async (req, res, next) => {
  try {
    const roles = Object.keys(Admin.ROLES).map(role => ({
      value: role,
      label: role,
      description: Admin.ROLES[role].description,
      level: Admin.ROLES[role].level,
      permissions: Admin.ROLES[role].permissions
    }));

    res.status(200).json({
      success: true,
      roles
    });
  } catch (error) {
    console.error(chalk.red('Get roles error:', error));
    next(error);
  }
};