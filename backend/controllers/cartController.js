import chalk from 'chalk';
import mongoose from 'mongoose';
import { User, Product } from '../models/index.js';

// Get cart items
export const getCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('selectedProducts.productId');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.status(200).json({ success: true, selectedProducts: user.selectedProducts });
  } catch (error) {
    console.error(chalk.red('Get cart error:', error));
    next(error);
  }
};

// Add item to cart
export const addToCart = async (req, res, next) => {
  try {
    const { userId, productId, selectedColor, selectedSize, quantity = 1 } = req.body;

    // Validate userId
    if (!userId || userId.trim() === "") {
      return res.status(401).json({ 
        success: false, 
        message: "กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าในตะกร้า",
        requiresAuth: true 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "รูปแบบ User ID ไม่ถูกต้อง",
        requiresAuth: true 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if product is in stock
    if (!product.isInStock(quantity)) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Only ${product.availableStock} items available` 
      });
    }

    const existingProductIndex = user.selectedProducts.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.selectedColor === selectedColor &&
        p.selectedSize === selectedSize
    );

    if (existingProductIndex > -1) {
      const newQuantity = user.selectedProducts[existingProductIndex].quantity + quantity;
      
      // Check stock for new quantity
      if (!product.isInStock(newQuantity)) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot add ${quantity} more items. Only ${product.availableStock} items available` 
        });
      }
      
      user.selectedProducts[existingProductIndex].quantity = newQuantity;
    } else {
      user.selectedProducts.push({
        productId,
        selectedColor,
        selectedSize,
        quantity,
      });
    }

    await user.save();
    const populatedUser = await User.findById(userId).populate('selectedProducts.productId');

    res.status(201).json({ 
      success: true, 
      message: "Product added to cart successfully",
      selectedProducts: populatedUser.selectedProducts
    });
  } catch (error) {
    console.error(chalk.red('Add to cart error:', error));
    next(error);
  }
};

// Update cart item quantity
export const updateCartQuantity = async (req, res, next) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const productIndex = user.selectedProducts.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    // Check stock availability
    const product = await Product.findById(productId);
    if (product && !product.isInStock(quantity)) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Only ${product.availableStock} items available` 
      });
    }

    user.selectedProducts[productIndex].quantity = quantity;
    await user.save();

    const populatedUser = await User.findById(userId).populate('selectedProducts.productId');

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      selectedProducts: populatedUser.selectedProducts,
    });
  } catch (error) {
    console.error(chalk.red('Update cart quantity error:', error));
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const { userId, productId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.selectedProducts.pull({ productId: productId });
    await user.save();
    
    const populatedUser = await User.findById(userId).populate('selectedProducts.productId');

    res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      selectedProducts: populatedUser.selectedProducts,
    });
  } catch (error) {
    console.error(chalk.red('Remove from cart error:', error));
    next(error);
  }
};

// Clear entire cart
export const clearCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.selectedProducts = [];
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: "Cart cleared successfully" 
    });
  } catch (error) {
    console.error(chalk.red('Clear cart error:', error));
    next(error);
  }
};