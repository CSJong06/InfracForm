import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';
import User from '../lib/models/User.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function createAdminUser() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB!');

    const adminUser = {
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    };

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create new admin user
    const user = await User.create(adminUser);
    console.log('Admin user created successfully:', user.email);
    
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  }
}

createAdminUser(); 