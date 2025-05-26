import express from 'express';
import Invitation from '../models/Invitation.js';
import { authenticate, isAdmin, isManagerOrAdmin } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get pending invitations for the organization
router.get('/pending', isManagerOrAdmin, async (req, res) => {
  try {
    const invitations = await Invitation.find({
      organizationId: req.user.organizationId,
      status: 'pending',
    }).sort({ createdAt: -1 });
    
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    res.status(500).json({ message: 'Server error while fetching invitations' });
  }
});

// Create new invitation
router.post('/', isManagerOrAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // Check if user is already invited
    const existingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      organizationId: req.user.organizationId,
      status: 'pending',
    });
    
    if (existingInvitation) {
      return res.status(400).json({ 
        message: 'An invitation has already been sent to this email' 
      });
    }
    
    // Create new invitation
    const invitation = new Invitation({
      email: email.toLowerCase(),
      role,
      organizationId: req.user.organizationId,
    });
    
    const savedInvitation = await invitation.save();
    
    // Send invitation email
    // Note: Configure email settings in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const transporter = nodemailer.createTransport({
          // Configure your email service
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        
        const inviteUrl = `${process.env.FRONTEND_URL}/register?token=${savedInvitation.token}`;
        
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: 'Invitation to join organization',
          html: `
            <h1>You've been invited!</h1>
            <p>You've been invited to join an organization on our platform.</p>
            <p>Click the link below to accept the invitation:</p>
            <a href="${inviteUrl}">${inviteUrl}</a>
            <p>This invitation will expire in 7 days.</p>
          `,
        });
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.status(201).json(savedInvitation);
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ message: 'Server error while creating invitation' });
  }
});

// Validate invitation token (public route)
router.get('/validate/:token', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).populate('organizationId', 'name');
    
    if (!invitation) {
      return res.json({ valid: false });
    }
    
    res.json({
      valid: true,
      organization: {
        id: invitation.organizationId._id,
        name: invitation.organizationId.name,
      },
      role: invitation.role,
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    res.status(500).json({ message: 'Server error while validating invitation' });
  }
});

// Cancel invitation
router.delete('/:id', isManagerOrAdmin, async (req, res) => {
  try {
    const result = await Invitation.deleteOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
      status: 'pending',
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({ message: 'Server error while cancelling invitation' });
  }
});

// Resend invitation
router.post('/:id/resend', isManagerOrAdmin, async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
      status: 'pending',
    });
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    // Update expiry date
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await invitation.save();
    
    // Resend email in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const transporter = nodemailer.createTransport({
          // Configure your email service
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        
        const inviteUrl = `${process.env.FRONTEND_URL}/register?token=${invitation.token}`;
        
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: invitation.email,
          subject: 'Invitation to join organization (Resent)',
          html: `
            <h1>You've been invited!</h1>
            <p>You've been invited to join an organization on our platform.</p>
            <p>Click the link below to accept the invitation:</p>
            <a href="${inviteUrl}">${inviteUrl}</a>
            <p>This invitation will expire in 7 days.</p>
          `,
        });
      } catch (emailError) {
        console.error('Error resending invitation email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.json({ message: 'Invitation resent successfully' });
  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ message: 'Server error while resending invitation' });
  }
});

export default router;