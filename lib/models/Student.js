import mongoose from 'mongoose'; // Import Mongoose for schema and model creation

const studentSchema = new mongoose.Schema({ // Define the structure of a student document
  studentId: { // Field for student's unique identifier
    type: String, // Store as a string
    required: true, // Must be provided
    unique: true, // Must be unique in the collection
    minlength: 6, // Must be at least 6 characters
    maxlength: 6 // Must be at most 6 characters
  },
  firstName: { // Field for student's first name
    type: String, // Store as a string
    required: true, // Must be provided
    trim: true // Remove whitespace from both ends
  },
  lastName: { // Field for student's last name
    type: String, // Store as a string
    required: true, // Must be provided
    trim: true // Remove whitespace from both ends
  },
  isActive: { // Field to determine if student record is active
    type: Boolean, // Store as a boolean
    default: true // Default to true (active student)
  },
  createdAt: { // Field for when the student record was created
    type: Date, // Store as a date
    default: Date.now // Default to current timestamp
  },
  updatedAt: { // Field for when the student record was last updated
    type: Date, // Store as a date
    default: Date.now // Default to current timestamp
  }
});

// Update the updatedAt timestamp before saving
studentSchema.pre('save', function(next) { // Middleware to run before saving a student document
  this.updatedAt = Date.now(); // Set updatedAt to current timestamp
  next(); // Continue to the next middleware or save operation
});

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema); // Create or retrieve Student model

export default Student; // Export the Student model as default 