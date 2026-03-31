import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getAllShipments, updateShipmentStatus } from '../services/shipmentService';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';
import { Truck, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatusBadge = ({ status }) => {
  const colors = {
    DELIVERED:  { bg: '#dcfce7', color: '#166534' },
    IN_TRANSIT: { bg: '#fef3c7', color: '#92400e' },
  };
  const s = colors[status] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
      {status}
    </span>
  );
};

const TransporterDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['allShipments'],
    queryFn: getAllShipments,
  });

  const updateMutation = useMutation({
    mutationFn: ({ shipmentId, status }) => updateShipmentStatus(shipmentId, status),
    onSuccess: () => {
      toast.success('Shipment status updated!');
      queryClient.invalidateQueries(['allShipments']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT');
  const delivered = shipments.filter(s => s.status === 'DELIVERED');
  const totalEarnings = shipments.filter(s => s.status === 'DELIVERED').reduce((sum, s) => sum + (s.fee || 0), 0);

  const stats = [
    { label: 'Total Shipments', value: shipments.length,  icon: <Truck size={22} />,        color: '#b45309' },
    { label: 'In Transit',      value: inTransit.length,  icon: <Clock size={22} />,         color: '#1d4ed8' },
    { label: 'Delivered',       value: delivered.length,  icon: <CheckCircle size={22} />,   color: '#15803d' },
    { label: 'Total Earnings',  value: `₹${totalEarnings.toLocaleString()}`, icon: <IndianRupee size={22} />, color: '#7c3aed' },
  ];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthShipments = shipments.filter(s => {
    if (!s.shipmentDate) return false;
    const d = new Date(s.shipmentDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const sPending = thisMonthShipments.filter(s => s.status === 'PENDING').length;
  const sInTransit = thisMonthShipments.filter(s => s.status === 'IN_TRANSIT').length;
  const sDelivered = thisMonthShipments.filter(s => s.status === 'DELIVERED').length;

  const chartData = {
    labels: ['Pending', 'In Transit', 'Delivered'],
    datasets: [{
      label: 'Deliveries This Month',
      data: [sPending, sInTransit, sDelivered],
      backgroundColor: ['#f59e0b', '#3b82f6', '#15803d'],
      borderRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>🚛 Transporter Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Welcome back, {user?.name}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ background: s.color + '20', color: s.color, padding: '0.75rem', borderRadius: '0.5rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Card title="Deliveries This Month">
        <div style={{ height: '300px', width: '100%' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>

      {/* Shipments Table */}
      <Card title="Assigned Shipments">
        {isLoading ? <Loader /> : shipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <Truck size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No shipments assigned yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)' }}>
                  {['ID', 'Pickup Location', 'Drop Location', 'Distance', 'Fee', 'From', 'To', 'Date', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.shipmentId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, fontSize: '0.875rem' }}>#{s.shipmentId}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{s.pickupLocation || '—'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{s.dropLocation || '—'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.distanceKm ? `${s.distanceKm} km` : '—'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>{s.fee ? `₹${s.fee.toLocaleString()}` : '—'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{s.fromPartyName || `Party #${s.fromPartyId}`}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{s.toPartyName || `Party #${s.toPartyId}`}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.shipmentDate || '—'}</td>
                    <td style={{ padding: '0.75rem' }}><StatusBadge status={s.status} /></td>
                    <td style={{ padding: '0.75rem' }}>
                      {s.status === 'IN_TRANSIT' && (
                        <button
                          onClick={() => updateMutation.mutate({ shipmentId: s.shipmentId, status: 'DELIVERED' })}
                          disabled={updateMutation.isPending}
                          style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          ✓ Mark Delivered
                        </button>
                      )}
                      {s.status === 'DELIVERED' && (
                        <span style={{ fontSize: '0.8rem', color: '#15803d' }}>✓ Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TransporterDashboard;
