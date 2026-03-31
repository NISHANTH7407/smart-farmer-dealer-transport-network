import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import Card from '../../../components/ui/Card';
import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';

const baseFields = {
  username: z.string().min(3, 'Min 3 characters'),
  name: z.string().min(2, 'Min 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Must be 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
};

const farmerSchema = z.object(baseFields)
  .refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const dealerSchema = z.object({ ...baseFields, gstin: z.string().optional() })
  .refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const transporterSchema = z.object({
  ...baseFields,
  vehicleType: z.enum(['TRUCK', 'MINI_TRUCK', 'VAN', 'TWO_WHEELER']),
  vehicleNumber: z.string().regex(/^[A-Z]{2} [0-9]{2} [A-Z]{2} [0-9]{4}$/, 'Format: XX 00 XX 0000'),
  licenceNumber: z.string().min(2, 'Required'),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const Signup = ({ roleTarget }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const schema = roleTarget === 'FARMER' ? farmerSchema : roleTarget === 'DEALER' ? dealerSchema : transporterSchema;

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let entityId;

      if (roleTarget === 'FARMER' || roleTarget === 'DEALER') {
        // Step 1: Create Party
        const partyRes = await apiClient.post('/parties', {
          name: data.name,
          phone: data.phone,
          address: data.address || '',
          type: roleTarget,
        });
        const partyId = partyRes.data.partyId;

        // Step 2: Create Farmer or Dealer
        if (roleTarget === 'FARMER') {
          const farmerRes = await apiClient.post('/farmers', { partyId });
          entityId = farmerRes.data.farmerId;
        } else {
          const dealerRes = await apiClient.post('/dealers', { partyId });
          entityId = dealerRes.data.dealerId;
        }
      } else {
        // Transporter: single step
        const tRes = await apiClient.post('/transporters', {
          name: data.name,
          phone: data.phone,
          vehicleDetails: JSON.stringify({
            vehicleType: data.vehicleType,
            vehicleNumber: data.vehicleNumber,
            licenceNumber: data.licenceNumber,
            email: data.email || '',
            address: data.address || '',
          }),
        });
        entityId = tRes.data.transporterId;
      }

      // Step 3: Register User account
      await apiClient.post('/auth/register', {
        username: data.username,
        password: data.password,
        name: data.name,
        role: roleTarget,
        entityId,
      });

      toast.success('Registration successful!');
      setTimeout(() => navigate(`/login/${roleTarget.toLowerCase()}`), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1rem', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>🌿 AgriConnect</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign Up - {roleTarget}</p>
        </div>

        <Card title="Sign Up">
          <form onSubmit={handleSubmit(onSubmit)}>
            <InputField label="Username" {...register('username')} error={errors.username?.message} />
            <InputField label="Full Name" {...register('name')} error={errors.name?.message} />
            <InputField label="Phone Number" placeholder="10 digits" {...register('phone')} error={errors.phone?.message} />
            <InputField label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <InputField label={roleTarget === 'TRANSPORTER' ? 'Current Location' : 'Address'} {...register('address')} error={errors.address?.message} />

            {roleTarget === 'DEALER' && (
              <InputField label="GSTIN (optional)" {...register('gstin')} error={errors.gstin?.message} />
            )}

            {roleTarget === 'TRANSPORTER' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Vehicle Type</label>
                  <select {...register('vehicleType')} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <option value="TRUCK">Truck</option>
                    <option value="MINI_TRUCK">Mini Truck</option>
                    <option value="VAN">Van</option>
                    <option value="TWO_WHEELER">Two Wheeler</option>
                  </select>
                  {errors.vehicleType && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.vehicleType.message}</span>}
                </div>
                <InputField label="Vehicle Number Plate" placeholder="XX 00 XX 0000" {...register('vehicleNumber')} error={errors.vehicleNumber?.message} />
                <InputField label="Driving Licence Number" {...register('licenceNumber')} error={errors.licenceNumber?.message} />
              </>
            )}

            <InputField label="Password" type="password" {...register('password')} error={errors.password?.message} />
            <InputField label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />

            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '1rem' }}>
              Sign Up
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <Link to={`/login/${roleTarget.toLowerCase()}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Already have an account? Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
