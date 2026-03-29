import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';
import apiClient from '../../../api/axios';
import { getUserId } from '../../../utils/auth';

const schema = z.object({
  lotId: z.coerce.number().min(1, 'Valid Lot ID required'),
  quantity: z.coerce.number().min(1, 'Quantity must be > 0'),
});

const PurchaseFormDialog = ({ onClose }) => {
  const queryClient = useQueryClient();
  const dealerId = getUserId();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const createPurchase = async (data) => {
      const payload = {
          dealerId,
          status: 'PENDING',
          items: [
              { lotId: data.lotId, quantity: data.quantity, negotiatedPrice: 100.0 }
          ]
      };
      const res = await apiClient.post('/purchases', payload);
      return res.data;
  };

  const mutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases']);
      queryClient.invalidateQueries(['dashboardStats']);
      onClose();
    }
  });

  return (
    <form onSubmit={handleSubmit(mutation.mutate)}>
      {!dealerId && <p style={{color: 'red'}}>Error: Your profile is not linked to a dealer ID. Please create a dealer profile first.</p>}
      <InputField label="Produce Lot ID" type="number" {...register('lotId')} error={errors.lotId?.message} />
      <InputField label="Quantity to Buy" type="number" {...register('quantity')} error={errors.quantity?.message} />

      <div className="flex justify-between gap-4" style={{ marginTop: '1.5rem' }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button type="submit" loading={mutation.isLoading} style={{ flex: 1 }} disabled={!dealerId}>Create Purchase</Button>
      </div>
    </form>
  );
};

export default PurchaseFormDialog;
