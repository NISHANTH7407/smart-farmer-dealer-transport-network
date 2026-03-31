import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getAvailableProduceLots } from '../services/produceService';
import { createPurchase, getMyPurchases, updatePurchaseStatus } from '../services/purchaseService';
import { createPayment } from '../services/paymentService';
import { createShipment, getAllShipments } from '../services/shipmentService';
import { getAllTransporters } from '../services/transporterService';
import { getAllParties } from '../services/partyService';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import PurchaseForm from '../components/forms/PurchaseForm';
import toast from 'react-hot-toast';
import { ShoppingCart, CreditCard, Package, Leaf, Truck } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatusBadge = ({ status }) => {
  const colors = {
    DELIVERED:  { bg: '#dcfce7', color: '#166534' },
    IN_TRANSIT: { bg: '#fef3c7', color: '#92400e' },
    PENDING:    { bg: '#dbeafe', color: '#1e40af' },
    CONFIRMED:  { bg: '#dcfce7', color: '#166534' },
    CANCELLED:  { bg: '#fee2e2', color: '#991b1b' },
    PAID:       { bg: '#dcfce7', color: '#166534' },
  };
  const s = colors[status] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
      {status}
    </span>
  );
};

const iStyle = {
  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', background: 'var(--white)',
  color: 'var(--text-primary)', fontSize: '0.875rem',
};
const lStyle = { display: 'block', fontWeight: 500, fontSize: '0.82rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' };

const EMPTY_SHIP = { transporterId: '', fromPartyId: '', toPartyId: '', pickupLocation: '', dropLocation: '', distanceKm: '' };

const DealerDashboard = () => {
  const { user } = useAuth();
  const dealerId = user?.id;
  const queryClient = useQueryClient();

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPayModal,      setShowPayModal]      = useState(null);
  const [showShipModal,     setShowShipModal]     = useState(null);
  const [payAmount,         setPayAmount]         = useState('');
  const [shipForm,          setShipForm]          = useState(EMPTY_SHIP);

  const { data: lots        = [], isLoading: lotsLoading }     = useQuery({ queryKey: ['availableLots'],             queryFn: getAvailableProduceLots });
  const { data: purchases   = [], isLoading: purchasesLoading } = useQuery({ queryKey: ['dealerPurchases', dealerId], queryFn: () => getMyPurchases(dealerId), enabled: !!dealerId });
  const { data: shipments   = [] }                              = useQuery({ queryKey: ['allShipments'],              queryFn: getAllShipments });
  const { data: transporters= [] }                              = useQuery({ queryKey: ['transporters'],              queryFn: getAllTransporters });
  const { data: parties     = [] }                              = useQuery({ queryKey: ['parties'],                   queryFn: getAllParties });

  // Dynamic fee calculation
  const selectedTransporter = transporters.find(t => String(t.transporterId) === String(shipForm.transporterId));
  const ratePerKm   = selectedTransporter?.ratePerKm || 10;
  const distanceKm  = parseFloat(shipForm.distanceKm) || 0;
  const estimatedFee = (distanceKm * ratePerKm).toFixed(2);

  const purchaseMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      toast.success('Purchase order placed!');
      queryClient.invalidateQueries(['dealerPurchases', dealerId]);
      queryClient.invalidateQueries(['availableLots']);
      setShowPurchaseModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Purchase failed'),
  });

  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success('Payment recorded!');
      queryClient.invalidateQueries(['dealerPurchases', dealerId]);
      setShowPayModal(null);
      setPayAmount('');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Payment failed'),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, status }) => updatePurchaseStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated!');
      queryClient.invalidateQueries(['dealerPurchases', dealerId]);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const shipmentMutation = useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      toast.success('Shipment assigned successfully!');
      queryClient.invalidateQueries(['allShipments']);
      setShowShipModal(null);
      setShipForm(EMPTY_SHIP);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Shipment failed'),
  });

  const handleAssignShipment = () => {
    const { transporterId, fromPartyId, toPartyId, pickupLocation, dropLocation, distanceKm } = shipForm;
    if (!transporterId || !fromPartyId || !toPartyId || !pickupLocation || !dropLocation || !distanceKm) {
      toast.error('Please fill all shipment fields');
      return;
    }
    if (parseFloat(distanceKm) <= 0) {
      toast.error('Distance must be greater than 0');
      return;
    }
    shipmentMutation.mutate({
      transporterId:  Number(transporterId),
      fromPartyId:    Number(fromPartyId),
      toPartyId:      Number(toPartyId),
      pickupLocation: pickupLocation.trim(),
      dropLocation:   dropLocation.trim(),
      distanceKm:     parseFloat(distanceKm),
    });
  };

  const stats = [
    { label: 'Available Lots', value: lots.length,                                           icon: <Package size={22} />,      color: '#15803d' },
    { label: 'My Purchases',   value: purchases.length,                                      icon: <ShoppingCart size={22} />, color: '#1d4ed8' },
    { label: 'Confirmed',      value: purchases.filter(p => p.status === 'CONFIRMED').length, icon: <Truck size={22} />,        color: '#7c3aed' },
    { label: 'Pending',        value: purchases.filter(p => p.status === 'PENDING').length,   icon: <CreditCard size={22} />,   color: '#b45309' },
  ];

  const last6Months = Array.from({length: 6}, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), total: 0 };
  });

  purchases.forEach(p => {
    if (!p.purchaseDate) return;
    const pd = new Date(p.purchaseDate);
    const match = last6Months.find(m => m.month === pd.toLocaleString('default', { month: 'short' }) && m.year === pd.getFullYear());
    if (match) {
      match.total += (p.items || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.pricePerUnit || 0)), 0);
    }
  });

  const chartData = {
    labels: last6Months.map(m => m.month),
    datasets: [{
      label: 'Purchase Value (₹)',
      data: last6Months.map(m => m.total),
      backgroundColor: '#15803d',
      borderRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>🏪 Dealer Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Welcome back, {user?.name}</p>
        </div>
        <button onClick={() => setShowPurchaseModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1d4ed8', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          <ShoppingCart size={18} /> New Purchase
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

      <Card title="Monthly Purchase Value (Last 6 Months)">
        <div style={{ height: '300px', width: '100%' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Browse Lots */}
        <Card title="Available Produce Lots">
          {lotsLoading ? <Loader /> : lots.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No lots available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
              {lots.map(lot => (
                <div key={lot.lotId} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', background: 'var(--bg-color)' }}>
                  {lot.imageUrl ? (
                    <img src={lot.imageUrl} alt={lot.cropType} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '0.4rem', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Leaf size={26} color="#15803d" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{lot.cropType}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lot #{lot.lotId} · {lot.availableQuantity} {lot.unit} available</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Grade: <strong>{lot.qualityGrade}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Purchase History */}
        <Card title="Purchase History">
          {purchasesLoading ? <Loader /> : purchases.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No purchases yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto' }}>
              {purchases.map(p => (
                <div key={p.purchaseId} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Purchase #{p.purchaseId}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.purchaseDate} · {p.items?.length || 0} items</div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {p.status === 'PENDING' && (
                      <>
                        <button onClick={() => confirmMutation.mutate({ id: p.purchaseId, status: 'CONFIRMED' })}
                          style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '0.3rem', fontWeight: 600 }}>
                          ✓ Confirm
                        </button>
                        <button onClick={() => confirmMutation.mutate({ id: p.purchaseId, status: 'CANCELLED' })}
                          style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '0.3rem', fontWeight: 600 }}>
                          ✕ Cancel
                        </button>
                      </>
                    )}
                    {p.status === 'CONFIRMED' && (
                      <>
                        <button onClick={() => { setShowPayModal(p.purchaseId); setPayAmount(''); }}
                          style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '0.3rem', fontWeight: 600 }}>
                          💳 Pay
                        </button>
                        <button onClick={() => { setShowShipModal(p); setShipForm(EMPTY_SHIP); }}
                          style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '0.3rem', fontWeight: 600 }}>
                          🚚 Assign Shipment
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Purchase Modal ── */}
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Create Purchase Order">
        <PurchaseForm lots={lots} dealerId={dealerId} onSubmit={purchaseMutation.mutate} loading={purchaseMutation.isPending} />
      </Modal>

      {/* ── Payment Modal ── */}
      <Modal isOpen={!!showPayModal} onClose={() => setShowPayModal(null)} title={`Record Payment — Purchase #${showPayModal}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={lStyle}>Amount (₹) *</label>
            <input type="number" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Enter payment amount" style={iStyle} />
          </div>
          <button
            onClick={() => {
              if (!payAmount || Number(payAmount) <= 0) { toast.error('Enter valid amount'); return; }
              paymentMutation.mutate({ purchaseId: showPayModal, amount: Number(payAmount) });
            }}
            disabled={paymentMutation.isPending}
            style={{ background: '#1d4ed8', color: '#fff', padding: '0.65rem', borderRadius: '0.5rem', fontWeight: 600, opacity: paymentMutation.isPending ? 0.7 : 1 }}>
            {paymentMutation.isPending ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </Modal>

      {/* ── Assign Shipment Modal ── */}
      <Modal isOpen={!!showShipModal} onClose={() => { setShowShipModal(null); setShipForm(EMPTY_SHIP); }} title={`Assign Shipment — Purchase #${showShipModal?.purchaseId}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Transporter selector with rate info */}
          <div>
            <label style={lStyle}>Transporter *</label>
            <select value={shipForm.transporterId} onChange={e => setShipForm(f => ({ ...f, transporterId: e.target.value }))} style={iStyle}>
              <option value="">-- Select Transporter --</option>
              {transporters.map(t => (
                <option key={t.transporterId} value={t.transporterId}>
                  {t.name} — {t.vehicleDetails} (₹{t.ratePerKm}/km)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={lStyle}>From Party (Sender) *</label>
              <select value={shipForm.fromPartyId} onChange={e => setShipForm(f => ({ ...f, fromPartyId: e.target.value }))} style={iStyle}>
                <option value="">-- Select --</option>
                {parties.map(p => (
                  <option key={p.partyId} value={p.partyId}>#{p.partyId} — {p.name} ({p.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lStyle}>To Party (Receiver) *</label>
              <select value={shipForm.toPartyId} onChange={e => setShipForm(f => ({ ...f, toPartyId: e.target.value }))} style={iStyle}>
                <option value="">-- Select --</option>
                {parties.map(p => (
                  <option key={p.partyId} value={p.partyId}>#{p.partyId} — {p.name} ({p.type})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={lStyle}>Pickup Location *</label>
            <input value={shipForm.pickupLocation} onChange={e => setShipForm(f => ({ ...f, pickupLocation: e.target.value }))}
              placeholder="e.g. Ludhiana, Punjab" style={iStyle} />
          </div>

          <div>
            <label style={lStyle}>Drop Location *</label>
            <input value={shipForm.dropLocation} onChange={e => setShipForm(f => ({ ...f, dropLocation: e.target.value }))}
              placeholder="e.g. Delhi" style={iStyle} />
          </div>

          <div>
            <label style={lStyle}>Distance (km) *</label>
            <input type="number" step="0.1" min="1" value={shipForm.distanceKm}
              onChange={e => setShipForm(f => ({ ...f, distanceKm: e.target.value }))}
              placeholder="e.g. 150" style={iStyle} />
          </div>

          {/* Dynamic fee preview */}
          {distanceKm > 0 && selectedTransporter && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#166534' }}>
                {distanceKm} km × ₹{ratePerKm}/km
              </span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#15803d' }}>
                Estimated Fee: ₹{estimatedFee}
              </span>
            </div>
          )}

          <button
            onClick={handleAssignShipment}
            disabled={shipmentMutation.isPending}
            style={{ background: '#b45309', color: '#fff', padding: '0.7rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: shipmentMutation.isPending ? 0.7 : 1 }}>
            <Truck size={18} />
            {shipmentMutation.isPending ? 'Assigning...' : 'Assign Transporter & Create Shipment'}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default DealerDashboard;
