import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getLots } from '../api/lotsApi';
import { getUserRole, getUserId } from '../../../utils/auth';
import { PackageOpen, AlertCircle, RefreshCw } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import InputField from '../../../components/ui/InputField';
import Modal from '../../../components/ui/Modal';
import LotFormDialog from './LotFormDialog';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const LotCard = ({ lot, t, role }) => {
  const percentage = Math.max(0, Math.min(100, (lot.availableQuantity / lot.quantity) * 100));
  
  const getQualityVariant = (grade) => {
    if (grade === 'A') return 'success';
    if (grade === 'B') return 'warning';
    return 'danger';
  };

  return (
    <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '160px', width: '100%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {lot.photoUrl ? (
          <img src={lot.photoUrl} alt={lot.cropName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '3rem' }}>🌱</span>
        )}
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
          <Badge variant={getQualityVariant(lot.qualityGrade)}>{lot.qualityGrade} Grade</Badge>
        </div>
      </div>
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {lot.cropName}
          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(lot.pricePerUnit || 0)}/{lot.unit}
          </span>
        </h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
            <span>{t('lots.available')}: {lot.availableQuantity} {lot.unit}</span>
            <span>{lot.quantity} {lot.unit}</span>
          </div>
          <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${percentage}%`, background: percentage > 20 ? 'var(--primary)' : 'var(--danger)', transition: 'width 0.3s' }}></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const SkeletonCard = () => (
  <Card style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ height: '160px', background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }}></div>
    <div style={{ padding: '1rem' }}>
      <div style={{ height: '1.5rem', width: '60%', background: 'var(--border-color)', marginBottom: '1rem', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
      <div style={{ height: '0.875rem', width: '100%', background: 'var(--border-color)', marginBottom: '0.5rem', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
      <div style={{ height: '8px', width: '100%', background: 'var(--border-color)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
    </div>
  </Card>
);

const LotsList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const pageSize = 50; // allow more for grid

  const role = getUserRole();
  const userId = getUserId();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lots', { page, pageSize, search: debouncedSearch }],
    queryFn: () => getLots({ page, pageSize, search: debouncedSearch })
  });
  
  const displayItems = (data?.items || []).filter(item => {
      if (role === 'FARMER' && userId) return String(item.farmerId) === String(userId);
      return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>{t('nav.lots')}</h1>
        <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
          <InputField 
            placeholder={t('common.search')}
            value={searchTerm} 
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }} 
            style={{ marginBottom: 0, minWidth: '250px' }}
          />
          {role === 'FARMER' && (
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              {t('lots.addLot')}
            </Button>
          )}
        </div>
      </div>

      {isError && (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '1rem' }}>{t('common.error')}</h3>
          <Button onClick={() => refetch()}><RefreshCw size={16} /> {t('common.retry')}</Button>
        </div>
      )}

      {!isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          
          {!isLoading && displayItems.map(lot => (
            <LotCard key={lot.lotId} lot={lot} t={t} role={role} />
          ))}
        </div>
      )}

      {!isLoading && !isError && displayItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)', marginTop: '2rem' }}>
          <PackageOpen size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{t('lots.empty')}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('common.empty')}</p>
          {role === 'FARMER' && (
            <Button onClick={() => setIsModalOpen(true)}>{t('lots.addFirst')}</Button>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t('lots.addLot')}
      >
        <LotFormDialog 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

export default LotsList;
