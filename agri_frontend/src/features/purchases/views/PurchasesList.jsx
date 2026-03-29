import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { getUserRole, getUserId } from '../../../utils/auth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Truck, XCircle, AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import CreateShipmentModal from './CreateShipmentModal';

const PurchasesList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const role = getUserRole();
  const userId = getUserId();
  
  const [expandedId, setExpandedId] = useState(null);
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const { data: purchases, isLoading, isError, refetch } = useQuery({
    queryKey: ['purchases', { dealerId: role === 'DEALER' ? userId : null }],
    queryFn: async () => {
      const url = role === 'DEALER' ? `/purchases?dealerId=${userId}` : '/purchases';
      const res = await apiClient.get(url);
      return res.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => apiClient.put(`/purchases/${id}`, { status: 'CANCELLED' }),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries(['purchases']);
    },
    onError: () => toast.error(t('common.error'))
  });

  const handleCancel = (purchase) => {
    if (window.confirm(t('common.confirm'))) {
      cancelMutation.mutate(purchase.purchaseId);
    }
  };

  const handleCreateShipment = (purchase) => {
    setSelectedPurchase(purchase);
    setShipmentModalOpen(true);
  };

  if (isError) {
    return (
      <Card style={{ textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ marginBottom: '1rem' }}>{t('common.error')}</h3>
        <Button onClick={() => refetch()}><RefreshCw size={16} /> {t('common.retry')}</Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} style={{ height: '100px', animation: 'pulse 1.5s infinite', background: 'var(--border-color)' }} />
        ))}
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <ShoppingCart size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <h3 style={{ marginBottom: '0.5rem' }}>{t('common.empty')}</h3>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6" style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
        {t('nav.purchases')}
      </h1>
      
      <div className="grid grid-cols-1 gap-4">
        {purchases.map(purchase => {
          const isExpanded = expandedId === purchase.purchaseId;
          const totalAmount = purchase.items?.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0) || 0;
          
          return (
            <Card key={purchase.purchaseId} style={{ padding: 0, overflow: 'hidden' }}>
              <div 
                className="flex justify-between items-center cursor-pointer" 
                style={{ padding: '1rem 1.5rem', background: isExpanded ? 'rgba(0,0,0,0.02)' : 'transparent', transition: 'background 0.2s' }}
                onClick={() => setExpandedId(isExpanded ? null : purchase.purchaseId)}
              >
                <div className="flex items-center gap-4">
                  <div style={{ background: 'var(--primary-light)', color: 'white', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    #{purchase.purchaseId.toString().slice(-3)}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{purchase.purchaseDate ? format(new Date(purchase.purchaseDate), 'dd MMM yyyy') : 'Recently'}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{purchase.items?.length || 0} items</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.125rem' }}>₹{totalAmount}</span>
                    <Badge variant={
                      purchase.status === 'CONFIRMED' ? 'success' : 
                      purchase.status === 'CANCELLED' ? 'danger' : 'warning'
                    }>
                      {purchase.status}
                    </Badge>
                  </div>
                  <button style={{ color: 'var(--text-secondary)' }}>
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </button>
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--white)' }}>
                  <h5 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--text-dark)' }}>Line Items</h5>
                  <div style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    {purchase.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center" style={{ padding: '0.5rem 0', borderBottom: idx !== purchase.items.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>Lot #{item.lotId}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.quantity} units @ ₹{item.pricePerUnit}/unit</div>
                        </div>
                        <div style={{ fontWeight: 600 }}>₹{item.quantity * item.pricePerUnit}</div>
                      </div>
                    ))}
                  </div>
                  
                  {role === 'DEALER' && (
                    <div className="flex justify-end gap-4" style={{ marginTop: '1.5rem' }}>
                      {purchase.status === 'PENDING' && (
                        <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleCancel(purchase); }} loading={cancelMutation.isLoading}>
                          <XCircle size={18} /> Cancel Purchase
                        </Button>
                      )}
                      {purchase.status === 'CONFIRMED' && (
                        <Button onClick={(e) => { e.stopPropagation(); handleCreateShipment(purchase); }}>
                          <Truck size={18} /> Create Shipment
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {selectedPurchase && (
        <CreateShipmentModal 
          isOpen={shipmentModalOpen}
          onClose={() => { setShipmentModalOpen(false); setSelectedPurchase(null); }}
          purchase={selectedPurchase}
        />
      )}
    </div>
  );
};

export default PurchasesList;
