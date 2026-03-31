import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Truck, CreditCard, Menu, LogOut, Sun, Moon, User, Bot } from 'lucide-react';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const navItems = [
  { key: 'dashboard', path: '/dashboard/farmer',      label: 'Dashboard',     icon: <LayoutDashboard size={20} />, roles: ['FARMER'] },
  { key: 'dashboard', path: '/dashboard/dealer',      label: 'Dashboard',     icon: <LayoutDashboard size={20} />, roles: ['DEALER'] },
  { key: 'dashboard', path: '/dashboard/transporter', label: 'Dashboard',     icon: <LayoutDashboard size={20} />, roles: ['TRANSPORTER'] },
  { key: 'lots',      path: '/lots',                  label: 'My Lots',       icon: <Package size={20} />,         roles: ['FARMER'] },
  { key: 'browse',    path: '/browse',                label: 'Browse Lots',   icon: <ShoppingCart size={20} />,    roles: ['DEALER'] },
  { key: 'purchases', path: '/purchases',             label: 'Purchases',     icon: <ShoppingCart size={20} />,    roles: ['DEALER'] },
  { key: 'shipments', path: '/shipments',             label: 'Shipments',     icon: <Truck size={20} />,           roles: ['FARMER', 'DEALER'] },
  { key: 'assignments',path: '/assignments',          label: 'Assignments',   icon: <Truck size={20} />,           roles: ['TRANSPORTER'] },
  { key: 'payments',  path: '/payments',              label: 'Payments',      icon: <CreditCard size={20} />,      roles: ['DEALER'] },
  { key: 'ai-chat',   path: '/ai-chat',               label: 'AI Assistant',  icon: <Bot size={20} />,             roles: ['FARMER', 'DEALER', 'TRANSPORTER', 'ADMIN'] },
  { key: 'profile',   path: '/profile',               label: 'Profile',       icon: <User size={20} />,            roles: ['FARMER', 'DEALER', 'TRANSPORTER', 'ADMIN'] },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains('dark'));

  const userRole = user?.role || '';

  const toggleTheme = () => {
    document.body.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login/farmer');
  };

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: isSidebarOpen ? '240px' : '0px',
        background: 'var(--sidebar-bg)',
        color: '#fff',
        transition: 'width 0.3s',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '1.5rem' }}>🌿</span>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'white', fontWeight: 700 }}>AgriConnect</h2>
        </div>

        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged in as</div>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{user?.name || userRole}</div>
          <div style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>{userRole}</div>
        </div>

        <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
          {visibleNavItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '0.7rem 1.5rem',
                gap: '0.75rem',
                color: isActive ? '#fff' : '#9ca3af',
                background: isActive ? 'var(--primary)' : 'transparent',
                transition: 'background 0.2s, color 0.2s',
                textDecoration: 'none',
                fontSize: '0.9rem',
              })}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-color)' }}>
        {/* Header */}
        <header style={{
          height: '60px',
          background: 'var(--white)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ color: 'var(--text-primary)' }}>
              <Menu size={22} />
            </button>
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>🌿 AgriConnect</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LanguageSwitcher />
            <button onClick={toggleTheme} style={{ color: 'var(--text-primary)' }}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontWeight: 500, fontSize: '0.875rem' }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
