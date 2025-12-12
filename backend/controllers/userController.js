import chalk from 'chalk';
import { User, Admin } from '../models/index.js';

// Save address
export const saveAddress = async (req, res, next) => {
  try {
    const { userId, ...addressDetails } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.address.push(addressDetails);
    await user.save();

    res.status(201).json({ 
      success: true, 
      message: "Address saved successfully", 
      address: user.address 
    });
  } catch (error) {
    console.error(chalk.red('Save address error:', error));
    next(error);
  }
};

// Update address
export const updateAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;
    const updatedAddress = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addressIndex = user.address.findIndex((addr) => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    user.address[addressIndex] = { ...user.address[addressIndex]._doc, ...updatedAddress };
    await user.save();

    res.status(200).json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.error(chalk.red('Update address error:', error));
    next(error);
  }
};

// Delete address
export const deleteAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.address.pull({ _id: addressId });
    await user.save();
    
    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error(chalk.red('Delete address error:', error));
    next(error);
  }
};

// Delete account
export const deleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Optionally, delete related data like orders
    // await Order.deleteMany({ userId: userId });
    
    res.status(200).json({ success: true, message: "User account deleted successfully" });
  } catch (error) {
    console.error(chalk.red('Delete account error:', error));
    next(error);
  }
};

// Get all users (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password'); // Exclude passwords
    res.status(200).json(users);
  } catch (error) {
    console.error(chalk.red('Get users error:', error));
    next(error);
  }
};

// Get all admins (Admin only)
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find({}, '-password'); // Exclude passwords
    res.status(200).json(admins);
  } catch (error) {
    console.error(chalk.red('Get admins error:', error));
    next(error);
  }
};