import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { setAuthToken, setUserRole, setUserId, setUserName, setUserStatus } from '../../../utils/auth';

import Card from '../../../components/ui/Card';
import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';
import LanguageSwitcher from '../../../components/ui/LanguageSwitcher';

const schema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(4, 'Password must be at least 4 characters')
});

const Login = ({ roleTarget }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const token = `mock-token-${roleTarget}`;
      
      // We will attempt to get status from backend. If backend responds array we check phone.
      let profile = null;
      try {
        const apiClient = (await import('../../../api/axios')).default;
        if (roleTarget === 'FARMER') {
          const res = await apiClient.get('/farmers');
          profile = res.data.find(f => f.party?.phone === data.phone || f.phone === data.phone);
        } else if (roleTarget === 'DEALER') {
          const res = await apiClient.get('/dealers');
          profile = res.data.find(d => d.party?.phone === data.phone || d.phone === data.phone);
        } else if (roleTarget === 'TRANSPORTER') {
          const res = await apiClient.get('/transporters');
          profile = res.data.find(t => t.phone === data.phone);
        } else if (roleTarget === 'ADMIN') {
           profile = { status: 'ACTIVE' }; // Admin is always active
        }
      } catch (e) {
        console.warn("Could not fetch user profile", e);
      }

      // Check status
      if (profile && profile.status === 'PENDING') {
         (await import('react-hot-toast')).default.error(t('auth.pending'), { icon: '⚠️' });
         return; // Do not redirect
      }
      if (profile && profile.status === 'REJECTED') {
         (await import('react-hot-toast')).default.error(t('auth.rejected'));
         return; // Do not redirect
      }

      setAuthToken(token);
      setUserRole(roleTarget);
      
      if (profile) {
          const id = profile.farmerId || profile.dealerId || profile.transporterId || 'admin-id';
          setUserId(id);
          const userName = profile.name || profile.party?.name || 'Admin';
          setUserName(userName);
          setUserStatus(profile.status || 'ACTIVE');
      } else {
          setUserId(null);
      }
      
      navigate(`/dashboard/${roleTarget.toLowerCase()}`);
    } catch (err) {
      setApiError('Login failed.');
      (await import('react-hot-toast')).default.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh', padding: '1rem', background: 'var(--bg-color)' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <LanguageSwitcher />
      </div>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>🌿 AgriConnect</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{roleTarget === 'FARMER' ? 'Farmer Portal Login' : 'Dealer Portal Login'}</p>
        </div>
        
        <Card title={t('login')}>
          {apiError && (
            <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <InputField 
              label="Phone Number" 
              id="phone" 
              type="text"
              placeholder="e.g. 9876543210"
              {...register('phone')}
              error={errors.phone?.message}
            />
            
            <InputField 
              label={t('password')} 
              id="password" 
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
            
            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {t('submit')}
            </Button>
          </form>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            {roleTarget !== 'ADMIN' && (
              <Link to={`/signup/${roleTarget.toLowerCase()}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                {t('auth.noAccount')} {t('auth.signup')}
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
