import mongoose from 'mongoose';
import 'dotenv/config';

async function resetAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the admins collection completely
    try {
      await db.collection('admins').drop();
      console.log('Dropped admins collection');
    } catch (error) {
      console.log('Admins collection does not exist or already dropped');
    }

    console.log('✅ Admin collection reset complete!');
    console.log('You can now run: npm run seed-admins');
    
  } catch (error) {
    console.error('Error resetting admins:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

resetAdmins();