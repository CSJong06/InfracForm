import mongoose from 'mongoose'; // Import Mongoose for schema and model creation
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing

const userSchema = new mongoose.Schema({ // Define the structure of a user document
  email: { // Field for user's email address
    type: String, // Store as a string
    required: true, // Must be provided
    unique: true, // Must be unique in the collection
    trim: true, // Remove whitespace from both ends
    lowercase: true // Convert to lowercase before saving
  },
  password: { // Field for user's hashed password
    type: String, // Store as a string
    required: true // Must be provided
  },
  isAdmin: { // Field to determine if user has admin privileges
    type: Boolean, // Store as a boolean
    default: false // Default to false (regular user)
  },
  firstName: { // Field for user's first name
    type: String, // Store as a string
    required: true, // Must be provided
    trim: true // Remove whitespace from both ends
  },
  lastName: { // Field for user's last name
    type: String, // Store as a string
    required: true, // Must be provided
    trim: true // Remove whitespace from both ends
  },
  isActive: { // Field to determine if user account is active
    type: Boolean, // Store as a boolean
    default: true // Default to true (active account)
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Hash password before saving
userSchema.pre('save', async function(next) { // Middleware to run before saving a user document
  if (!this.isModified('password')) return next(); // Skip hashing if password hasn't changed
  
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
    next(); // Continue to the next middleware or save operation
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) { // Instance method to verify password
  return bcrypt.compare(candidatePassword, this.password); // Compare candidate password with stored hash
};

const User = mongoose.models.User || mongoose.model('User', userSchema); // Create or retrieve User model

export default User; // Export the User model as default 