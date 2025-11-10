import express from 'express';
import db from '../database/index.js';
import UAParser from 'ua-parser-js';

const router = express.Router();

/**
 * Track a page view
 * POST /api/analytics/track
 */
router.post('/track', async (req, res) => {
  try {
    const { page, referrer, sessionId } = req.body;
    
    // Parse user agent
    const parser = new UAParser(req.headers['user-agent']);
    const uaResult = parser.getResult();
    
    // Get IP (considera proxy se presente)
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.socket.remoteAddress;
    
    // Lista IP da escludere (admin/sviluppatori)
    const excludedIPs = process.env.EXCLUDED_IPS 
      ? process.env.EXCLUDED_IPS.split(',').map(ip => ip.trim())
      : [];
    
    // Escludi localhost e IP sviluppatori
    const isLocalhost = ip === '::1' || ip === '127.0.0.1' || ip?.includes('::ffff:127.0.0.1');
    const isExcluded = excludedIPs.includes(ip);
    
    if (isLocalhost || isExcluded) {
      console.log(`🚫 Analytics tracking skipped for IP: ${ip}`);
      return res.status(201).json({
        success: true,
        tracked: false,
        reason: 'excluded_ip'
      });
    }
    
    const viewData = {
      page: page || req.headers.referer || '/',
      referrer: referrer || req.headers.referer || null,
      userAgent: req.headers['user-agent'],
      sessionId: sessionId || null,
      ip: ip,
      device: uaResult.device.type || 'desktop',
      browser: uaResult.browser.name || 'unknown'
    };
    
    const pageView = db.trackPageView(viewData);
    
    res.status(201).json({
      success: true,
      tracked: true,
      id: pageView.id
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

/**
 * Get analytics statistics
 * GET /api/analytics/stats?days=7
 */
router.get('/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = db.getAnalyticsStats(days);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Get raw analytics data with filters
 * GET /api/analytics/data?startDate=2024-01-01&endDate=2024-12-31&page=/home
 */
router.get('/data', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page
    };
    
    const data = db.getAnalytics(filters);
    
    res.json({
      total: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

/**
 * Clear old analytics data
 * DELETE /api/analytics/cleanup?days=30
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const daysToKeep = parseInt(req.query.days) || 30;
    const result = db.clearOldAnalytics(daysToKeep);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error cleaning up analytics:', error);
    res.status(500).json({ error: 'Failed to cleanup' });
  }
});

export default router;
