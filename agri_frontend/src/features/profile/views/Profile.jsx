import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axios';
import { getUserId, getUserRole } from '../../../utils/auth';
import toast from 'react-hot-toast';
import Card from '../../../components/ui/Card';

const Field = ({ label, value }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
      {label}
    </div>
    <div style={{ padding: '0.55rem 0.75rem', background: 'var(--bg-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
      {value || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not set</span>}
    </div>
  </div>
);

const Profile = () => {
  const userId = getUserId();
  const role   = getUserRole();

  const endpoint = role === 'FARMER' ? `/farmers/${userId}` : role === 'DEALER' ? `/dealers/${userId}` : `/transporters/${userId}`;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId, role],
    queryFn: () => apiClient.get(endpoint).then(r => r.data),
    enabled: !!userId,
  });

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!profile)  return <div style={{ padding: '2rem', textAlign: 'center' }}>Profile not found</div>;

  // Parse vehicleDetails JSON if transporter
  let vehicleParsed = {};
  if (role === 'TRANSPORTER' && profile.vehicleDetails) {
    try { vehicleParsed = JSON.parse(profile.vehicleDetails); } catch { vehicleParsed = {}; }
  }

  const name    = profile.name    || profile.party?.name    || '—';
  const phone   = profile.phone   || profile.party?.phone   || '—';
  const address = profile.address || profile.party?.address || '—';

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>👤 My Profile</h1>

      <Card>
        {/* Role badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            {role === 'FARMER' ? '🌾' : role === 'DEALER' ? '🏪' : '🚛'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{role}</div>
          </div>
        </div>

        {/* Common fields */}
        <Field label="Name"         value={name} />
        <Field label="Phone Number" value={phone} />
        <Field label="Address"      value={address} />

        {/* Transporter-specific */}
        {role === 'TRANSPORTER' && (
          <>
            <Field label="Vehicle Details"  value={profile.vehicleDetails} />
            <Field label="Rate per KM (₹)"  value={profile.ratePerKm ? `₹${profile.ratePerKm}/km` : null} />
            <Field label="Vehicle Type"     value={vehicleParsed.vehicleType} />
            <Field label="Vehicle Number"   value={vehicleParsed.vehicleNumber} />
            <Field label="License Number"   value={vehicleParsed.licenceNumber} />
            <Field label="Location"         value={vehicleParsed.address} />
          </>
        )}

        {/* Farmer/Dealer IDs */}
        {role === 'FARMER' && <Field label="Farmer ID" value={profile.farmerId} />}
        {role === 'DEALER' && <Field label="Dealer ID" value={profile.dealerId} />}
      </Card>
    </div>
  );
};

export default Profile;
