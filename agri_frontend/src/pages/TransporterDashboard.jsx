import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getAllShipments, updateShipmentStatus } from '../services/shipmentService';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';
import { Truck, CheckCircle, Clock } from 'lucide-react';

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

  const stats = [
    { label: 'Total Shipments', value: shipments.length, icon: <Truck size={22} />, color: '#b45309' },
    { label: 'In Transit',      value: inTransit.length,  icon: <Clock size={22} />, color: '#1d4ed8' },
    { label: 'Delivered',       value: delivered.length,  icon: <CheckCircle size={22} />, color: '#15803d' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>🚛 Transporter Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ background: s.color + '20', color: s.color, padding: '0.75rem', borderRadius: '0.5rem' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Shipments Table */}
      <Card title="All Shipments">
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
                  {['ID', 'From Party', 'To Party', 'Shipment Date', 'Delivery Date', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.shipmentId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>#{s.shipmentId}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>Party #{s.fromPartyId}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>Party #{s.toPartyId}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.shipmentDate || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.deliveryDate || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={s.status} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {s.status === 'IN_TRANSIT' && (
                        <button
                          onClick={() => updateMutation.mutate({ shipmentId: s.shipmentId, status: 'DELIVERED' })}
                          disabled={updateMutation.isPending}
                          style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ✓ Mark Delivered
                        </button>
                      )}
                      {s.status === 'DELIVERED' && (
                        <span style={{ fontSize: '0.8rem', color: '#15803d' }}>✓ Completed</span>
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
