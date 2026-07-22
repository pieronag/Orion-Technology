'use server'

import { getDb } from '@/lib/firebase-admin';
import { convertTimestamps } from '@/lib/firestore-utils';

export async function getNexusDashboardStats(filterMonth?: number, filterYear?: number): Promise<{
  success: true; stats: {
    totalOrders: number; totalClients: number; totalEquipments: number;
    statusCounts: Record<string, number>; monthPayments: number;
    lowStockItems: { id: string; name: string; stock: number; minStock: number }[];
    avgRepairTime: number; avgRepairTimeByType: Record<string, number>;
    recentActivity: { id: string; status: string; createdAt: number; clientName: string; equipmentName: string }[];
    pendingPaymentCount: number; partialPaymentCount: number; paidCount: number;
    totalRevenue: number; pendingRevenue: number;
    monthQuotes: number; monthOrders: number; inWorkshop: number;
  }
} | { success: false; error: string }> {
  try {
    const m = filterMonth !== undefined ? filterMonth : new Date().getMonth();
    const y = filterYear !== undefined ? filterYear : new Date().getFullYear();
    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 1);

    const ordersSnap = await getDb().collection('nexus-work-orders').get();
    const orders = ordersSnap.docs.map(d => convertTimestamps(d.data()));
    const cancelledIds = new Set(orders.filter((o: any) => o.status === 'cancelled').map((o: any) => o.id));

    const monthOrders = orders.filter((o: any) => o.createdAt && o.createdAt >= monthStart.getTime() && o.createdAt < monthEnd.getTime()).length;
    const activeOrders = orders.filter((o: any) => o.status !== 'cancelled');

    const inWorkshop = activeOrders.filter((o: any) => o.status !== 'delivered').length;

    let pendingPaymentCount = 0, partialPaymentCount = 0, paidCount = 0;
    let totalRevenue = 0, pendingRevenue = 0;
    for (const o of activeOrders) {
      const amt = o.totalAmount || 0;
      totalRevenue += amt;
      if (o.paymentStatus === 'pending') { pendingPaymentCount++; pendingRevenue += amt; }
      else if (o.paymentStatus === 'partial') partialPaymentCount++;
      else if (o.paymentStatus === 'paid') paidCount++;
    }

    const paymentsSnap = await getDb().collection('nexus-payments')
      .where('date', '>=', monthStart).where('date', '<', monthEnd).get();
    const monthPayments = paymentsSnap.docs
      .filter(d => !cancelledIds.has(d.data().workOrderId))
      .reduce((sum, d) => sum + (d.data().amount || 0), 0);

    const inventorySnap = await getDb().collection('nexus-inventory').get();
    const lowStockItems = inventorySnap.docs.filter((d: any) => d.data().stock <= d.data().minStock)
      .map(d => ({ id: d.id, name: d.data().name, stock: d.data().stock, minStock: d.data().minStock }));

    const statusCounts: Record<string, number> = {};
    let totalRepairTime = 0, repairCount = 0;
    const typeTimes: Record<string, { total: number; count: number }> = {};

    for (const o of activeOrders) {
      const status = o.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (o.deliveredAt && o.receivedAt) {
        const diffMs = o.deliveredAt - o.receivedAt;
        if (diffMs > 0) {
          totalRepairTime += diffMs; repairCount++;
          const eqDoc = await getDb().collection('nexus-equipments').doc(o.equipmentId).get();
          const eqType = convertTimestamps(eqDoc.data())?.type || 'other';
          if (!typeTimes[eqType]) typeTimes[eqType] = { total: 0, count: 0 };
          typeTimes[eqType].total += diffMs; typeTimes[eqType].count++;
        }
      }
    }

    const avgRepairTime = repairCount > 0 ? totalRepairTime / repairCount : 0;
    const avgByType: Record<string, number> = {};
    for (const [type, val] of Object.entries(typeTimes))
      avgByType[type] = val.count > 0 ? val.total / val.count : 0;

    const clientsSnap = await getDb().collection('nexus-clients').get();
    const equipmentsSnap = await getDb().collection('nexus-equipments').get();

    const quotesSnap = await getDb().collection('nexus-quotes')
      .where('createdAt', '>=', monthStart).where('createdAt', '<', monthEnd).get();
    const monthQuotes = quotesSnap.docs.length;

    // Recent activity with client and equipment info
    const recentActivity = await getDb().collection('nexus-work-orders')
      .orderBy('createdAt', 'desc').limit(10).get();
    const activity = await Promise.all(recentActivity.docs.map(async d => {
      const data = convertTimestamps(d.data());
      let clientName = '';
      let equipmentName = '';
      try {
        const cd = await getDb().collection('nexus-clients').doc(data.clientId).get();
        clientName = cd.data()?.name || '';
      } catch {}
      try {
        const ed = await getDb().collection('nexus-equipments').doc(data.equipmentId).get();
        const eq = ed.data();
        if (eq) equipmentName = `${eq.brand || ''} ${eq.model || ''}`.trim();
      } catch {}
      return {
        id: d.id, status: data.status,
        createdAt: data.createdAt || 0,
        clientName, equipmentName,
      };
    }));

    return {
      success: true,
      stats: {
        totalOrders: activeOrders.length, totalClients: clientsSnap.size,
        totalEquipments: equipmentsSnap.size, statusCounts, monthPayments,
        lowStockItems, avgRepairTime, avgRepairTimeByType: avgByType,
        recentActivity: activity,
        pendingPaymentCount, partialPaymentCount, paidCount,
        totalRevenue, pendingRevenue,
        monthQuotes, monthOrders, inWorkshop,
      },
    };
  } catch (e) {
    console.error('Error fetching dashboard stats:', e);
    return { success: false, error: 'Error al cargar estadísticas' };
  }
}
