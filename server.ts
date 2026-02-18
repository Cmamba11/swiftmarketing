
/**
 * SWIFT PLASTICS - BACKEND ENGINE (server.ts)
 * 
 * SETUP:
 * 1. npm install express cors @prisma/client
 * 2. npx prisma generate
 * 3. npx ts-node server.ts
 */
import express from 'express';
import cors from 'cors';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

// Robust CORS for local separation
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json() as any);

/**
 * DATABASE SEEDER
 * Ensures the system is usable immediately upon ignition.
 */
async function seedDatabase() {
  try {
    const roleCount = await (prisma as any).role.count();
    if (roleCount === 0) {
      console.log("🌱 [SEED] Database empty. Planting System Administrator role...");
      const adminRole = await (prisma as any).role.create({
        data: {
          name: 'System Administrator',
          description: 'Root access with full industrial control.',
          isSystemAdmin: true,
          canViewPartners: true, canCreatePartners: true, canEditPartners: true, canDeletePartners: true,
          canViewAgents: true, canCreateAgents: true, canEditAgents: true, canDeleteAgents: true,
          canViewOrders: true, canCreateOrders: true, canEditOrders: true, canDeleteOrders: true,
          canVerifyOrders: true, canApproveAsAgentHead: true, canApproveAsAccountOfficer: true,
          canViewWorkOrders: true, canManageWorkOrders: true, canDeleteWorkOrders: true,
          canViewCalls: true, canCreateCalls: true, canEditCalls: true, canDeleteCalls: true,
          canViewLogistics: true, canManageLogistics: true,
          canViewSecurity: true, canManageUsers: true, canManageRoles: true,
          canAccessAIArchitect: true
        }
      });

      console.log("👤 [SEED] Creating default admin user...");
      await (prisma as any).user.create({
        data: {
          username: 'admin',
          name: 'Chief Administrator',
          roleId: adminRole.id
        }
      });
      console.log("✅ [SEED] System initialized. Login with 'admin'.");
    }
  } catch (err) {
    console.error("❌ [SEED] Failed to check/seed database:", err);
  }
}

seedDatabase();

// --- SYSTEM HEALTH ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ONLINE', 
    timestamp: new Date().toISOString(),
    engine: 'Prisma Runtime v5.x',
    database: 'Neon PostgreSQL'
  });
});

// --- PARTNERS ---
app.get('/api/partners', async (req, res) => {
  try {
    const partners = await (prisma as any).partner.findMany({ orderBy: { name: 'asc' } });
    res.json(partners);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners', async (req, res) => {
  try {
    const partner = await (prisma as any).partner.create({ data: req.body });
    res.json(partner);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/partners/:id', async (req, res) => {
  try {
    await (prisma as any).partner.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- AGENTS ---
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await (prisma as any).agent.findMany();
    res.json(agents);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/agents', async (req, res) => {
  try {
    const agent = await (prisma as any).agent.create({ data: req.body });
    res.json(agent);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/agents/:id', async (req, res) => {
  try {
    await (prisma as any).agent.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- ORDERS ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await (prisma as any).order.findMany({ include: { items: true } });
    res.json(orders);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, ...orderData } = req.body;
    const internalId = `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const order = await (prisma as any).order.create({
      data: {
        ...orderData,
        internalId,
        status: 'PENDING',
        items: { create: items }
      },
      include: { items: true }
    });
    res.json(order);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders/:id/approve', async (req, res) => {
  try {
    const { type } = req.body;
    const update: any = {};
    if (type === 'ADMIN') update.adminApproved = true;
    if (type === 'AGENT_HEAD') update.agentHeadApproved = true;
    if (type === 'ACCOUNT_OFFICER') update.accountOfficerApproved = true;
    
    const order = await (prisma as any).order.update({
      where: { id: req.params.id },
      data: update
    });
    res.json(order);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- WORK ORDERS ---
app.get('/api/work-orders', async (req, res) => {
  try {
    const wos = await (prisma as any).workOrder.findMany();
    res.json(wos);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/work-orders/issue', async (req, res) => {
  try {
    const { orderId } = req.body;
    const internalId = `WO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const wo = await (prisma as any).workOrder.create({
      data: { orderId, internalId, status: 'PENDING', priority: 'NORMAL' }
    });
    await (prisma as any).order.update({
      where: { id: orderId },
      data: { status: 'AWAITING_PROD' }
    });
    res.json(wo);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/work-orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const wo = await (prisma as any).workOrder.update({
      where: { id: req.params.id },
      data: { status, startDate: status === 'IN_PROD' ? new Date().toISOString() : undefined }
    });
    
    // Auto-update order status
    let orderStatus = 'IN_PROD';
    if (status === 'COMPLETED') orderStatus = 'READY_FOR_DISPATCH';
    await (prisma as any).order.update({
      where: { id: wo.orderId },
      data: { status: orderStatus }
    });
    
    res.json(wo);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- CONFIG ---
app.get('/api/config', async (req, res) => {
  try {
    let config = await (prisma as any).systemConfig.findFirst();
    if (!config) {
      config = await (prisma as any).systemConfig.create({
        data: {
          recommendedCommissionRate: 10,
          targetEfficiencyMetric: 'Lead Conversion',
          customerSegmentationAdvice: ['SMB', 'Enterprise'],
          logisticsThreshold: 50,
          lastUpdated: new Date().toISOString()
        }
      });
    }
    res.json(config);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/config', async (req, res) => {
  try {
    const config = await (prisma as any).systemConfig.findFirst();
    const updated = await (prisma as any).systemConfig.update({
      where: { id: config.id },
      data: { ...req.body, lastUpdated: new Date().toISOString() }
    });
    res.json(updated);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- USERS & ROLES ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await (prisma as any).user.findMany();
    res.json(users);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await (prisma as any).user.create({ data: req.body });
    res.json(user);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await (prisma as any).user.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/roles', async (req, res) => {
  try {
    const roles = await (prisma as any).role.findMany();
    res.json(roles);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/roles', async (req, res) => {
  try {
    const role = await (prisma as any).role.create({ data: req.body });
    res.json(role);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`📡 [SWIFT ENGINE] Backend active on port ${PORT}`);
  console.log(`🔗 [DB TARGET] Neon PostgreSQL Instance`);
});
