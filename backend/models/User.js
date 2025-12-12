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

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  password: { type: String, required: true },
  selectedProducts: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
      selectedColor: { type: String, required: true },
      selectedSize: { type: String, required: true },
    },
  ],
  address: [
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      age: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
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

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

export default mongoose.model("User", userSchema);