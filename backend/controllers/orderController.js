import chalk from 'chalk';
import { Order, Product, User } from '../models/index.js';

// Stock management functions (moved from server.js)
async function validateStockAvailability(productSelected) {
  const errors = [];
  for (const item of productSelected) {
    const product = await Product.findById(item.productId);
    if (!product) {
      errors.push({ 
        productId: item.productId, 
        error: "Product not found",
        requested: item.quantity,
        available: 0,
      });
      continue;
    }
    
    if (!item.quantity || item.quantity <= 0) {
      errors.push({
        productId: item.productId,
        productName: product.name,
        requested: item.quantity,
        available: product.stock_remaining,
        error: "Invalid quantity",
      });
      continue;
    }
    
    const availableStock = product.stock_remaining - product.stock_reserved;
    
    if (product.stock_remaining <= 0 || availableStock < item.quantity) {
      errors.push({
        productId: item.productId,
        productName: product.name,
        requested: item.quantity,
        available: Math.max(0, availableStock),
        remaining: product.stock_remaining,
        error: `Insufficient stock for ${product.name}. Available: ${Math.max(0, availableStock)} units`,
      });
    }
  }
  return errors;
}

async function verifyStockBeforeDeduction(productSelected) {
  const errors = [];
  for (const item of productSelected) {
    const product = await Product.findById(item.productId);
    if (!product) {
      errors.push({ 
        productId: item.productId, 
        error: "Product no longer available",
      });
      continue;
    }
    
    if (product.stock_remaining < item.quantity) {
      errors.push({
        productId: item.productId,
        productName: product.name,
        requested: item.quantity,
        available: product.stock_remaining,
        error: `Stock depleted. Only ${product.stock_remaining} remaining.`,
      });
    }
  }
  return errors;
}

async function deductStock(productSelected, orderId) {
  try {
    for (const item of productSelected) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock_remaining: -item.quantity,
            stock_reserved: -item.quantity,
          },
          $push: {
            stock_history: {
              action: "deducted",
              quantity: item.quantity,
              orderId: orderId,
              reason: "Order confirmed and paid",
            },
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error(chalk.red("Error deducting stock:", error));
    throw error;
  }
}

async function refundStock(productSelected, orderId, reason = "Order refunded") {
  try {
    for (const item of productSelected) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { stock_remaining: item.quantity },
          $push: {
            stock_history: {
              action: "refunded",
              quantity: item.quantity,
              orderId: orderId,
              reason: reason,
            },
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error(chalk.red("Error refunding stock:", error));
    throw error;
  }
}

// Get user orders
export const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate('productSelected.productId', 'name imageSrc').sort({ createdAt: -1 });
    
    if (!orders || orders.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "No orders found for this user",
        orders: []
      });
    }
    
    console.log(chalk.green(`Found ${orders.length} orders for user: ${userId}`));
    
    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      orders: orders
    });
  } catch (error) {
    console.error(chalk.red('Get user orders error:', error));
    next(error);
  }
};

// Create order
export const createOrder = async (req, res, next) => {
  try {
    const {
      userId,
      productSelected,
      shippingAddress,
      payment,
      deliveryPrice = 0,
    } = req.body;

    // Validate required fields
    if (!userId || !shippingAddress || !payment || !productSelected || productSelected.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required order details" 
      });
    }

    // Validate stock availability
    const stockErrors = await validateStockAvailability(productSelected);
    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for one or more items",
        errors: stockErrors,
      });
    }

    // Calculate prices
    let calculatedTotalPrice = 0;
    const finalProductSelected = [];

    for (const item of productSelected) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: `Product with ID ${item.productId} not found` 
        });
      }

      const priceAtPurchase = product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : product.price;

      calculatedTotalPrice += priceAtPurchase * item.quantity;

      finalProductSelected.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: priceAtPurchase,
      });
    }

    const finalTotal = calculatedTotalPrice + deliveryPrice;

    // Generate unique IDs
    const timestamp = Date.now();
    const orderId = `ORD-${timestamp}`;
    const trackingCode = `TRK${timestamp}`;

    // Check for ID collision
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res.status(500).json({ 
        success: false,
        message: "Order ID collision. Please try again." 
      });
    }

    // Final stock verification
    const stockVerifyErrors = await verifyStockBeforeDeduction(productSelected);
    if (stockVerifyErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Stock verification failed. Inventory may have changed.",
        errors: stockVerifyErrors,
      });
    }

    // Create order
    const order = new Order({
      orderId,
      trackingCode,
      userId,
      productSelected: finalProductSelected,
      estDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      from: "Warehouse A",
      to: shippingAddress.country,
      deliveryPrice,
      totalPrice: finalTotal,
      payment,
      shippingAddress,
      lastLocation: "Warehouse A",
      carrier: "FedEx",
      status: "In Transit",
    });

    await order.save();

    try {
      // Final verification before stock deduction
      const finalVerifyErrors = await verifyStockBeforeDeduction(productSelected);
      if (finalVerifyErrors.length > 0) {
        await Order.deleteOne({ orderId });
        return res.status(400).json({
          success: false,
          message: "Order failed: Stock no longer available. Please try again.",
          errors: finalVerifyErrors,
        });
      }

      await deductStock(finalProductSelected, orderId);
    } catch (stockError) {
      console.error(chalk.red("Error deducting stock:", stockError));
      await Order.deleteOne({ orderId });
      return res.status(500).json({
        success: false,
        message: "Error processing inventory. Order cancelled.",
        error: stockError.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Order saved successfully and stock deducted",
      orderId: order.orderId,
      trackingCode: order.trackingCode,
    });

  } catch (error) {
    console.error(chalk.red("Error creating order:", error));
    next(error);
  }
};

// Validate stock
export const validateStock = async (req, res, next) => {
  try {
    const { productSelected } = req.body;

    if (!productSelected || productSelected.length === 0) {
      return res.status(400).json({ success: false, message: "No products selected" });
    }

    const stockErrors = await validateStockAvailability(productSelected);

    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for some items",
        errors: stockErrors,
      });
    }

    res.status(200).json({
      success: true,
      message: "All items are in stock",
    });
  } catch (error) {
    console.error(chalk.red("Error validating stock:", error));
    next(error);
  }
};

// Get admin orders
export const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'fname lname')
      .populate('productSelected.productId', 'imageSrc')
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error(chalk.red('Get admin orders error:', error));
    next(error);
  }
};

// Update order
export const updateOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const updatedOrderData = req.body;

    const order = await Order.findOneAndUpdate({ orderId }, updatedOrderData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order updated successfully", order });
  } catch (error) {
    console.error(chalk.red("Error updating order:", error));
    next(error);
  }
};

// Delete order
export const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOneAndDelete({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Restore stock when order is cancelled
    try {
      await refundStock(order.productSelected, orderId, "Order deleted/cancelled");
    } catch (stockError) {
      console.error(chalk.red("Error refunding stock during order deletion:", stockError));
    }

    res.status(200).json({ success: true, message: "Order deleted successfully and stock restored" });
  } catch (error) {
    console.error(chalk.red("Error deleting order:", error));
    next(error);
  }
};

// Cancel order
export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only allow cancellation of orders that are not yet shipped
    if (order.status === "Delivered" || order.status === "Shipped") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Restore stock
    try {
      await refundStock(order.productSelected, orderId, "Order cancelled by customer");
    } catch (stockError) {
      console.error(chalk.red("Error refunding stock during order cancellation:", stockError));
      return res.status(500).json({
        success: false,
        message: "Error processing stock refund",
      });
    }

    // Update order status
    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully and stock restored",
    });
  } catch (error) {
    console.error(chalk.red("Error cancelling order:", error));
    next(error);
  }
};