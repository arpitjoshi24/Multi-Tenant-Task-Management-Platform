import express from 'express';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get current organization
router.get('/current', async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organizationId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Server error while fetching organization' });
  }
});

// Update organization (admin only)
router.put('/current', isAdmin, async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    
    const organization = await Organization.findById(req.user.organizationId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Update fields
    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (settings) organization.settings = { ...organization.settings, ...settings };
    
    const updatedOrganization = await organization.save();
    
    res.json(updatedOrganization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Server error while updating organization' });
  }
});

// Get organization members
router.get('/members', async (req, res) => {
  try {
    const members = await User.find({ organizationId: req.user.organizationId })
                            .select('-password')
                            .sort({ createdAt: -1 });
    
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Server error while fetching members' });
  }
});

// Update member role (admin only)
router.patch('/members/:userId/role', isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;
    
    // Validate role
    if (!['admin', 'manager', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findOne({
      _id: userId,
      organizationId: req.user.organizationId
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update role
    user.role = role;
    const updatedUser = await user.save();
    
    // Remove sensitive data
    const userResponse = updatedUser.toJSON();
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Server error while updating member role' });
  }
});

// Remove member from organization (admin only)
router.delete('/members/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent removing yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot remove yourself from the organization' 
      });
    }
    
    const result = await User.deleteOne({
      _id: userId,
      organizationId: req.user.organizationId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Server error while removing member' });
  }
});

// Get organization statistics (admin/manager only)
router.get('/statistics', async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organizationId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    const [memberCount, invitationCount] = await Promise.all([
      User.countDocuments({ organizationId: req.user.organizationId }),
      Invitation.countDocuments({ 
        organizationId: req.user.organizationId,
        status: 'pending'
      }),
    ]);
    
    res.json({
      memberCount,
      pendingInvitations: invitationCount,
      // Add more statistics as needed
    });
  } catch (error) {
    console.error('Error fetching organization statistics:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

export default router;