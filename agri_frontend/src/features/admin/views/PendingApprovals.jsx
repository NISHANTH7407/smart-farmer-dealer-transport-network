import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import { Check, X, AlertCircle } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import InputField from '../../../components/ui/InputField';

const fetchPending = async (role) => {
  const endpoint = role === 'FARMER' ? '/farmers' : role === 'DEALER' ? '/dealers' : '/transporters';
  const res = await apiClient.get(endpoint);
  return (res.data || []).filter(item => item.status === 'PENDING');
};

const PendingApprovals = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('FARMER');
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['pending-approvals', activeTab],
    queryFn: () => fetchPending(activeTab)
  });

  const getEntityId = (item) => item.farmerId || item.dealerId || item.transporterId;
  const getRoleEndpoint = () => activeTab === 'FARMER' ? 'farmers' : activeTab === 'DEALER' ? 'dealers' : 'transporters';

  const approveMutation = useMutation({
    mutationFn: (id) => apiClient.put(`/admin/${getRoleEndpoint()}/${id}/approve`),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['pending-approvals', activeTab]);
      const previousUsers = queryClient.getQueryData(['pending-approvals', activeTab]);
      queryClient.setQueryData(['pending-approvals', activeTab], old => old.filter(u => getEntityId(u) !== id));
      return { previousUsers };
    },
    onSuccess: () => toast.success(t('common.success')),
    onError: (err, id, context) => {
      toast.error(t('common.error'));
      queryClient.setQueryData(['pending-approvals', activeTab], context.previousUsers);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => apiClient.put(`/admin/${getRoleEndpoint()}/${id}/reject`, { reason }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries(['pending-approvals', activeTab]);
      const previousUsers = queryClient.getQueryData(['pending-approvals', activeTab]);
      queryClient.setQueryData(['pending-approvals', activeTab], old => old.filter(u => getEntityId(u) !== id));
      return { previousUsers };
    },
    onSuccess: () => {
      toast.success(t('common.success'));
      setRejectModalOpen(false);
      setSelectedUser(null);
      setRejectReason('');
    },
    onError: (err, newTodo, context) => {
      toast.error(t('common.error'));
      queryClient.setQueryData(['pending-approvals', activeTab], context.previousUsers);
    }
  });

  const handleApprove = (user) => {
    approveMutation.mutate(getEntityId(user));
  };

  const handleRejectClick = (user) => {
    setSelectedUser(user);
    setRejectModalOpen(true);
  };

  const submitReject = () => {
    if (!rejectReason) return toast.error('Reason is required');
    rejectMutation.mutate({ id: getEntityId(selectedUser), reason: rejectReason });
  };

  const tabs = [
    { id: 'FARMER', label: 'Farmers' },
    { id: 'DEALER', label: 'Dealers' },
    { id: 'TRANSPORTER', label: 'Transporters' }
  ];

  let displayData = users || [];
  if (activeTab === 'TRANSPORTER') {
    displayData = displayData.map(t => {
      let details = {};
      try {
        if (t.vehicleDetails) details = JSON.parse(t.vehicleDetails);
      } catch(e) {}
      return { ...t, ...details };
    });
  }

  const columns = [
    { label: 'Name', key: 'name', render: (val, row) => val || row.party?.name || 'Unknown' },
    { label: 'Phone', key: 'phone', render: (val, row) => val || row.party?.phone || 'N/A' },
    { label: 'Sign Up Date', key: 'createdAt', render: (val) => val ? new Date(val).toLocaleDateString() : 'Recent' },
  ];

  if (activeTab === 'TRANSPORTER') {
    columns.push({ label: 'Vehicle Type', key: 'vehicleType' });
    columns.push({ label: 'Vehicle Number', key: 'vehicleNumber' });
    columns.push({ label: 'Licence', key: 'licenceNumber' });
  } else {
    columns.push({ label: 'Email', key: 'email', render: (val, row) => val || row.party?.email || 'N/A' });
  }

  // Actions column
  columns.push({
    label: 'Actions',
    key: 'actions',
    render: (_, row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="success" onClick={() => handleApprove(row)} style={{ padding: '0.25rem 0.5rem', background: 'var(--success)', border: 'none', color: 'white' }}>
          <Check size={16} /> {t('admin.approve')}
        </Button>
        <Button size="sm" variant="danger" onClick={() => handleRejectClick(row)} style={{ padding: '0.25rem 0.5rem' }}>
          <X size={16} /> {t('admin.reject')}
        </Button>
      </div>
    )
  });

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6" style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
        {t('admin.pending')}
      </h1>
      
      <div className="flex gap-4 mb-6" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              fontWeight: 500,
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Table columns={columns} data={displayData} isLoading={isLoading} />
        {!isLoading && displayData.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No pending approvals for {activeTab.toLowerCase()}s.
          </div>
        )}
      </Card>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title={`Reject ${activeTab}`}>
        <div style={{ marginBottom: '1rem' }}>
          <InputField 
            label="Reason for rejection" 
            placeholder="Please specify a reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={submitReject} loading={rejectMutation.isLoading}>Confirm Reject</Button>
        </div>
      </Modal>
    </div>
  );
};

export default PendingApprovals;
