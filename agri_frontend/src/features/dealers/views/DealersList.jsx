import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { Eye, Edit, Trash2 } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import InputField from '../../../components/ui/InputField';

const DealersList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: dealers, isLoading } = useQuery({
    queryKey: ['dealers-admin'],
    queryFn: async () => {
      const res = await apiClient.get('/dealers');
      const pRes = await apiClient.get('/purchases').catch(() => ({ data: [] }));
      const allPurchases = pRes.data || [];
      
      const dealersList = res.data || [];
      return dealersList.filter(d => d.status !== 'PENDING').map(dealer => {
        const myPurchases = allPurchases.filter(p => String(p.dealerId) === String(dealer.dealerId)).length;
        return {
          ...dealer,
          name: dealer.name || dealer.party?.name,
          email: dealer.email || dealer.party?.email,
          phone: dealer.phone || dealer.party?.phone,
          address: dealer.address || dealer.party?.address,
          gstin: dealer.gstin || '-',
          totalPurchases: myPurchases
        };
      });
    }
  });

  const displayData = (dealers || []).filter(d => 
    !searchTerm || 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone?.includes(searchTerm)
  );

  const columns = [
    { label: 'Name', key: 'name' },
    { label: 'Phone', key: 'phone' },
    { label: 'Email', key: 'email', render: (val) => val || '-' },
    { label: 'Address', key: 'address', render: (val) => val || '-' },
    { label: 'GSTIN', key: 'gstin' },
    { label: 'Total Purchases', key: 'totalPurchases' },
    {
      label: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" style={{ padding: '0.25rem 0.5rem' }}><Eye size={16} /></Button>
          <Button size="sm" variant="secondary" style={{ padding: '0.25rem 0.5rem' }}><Edit size={16} /></Button>
          <Button size="sm" variant="danger" style={{ padding: '0.25rem 0.5rem' }}><Trash2 size={16} /></Button>
        </div>
      )
    }
  ];

  return (
    <Card className="animate-fade-in" title={t('admin.dealers')} style={{ padding: 0 }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
        <InputField 
          placeholder={t('common.search')} 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          style={{ marginBottom: 0, minWidth: '300px' }}
        />
      </div>
      <Table columns={columns} data={displayData} isLoading={isLoading} />
    </Card>
  );
};

export default DealersList;
