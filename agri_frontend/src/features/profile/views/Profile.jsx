import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { getUserId, getUserRole } from '../../../utils/auth';
import toast from 'react-hot-toast';

import Card from '../../../components/ui/Card';
import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';

const Profile = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userId = getUserId();
  const role = getUserRole();

  const [isEditing, setIsEditing] = useState(false);
  
  // Generic profile logic just in case, but focused on TRANSPORTER for the edit functionality requested
  const endpoint = role === 'FARMER' ? '/farmers' : role === 'DEALER' ? '/dealers' : '/transporters';

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId, role],
    queryFn: async () => {
      // Often backend handles /:id or we just fetch the list and find it
      try {
         const res = await apiClient.get(`${endpoint}/${userId}`);
         return res.data;
      } catch(e) {
         // fallback to find from all if direct get isn't there
         const all = await apiClient.get(endpoint);
         const idKey = role === 'FARMER' ? 'farmerId' : role === 'DEALER' ? 'dealerId' : 'transporterId';
         return (all.data || []).find(x => String(x[idKey]) === String(userId)) || {};
      }
    }
  });

  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (profile) {
      if (role === 'TRANSPORTER') {
        let details = {};
        try {
          if (profile.vehicleDetails) details = JSON.parse(profile.vehicleDetails);
        } catch(e) {}
        setFormData({
          name: profile.name || profile.party?.name || '',
          phone: profile.phone || profile.party?.phone || '',
          vehicleType: details.vehicleType || '',
          vehicleNumber: details.vehicleNumber || '',
          licenceNumber: details.licenceNumber || '',
          address: details.address || profile.address || profile.party?.address || ''
        });
      } else {
        setFormData({
          name: profile.name || profile.party?.name || '',
          phone: profile.phone || profile.party?.phone || '',
          address: profile.address || profile.party?.address || '',
          email: profile.email || profile.party?.email || ''
        });
      }
    }
  }, [profile, role]);

  const updateMutation = useMutation({
    mutationFn: (payload) => apiClient.put(`${endpoint}/${userId}`, payload),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries(['profile']);
      setIsEditing(false);
    },
    onError: () => toast.error(t('common.error'))
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (role === 'TRANSPORTER') {
      const vehicleDetails = JSON.stringify({
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        licenceNumber: formData.licenceNumber,
        address: formData.address,
        email: profile.email || profile.party?.email
      });
      
      updateMutation.mutate({
        name: formData.name,
        phone: formData.phone,
        vehicleDetails
      });
    } else {
      updateMutation.mutate(formData);
    }
  };

  if (isLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="mb-6" style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
        {t('nav.profile')}
      </h1>
      
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <InputField 
            label={t('auth.name')} 
            name="name" 
            value={formData.name || ''} 
            onChange={handleChange} 
            disabled={!isEditing} 
          />
          <InputField 
            label={t('auth.phone')} 
            name="phone" 
            value={formData.phone || ''} 
            onChange={handleChange} 
            disabled={!isEditing} 
          />
          
          {role === 'TRANSPORTER' ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">{t('transporter.vehicleType')}</label>
                <select 
                  name="vehicleType" 
                  value={formData.vehicleType || ''} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                >
                  <option value="TRUCK">Truck</option>
                  <option value="MINI_TRUCK">Mini Truck</option>
                  <option value="VAN">Van</option>
                  <option value="TWO_WHEELER">Two Wheeler</option>
                </select>
              </div>
              <InputField 
                label={t('transporter.vehicleNumber')} 
                name="vehicleNumber" 
                value={formData.vehicleNumber || ''} 
                onChange={handleChange} 
                disabled={!isEditing} 
              />
              <InputField 
                label={t('transporter.licence')} 
                name="licenceNumber" 
                value={formData.licenceNumber || ''} 
                onChange={handleChange} 
                disabled={!isEditing} 
              />
              <InputField 
                label={t('transporter.location')} 
                name="address" 
                value={formData.address || ''} 
                onChange={handleChange} 
                disabled={!isEditing} 
              />
            </>
          ) : (
            <>
              <InputField 
                label={t('auth.email')} 
                name="email" 
                value={formData.email || ''} 
                onChange={handleChange} 
                disabled={!isEditing} 
              />
              <InputField 
                label={t('auth.address')} 
                name="address" 
                value={formData.address || ''} 
                onChange={handleChange} 
                disabled={!isEditing} 
              />
            </>
          )}
        </div>
        
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSave} loading={updateMutation.isLoading}>
                {t('common.save')}
              </Button>
            </>
          ) : (
             <Button variant="primary" onClick={() => setIsEditing(true)}>
                {t('common.edit')}
             </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
