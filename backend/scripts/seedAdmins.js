import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import 'dotenv/config';

const testAdmins = [
  {
    email: 'erogun@admin.com',
    password: 'ErogunMaster123',
    firstName: 'EROGUN',
    lastName: 'MASTER',
    masterID: 'EROGUN',
    phoneNumber: '+66999999999',
    role: 'Admin (Owner Master ID)'
  },
  {
    email: 'ed3m1a@seller.com',
    password: 'Seller123456',
    firstName: 'ED3M1A',
    lastName: 'SELLER',
    masterID: 'ED3M1A',
    phoneNumber: '+66888888888',
    role: 'Seller'
  },
  {
    email: 'eumkgt@warehouse.com',
    password: 'Warehouse123',
    firstName: 'EUMKGT',
    lastName: 'MANAGER',
    masterID: 'EUMKGT',
    phoneNumber: '+66777777777',
    role: 'Warehouse Manager'
  },
  {
    email: 'e4cep3@marketing.com',
    password: 'Marketing123',
    firstName: 'E4CEP3',
    lastName: 'SPECIALIST',
    masterID: 'E4CEP3',
    phoneNumber: '+66666666666',
    role: 'Marketing Specialist'
  },
  {
    email: 'e9m0ea@support.com',
    password: 'Support123456',
    firstName: 'E9M0EA',
    lastName: 'AGENT',
    masterID: 'E9M0EA',
    phoneNumber: '+66555555555',
    role: 'Customer Support Agent'
  },
  {
    email: 'exnin8@finance.com',
    password: 'Finance123456',
    firstName: 'EXNIN8',
    lastName: 'ANALYST',
    masterID: 'EXNIN8',
    phoneNumber: '+66444444444',
    role: 'Finance Analyst'
  },
  {
    email: 'eq8id2@content.com',
    password: 'Content123456',
    firstName: 'EQ8ID2',
    lastName: 'CREATOR',
    masterID: 'EQ8ID2',
    phoneNumber: '+66333333333',
    role: 'Content Creator'
  },
  {
    email: 'e29nxo@dev.com',
    password: 'Developer123',
    firstName: 'E29NXO',
    lastName: 'JUNIOR',
    masterID: 'E29NXO',
    phoneNumber: '+66222222222',
    role: 'Developer (Junior)'
  },
  {
    email: 'ejvlo6@data.com',
    password: 'DataEntry123',
    firstName: 'EJVLO6',
    lastName: 'CLERK',
    masterID: 'EJVLO6',
    phoneNumber: '+66111111111',
    role: 'Data Entry Clerk'
  },
  {
    email: 'eixe86@logistics.com',
    password: 'Logistics123',
    firstName: 'EIXE86',
    lastName: 'COORDINATOR',
    masterID: 'EIXE86',
    phoneNumber: '+66000000000',
    role: 'Logistics Coordinator'
  }
];

async function seedAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing admins
    await Admin.deleteMany({});
    console.log('Cleared existing admins');

    // Create test admins
    for (const adminData of testAdmins) {
      const admin = new Admin(adminData);
      await admin.save();
      console.log(`Created admin: ${admin.masterID} (${admin.role})`);
    }

    console.log('✅ All test admins created successfully!');
    console.log('\n📋 Test Admin Accounts:');
    console.log('='.repeat(80));
    
    testAdmins.forEach(admin => {
      console.log(`Master ID: ${admin.masterID.padEnd(8)} | Email: ${admin.email.padEnd(25)} | Role: ${admin.role}`);
    });
    
    console.log('='.repeat(80));
    console.log('🔑 All passwords follow the pattern: [Role]123456 or [MasterID]Master123');
    
  } catch (error) {
    console.error('Error seeding admins:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedAdmins();