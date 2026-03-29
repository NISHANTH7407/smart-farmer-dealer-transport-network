import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import InputField from '../../../components/ui/InputField';

const FarmersList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: farmers, isLoading } = useQuery({
    queryKey: ['farmers-admin'],
    queryFn: async () => {
      const res = await apiClient.get('/farmers');
      const lotsRes = await apiClient.get('/lots').catch(() => ({ data: { items: [] } }));
      const allLots = Array.isArray(lotsRes.data) ? lotsRes.data : (lotsRes.data?.items || []);
      
      const farmersList = res.data || [];
      return farmersList.filter(f => f.status !== 'PENDING').map(farmer => {
        const myLots = allLots.filter(l => String(l.farmerId) === String(farmer.farmerId)).length;
        return {
          ...farmer,
          name: farmer.name || farmer.party?.name,
          email: farmer.email || farmer.party?.email,
          phone: farmer.phone || farmer.party?.phone,
          address: farmer.address || farmer.party?.address,
          totalLots: myLots
        };
      });
    }
  });

  const displayData = (farmers || []).filter(f => 
    !searchTerm || 
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.phone?.includes(searchTerm)
  );

  const columns = [
    { label: 'Name', key: 'name' },
    { label: 'Phone', key: 'phone' },
    { label: 'Email', key: 'email', render: (val) => val || '-' },
    { label: 'Address', key: 'address', render: (val) => val || '-' },
    { label: 'Total Lots', key: 'totalLots' },
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
    <Card className="animate-fade-in" title={t('admin.farmers')} style={{ padding: 0 }}>
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

export default FarmersList;
