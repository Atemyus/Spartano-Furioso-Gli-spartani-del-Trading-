// Helper ordini basato su Prisma/MongoDB (sostituisce il vecchio store su file JSON).
// Espone funzioni async con le stesse semantiche dei vecchi metodi db.*Order*.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Campi ammessi dal modello Order (gli altri vengono ignorati per evitare errori Prisma).
const ORDER_FIELDS = new Set([
  'orderNumber', 'userId', 'customerEmail', 'customerName', 'productId',
  'productName', 'productType', 'plan', 'amount', 'currency', 'items',
  'status', 'paymentStatus', 'paymentProvider', 'paymentId', 'mode', 'notes',
  'accessDetails', 'metadata', 'cancellationReason', 'confirmedAt',
  'cancelledAt', 'stripeSessionId', 'stripePaymentId'
]);

function pickOrderFields(input = {}) {
  const data = {};
  for (const [key, value] of Object.entries(input)) {
    if (ORDER_FIELDS.has(key) && value !== undefined) {
      // Date passate come stringa ISO -> Date
      if ((key === 'confirmedAt' || key === 'cancelledAt') && typeof value === 'string') {
        data[key] = new Date(value);
      } else {
        data[key] = value;
      }
    }
  }
  return data;
}

const isObjectId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

export async function createOrder(orderData) {
  const data = pickOrderFields(orderData);
  if (!data.status) data.status = 'pending';
  if (data.amount == null) data.amount = 0;
  if (!data.currency) data.currency = 'eur';
  return prisma.order.create({ data });
}

export async function getOrderById(id) {
  if (!isObjectId(id)) return null;
  return prisma.order.findUnique({ where: { id } });
}

export async function getOrderByPaymentId(paymentId) {
  if (!paymentId) return null;
  return prisma.order.findFirst({ where: { paymentId: String(paymentId) } });
}

export async function getOrdersByUserId(userId) {
  if (!isObjectId(userId)) return [];
  return prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function updateOrder(id, updates) {
  if (!isObjectId(id)) return null;
  const data = pickOrderFields(updates);
  try {
    return await prisma.order.update({ where: { id }, data });
  } catch (e) {
    return null;
  }
}

export async function getAllOrders() {
  return prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function deleteOrder(id) {
  if (!isObjectId(id)) return null;
  try {
    return await prisma.order.delete({ where: { id } });
  } catch (e) {
    return null;
  }
}

export default {
  createOrder,
  getOrderById,
  getOrderByPaymentId,
  getOrdersByUserId,
  updateOrder,
  getAllOrders,
  deleteOrder
};
