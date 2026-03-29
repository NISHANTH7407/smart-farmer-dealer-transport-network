import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, UserRound, Package, ShoppingCart, Truck, CreditCard, Factory, Menu, LogOut, Sun, Moon } from 'lucide-react';
import { getUserRole, clearAuth } from '../utils/auth';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
const iconMap = {
  dashboard: <LayoutDashboard size={20} />,
  farmers: <UserRound size={20} />,
  dealers: <Users size={20} />,
  lots: <Package size={20} />,
  purchases: <ShoppingCart size={20} />,
  shipments: <Truck size={20} />,
  payments: <CreditCard size={20} />,
  transporters: <Truck size={20} />,
  parties: <Factory size={20} />,
  browse: <ShoppingCart size={20} />
};

const navItems = [
  { key: 'dashboard', path: '/dashboard', labelKey: 'nav.dashboard', roles: ['FARMER', 'DEALER', 'TRANSPORTER', 'ADMIN'] },
  { key: 'lots', path: '/lots', labelKey: 'nav.lots', roles: ['FARMER', 'ADMIN'] },
  { key: 'browse', path: '/browse', labelKey: 'nav.browse', roles: ['DEALER'] },
  { key: 'purchases', path: '/purchases', labelKey: 'nav.purchases', roles: ['DEALER', 'ADMIN'] },
  { key: 'shipments', path: '/shipments', labelKey: 'nav.shipments', roles: ['FARMER', 'DEALER', 'ADMIN'] },
  { key: 'payments', path: '/payments', labelKey: 'nav.payments', roles: ['FARMER', 'DEALER', 'TRANSPORTER', 'ADMIN'] },
  { key: 'assignments', path: '/assignments', labelKey: 'transporter.assignments', roles: ['TRANSPORTER'] },
  { key: 'profile', path: '/profile', labelKey: 'nav.profile', roles: ['FARMER', 'DEALER', 'TRANSPORTER', 'ADMIN'] },
  { key: 'admin-pending', path: '/dashboard/admin/approvals', labelKey: 'admin.pending', roles: ['ADMIN'] },
  { key: 'admin-farmers', path: '/dashboard/admin/farmers', labelKey: 'admin.farmers', roles: ['ADMIN'] },
  { key: 'admin-dealers', path: '/dashboard/admin/dealers', labelKey: 'admin.dealers', roles: ['ADMIN'] },
  { key: 'admin-transporters', path: '/dashboard/admin/transporters', labelKey: 'admin.transporters', roles: ['ADMIN'] }
];

const DashboardLayout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const userRole = getUserRole();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    document.body.classList.contains('dark')
  );

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  
  const toggleTheme = () => {
    document.body.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside 
        style={{
          width: isSidebarOpen ? '260px' : '0px',
          background: 'var(--sidebar-bg)',
          color: '#fff',
          transition: 'width 0.3s',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            🌿
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'white' }}>AgriConnect</h2>
        </div>
        
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Role</div>
          <div style={{ fontWeight: 600 }}>{userRole}</div>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {visibleNavItems.map(item => (
            <NavLink 
              key={item.key} 
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                gap: '0.75rem',
                color: isActive ? '#fff' : '#9ca3af',
                background: isActive ? 'var(--primary)' : 'transparent',
                transition: 'background 0.2s, color 0.2s',
                textDecoration: 'none'
              })}
            >
              {iconMap[item.key] || <LayoutDashboard size={20} />}
              <span>{t(item.labelKey || item.key)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-color)', transition: 'background-color 0.3s' }}>
        {/* Top Navbar */}
        <header style={{
          height: '64px',
          background: 'var(--white)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          transition: 'background-color 0.3s, border-color 0.3s'
        }}>
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} style={{ color: 'var(--text-primary)' }}>
              <Menu size={24} />
            </button>
            <h1 style={{ fontSize: '1.25rem', margin: 0 }}>{t('dashboard')}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <button onClick={toggleTheme} style={{ color: 'var(--text-primary)' }} title="Toggle Theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={() => { clearAuth(); navigate('/login'); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 500 }}
            >
              <LogOut size={20} />
              <span className="hide-mobile">{t('nav.logout')}</span>
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
