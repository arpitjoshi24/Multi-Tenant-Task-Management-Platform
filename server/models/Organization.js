import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // Add any additional fields for organization settings
  settings: {
    theme: {
      type: String,
      default: 'light',
    },
    // Add more settings as needed
  },
}, { timestamps: true });

const Organization = mongoose.model('Organization', OrganizationSchema);

export default Organization;