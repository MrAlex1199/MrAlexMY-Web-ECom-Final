import mongoose from 'mongoose';

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock_remaining: { type: Number, required: true },
  stock_reserved: { type: Number, default: 0 },
  href: { type: String },
  imageSrc: { type: String, required: true },
  imageAlt: { type: String },
  breadcrumbs: { type: String },
  images: [{ src: String, alt: String }],
  description: { type: String },
  colors: [{ name: String, class: String, selectedClass: String }],
  sizes: [{ name: String, inStock: Boolean }],
  highlights: [String],
  details: String,
  discount: { type: Number, default: 0 },
  reviewsAvg: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  reviewsHref: { type: String, default: "#" },
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      comment: { type: String, required: true },
      reviewImg: [{ type: String }],
      rating: { type: Number, default: 0 },
      date: { type: Date, default: Date.now },
    },
  ],
  stock_history: [
    {
      action: { type: String, enum: ['deducted', 'refunded', 'reserved', 'unreserved'], required: true },
      quantity: { type: Number, required: true },
      orderId: { type: String },
      reason: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// Index for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ stock_remaining: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for available stock
productSchema.virtual('availableStock').get(function() {
  return this.stock_remaining - this.stock_reserved;
});

// Instance method to check if product is in stock
productSchema.methods.isInStock = function(quantity = 1) {
  return this.availableStock >= quantity;
};

// Instance method to calculate discounted price
productSchema.methods.getDiscountedPrice = function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({
    breadcrumbs: new RegExp(category, 'i')
  });
};

// Static method to find products in stock
productSchema.statics.findInStock = function() {
  return this.find({
    $expr: { $gt: ['$stock_remaining', '$stock_reserved'] }
  });
};

export default mongoose.model("Product", productSchema);