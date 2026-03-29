import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { Eye, Edit, Trash2 } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import InputField from '../../../components/ui/InputField';

const TransportersList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transporters, isLoading } = useQuery({
    queryKey: ['transporters-admin'],
    queryFn: async () => {
      const res = await apiClient.get('/transporters');
      const sRes = await apiClient.get('/shipments').catch(() => ({ data: [] }));
      const allShipments = sRes.data || [];
      
      const transportersList = res.data || [];
      return transportersList.filter(tr => tr.status !== 'PENDING').map(transporter => {
        let details = {};
        try {
          if (transporter.vehicleDetails) details = JSON.parse(transporter.vehicleDetails);
        } catch(e) {}
        
        const myShipments = allShipments.filter(s => String(s.transporterId) === String(transporter.transporterId)).length;
        
        return {
          ...transporter,
          ...details,
          name: transporter.name || transporter.party?.name,
          phone: transporter.phone || transporter.party?.phone,
          totalDeliveries: myShipments
        };
      });
    }
  });

  const displayData = (transporters || []).filter(tr => 
    !searchTerm || 
    tr.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tr.phone?.includes(searchTerm) ||
    tr.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { label: 'Name', key: 'name' },
    { label: 'Phone', key: 'phone' },
    { label: 'Vehicle Type', key: 'vehicleType' },
    { label: 'Vehicle Number', key: 'vehicleNumber' },
    { label: 'Licence', key: 'licenceNumber' },
    { label: 'Total Deliveries', key: 'totalDeliveries' },
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
    <Card className="animate-fade-in" title={t('admin.transporters')} style={{ padding: 0 }}>
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

export default TransportersList;
