import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware per verificare l'accesso ai contenuti dei corsi
 * Controlla se l'utente ha un trial attivo o una subscription per il corso
 */
export async function checkCourseAccess(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId || req.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Autenticazione richiesta',
        hasAccess: false 
      });
    }
    
    // Ottieni l'utente con i suoi trial
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        trials: {
          where: {
            productId: courseId
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Utente non trovato',
        hasAccess: false 
      });
    }
    
    // Verifica se c'è un trial attivo per questo corso
    const now = new Date();
    const activeTrial = user.trials.find(trial => {
      const endDate = new Date(trial.endDate);
      return trial.status === 'active' && now < endDate;
    });
    
    if (activeTrial) {
      // Ha un trial attivo
      req.userAccess = {
        hasAccess: true,
        accessType: 'trial',
        trialEndDate: activeTrial.endDate,
        daysRemaining: Math.ceil((new Date(activeTrial.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      };
      return next();
    }
    
    // TODO: Verificare se ha una subscription attiva
    // Per ora permettiamo l'accesso solo con trial
    
    return res.status(403).json({ 
      error: 'Accesso negato. È necessario un trial attivo o una subscription per accedere a questo corso.',
      hasAccess: false,
      needsTrial: true
    });
    
  } catch (error) {
    console.error('Errore nel controllo accesso corso:', error);
    return res.status(500).json({ 
      error: 'Errore interno del server',
      hasAccess: false 
    });
  }
}

/**
 * Middleware per verificare l'accesso a una specifica lezione
 * Permette l'accesso alle lezioni trial anche senza trial attivo
 */
export async function checkLessonAccess(req, res, next) {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user?.userId || req.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Autenticazione richiesta',
        hasAccess: false 
      });
    }
    
    // Carica il contenuto del corso per verificare se la lezione è trial content
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const COURSE_CONTENT_FILE = path.join(__dirname, '../data/course-content.json');
    const contentData = await fs.readFile(COURSE_CONTENT_FILE, 'utf-8');
    const content = JSON.parse(contentData);
    
    const course = content.courses[courseId];
    if (!course) {
      return res.status(404).json({ 
        error: 'Corso non trovato',
        hasAccess: false 
      });
    }
    
    // Trova la lezione
    let lesson = null;
    let isTrialContent = false;
    
    for (const module of course.modules) {
      const foundLesson = module.lessons.find(l => l.id === lessonId);
      if (foundLesson) {
        lesson = foundLesson;
        isTrialContent = foundLesson.isTrialContent || false;
        break;
      }
    }
    
    if (!lesson) {
      return res.status(404).json({ 
        error: 'Lezione non trovata',
        hasAccess: false 
      });
    }
    
    // Se è contenuto trial, permetti l'accesso a tutti
    if (isTrialContent) {
      req.userAccess = {
        hasAccess: true,
        accessType: 'trial_content',
        isTrialContent: true
      };
      return next();
    }
    
    // Altrimenti verifica il trial/subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        trials: {
          where: {
            productId: courseId
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Utente non trovato',
        hasAccess: false 
      });
    }
    
    // Verifica trial attivo
    const now = new Date();
    const activeTrial = user.trials.find(trial => {
      const endDate = new Date(trial.endDate);
      return trial.status === 'active' && now < endDate;
    });
    
    if (activeTrial) {
      req.userAccess = {
        hasAccess: true,
        accessType: 'trial',
        trialEndDate: activeTrial.endDate,
        daysRemaining: Math.ceil((new Date(activeTrial.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      };
      return next();
    }
    
    // TODO: Verificare subscription
    
    return res.status(403).json({ 
      error: 'Accesso negato. Questa lezione richiede un trial attivo o una subscription.',
      hasAccess: false,
      needsTrial: true,
      isTrialContent: false
    });
    
  } catch (error) {
    console.error('Errore nel controllo accesso lezione:', error);
    return res.status(500).json({ 
      error: 'Errore interno del server',
      hasAccess: false 
    });
  }
}
