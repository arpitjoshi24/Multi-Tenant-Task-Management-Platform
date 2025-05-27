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
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  settings: {
    theme: {
      type: String,
      default: 'light',
    },
  },
}, { timestamps: true });

// Index for efficient code lookups
OrganizationSchema.index({ code: 1 });

const Organization = mongoose.model('Organization', OrganizationSchema);

export default Organization;