import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getLots } from '../../lots/api/lotsApi';
import apiClient from '../../../api/axios';
import { getUserId } from '../../../utils/auth';
import useCartStore from '../store/useCartStore';
import toast from 'react-hot-toast';
import { Search, ShoppingCart, Trash2, PackageOpen, AlertCircle, RefreshCw } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import InputField from '../../../components/ui/InputField';
import Modal from '../../../components/ui/Modal';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const BrowseLots = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const dealerId = getUserId();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const { items: cartItems, addItem, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch all lots and client-side filter
  const { data: lotsResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ['available-lots', { search: debouncedSearch }],
    queryFn: () => apiClient.get('/lots', { params: { status: 'AVAILABLE', search: debouncedSearch } }).then(res => res.data)
  });

  const purchaseMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/purchases', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['available-lots']);
      queryClient.invalidateQueries(['purchases']);
      toast.success(t('common.success'));
      clearCart();
      setIsCartOpen(false);
      // navigation can be handled via link or navigate, we are in modal here
    },
    onError: () => toast.error(t('common.error'))
  });

  const availableLots = Array.isArray(lotsResponse) ? lotsResponse : (lotsResponse?.items || []);
  
  let displayedLots = availableLots.filter(lot => lot.status === 'AVAILABLE' || lot.availableQuantity > 0);
  if (filterGrade) {
    displayedLots = displayedLots.filter(l => l.qualityGrade === filterGrade);
  }

  const handlePlaceOrder = () => {
    if (!dealerId) return toast.error('Dealer identity not found');
    const payload = {
      dealerId,
      items: cartItems.map(item => ({
        lotId: item.lotId,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit
      }))
    };
    purchaseMutation.mutate(payload);
  };

  return (
    <div className="animate-fade-in relative flex items-start gap-6">
      <div style={{ flex: 1 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>{t('nav.browse')}</h1>
          <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
            <InputField 
              placeholder={t('common.search')}
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ marginBottom: 0, minWidth: '200px' }}
            />
            <select 
              value={filterGrade} 
              onChange={e => setFilterGrade(e.target.value)}
              className="input" 
              style={{ width: 'auto', marginBottom: 0 }}
            >
              <option value="">{t('common.filter')} Grade</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
            <Button variant="secondary" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
              <ShoppingCart size={18} />
              {cartItems.length > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                  {cartItems.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {isError ? (
           <div className="card" style={{ textAlign: 'center' }}>
             <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
             <p>{t('common.error')}</p>
             <Button onClick={() => refetch()} style={{ marginTop: '1rem' }}><RefreshCw size={16} /> {t('common.retry')}</Button>
           </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} style={{ height: '300px', animation: 'pulse 1.5s infinite', background: 'var(--border-color)' }} />
             ))}
          </div>
        ) : displayedLots.length === 0 ? (
           <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
             <PackageOpen size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
             <p style={{ color: 'var(--text-secondary)' }}>{t('common.empty')}</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedLots.map(lot => (
              <Card key={lot.lotId} style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: '160px', background: 'var(--bg-color)', position: 'relative' }}>
                   {lot.photoUrl ? (
                     <img src={lot.photoUrl} alt="crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                     <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🌱</div>
                   )}
                   <div style={{ position: 'absolute', top: 8, right: 8 }}>
                     <Badge variant={lot.qualityGrade === 'A' ? 'success' : lot.qualityGrade === 'B' ? 'warning' : 'danger'}>
                        Grade {lot.qualityGrade}
                     </Badge>
                   </div>
                </div>
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                   <div className="flex justify-between items-start mb-2">
                     <h3 style={{ fontSize: '1.25rem' }}>{lot.cropName}</h3>
                     <strong style={{ color: 'var(--primary)' }}>₹{lot.pricePerUnit || 0}/{lot.unit}</strong>
                   </div>
                   <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                     Seller: {lot.farmer?.name || lot.party?.name || 'Unknown'}
                   </p>
                   <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '0.875rem' }}>Available: {lot.availableQuantity} {lot.unit}</span>
                     <Button 
                        size="sm" 
                        disabled={lot.availableQuantity <= 0}
                        onClick={() => addItem(lot)}
                     >
                       Add to Cart
                     </Button>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Your Cart">
         {cartItems.length === 0 ? (
           <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Cart is empty</p>
         ) : (
           <div>
             {cartItems.map(item => (
               <div key={item.lotId} className="flex justify-between items-center" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
                  <img src={item.photoUrl || 'https://via.placeholder.com/50'} alt="crop" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.cropName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{item.pricePerUnit}/{item.unit}</div>
                  </div>
                  <div>
                    <input 
                      type="number" 
                      min="1" 
                      max={item.maxQuantity}
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(item.lotId, Number(e.target.value))}
                      className="input"
                      style={{ width: '80px', padding: '0.25rem', marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ fontWeight: 600, width: '80px', textAlign: 'right' }}>
                    ₹{item.pricePerUnit * item.quantity}
                  </div>
                  <button onClick={() => removeItem(item.lotId)} style={{ color: 'var(--danger)' }}>
                    <Trash2 size={18} />
                  </button>
               </div>
             ))}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
               <span>Total amount:</span>
               <span style={{ color: 'var(--primary)' }}>₹{getTotal()}</span>
             </div>
             
             <div className="flex gap-4" style={{ marginTop: '1.5rem' }}>
               <Button variant="secondary" onClick={() => setIsCartOpen(false)} style={{ flex: 1 }}>{t('common.cancel')}</Button>
               <Button onClick={handlePlaceOrder} loading={purchaseMutation.isLoading} style={{ flex: 1 }}>Place Order</Button>
             </div>
           </div>
         )}
      </Modal>
    </div>
  );
};

export default BrowseLots;
