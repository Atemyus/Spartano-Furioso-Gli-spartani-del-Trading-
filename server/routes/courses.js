import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Middleware di autenticazione semplificato
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token richiesto' });
  }
  
  // Per ora usiamo l'ID dell'utente esistente per testing
  // In produzione dovremmo decodificare il JWT token
  req.user = { userId: 'user_1757115708866' }; // ID dell'utente admin nel database
  next();
};

// File paths
const COURSE_CONTENT_FILE = path.join(__dirname, '../data/course-content.json');
const USERS_FILE = path.join(__dirname, '../database/data/users.json');
const PRODUCTS_FILE = path.join(__dirname, '../database/data/products.json');

// Helper functions
async function loadCourseContent() {
  try {
    const data = await fs.readFile(COURSE_CONTENT_FILE, 'utf-8');
    const content = JSON.parse(data);
    
    // Sync with products of category "Formazione"
    await syncWithFormationProducts(content);
    
    return content;
  } catch (error) {
    console.error('Error loading course content:', error);
    return { courses: {}, userProgress: {} };
  }
}

async function syncWithFormationProducts(content) {
  try {
    console.log('Syncing with formation products...');
    const productsData = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(productsData);
    
    // Find all products with category "Formazione"
    const formationProducts = products.filter(p => p.category === 'Formazione');
    console.log(`Found ${formationProducts.length} formation products`);
    
    for (const product of formationProducts) {
      console.log(`Processing formation product: ${product.id} - ${product.name}`);
      
      // Check if course already exists with proper structure
      if (!content.courses[product.id]) {
        console.log(`Creating new course for product: ${product.id}`);
        // If product is spartan_academy and we already have data, keep existing data
        if (product.id === 'spartan_academy' && content.courses['spartan_academy']) {
          // Update name and description only
          content.courses['spartan_academy'].name = product.name;
          content.courses['spartan_academy'].description = product.description;
        } else {
          // Create new course structure
          content.courses[product.id] = {
            id: product.id,
            name: product.name,
            description: product.description,
            modules: content.courses['spartan_academy']?.modules || [
              {
                id: `${product.id}_module_1`,
                title: 'Modulo 1 - Introduzione',
                description: 'Modulo introduttivo del corso',
                order: 1,
                isTrialContent: true,
                duration: '2h 00min',
                lessons: [
                  {
                    id: `${product.id}_lesson_1_1`,
                    title: 'Lezione 1 - Benvenuto',
                    description: 'Lezione di benvenuto al corso',
                    duration: '15min',
                    vimeoId: '123456789',
                    order: 1,
                    isTrialContent: true
                  }
                ]
              }
            ]
          };
        }
      } else {
        // Update course name and description if product changed
        console.log(`Updating existing course: ${product.id}`);
        content.courses[product.id].name = product.name;
        content.courses[product.id].description = product.description;
      }
    }
    
    // Save updated content
    await saveCourseContent(content);
    console.log('Formation products sync completed');
  } catch (error) {
    console.error('Error syncing with formation products:', error);
  }
}

async function saveCourseContent(data) {
  try {
    await fs.writeFile(COURSE_CONTENT_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving course content:', error);
    return false;
  }
}

async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(data);
    // Il file users.json è un array diretto, non un oggetto con proprietà users
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

// Get course content
router.get('/:courseId/content', async (req, res) => {
  try {
    const { courseId } = req.params;
    const content = await loadCourseContent();
    
    if (!content.courses[courseId]) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ 
      success: true,
      course: content.courses[courseId] 
    });
  } catch (error) {
    console.error('Error getting course content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user progress for a course
router.get('/:courseId/progress/:userId', authenticateToken, async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const content = await loadCourseContent();
    
    const progressKey = `${userId}_${courseId}`;
    const userProgress = content.userProgress[progressKey] || {
      completedLessons: [],
      lastAccessed: null,
      progress: 0
    };
    
    res.json({ 
      success: true,
      ...userProgress 
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user progress
router.post('/:courseId/progress', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, lessonId, completed, moduleId } = req.body;
    
    const content = await loadCourseContent();
    const progressKey = `${userId}_${courseId}`;
    
    if (!content.userProgress[progressKey]) {
      content.userProgress[progressKey] = {
        completedLessons: [],
        lastAccessed: new Date().toISOString(),
        lastLessonId: null,
        lastModuleId: null,
        progress: 0,
        totalTimeSpent: 0
      };
    }
    
    const progress = content.userProgress[progressKey];
    
    // Update completed lessons
    if (completed && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    } else if (!completed && progress.completedLessons.includes(lessonId)) {
      progress.completedLessons = progress.completedLessons.filter(id => id !== lessonId);
    }
    
    // Update last accessed lesson
    progress.lastAccessed = new Date().toISOString();
    progress.lastLessonId = lessonId;
    progress.lastModuleId = moduleId || progress.lastModuleId;
    
    // Calculate progress percentage for trial content only
    const course = content.courses[courseId];
    if (course) {
      // Count only trial lessons
      let totalTrialLessons = 0;
      let completedTrialLessons = 0;
      
      course.modules.forEach(module => {
        if (module.isTrialContent) {
          module.lessons.forEach(lesson => {
            if (lesson.isTrialContent) {
              totalTrialLessons++;
              if (progress.completedLessons.includes(lesson.id)) {
                completedTrialLessons++;
              }
            }
          });
        }
      });
      
      progress.progress = totalTrialLessons > 0 
        ? Math.round((completedTrialLessons / totalTrialLessons) * 100)
        : 0;
    }
    
    await saveCourseContent(content);
    
    res.json({ 
      success: true,
      progress: progress.progress,
      completedLessons: progress.completedLessons,
      lastLessonId: progress.lastLessonId,
      lastModuleId: progress.lastModuleId
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update course content
router.put('/:courseId/content', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const users = await loadUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { courseId } = req.params;
    const { modules, name, description } = req.body;
    
    const content = await loadCourseContent();
    
    if (!content.courses[courseId]) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Update course name and description if provided
    if (name) content.courses[courseId].name = name;
    if (description) content.courses[courseId].description = description;
    if (modules) content.courses[courseId].modules = modules;
    
    await saveCourseContent(content);
    
    // Also update product if it's a formation
    try {
      const productsData = await fs.readFile(PRODUCTS_FILE, 'utf-8');
      const products = JSON.parse(productsData);
      const productIndex = products.findIndex(p => p.id === courseId && p.category === 'Formazione');
      
      if (productIndex !== -1) {
        if (name) products[productIndex].name = name;
        if (description) products[productIndex].description = description;
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
    
    res.json({ 
      success: true,
      message: 'Course content updated successfully'
    });
  } catch (error) {
    console.error('Error updating course content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all courses
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const users = await loadUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    console.log('User requesting courses:', user?.email, 'Role:', user?.role);
    
    if (!user || user.role !== 'admin') {
      console.log('Access denied: User is not admin');
      return res.status(403).json({ error: 'Unauthorized - Admin role required' });
    }
    
    const content = await loadCourseContent();
    console.log('Courses loaded:', Object.keys(content.courses));
    
    res.json({ 
      success: true,
      courses: content.courses
    });
  } catch (error) {
    console.error('Error getting all courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Add new module
router.post('/:courseId/module', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const users = await loadUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { courseId } = req.params;
    const { title, description, duration, isTrialContent, insertBeforeOrder } = req.body;
    
    const content = await loadCourseContent();
    
    if (!content.courses[courseId]) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Determine the order for the new module
    let newOrder;
    if (insertBeforeOrder !== undefined && insertBeforeOrder !== null) {
      // Insert before specified order
      newOrder = insertBeforeOrder;
      // Shift all modules with order >= newOrder
      content.courses[courseId].modules.forEach(module => {
        if (module.order >= newOrder) {
          module.order++;
        }
      });
    } else {
      // Add at the end
      newOrder = content.courses[courseId].modules.length + 1;
    }
    
    const newModule = {
      id: `module_${Date.now()}`,
      title: title || 'Nuovo Modulo',
      description: description || 'Descrizione del modulo',
      order: newOrder,
      isTrialContent: isTrialContent !== undefined ? isTrialContent : true,
      duration: duration || '0min',
      lessons: []
    };
    
    content.courses[courseId].modules.push(newModule);
    
    // Sort modules by order
    content.courses[courseId].modules.sort((a, b) => a.order - b.order);
    
    await saveCourseContent(content);
    
    res.json({ 
      success: true,
      module: newModule,
      message: 'Module created successfully'
    });
  } catch (error) {
    console.error('Error adding module:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete module
router.delete('/:courseId/module/:moduleId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const users = await loadUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { courseId, moduleId } = req.params;
    
    const content = await loadCourseContent();
    
    if (!content.courses[courseId]) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const moduleIndex = content.courses[courseId].modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    // Remove the module
    content.courses[courseId].modules.splice(moduleIndex, 1);
    
    // Reorder remaining modules
    content.courses[courseId].modules.forEach((module, index) => {
      module.order = index + 1;
    });
    
    await saveCourseContent(content);
    
    res.json({ 
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update module
router.put('/:courseId/module/:moduleId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const users = await loadUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { courseId, moduleId } = req.params;
    const updates = req.body;
    
    const content = await loadCourseContent();
    
    if (!content.courses[courseId]) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const moduleIndex = content.courses[courseId].modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    content.courses[courseId].modules[moduleIndex] = { 
      ...content.courses[courseId].modules[moduleIndex], 
      ...updates 
    };
    
    await saveCourseContent(content);
    
    res.json({ 
      success: true,
      module: content.courses[courseId].modules[moduleIndex]
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Add new video to a lesson
router.post('/:courseId/module/:moduleId/lesson', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const users = await loadUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { courseId, moduleId } = req.params;
    const { title, description, duration, vimeoId, videoUrl, isTrialContent } = req.body;
    
    const content = await loadCourseContent();
    
    if (!content.courses[courseId]) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const module = content.courses[courseId].modules.find(m => m.id === moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    const newLesson = {
      id: `lesson_${Date.now()}`,
      title,
      description,
      duration,
      order: module.lessons.length + 1,
      isTrialContent
    };
    
    // Add vimeoId or videoUrl based on what's provided
    if (videoUrl) {
      newLesson.videoUrl = videoUrl;
    } else if (vimeoId) {
      newLesson.vimeoId = vimeoId;
    }
    
    module.lessons.push(newLesson);
    await saveCourseContent(content);
    
    res.json({ 
      success: true,
      lesson: newLesson
    });
  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update lesson
router.put('/:courseId/module/:moduleId/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const users = await loadUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { courseId, moduleId, lessonId } = req.params;
    const updates = req.body;
    
    const content = await loadCourseContent();
    
    if (!content.courses[courseId]) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const module = content.courses[courseId].modules.find(m => m.id === moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    module.lessons[lessonIndex] = { ...module.lessons[lessonIndex], ...updates };
    await saveCourseContent(content);
    
    res.json({ 
      success: true,
      lesson: module.lessons[lessonIndex]
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete lesson
router.delete('/:courseId/module/:moduleId/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const users = await loadUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { courseId, moduleId, lessonId } = req.params;
    
    const content = await loadCourseContent();
    
    if (!content.courses[courseId]) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const module = content.courses[courseId].modules.find(m => m.id === moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    module.lessons = module.lessons.filter(l => l.id !== lessonId);
    
    // Re-order lessons
    module.lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });
    
    await saveCourseContent(content);
    
    res.json({ 
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
