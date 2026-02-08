import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

/**
 * --- UTILITIES ---
 */
const handleErrors = (res: any, error: any, message: string) => {
  console.error(error);
  res.status(500).json({ error: message, details: error.message });
};

/**
 * --- HEALTH & DIAGNOSTICS ---
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ONLINE', 
    timestamp: new Date().toISOString(),
    engine: 'Prisma Runtime v5.x',
    database: 'Neon PostgreSQL'
  });
});

/**
 * --- PARTNERS (Wholesalers) ---
 */
app.get('/api/partners', async (req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(partners);
  } catch (err) { handleErrors(res, err, "Failed to fetch partners"); }
});

app.post('/api/partners', async (req, res) => {
  try {
    const partner = await prisma.partner.create({ data: req.body });
    res.json(partner);
  } catch (err) { handleErrors(res, err, "Failed to create partner"); }
});

app.put('/api/partners/:id', async (req, res) => {
  try {
    const partner = await prisma.partner.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(partner);
  } catch (err) { handleErrors(res, err, "Failed to update partner"); }
});

app.delete('/api/partners/:id', async (req, res) => {
  try {
    await prisma.partner.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { handleErrors(res, err, "Failed to delete partner"); }
});

/**
 * --- SALES AGENTS (Personnel) ---
 */
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await prisma.salesAgent.findMany();
    res.json(agents);
  } catch (err) { handleErrors(res, err, "Failed to fetch agents"); }
});

app.post('/api/agents', async (req, res) => {
  try {
    const agent = await prisma.salesAgent.create({ data: req.body });
    res.json(agent);
  } catch (err) { handleErrors(res, err, "Failed to create agent"); }
});

app.put('/api/agents/:id', async (req, res) => {
  try {
    const agent = await prisma.salesAgent.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(agent);
  } catch (err) { handleErrors(res, err, "Failed to update agent"); }
});

app.delete('/api/agents/:id', async (req, res) => {
  try {
    await prisma.salesAgent.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { handleErrors(res, err, "Failed to delete agent"); }
});

/**
 * --- ORDERS & WORK ORDERS ---
 */
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ 
      include: { items: true },
      orderBy: { orderDate: 'desc' }
    });
    res.json(orders);
  } catch (err) { handleErrors(res, err, "Failed to fetch orders"); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, ...orderData } = req.body;
    const order = await prisma.order.create({
      data: {
        ...orderData,
        items: { create: items }
      },
      include: { items: true }
    });
    res.json(order);
  } catch (err) { handleErrors(res, err, "Failed to create order"); }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(order);
  } catch (err) { handleErrors(res, err, "Failed to update order"); }
});

app.get('/api/workOrders', async (req, res) => {
  try {
    const workOrders = await prisma.workOrder.findMany();
    res.json(workOrders);
  } catch (err) { handleErrors(res, err, "Failed to fetch work orders"); }
});

app.post('/api/workOrders', async (req, res) => {
  try {
    const workOrder = await prisma.workOrder.create({ data: req.body });
    res.json(workOrder);
  } catch (err) { handleErrors(res, err, "Failed to create work order"); }
});

app.put('/api/workOrders/:id', async (req, res) => {
  try {
    const workOrder = await prisma.workOrder.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(workOrder);
  } catch (err) { handleErrors(res, err, "Failed to update work order"); }
});

/**
 * --- INVENTORY & LOGS ---
 */
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { productName: 'asc' }
    });
    res.json(inventory);
  } catch (err) { handleErrors(res, err, "Failed to fetch inventory"); }
});

app.get('/api/inventory/:id/logs', async (req, res) => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      where: { inventoryItemId: req.params.id },
      orderBy: { timestamp: 'desc' }
    });
    res.json(logs);
  } catch (err) { handleErrors(res, err, "Failed to fetch inventory logs"); }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const item = await prisma.inventory.create({ data: req.body });
    res.json(item);
  } catch (err) { handleErrors(res, err, "Failed to create inventory item"); }
});

app.patch('/api/inventory/:id', async (req, res) => {
  try {
    const item = await prisma.inventory.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(item);
  } catch (err) { handleErrors(res, err, "Failed to adjust inventory"); }
});

/**
 * --- SALES & INTERACTIONS ---
 */
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({ orderBy: { date: 'desc' } });
    res.json(sales);
  } catch (err) { handleErrors(res, err, "Failed to fetch sales ledger"); }
});

app.post('/api/sales', async (req, res) => {
  try {
    const sale = await prisma.sale.create({ data: req.body });
    res.json(sale);
  } catch (err) { handleErrors(res, err, "Failed to record sale"); }
});

app.get('/api/calls', async (req, res) => {
  try {
    const calls = await prisma.callReport.findMany({ orderBy: { date: 'desc' } });
    res.json(calls);
  } catch (err) { handleErrors(res, err, "Failed to fetch call reports"); }
});

app.post('/api/calls', async (req, res) => {
  try {
    const call = await prisma.callReport.create({ data: req.body });
    res.json(call);
  } catch (err) { handleErrors(res, err, "Failed to create call report"); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  🚀 SWIFT PLASTICS OS - FULL CRUD ENGINE ACTIVE
  📡 API PORT: ${PORT}
  🛠 MODE: RESTFUL JSON
  `);
});