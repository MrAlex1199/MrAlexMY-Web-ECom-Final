import chalk from 'chalk';
import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Product } from '../models/index.js';

// Get all products with pagination
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments();
    const totalPages = Math.ceil(total / limit);

    // For backward compatibility, return products array directly if no pagination requested
    if (!req.query.page && !req.query.limit) {
      const allProducts = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json(allProducts);
    }

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error(chalk.red('Get products error:', error));
    next(error);
  }
};

// Get single product
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(chalk.red('Get product error:', error));
    next(error);
  }
};

// Create product
export const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    // Invalidate product-related cache
    const { invalidateCache } = await import('../middleware/cache.js');
    invalidateCache('/api/products');
    
    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    console.error(chalk.red('Create product error:', error));
    next(error);
  }
};

// Update product
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    // Invalidate product-related cache
    const { invalidateCache } = await import('../middleware/cache.js');
    invalidateCache('/api/products');
    
    res.status(200).json({ 
      success: true, 
      message: "Product updated successfully", 
      product: updatedProduct 
    });
  } catch (error) {
    console.error(chalk.red('Update product error:', error));
    next(error);
  }
};

// Delete product
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "ไม่พบสินค้าที่ต้องการลบ" });
    }
    
    // Invalidate product-related cache
    const { invalidateCache } = await import('../middleware/cache.js');
    invalidateCache('/api/products');
    
    res.status(200).json({ 
      success: true, 
      message: "ลบสินค้าสำเร็จ",
      deletedProduct: {
        id: deletedProduct._id,
        name: deletedProduct.name
      }
    });
  } catch (error) {
    console.error(chalk.red('Delete product error:', error));
    next(error);
  }
};

// Add discount
export const addDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { discount } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    product.discount = discount;
    await product.save();
    
    // Invalidate product-related cache
    const { invalidateCache } = await import('../middleware/cache.js');
    invalidateCache('/api/products');
    
    res.status(200).json({ success: true, message: "Discount added successfully", product });
  } catch (error) {
    console.error(chalk.red('Add discount error:', error));
    next(error);
  }
};

// Remove discount
export const removeDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    product.discount = 0;
    await product.save();
    
    // Invalidate product-related cache
    const { invalidateCache } = await import('../middleware/cache.js');
    invalidateCache('/api/products');
    
    res.status(200).json({ success: true, message: "Discount removed successfully", product });
  } catch (error) {
    console.error(chalk.red('Remove discount error:', error));
    next(error);
  }
};

// Add comment
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, name, comment, reviewImg, rating } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate userId if provided
    let validUserId = null;
    if (userId && userId.trim() !== "" && mongoose.Types.ObjectId.isValid(userId)) {
      validUserId = userId;
    }

    const newComment = {
      userId: validUserId,
      name: name || "Anonymous",
      comment,
      reviewImg: Array.isArray(reviewImg) ? reviewImg : [],
      rating: rating || 0,
      date: new Date(),
    };

    product.comments.push(newComment);
    await product.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error(chalk.red('Add comment error:', error));
    next(error);
  }
};

// Delete comment
export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    product.comments.pull({ _id: commentId });
    await product.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(chalk.red('Delete comment error:', error));
    next(error);
  }
};

// Get stock levels
export const getStockLevels = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!productIds || productIds.length === 0) {
      return res.status(400).json({ success: false, message: "No product IDs provided" });
    }

    const products = await Product.find({
      '_id': { $in: productIds }
    });

    const stockLevels = products.reduce((acc, product) => {
      acc[product._id.toString()] = product.stock_remaining;
      return acc;
    }, {});

    res.status(200).json({ success: true, stockLevels });
  } catch (error) {
    console.error(chalk.red('Get stock levels error:', error));
    next(error);
  }
};

// Get stock history
export const getStockHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select("name stock_remaining stock_reserved stock_history");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      productId: product._id,
      productName: product.name,
      currentStock: product.stock_remaining,
      reservedStock: product.stock_reserved,
      availableStock: product.stock_remaining - product.stock_reserved,
      history: product.stock_history.sort((a, b) => b.timestamp - a.timestamp),
    });
  } catch (error) {
    console.error(chalk.red('Get stock history error:', error));
    next(error);
  }
};

// Upload images to Cloudinary
export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ecom-products",
          resource_type: "auto",
        });
        uploadedUrls.push(result.secure_url);
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(chalk.red("Error uploading to Cloudinary:", error));
        fs.unlinkSync(file.path);
        throw error;
      }
    }

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error(chalk.red('Upload images error:', error));
    next(error);
  }
};

// Upload CSV products
export const uploadCSVProducts = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = req.file.path;

  try {
    const products = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          if (!row.name || !row.price || !row.stock_remaining || !row.imageSrc) {
            console.warn(chalk.yellow("Skipping row due to missing required fields:", row));
            return;
          }
          try {
            const product = {
              name: row.name,
              price: parseFloat(row.price.replace("$", "")),
              stock_remaining: parseInt(row.stock_remaining),
              href: row.href || "",
              imageSrc: row.imageSrc,
              imageAlt: row.imageAlt || "",
              breadcrumbs: row.breadcrumbs || "",
              images: row.images ? row.images.split(" | ").map((image) => {
                const [src, alt] = image.split(" > ");
                if (!src || !alt) throw new Error("Invalid image format");
                return { src, alt };
              }) : [],
              colors: row.colors ? row.colors.split(" | ").map((color) => {
                const [name, classStr, selectedClass] = color.split(" > ");
                if (!name || !classStr || !selectedClass) throw new Error("Invalid color format");
                return { name, class: classStr, selectedClass };
              }) : [],
              sizes: row.sizes ? row.sizes.split(" | ").map((size) => {
                const [name, inStock] = size.split(" > ");
                if (!name || !inStock) throw new Error("Invalid size format");
                return { name, inStock: inStock === "true" };
              }) : [],
              description: row.description || "",
              highlights: row.highlights ? row.highlights.split(" | ") : [],
              details: row.details || "",
              discount: row.discount ? parseInt(row.discount) : 0,
              reviewsAvg: row.reviewsAverage || 0,
              reviewsCount: row.reviewsTotal || 0,
              reviewsHref: row.reviewLink || "#",
            };
            if (isNaN(product.price) || isNaN(product.stock_remaining) || isNaN(product.discount)) {
              throw new Error("Invalid numeric value");
            }
            products.push(product);
          } catch (error) {
            console.warn(chalk.yellow(`Skipping row due to parsing error: ${error.message}`), row);
          }
        })
        .on("end", () => resolve())
        .on("error", (error) => reject(error));
    });

    if (products.length === 0) {
      return res.status(400).json({ message: "No valid products found in CSV" });
    }

    await Product.insertMany(products, { ordered: false });
    res.status(200).json({ message: `${products.length} products added successfully!` });
  } catch (error) {
    console.error(chalk.red('Upload CSV error:', error));
    next(error);
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.error(chalk.red("Error deleting file:", cleanupError));
    }
  }
};