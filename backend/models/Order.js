import mongoose from 'mongoose';

// Order schema
const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productSelected: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  estDelivery: { type: Date, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  payment: { type: String, required: true },
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  trackingCode: { type: String, required: true },
  lastLocation: { type: String, required: true },
  carrier: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    default: 'In Transit',
    enum: ['In Transit', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']
  },
}, { timestamps: true });

// Index for better performance
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Virtual for full name
OrderSchema.virtual('customerName').get(function() {
  return `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`;
});

// Instance method to check if order can be cancelled
OrderSchema.methods.canBeCancelled = function() {
  return ['In Transit', 'Processing'].includes(this.status);
};

// Instance method to calculate total items
OrderSchema.methods.getTotalItems = function() {
  return this.productSelected.reduce((total, item) => total + item.quantity, 0);
};

// Static method to find orders by status
OrderSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find recent orders
OrderSchema.statics.findRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'fname lname email')
    .populate('productSelected.productId', 'name imageSrc');
};

export default mongoose.model("Order", OrderSchema);