import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Invitation from '../models/Invitation.js';
import { authenticate } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      organizationName, 
      joinExisting, 
      inviteToken,
      organizationCode,
      role 
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    let organizationId;
    let userRole = role;
    
    if (joinExisting) {
      if (inviteToken) {
        // Join via invitation
        const invitation = await Invitation.findOne({ 
          token: inviteToken,
          status: 'pending',
          expiresAt: { $gt: new Date() }
        });
        
        if (!invitation) {
          return res.status(400).json({ message: 'Invalid or expired invitation token' });
        }
        
        if (invitation.email.toLowerCase() !== email.toLowerCase()) {
          return res.status(400).json({ message: 'Invitation was sent to a different email address' });
        }
        
        organizationId = invitation.organizationId;
        userRole = invitation.role;
        
        // Update invitation status
        invitation.status = 'accepted';
        await invitation.save();
      } else if (organizationCode) {
        // Join via organization code
        const organization = await Organization.findOne({ code: organizationCode });
        if (!organization) {
          return res.status(400).json({ message: 'Invalid organization code' });
        }
        organizationId = organization._id;
      } else {
        return res.status(400).json({ 
          message: 'Either provide an organization code or a valid invitation token' 
        });
      }
    } else if (organizationName) {
      // Create a new organization
      const code = crypto.randomBytes(6).toString('hex').toUpperCase();
      const newOrganization = new Organization({
        name: organizationName,
        code,
      });
      
      const savedOrganization = await newOrganization.save();
      organizationId = savedOrganization._id;
      userRole = 'admin'; // First user is always admin
    } else {
      return res.status(400).json({ 
        message: 'Either provide an organization name or join an existing organization' 
      });
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      organizationId,
      role: userRole
    });
    
    const savedUser = await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      organizationId: savedUser.organizationId,
      token,
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Check organization code
router.post('/check-organization-code', async (req, res) => {
  try {
    const { code } = req.body;
    const organization = await Organization.findOne({ code });
    res.json({ valid: !!organization });
  } catch (error) {
    console.error('Error checking organization code:', error);
    res.status(500).json({ message: 'Server error while checking organization code' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      token,
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify token and get user data
router.get('/verify', authenticate, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organizationId: req.user.organizationId,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
});

export default router;