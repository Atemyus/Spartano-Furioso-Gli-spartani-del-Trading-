import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import { generateTokens, authenticate, refreshAccessToken } from '../middleware/auth';
import { emailService } from '../services/email.service';
import { validateRegistration, validateLogin } from '../validators/auth.validators';

const router = Router();

// Register
router.post('/register', validateRegistration, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utente con questa email esiste già.'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    try {
      console.log('📧 Tentativo invio email a:', user.email);
      await emailService.sendEmail({
        to: user.email,
        subject: 'Benvenuto in Spartano Furioso - Verifica la tua email',
        html: `
          <h1>Benvenuto ${firstName}!</h1>
          <p>Grazie per esserti registrato a Spartano Furioso.</p>
          <p>Per completare la registrazione, verifica la tua email cliccando sul link sottostante:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 8px;">Verifica Email</a>
          <p>Il link scadrà tra 24 ore.</p>
          <p>Se non hai richiesto questa registrazione, ignora questa email.</p>
          <br>
          <p>Forza e Onore,<br>Il Team Spartano Furioso</p>
        `
      });
      console.log('✅ Email inviata con successo!');
    } catch (emailError: any) {
      console.error('❌ Errore invio email:', emailError.message);
      console.log('⚠️ Utente registrato ma email non inviata - continuo...');
      // NON bloccare la registrazione se l'email fallisce
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registrazione completata! Controlla la tua email per verificare l\'account.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account bloccato per troppi tentativi di accesso. Riprova più tardi.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide.'
      });
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const tokens = generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login effettuato con successo!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          trials: user.trials,
          subscriptions: user.subscriptions
        },
        tokens
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il login.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    // Clear refresh token from database
    if (req.user) {
      req.user.refreshToken = undefined;
      await req.user.save();
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout effettuato con successo!'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il logout.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token di verifica mancante.'
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token di verifica non valido o scaduto.'
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    await emailService.sendEmail({
      to: user.email,
      subject: 'Email verificata - Benvenuto nella Falange Spartana!',
      html: `
        <h1>Benvenuto ${user.firstName}!</h1>
        <p>La tua email è stata verificata con successo.</p>
        <p>Ora puoi accedere a tutte le funzionalità di Spartano Furioso:</p>
        <ul>
          <li>✅ Inizia la prova gratuita di 60 giorni dei nostri bot</li>
          <li>📊 Accedi alla dashboard completa</li>
          <li>💬 Unisciti alla community esclusiva</li>
          <li>🎓 Accedi ai contenuti formativi</li>
        </ul>
        <p>Inizia subito la tua prova gratuita visitando la sezione prodotti!</p>
        <br>
        <p>Forza e Onore,<br>Il Team Spartano Furioso</p>
      `
    });

    res.json({
      success: true,
      message: 'Email verificata con successo!'
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la verifica dell\'email.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'Se l\'email esiste nel nostro sistema, riceverai le istruzioni per il reset.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await emailService.sendEmail({
      to: user.email,
      subject: 'Reset Password - Spartano Furioso',
      html: `
        <h1>Reset Password</h1>
        <p>Hai richiesto il reset della password per il tuo account Spartano Furioso.</p>
        <p>Clicca sul link sottostante per impostare una nuova password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a>
        <p>Il link scadrà tra 1 ora.</p>
        <p>Se non hai richiesto questo reset, ignora questa email.</p>
        <br>
        <p>Forza e Onore,<br>Il Team Spartano Furioso</p>
      `
    });

    res.json({
      success: true,
      message: 'Se l\'email esiste nel nostro sistema, riceverai le istruzioni per il reset.'
    });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la richiesta di reset password.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reset password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token e password sono richiesti.'
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token non valido o scaduto.'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Send confirmation email
    await emailService.sendEmail({
      to: user.email,
      subject: 'Password modificata - Spartano Furioso',
      html: `
        <h1>Password modificata con successo</h1>
        <p>La tua password è stata modificata con successo.</p>
        <p>Se non hai effettuato tu questa modifica, contatta immediatamente il supporto.</p>
        <br>
        <p>Forza e Onore,<br>Il Team Spartano Furioso</p>
      `
    });

    res.json({
      success: true,
      message: 'Password modificata con successo!'
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il reset della password.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Refresh token
router.post('/refresh', refreshAccessToken);

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user!._id,
          email: req.user!.email,
          firstName: req.user!.firstName,
          lastName: req.user!.lastName,
          role: req.user!.role,
          isEmailVerified: req.user!.isEmailVerified,
          profile: req.user!.profile,
          trials: req.user!.trials,
          subscriptions: req.user!.subscriptions,
          notifications: req.user!.notifications
        }
      }
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dati utente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile
router.put('/update-profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = req.user!;

    // Update name if provided
    if (name) {
      const nameParts = name.trim().split(' ');
      user.firstName = nameParts[0] || user.firstName;
      user.lastName = nameParts.slice(1).join(' ') || user.lastName;
    }

    // Update email if provided and different
    if (email && email.toLowerCase() !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Questa email è già in uso.'
        });
      }
      
      user.email = email.toLowerCase();
      // Mark email as unverified if changed
      user.isEmailVerified = false;
      
      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpires;
      
      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await emailService.sendEmail({
        to: user.email,
        subject: 'Verifica la tua nuova email - Spartano Furioso',
        html: `
          <h1>Ciao ${user.firstName}!</h1>
          <p>Hai modificato la tua email. Per confermare la modifica, verifica la nuova email cliccando sul link:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 8px;">Verifica Email</a>
          <p>Il link scadrà tra 24 ore.</p>
          <br>
          <p>Forza e Onore,<br>Il Team Spartano Furioso</p>
        `
      });
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Password attuale non corretta.'
        });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La nuova password deve essere di almeno 8 caratteri.'
        });
      }

      // Update password
      user.password = newPassword;
      
      // Send confirmation email
      await emailService.sendEmail({
        to: user.email,
        subject: 'Password modificata - Spartano Furioso',
        html: `
          <h1>Password modificata</h1>
          <p>La tua password è stata modificata con successo.</p>
          <p>Se non hai effettuato tu questa modifica, contatta immediatamente il supporto.</p>
          <br>
          <p>Forza e Onore,<br>Il Team Spartano Furioso</p>
        `
      });
    }

    // Save user
    await user.save();

    res.json({
      success: true,
      message: 'Profilo aggiornato con successo!',
      user: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento del profilo.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
