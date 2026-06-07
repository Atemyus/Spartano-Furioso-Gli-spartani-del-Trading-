import express from 'express';
import { PrismaClient } from '@prisma/client';
import { UAParser } from 'ua-parser-js';

const router = express.Router();
const prisma = new PrismaClient();

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

    const pageView = await prisma.analytics.create({
      data: {
        page: page || req.headers.referer || '/',
        referrer: referrer || req.headers.referer || null,
        userAgent: req.headers['user-agent'] || null,
        sessionId: sessionId || null,
        ip: ip || null,
        device: uaResult.device.type || 'desktop',
        browser: uaResult.browser.name || 'unknown'
      }
    });

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
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const recentViews = await prisma.analytics.findMany({
      where: { timestamp: { gte: startDate } }
    });

    // Visitatori unici (basati su sessionId)
    const uniqueSessions = new Set(recentViews.map(v => v.sessionId).filter(Boolean));

    // Pagine più visitate
    const pageViews = {};
    recentViews.forEach(view => {
      pageViews[view.page] = (pageViews[view.page] || 0) + 1;
    });

    // Visite per giorno
    const viewsByDay = {};
    recentViews.forEach(view => {
      const day = new Date(view.timestamp).toISOString().split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    // Device breakdown
    const deviceBreakdown = {};
    recentViews.forEach(view => {
      deviceBreakdown[view.device] = (deviceBreakdown[view.device] || 0) + 1;
    });

    // Browser breakdown
    const browserBreakdown = {};
    recentViews.forEach(view => {
      browserBreakdown[view.browser] = (browserBreakdown[view.browser] || 0) + 1;
    });

    // Conversion rate (visite -> ordini)
    let ordersInPeriod = 0;
    try {
      ordersInPeriod = await prisma.order.count({
        where: { createdAt: { gte: startDate } }
      });
    } catch (e) {
      ordersInPeriod = 0;
    }
    const conversionRate = uniqueSessions.size > 0
      ? ((ordersInPeriod / uniqueSessions.size) * 100).toFixed(2)
      : '0.00';

    res.json({
      totalPageViews: recentViews.length,
      uniqueVisitors: uniqueSessions.size,
      topPages: Object.entries(pageViews)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, views]) => ({ page, views })),
      viewsByDay,
      deviceBreakdown,
      browserBreakdown,
      conversionRate,
      ordersInPeriod,
      averagePageViewsPerVisitor: uniqueSessions.size > 0
        ? (recentViews.length / uniqueSessions.size).toFixed(2)
        : '0.00'
    });
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
    const where = {};
    if (req.query.startDate || req.query.endDate) {
      where.timestamp = {};
      if (req.query.startDate) where.timestamp.gte = new Date(req.query.startDate);
      if (req.query.endDate) where.timestamp.lte = new Date(req.query.endDate);
    }
    if (req.query.page) where.page = req.query.page;

    const data = await prisma.analytics.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });

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
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const before = await prisma.analytics.count();
    const del = await prisma.analytics.deleteMany({
      where: { timestamp: { lt: cutoffDate } }
    });

    res.json({
      success: true,
      before,
      after: before - del.count,
      deleted: del.count
    });
  } catch (error) {
    console.error('Error cleaning up analytics:', error);
    res.status(500).json({ error: 'Failed to cleanup' });
  }
});

export default router;
