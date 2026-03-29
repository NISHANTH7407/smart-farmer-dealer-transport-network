import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { getUserRole, getUserName, getUserId } from '../../../utils/auth';
import { Users, Truck, Store, Map, TrendingUp, Package, AlertCircle, RefreshCw } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Loader from '../../../components/ui/Loader';
import Button from '../../../components/ui/Button';

const fetchAdminStats = async () => {
  const [farmersRes, dealersRes, transportersRes, lotsRes, purchasesRes] = await Promise.all([
    apiClient.get('/farmers').catch(() => ({ data: [] })),
    apiClient.get('/dealers').catch(() => ({ data: [] })),
    apiClient.get('/transporters').catch(() => ({ data: [] })),
    apiClient.get('/lots').catch(() => ({ data: { items: [] } })),
    apiClient.get('/purchases').catch(() => ({ data: [] }))
  ]);

  const farmers = farmersRes.data || [];
  const dealers = dealersRes.data || [];
  const transporters = transportersRes.data || [];
  const lots = Array.isArray(lotsRes.data) ? lotsRes.data : (lotsRes.data?.items || []);
  const purchases = purchasesRes.data || [];

  const totalRevenue = purchases.reduce((sum, p) => {
    return sum + (p.items?.reduce((itemSum, item) => itemSum + (item.quantity * item.pricePerUnit), 0) || 0);
  }, 0);

  return {
    farmersCount: farmers.length,
    dealersCount: dealers.length,
    transportersCount: transporters.length,
    lotsCount: lots.length,
    purchasesCount: purchases.length,
    totalRevenue
  };
};

const fetchUserStats = async (role, userId) => {
  if (role === 'FARMER') {
    const lotsRes = await apiClient.get('/lots').catch(() => ({ data: { items: [] } }));
    const lots = Array.isArray(lotsRes.data) ? lotsRes.data : (lotsRes.data?.items || []);
    const myLots = lots.filter(l => String(l.farmerId) === String(userId));
    const activeLots = myLots.filter(l => l.availableQuantity > 0).length;
    return { activeLots, totalLots: myLots.length };
  } else if (role === 'DEALER') {
    const pRes = await apiClient.get(`/purchases?dealerId=${userId}`).catch(() => ({ data: [] }));
    const purchases = pRes.data || [];
    const spent = purchases.reduce((sum, p) => {
      return sum + (p.items?.reduce((itemSum, item) => itemSum + (item.quantity * item.pricePerUnit), 0) || 0);
    }, 0);
    return { totalPurchases: purchases.length, spent };
  } else if (role === 'TRANSPORTER') {
    const sRes = await apiClient.get(`/shipments?transporterId=${userId}`).catch(() => ({ data: [] }));
    const shipments = sRes.data || [];
    const active = shipments.filter(s => s.status === 'IN_TRANSIT').length;
    const completed = shipments.filter(s => s.status === 'DELIVERED').length;
    const earnings = shipments.reduce((sum, s) => sum + (s.status === 'DELIVERED' ? s.transporterFee : 0), 0);
    return { active, completed, earnings };
  }
  return {};
};

const StatCard = ({ title, value, icon, color }) => (
  <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ background: `${color}20`, padding: '1rem', borderRadius: '50%', color }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>{value}</div>
    </div>
  </Card>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const role = getUserRole();
  const userId = getUserId();
  const userName = getUserName() || role;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboardStats', role, userId],
    queryFn: () => role === 'ADMIN' ? fetchAdminStats() : fetchUserStats(role, userId),
    retry: 1
  });

  if (isError) return (
    <Card style={{ textAlign: 'center' }}>
      <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
      <h3 style={{ marginBottom: '1rem' }}>{t('common.error')}</h3>
      <Button onClick={() => refetch()}><RefreshCw size={16} /> {t('common.retry')}</Button>
    </Card>
  );

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} style={{ height: '120px', animation: 'pulse 1.5s infinite', background: 'var(--border-color)' }} />
       ))}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-dark)', fontWeight: 700 }}>
          Welcome back, {userName}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {role === 'ADMIN' ? 'Here is a quick overview of the agricultural network.' : 'Here is what is happening today.'}
        </p>
      </div>

      {role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Farmers" value={data.farmersCount} icon={<Users size={28} />} color="#10b981" />
          <StatCard title="Dealers" value={data.dealersCount} icon={<Store size={28} />} color="#3b82f6" />
          <StatCard title="Transporters" value={data.transportersCount} icon={<Truck size={28} />} color="#f59e0b" />
          <StatCard title="Total Lots" value={data.lotsCount} icon={<Package size={28} />} color="#8b5cf6" />
          <StatCard title="Purchases" value={data.purchasesCount} icon={<ShoppingCart size={28} />} color="#ec4899" />
          <StatCard title="Total Revenue" value={`₹${data.totalRevenue?.toLocaleString('en-IN') || 0}`} icon={<TrendingUp size={28} />} color="#14b8a6" />
        </div>
      )}

      {role === 'FARMER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard title="Active Lots" value={data.activeLots} icon={<Package size={28} />} color="#10b981" />
          <StatCard title="Total Lots Created" value={data.totalLots} icon={<Map size={28} />} color="#3b82f6" />
        </div>
      )}

      {role === 'DEALER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard title="Total Orders" value={data.totalPurchases} icon={<ShoppingCart size={28} />} color="#f59e0b" />
          <StatCard title="Total Spent" value={`₹${data.spent?.toLocaleString('en-IN') || 0}`} icon={<TrendingUp size={28} />} color="#10b981" />
        </div>
      )}

      {role === 'TRANSPORTER' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Active Assignments" value={data.active} icon={<Truck size={28} />} color="#3b82f6" />
          <StatCard title="Completed" value={data.completed} icon={<Package size={28} />} color="#10b981" />
          <StatCard title="Total Earnings" value={`₹${data.earnings?.toLocaleString('en-IN') || 0}`} icon={<TrendingUp size={28} />} color="#f59e0b" />
        </div>
      )}

      <Card title="Quick Actions" style={{ marginTop: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Navigate from the sidebar to manage your activities.</p>
      </Card>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
