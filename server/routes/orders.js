import express from 'express';
import db from '../database/index.js';
import { sendOrderConfirmation, sendVimeoAccessInstructions } from '../services/emailService.js';

const router = express.Router();

// Get all orders (Admin only)
router.get('/', async (req, res) => {
  try {
    const orders = db.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Errore nel recupero degli ordini' });
  }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Ordine non trovato' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Errore nel recupero dell\'ordine' });
  }
});

// Confirm order (Admin only) - Sends Vimeo credentials and Telegram link
router.post('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { telegramLink, vimeoLink, vimeoPassword } = req.body;
    
    const order = db.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Ordine non trovato' });
    }
    
    if (order.status === 'confirmed') {
      return res.status(400).json({ error: 'Ordine già confermato' });
    }
    
    // Update order status
    const updatedOrder = db.updateOrder(id, { 
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      accessDetails: {
        telegramLink: telegramLink || process.env.TELEGRAM_VIP_LINK || 'https://t.me/codextrading',
        vimeoLink: vimeoLink || process.env.VIMEO_COURSE_LINK,
        vimeoPassword: vimeoPassword || process.env.VIMEO_COURSE_PASSWORD
      }
    });
    
    console.log('✅ Ordine confermato:', order.orderNumber);
    
    // Send updated confirmation email with "CONFIRMED" status
    await sendOrderConfirmation({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderNumber: order.orderNumber,
      productName: order.productName,
      amount: order.amount,
      currency: order.currency,
      date: new Date(order.createdAt),
      isPending: false // Ora è confermato
    });
    
    // Send Vimeo access instructions
    await sendVimeoAccessInstructions({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      productName: order.productName,
      vimeoLink: updatedOrder.accessDetails.vimeoLink,
      vimeoPassword: updatedOrder.accessDetails.vimeoPassword,
      telegramLink: updatedOrder.accessDetails.telegramLink
    });
    
    console.log('📧 Email di accesso inviata a:', order.customerEmail);
    
    res.json({
      success: true,
      message: 'Ordine confermato e credenziali inviate',
      order: updatedOrder
    });
    
  } catch (error) {
    console.error('Error confirming order:', error);
    res.status(500).json({ error: 'Errore nella conferma dell\'ordine' });
  }
});

// Cancel/Reject order (Admin only)
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = db.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Ordine non trovato' });
    }
    
    const updatedOrder = db.updateOrder(id, { 
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason || 'Annullato dall\'amministratore'
    });
    
    console.log('❌ Ordine annullato:', order.orderNumber);
    
    // Invia email di notifica cancellazione al cliente
    try {
      await sendOrderConfirmation({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        productName: order.productName,
        amount: order.amount,
        currency: order.currency,
        date: new Date(order.createdAt),
        isPending: false,
        isCancelled: true,
        cancellationReason: reason || 'Annullato dall\'amministratore'
      });
      console.log('📧 Email di cancellazione inviata a:', order.customerEmail);
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Non bloccare la risposta se l'email fallisce
    }
    
    res.json({
      success: true,
      message: 'Ordine annullato',
      order: updatedOrder
    });
    
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Errore nell\'annullamento dell\'ordine' });
  }
});

// Get orders by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const allOrders = db.getAllOrders();
    const filteredOrders = allOrders.filter(order => order.status === status);
    res.json(filteredOrders);
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({ error: 'Errore nel recupero degli ordini' });
  }
});

// Get orders statistics
router.get('/stats', async (req, res) => {
  try {
    const allOrders = db.getAllOrders();
    
    // Calculate statistics
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter(order => order.status === 'confirmed' || order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + (order.amount || 0), 0);
    
    const subscriptions = allOrders.filter(order => order.mode === 'subscription').length;
    const oneTimePayments = allOrders.filter(order => order.mode === 'payment').length;
    const failedPayments = allOrders.filter(order => order.status === 'cancelled' || order.paymentStatus === 'failed').length;
    
    // Revenue by month
    const revenueByMonth = {};
    allOrders.forEach(order => {
      if (order.status === 'confirmed' || order.paymentStatus === 'paid') {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (order.amount || 0);
      }
    });
    
    // Revenue by product
    const revenueByProduct = {};
    allOrders.forEach(order => {
      if (order.status === 'confirmed' || order.paymentStatus === 'paid') {
        const productName = order.productName || 'Unknown';
        revenueByProduct[productName] = (revenueByProduct[productName] || 0) + (order.amount || 0);
      }
    });
    
    res.json({
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimals
      subscriptions,
      oneTimePayments,
      failedPayments,
      revenueByMonth,
      revenueByProduct
    });
  } catch (error) {
    console.error('Error fetching orders stats:', error);
    res.status(500).json({ error: 'Errore nel calcolo delle statistiche' });
  }
});

// Get pending orders count
router.get('/stats/pending-count', async (req, res) => {
  try {
    const allOrders = db.getAllOrders();
    const pendingCount = allOrders.filter(order => order.status === 'pending').length;
    res.json({ count: pendingCount });
  } catch (error) {
    console.error('Error fetching pending count:', error);
    res.status(500).json({ error: 'Errore nel conteggio degli ordini' });
  }
});

export default router;
