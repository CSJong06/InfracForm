import mongoose from 'mongoose'; // Import Mongoose ODM for MongoDB interactions

const MONGODB_URI = process.env.MONGODB_URI; // Get MongoDB connection string from environment variables

if (!MONGODB_URI) { // Check if MongoDB URI is not provided
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local'); // Throw error if URI is missing
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose; // Get cached connection from global scope

if (!cached) { // Check if no cached connection exists
  cached = global.mongoose = { conn: null, promise: null }; // Initialize cache object with null values
}

async function connectDB() { // Define async function to establish database connection
  if (cached.conn) { // Check if connection already exists in cache
    return cached.conn; // Return existing connection to avoid reconnection
  }

  if (!cached.promise) { // Check if no connection promise exists
    const opts = { // Define connection options object
      bufferCommands: false, // Disable command buffering for immediate execution
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => { // Create connection promise with options
      return mongoose; // Return mongoose instance when connected
    });
  }

  try { // Wrap connection attempt in try-catch
    cached.conn = await cached.promise; // Wait for connection promise to resolve and store result
  } catch (e) { // Catch any connection errors
    cached.promise = null; // Reset promise to null on error
    throw e; // Re-throw the error for handling by caller
  }

  return cached.conn; // Return the established connection
}

export default connectDB; // Export the connection function as default 