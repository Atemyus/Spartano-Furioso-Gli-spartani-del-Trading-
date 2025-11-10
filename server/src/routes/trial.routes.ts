import { Router } from 'express';
import { z } from 'zod';
import { trialService } from '../services/trial.service';

const router = Router();

// Schema validation
const createTrialSchema = z.object({
  email: z.string().email('Email non valida'),
  name: z.string().optional(),
});

const checkTrialSchema = z.object({
  email: z.string().email('Email non valida'),
});

// POST /api/trial/create
router.post('/create', async (req, res) => {
  try {
    const data = createTrialSchema.parse(req.body);
    const result = await trialService.createTrial(data.email, data.name);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        trialId: result.trialId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dati non validi',
        errors: error.errors,
      });
    } else {
      console.error('Error in trial creation:', error);
      res.status(500).json({
        success: false,
        message: 'Errore del server. Riprova più tardi.',
      });
    }
  }
});

// POST /api/trial/status
router.post('/status', async (req, res) => {
  try {
    const data = checkTrialSchema.parse(req.body);
    const status = await trialService.checkTrialStatus(data.email);
    
    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Email non valida',
      });
    } else {
      console.error('Error checking trial status:', error);
      res.status(500).json({
        success: false,
        message: 'Errore del server',
      });
    }
  }
});

export default router;
