import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { generateToken, comparePassword, hashPassword, authenticateToken } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../services/emailService.js';
import { protectTrial } from '../middleware/trialProtection.js';

const prisma = new PrismaClient();

const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Admin login attempt for:', email);

    // First, check environment variables (legacy method)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = generateToken({
        adminId: 'admin-1',
        email,
        isAdmin: true
      }, true);

      console.log('✅ Admin logged in via ENV variables');
      return res.json({
        success: true,
        token,
        admin: {
          id: 'admin-1',
          email,
          name: 'Administrator'
        }
      });
    }

    // Second, check Prisma database for admin users
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    console.log('👤 User found in database:', !!user);
    console.log('👤 User role:', user?.role);

    if (user && user.role === 'ADMIN') {
      // Check password
      const isValidPassword = await comparePassword(password, user.password);
      console.log('🔑 Password valid:', isValidPassword);

      if (isValidPassword) {
        // Check if email is verified
        if (!user.emailVerified) {
          return res.status(403).json({ 
            error: 'Email non verificata. Contatta un amministratore.' 
          });
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });

        const token = generateToken({
          adminId: user.id,
          email: user.email,
          isAdmin: true
        }, true);

        console.log('✅ Admin logged in via database');
        return res.json({
          success: true,
          token,
          admin: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        });
      }
    }

    console.log('❌ Invalid admin credentials');
    res.status(401).json({ error: 'Credenziali non valide' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login fallito' });
  }
});

// User registration with trial protection
router.post('/register', protectTrial, async (req, res) => {
  try {
    const { email, password, name, deviceFingerprint } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Un utente con questa email esiste già' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (with pending status and trial protection info)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        status: 'pending',
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
        registrationIP: req.trialProtection?.ip,
        deviceHash: req.trialProtection?.deviceHash
      }
    });
    
    console.log('✅ Utente creato nel database:', user.email);

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailResult = await sendEmail(email, 'verification', {
      userName: name,
      verificationLink
    });

    // In development, include verification link for easy testing
    const response = {
      success: true,
      message: 'Registrazione completata! Controlla la tua email per verificare il tuo account.',
      requiresVerification: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔗 LINK DI VERIFICA PER TEST:');
      console.log(verificationLink);
      console.log('\n');
      response.verificationLink = verificationLink;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registrazione fallita' });
  }
});

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token di verifica mancante' });
    }

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: { gt: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Token di verifica non valido o scaduto' });
    }

    // Update user status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'active',
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      }
    });
    
    console.log('✅ Email verificata per:', user.email);

    // Send welcome email
    await sendEmail(user.email, 'welcome', {
      userName: user.name
    });

    // Generate login token
    const authToken = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Email verificata con successo!',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Verifica email fallita' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email già verificata' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry
      }
    });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(email, 'verification', {
      userName: user.name,
      verificationLink
    });

    res.json({
      success: true,
      message: 'Email di verifica reinviata'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Impossibile reinviare email di verifica' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    console.log('👤 User found:', !!user);
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'Email non verificata', 
        requiresVerification: true,
        email: user.email 
      });
    }

    // Check password
    console.log('🔑 Checking password...');
    const isValidPassword = await comparePassword(password, user.password);
    console.log('🔑 Password valid:', isValidPassword);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        trials: user.trials || [],
        subscriptions: user.subscriptions || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login fallito' });
  }
});

// Verify token endpoint
router.get('/verify-token', authenticateToken, async (req, res) => {
  try {
    // Se arriva qui, il token è valido (già verificato dal middleware)
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { trials: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'Email non verificata',
        requiresVerification: true 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        status: user.status,
        createdAt: user.createdAt,
        trials: user.trials || [],
        subscriptions: user.subscriptions || []
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Errore verifica token' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token, isAdmin } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify old token
    const secret = isAdmin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    // Generate new token
    const newToken = generateToken({
      userId: decoded.userId || decoded.adminId,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false
    }, isAdmin);

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email richiesta' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      // Non rivelare se l'email esiste o meno per sicurezza
      return res.json({
        success: true,
        message: 'Se l\'email esiste nel sistema, riceverai le istruzioni per il reset'
      });
    }
    
    // Genera token di reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 ora
    
    // Salva token nel database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry
      }
    });
    
    // Invia email di reset
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'passwordReset', {
      userName: user.name,
      resetLink
    });
    
    // In development, mostra il link
    const response = {
      success: true,
      message: 'Email di recupero password inviata'
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔗 LINK DI RESET PASSWORD PER TEST:');
      console.log(resetLink);
      console.log('\n');
      response.resetLink = resetLink;
    }
    
    res.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Errore durante il recupero password' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token e password richiesti' });
    }
    
    // Trova utente con questo token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Token non valido o scaduto' });
    }
    
    // Hash nuova password
    const hashedPassword = await hashPassword(password);
    
    // Aggiorna password e rimuovi token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null
      }
    });
    
    // Invia email di conferma
    await sendEmail(user.email, 'passwordChanged', {
      userName: user.name
    });
    
    res.json({
      success: true,
      message: 'Password reimpostata con successo'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Errore durante il reset della password' });
  }
});

export default router;
