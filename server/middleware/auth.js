import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Find user by id
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user has admin role
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Check if user has manager or admin role
export const isManagerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Manager or Admin role required.' });
  }
  next();
};

// Check if user belongs to the specified organization
export const isSameOrganization = (req, res, next) => {
  const orgIdFromParam = req.params.organizationId;
  
  if (orgIdFromParam && req.user.organizationId.toString() !== orgIdFromParam) {
    return res.status(403).json({ 
      message: 'Access denied. You can only access resources within your organization.' 
    });
  }
  
  next();
};