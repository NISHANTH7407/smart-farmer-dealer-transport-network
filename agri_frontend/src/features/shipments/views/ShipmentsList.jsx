import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { getUserRole, getUserId } from '../../../utils/auth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Map, MapPin, Truck, CheckCircle, PackageOpen, AlertCircle, RefreshCw } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const ShipmentsList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const role = getUserRole();
  const userId = getUserId();

  const { data: shipments, isLoading, isError, refetch } = useQuery({
    queryKey: ['shipments', { userId, role }],
    queryFn: async () => {
      let url = '/shipments';
      if (role === 'TRANSPORTER') url += `?transporterId=${userId}`;
      else if (role === 'DEALER') url += `?dealerId=${userId}`; // or filter locally
      const res = await apiClient.get(url);
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => apiClient.put(`/shipments/${id}`, { status }),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries(['shipments']);
    },
    onError: () => toast.error(t('common.error'))
  });

  let displayItems = shipments || [];
  if (role === 'FARMER') {
      displayItems = displayItems.filter(s => String(s.fromPartyId) === String(userId));
  } else if (role === 'DEALER') {
      displayItems = displayItems.filter(s => String(s.toPartyId) === String(userId));
  }

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} style={{ height: '250px', animation: 'pulse 1.5s infinite', background: 'var(--border-color)' }} />
        ))}
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <PackageOpen size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <h3 style={{ marginBottom: '0.5rem' }}>{t('common.empty')}</h3>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6" style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
        {role === 'TRANSPORTER' ? t('transporter.assignments') : t('nav.shipments')}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayItems.map(shipment => {
          // Dummy addresses if API doesn't populate
          const pickupAddress = 'Pickup Address Unknown';
          const deliveryAddress = 'Delivery Address Unknown';
          
          return (
            <Card key={shipment.shipmentId} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ref: #{shipment.purchaseId}</div>
                  <h3 style={{ fontSize: '1.125rem' }}>Shipment #{shipment.shipmentId}</h3>
                </div>
                <Badge variant={
                  shipment.status === 'DELIVERED' ? 'success' : 
                  shipment.status === 'IN_TRANSIT' ? 'info' : 'warning'
                }>
                  {shipment.status === 'IN_TRANSIT' ? 'In Transit' : shipment.status}
                </Badge>
              </div>

              <div style={{ flex: 1, borderLeft: '2px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1.5rem', position: 'relative', marginBottom: '1.5rem', paddingBottom: '1.5rem' }}>
                <div style={{ position: 'absolute', top: 0, left: '-9px', background: 'var(--white)', border: '2px solid var(--primary)', borderRadius: '50%', width: '16px', height: '16px' }}></div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Pickup</div>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{pickupAddress}</div>
                {shipment.shipDate && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Shipped on {format(new Date(shipment.shipDate), 'dd MMM yyyy')}</div>}
                
                <div style={{ position: 'absolute', bottom: 0, left: '-9px', background: 'var(--primary)', border: '2px solid var(--white)', borderRadius: '50%', width: '16px', height: '16px' }}></div>
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Destination</div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{deliveryAddress}</div>
                  {shipment.deliveryDate && <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>Delivered on {format(new Date(shipment.deliveryDate), 'dd MMM yyyy')}</div>}
                  
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(deliveryAddress)}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', marginTop: '0.5rem', fontWeight: 500 }}>
                    <Map size={14} /> Open in Maps
                  </a>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.875rem' }}>
                  Fee: <strong style={{ color: 'var(--primary)', fontSize: '1.125rem' }}>₹{shipment.transporterFee}</strong>
                </div>
                
                {role === 'TRANSPORTER' && (
                  <div>
                    {shipment.status === 'PENDING' && (
                      <Button onClick={() => updateStatusMutation.mutate({ id: shipment.shipmentId, status: 'IN_TRANSIT' })} loading={updateStatusMutation.isLoading}>
                        <Truck size={16} /> Pick Up
                      </Button>
                    )}
                    {shipment.status === 'IN_TRANSIT' && (
                      <Button onClick={() => updateStatusMutation.mutate({ id: shipment.shipmentId, status: 'DELIVERED' })} loading={updateStatusMutation.isLoading}>
                        <CheckCircle size={16} /> Mark Delivered
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ShipmentsList;
