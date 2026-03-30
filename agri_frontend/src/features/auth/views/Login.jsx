import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { loginUser } from '../../../services/authService';
import toast from 'react-hot-toast';
import Card from '../../../components/ui/Card';
import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const roleRedirects = {
  FARMER: '/dashboard/farmer',
  DEALER: '/dashboard/dealer',
  TRANSPORTER: '/dashboard/transporter',
  ADMIN: '/dashboard/admin',
};

const Login = ({ roleTarget }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const response = await loginUser({ username: data.username, password: data.password });
      const { token, user } = response;

      if (roleTarget && user.role !== roleTarget) {
        toast.error(`This portal is for ${roleTarget} accounts only.`);
        return;
      }

      login(token, user);
      toast.success(`Welcome, ${user.name || user.username}!`);
      navigate(roleRedirects[user.role] || '/dashboard/farmer');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials.';
      setApiError(message);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = { FARMER: '#15803d', DEALER: '#1d4ed8', TRANSPORTER: '#b45309' };
  const color = roleColors[roleTarget] || '#15803d';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌿</div>
          <h1 style={{ color, fontSize: '1.75rem', fontWeight: 700 }}>AgriConnect</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{roleTarget} Portal</p>
        </div>

        <Card>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Sign In</h2>

          {apiError && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <InputField
              label="Username"
              id="username"
              type="text"
              placeholder="Enter your username"
              {...register('username')}
              error={errors.username?.message}
            />
            <InputField
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem', background: color }}>
              Login as {roleTarget}
            </Button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {roleTarget !== 'ADMIN' && (
              <span>Don't have an account?{' '}
                <Link to={`/signup/${roleTarget?.toLowerCase()}`} style={{ color, fontWeight: 500 }}>Sign up</Link>
              </span>
            )}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem' }}>
            {['FARMER', 'DEALER', 'TRANSPORTER'].map(r => (
              <Link key={r} to={`/login/${r.toLowerCase()}`}
                style={{ color: r === roleTarget ? color : 'var(--text-secondary)', fontWeight: r === roleTarget ? 600 : 400 }}>
                {r}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
