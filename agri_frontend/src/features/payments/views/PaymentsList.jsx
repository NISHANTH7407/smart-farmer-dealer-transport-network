import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { getUserRole, getUserId } from '../../../utils/auth';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import InputField from '../../../components/ui/InputField';
import Modal from '../../../components/ui/Modal';

const PaymentsList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const role = getUserRole();
  const userId = getUserId();
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');

  const { data: purchases, isLoading: loadingPurchases, isError: pError, refetch: refetchP } = useQuery({
    queryKey: ['purchases', { dealerId: role === 'DEALER' ? userId : null }],
    queryFn: async () => {
      let url = '/purchases';
      if (role === 'DEALER') url += `?dealerId=${userId}`;
      const res = await apiClient.get(url);
      return res.data || [];
    }
  });

  const { data: payments, isLoading: loadingPayments, isError: payError, refetch: refetchPay } = useQuery({
    queryKey: ['payments', { dealerId: role === 'DEALER' ? userId : null }],
    queryFn: async () => {
      let url = '/payments';
      if (role === 'DEALER') url += `?dealerId=${userId}`;
      const res = await apiClient.get(url);
      return res.data || [];
    }
  });

  const generatePaymentMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/payments', payload),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries(['payments']);
      setPaymentModalOpen(false);
      setSelectedPurchase(null);
      setReferenceNumber('');
    },
    onError: () => toast.error(t('common.error'))
  });

  if (pError || payError) {
    return (
      <Card style={{ textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ marginBottom: '1rem' }}>{t('common.error')}</h3>
        <Button onClick={() => { refetchP(); refetchPay(); }}><RefreshCw size={16} /> {t('common.retry')}</Button>
      </Card>
    );
  }

  if (loadingPurchases || loadingPayments) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} style={{ height: '150px', animation: 'pulse 1.5s infinite', background: 'var(--border-color)' }} />
        ))}
      </div>
    );
  }

  const confirmedPurchases = (purchases || []).filter(p => p.status === 'CONFIRMED' || p.status === 'DELIVERED');
  
  // Cross check with payments
  const unpaidPurchases = [];
  const paidPurchases = [];

  confirmedPurchases.forEach(p => {
    const payment = (payments || []).find(pay => String(pay.purchaseId) === String(p.purchaseId));
    if (payment) paidPurchases.push({ ...p, payment });
    else unpaidPurchases.push(p);
  });

  const handleMakePayment = (p) => {
    setSelectedPurchase(p);
    setPaymentModalOpen(true);
  };

  const submitPayment = () => {
    if (!referenceNumber) return toast.error('Reference parameter required');
    
    const amount = selectedPurchase.items?.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0) || 0;
    generatePaymentMutation.mutate({
      purchaseId: selectedPurchase.purchaseId,
      amount,
      paymentMethod,
      referenceNumber,
      status: 'COMPLETED'
    });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6" style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
        {t('nav.payments')}
      </h1>
      
      {role === 'DEALER' && unpaidPurchases.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-dark)', fontWeight: 600 }}>Action Required: Unpaid Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unpaidPurchases.map(p => {
              const amount = p.items?.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0) || 0;
              return (
                <Card key={p.purchaseId} style={{ borderLeft: '4px solid var(--warning)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                     <div>
                       <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Purchase ID</div>
                       <div style={{ fontWeight: 600 }}>#{p.purchaseId}</div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Amount Due</div>
                       <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--danger)' }}>₹{amount}</div>
                     </div>
                   </div>
                   <Button style={{ width: '100%' }} onClick={() => handleMakePayment(p)}>Make Payment</Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-dark)', fontWeight: 600 }}>Payment History</h2>
        {paidPurchases.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-secondary)' }}>
            No payments recorded yet.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paidPurchases.map(p => {
              const amount = p.payment.amount;
              return (
                <Card key={p.purchaseId} style={{ borderLeft: '4px solid var(--success)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                     <div>
                       <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Receipt for Purchase</div>
                       <div style={{ fontWeight: 600 }}>#{p.purchaseId}</div>
                     </div>
                     <Badge variant="success" style={{ alignSelf: 'flex-start' }}><CheckCircle size={14} style={{ marginRight: 4 }}/> Paid</Badge>
                   </div>
                   
                   <div style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Amount</span>
                          <span style={{ fontWeight: 600 }}>₹{amount}</span>
                        </div>
                        <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Method</span>
                          <span style={{ fontWeight: 600 }}>{p.payment.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Reference</span>
                          <span style={{ fontWeight: 600 }}>{p.payment.referenceNumber}</span>
                        </div>
                        <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                          <span style={{ fontWeight: 600 }}>{new Date(p.payment.paymentDate || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                   </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Make Payment">
        {selectedPurchase && (
          <div>
            <div style={{ background: 'var(--primary-light)', color: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Amount</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                ₹{selectedPurchase.items?.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0) || 0}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Payment Method</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            <InputField 
              label="Reference / Transaction Number" 
              placeholder="e.g. UTR / Ref Id"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />

            <div className="flex gap-4" style={{ marginTop: '2rem' }}>
              <Button variant="secondary" onClick={() => setPaymentModalOpen(false)} style={{ flex: 1 }}>{t('common.cancel')}</Button>
              <Button onClick={submitPayment} loading={generatePaymentMutation.isLoading} style={{ flex: 1 }}>Confirm Payment</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsList;
