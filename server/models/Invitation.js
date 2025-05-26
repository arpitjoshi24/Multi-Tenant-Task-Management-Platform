import mongoose from 'mongoose';
import crypto from 'crypto';

const InvitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'member'],
    default: 'member',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending',
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default expiry: 7 days from now
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}, { timestamps: true });

// Generate a unique token before saving
InvitationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Indexes for efficient queries
InvitationSchema.index({ token: 1 });
InvitationSchema.index({ email: 1, organizationId: 1 }, { unique: true });
InvitationSchema.index({ expiresAt: 1 });

const Invitation = mongoose.model('Invitation', InvitationSchema);

export default Invitation;