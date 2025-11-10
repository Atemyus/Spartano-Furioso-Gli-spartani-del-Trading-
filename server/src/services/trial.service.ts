import { add } from 'date-fns';
import db from '../db';
import { emailService } from './email.service';

export class TrialService {
  async createTrial(email: string, name?: string): Promise<{ success: boolean; message: string; trialId?: string }> {
    try {
      // Check if user exists
      let user = await db.user.findUnique({ where: { email } });
      
      if (!user) {
        // Create new user
        user = await db.user.create({
          data: { email, name },
        });
      }

      // Check for existing active trial
      const activeTrial = await db.trial.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          endAt: { gte: new Date() },
        },
      });

      if (activeTrial) {
        return {
          success: false,
          message: 'Hai già una prova attiva. Controlla la tua email per i dettagli.',
        };
      }

      // Create new trial (50 days from now)
      const startAt = new Date();
      const endAt = add(startAt, { days: 50 });

      const trial = await db.trial.create({
        data: {
          userId: user.id,
          startAt,
          endAt,
          status: 'ACTIVE',
        },
      });

      // Send activation email
      await emailService.sendTrialActivation(email, name || null, endAt);

      return {
        success: true,
        message: 'Prova di 50 giorni attivata! Controlla la tua email per i dettagli.',
        trialId: trial.id,
      };
    } catch (error) {
      console.error('Error creating trial:', error);
      return {
        success: false,
        message: 'Errore durante l\'attivazione della prova. Riprova più tardi.',
      };
    }
  }

  async checkTrialStatus(email: string): Promise<{ active: boolean; daysLeft?: number }> {
    const user = await db.user.findUnique({ where: { email } });
    
    if (!user) {
      return { active: false };
    }

    const activeTrial = await db.trial.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        endAt: { gte: new Date() },
      },
    });

    if (!activeTrial) {
      return { active: false };
    }

    const daysLeft = Math.ceil((activeTrial.endAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return { active: true, daysLeft };
  }

  async expireTrials(): Promise<void> {
    // Find and expire trials that have ended
    await db.trial.updateMany({
      where: {
        status: 'ACTIVE',
        endAt: { lt: new Date() },
      },
      data: {
        status: 'EXPIRED',
      },
    });
  }

  async sendExpiringReminders(): Promise<void> {
    // Find trials expiring in 7 days
    const sevenDaysFromNow = add(new Date(), { days: 7 });
    
    const expiringTrials = await db.trial.findMany({
      where: {
        status: 'ACTIVE',
        endAt: {
          gte: new Date(),
          lte: sevenDaysFromNow,
        },
      },
      include: { user: true },
    });

    for (const trial of expiringTrials) {
      const daysLeft = Math.ceil((trial.endAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
        await emailService.sendTrialExpiring(trial.user.email, trial.user.name, daysLeft);
      }
    }
  }
}

export const trialService = new TrialService();
