import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import { MapPin, Truck, CheckCircle } from 'lucide-react';

import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const getDistance = async (origin, destination) => {
  // Using Google Maps Distance Matrix API requires proper VITE_ key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
    console.warn("No valid Google Maps API Key found, using mock distance");
    return { text: "150 km", value: 150000 };
  }
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`);
    const data = await res.json();
    if (data.rows && data.rows[0].elements[0].status === 'OK') {
      return data.rows[0].elements[0].distance;
    }
  } catch (err) {
    console.error(err);
  }
  return { text: "200 km", value: 200000 };
};

const CreateShipmentModal = ({ isOpen, onClose, purchase }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [distanceKm, setDistanceKm] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);
  
  // Extract addresses from purchase if nested objects exist
  // Or fallback to dummy strings just for calculation
  const dealerAddress = purchase.dealer?.address || purchase.dealer?.party?.address || 'City Center';
  
  // Farmer might be inside items[0].lot.farmer? Wait, we don't have it explicitly.
  const fromPartyId = purchase.items?.[0]?.lot?.farmerId || 1;
  const toPartyId = purchase.dealerId || 2;
  const pickupAddress = purchase.items?.[0]?.lot?.farmer?.address || 'Farm Road';

  useEffect(() => {
    if (isOpen && !distanceKm) {
      const calc = async () => {
        setLoadingDistance(true);
        const dist = await getDistance(pickupAddress, dealerAddress);
        setDistanceKm(dist.value / 1000); // km
        setLoadingDistance(false);
      };
      calc();
    }
  }, [isOpen, pickupAddress, dealerAddress]);

  const { data: transporters, isLoading: isLoadingTransporters } = useQuery({
    queryKey: ['transporters'],
    queryFn: async () => {
      const res = await apiClient.get('/transporters');
      return res.data;
    },
    enabled: isOpen
  });

  const parsedTransporters = (transporters || []).map(t => {
    let details = {};
    if (t.vehicleDetails) {
      try {
        details = JSON.parse(t.vehicleDetails);
      } catch(e) {}
    }
    return { ...t, ...details };
  });

  const getRate = (type) => {
    if (type === 'TRUCK') return 15;
    if (type === 'MINI_TRUCK') return 10;
    if (type === 'VAN') return 8;
    if (type === 'TWO_WHEELER') return 5;
    return 10;
  };

  const createShipmentMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/shipments', payload),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries(['purchases']);
      queryClient.invalidateQueries(['shipments']);
      onClose();
    },
    onError: () => toast.error(t('common.error'))
  });

  const handleSelectTransporter = (transporter, fee) => {
    const payload = {
      purchaseId: purchase.purchaseId,
      transporterId: transporter.transporterId,
      fromPartyId,
      toPartyId,
      transporterFee: Math.round(fee),
      status: 'PENDING'
    };
    createShipmentMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Shipment">
      <div className="mb-6 flex flex-col gap-4">
        <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}>
          <MapPin color="var(--primary)" size={24} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pickup from</div>
            <div style={{ fontWeight: 600 }}>{pickupAddress}</div>
          </div>
          <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>→</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Deliver to</div>
            <div style={{ fontWeight: 600 }}>{dealerAddress}</div>
          </div>
        </div>
        
        {loadingDistance ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>Calculating distance...</div>
        ) : (
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
            Distance: {distanceKm?.toFixed(1)} km
          </div>
        )}
      </div>

      <h4 style={{ marginBottom: '1rem', color: 'var(--text-dark)', fontWeight: 600 }}>{t('transporter.select')}</h4>

      {isLoadingTransporters ? (
        <div className="flex justify-center p-4">Loading Transporters...</div>
      ) : parsedTransporters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No transporters available.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {parsedTransporters.filter(tr => tr.status !== 'PENDING' && tr.status !== 'REJECTED').map(tr => {
            const fee = distanceKm ? parseFloat(distanceKm) * getRate(tr.vehicleType) : 0;
            return (
              <Card key={tr.transporterId} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-4">
                  <div style={{ background: 'var(--bg-color)', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <strong style={{ display: 'block' }}>{tr.name}</strong>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {tr.vehicleType} | {tr.vehicleNumber}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--primary)' }}>₹{Math.round(fee)}</div>
                  <Button 
                    size="sm" 
                    onClick={() => handleSelectTransporter(tr, fee)}
                    loading={createShipmentMutation.isLoading}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Select
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default CreateShipmentModal;
