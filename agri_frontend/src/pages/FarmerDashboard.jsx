import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { createProduceLot, getMyProduceLots } from '../services/produceService';
import { getAllShipments } from '../services/shipmentService';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import AddProduceForm from '../components/forms/AddProduceForm';
import toast from 'react-hot-toast';
import { Package, Truck, Plus, Leaf } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const colors = {
    DELIVERED: { bg: '#dcfce7', color: '#166534' },
    IN_TRANSIT: { bg: '#fef3c7', color: '#92400e' },
    PENDING: { bg: '#dbeafe', color: '#1e40af' },
    CONFIRMED: { bg: '#dcfce7', color: '#166534' },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
  };
  const s = colors[status] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
      {status}
    </span>
  );
};

const FarmerDashboard = () => {
  const { user } = useAuth();
  const farmerId = user?.id;
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: lots = [], isLoading: lotsLoading } = useQuery({
    queryKey: ['farmerLots', farmerId],
    queryFn: () => getMyProduceLots(farmerId),
    enabled: !!farmerId,
  });

  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ['allShipments'],
    queryFn: getAllShipments,
  });

  const addLotMutation = useMutation({
    mutationFn: (data) => createProduceLot(farmerId, data),
    onSuccess: () => {
      toast.success('Produce lot added!');
      queryClient.invalidateQueries(['farmerLots', farmerId]);
      setShowAddModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add lot'),
  });

  const stats = [
    { label: 'Total Lots', value: lots.length, icon: <Package size={22} />, color: '#15803d' },
    { label: 'Total Quantity', value: `${lots.reduce((s, l) => s + (l.quantity || 0), 0)} kg`, icon: <Leaf size={22} />, color: '#0891b2' },
    { label: 'Available Stock', value: `${lots.reduce((s, l) => s + (l.availableQuantity || 0), 0)} kg`, icon: <Package size={22} />, color: '#7c3aed' },
    { label: 'Shipments', value: shipments.length, icon: <Truck size={22} />, color: '#b45309' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>🌾 Farmer Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Welcome back, {user?.name}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}
        >
          <Plus size={18} /> Add Produce Lot
        </button>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Produce Lots */}
        <Card title="My Produce Lots">
          {lotsLoading ? <Loader /> : lots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <Package size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p>No lots yet. Add your first produce lot!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
              {lots.map(lot => (
                <div key={lot.lotId} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', background: 'var(--bg-color)' }}>
                  {lot.imageUrl ? (
                    <img src={lot.imageUrl} alt={lot.cropType} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.4rem', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', background: '#dcfce7', borderRadius: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Leaf size={24} color="#15803d" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{lot.cropType}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {lot.availableQuantity}/{lot.quantity} {lot.unit} available
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                      <StatusBadge status={`Grade ${lot.qualityGrade}`} />
                      {lot.harvestDate && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📅 {lot.harvestDate}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Shipments */}
        <Card title="Shipments">
          {shipmentsLoading ? <Loader /> : shipments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <Truck size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p>No shipments found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
              {shipments.map(s => (
                <div key={s.shipmentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Shipment #{s.shipmentId}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {s.shipmentDate} {s.deliveryDate ? `→ ${s.deliveryDate}` : ''}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Lot Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Produce Lot">
        <AddProduceForm
          onSubmit={addLotMutation.mutate}
          loading={addLotMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default FarmerDashboard;
