import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useParams } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

import Card from '../../../components/ui/Card';
import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';
import LanguageSwitcher from '../../../components/ui/LanguageSwitcher';

const getFarmerSchema = (t) => z.object({
  name: z.string().min(2, t('common.error')),
  phone: z.string().regex(/^[0-9]{10}$/, t('common.error')),
  email: z.string().email(t('common.error')).optional().or(z.literal('')),
  address: z.string().optional(),
  password: z.string().min(8, t('common.error')),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: t('common.error'),
  path: ['confirmPassword']
});

const getDealerSchema = (t) => z.object({
  name: z.string().min(2, t('common.error')),
  phone: z.string().regex(/^[0-9]{10}$/, t('common.error')),
  email: z.string().email(t('common.error')).optional().or(z.literal('')),
  address: z.string().optional(),
  gstin: z.string().optional(),
  password: z.string().min(8, t('common.error')),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: t('common.error'),
  path: ['confirmPassword']
});

const getTransporterSchema = (t) => z.object({
  name: z.string().min(2, t('common.error')),
  phone: z.string().regex(/^[0-9]{10}$/, t('common.error')),
  email: z.string().email(t('common.error')).optional().or(z.literal('')),
  address: z.string().optional(), // current location
  vehicleType: z.enum(['TRUCK', 'MINI_TRUCK', 'VAN', 'TWO_WHEELER']),
  vehicleNumber: z.string().regex(/^[A-Z]{2} [0-9]{2} [A-Z]{2} [0-9]{4}$/, t('common.error')),
  licenceNumber: z.string().min(2, t('common.error')),
  password: z.string().min(8, t('common.error')),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: t('common.error'),
  path: ['confirmPassword']
});

const Signup = ({ roleTarget }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  let schema;
  if (roleTarget === 'FARMER') schema = getFarmerSchema(t);
  else if (roleTarget === 'DEALER') schema = getDealerSchema(t);
  else schema = getTransporterSchema(t);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (roleTarget === 'FARMER') {
        await apiClient.post('/farmers/register', data);
      } else if (roleTarget === 'DEALER') {
        await apiClient.post('/dealers/register', data);
      } else if (roleTarget === 'TRANSPORTER') {
        const vehicleDetails = JSON.stringify({
          vehicleType: data.vehicleType,
          vehicleNumber: data.vehicleNumber,
          licenceNumber: data.licenceNumber,
          email: data.email,
          address: data.address
        });
        await apiClient.post('/transporters', {
          name: data.name,
          phone: data.phone,
          vehicleDetails
        });
      }
      
      toast.success(t('auth.signupSuccess'));
      setTimeout(() => {
        navigate(`/login/${roleTarget.toLowerCase()}`);
      }, 2000);
      
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh', padding: '1rem', background: 'var(--bg-color)' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <LanguageSwitcher />
      </div>

      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>🌿 AgriConnect</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('auth.signup')} - {roleTarget}</p>
        </div>
        
        <Card title={t('auth.signup')}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <InputField label={t('auth.name')} {...register('name')} error={errors.name?.message} />
            <InputField label={t('auth.phone')} placeholder="10 digits" {...register('phone')} error={errors.phone?.message} />
            <InputField label={t('auth.email')} type="email" {...register('email')} error={errors.email?.message} />
            <InputField label={roleTarget === 'TRANSPORTER' ? t('transporter.location') : t('auth.address')} {...register('address')} error={errors.address?.message} />
            
            {roleTarget === 'DEALER' && (
              <InputField label={t('auth.gstin')} {...register('gstin')} error={errors.gstin?.message} />
            )}

            {roleTarget === 'TRANSPORTER' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{t('transporter.vehicleType')}</label>
                  <select {...register('vehicleType')} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <option value="TRUCK">{t('transporter.truck')}</option>
                    <option value="MINI_TRUCK">{t('transporter.miniTruck')}</option>
                    <option value="VAN">{t('transporter.van')}</option>
                    <option value="TWO_WHEELER">{t('transporter.twoWheeler')}</option>
                  </select>
                  {errors.vehicleType && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.vehicleType.message}</span>}
                </div>
                <InputField label={t('transporter.vehicleNumber')} placeholder="XX 00 XX 0000" {...register('vehicleNumber')} error={errors.vehicleNumber?.message} />
                <InputField label={t('transporter.licence')} {...register('licenceNumber')} error={errors.licenceNumber?.message} />
              </>
            )}

            <InputField label={t('auth.password')} type="password" {...register('password')} error={errors.password?.message} />
            <InputField label={t('auth.confirmPassword')} type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
            
            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {t('auth.signup')}
            </Button>
          </form>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <Link to={`/login/${roleTarget.toLowerCase()}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              {t('auth.hasAccount')} {t('auth.login')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
