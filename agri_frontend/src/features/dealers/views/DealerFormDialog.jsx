import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';
import { createDealer } from '../api/dealersApi';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(10, 'Valid phone required'),
  location: z.string().min(3, 'Location required'),
});

const DealerFormDialog = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: createDealer,
    onSuccess: () => {
      queryClient.invalidateQueries(['dealers']);
      onClose();
    }
  });

  return (
    <form onSubmit={handleSubmit(mutation.mutate)}>
      <InputField label="Dealer Name" {...register('name')} error={errors.name?.message} />
      <InputField label="Phone Number" {...register('phone')} error={errors.phone?.message} />
      <InputField label="Business Location" {...register('location')} error={errors.location?.message} />

      <div className="flex justify-between gap-4" style={{ marginTop: '1.5rem' }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button type="submit" loading={mutation.isLoading} style={{ flex: 1 }}>Save Dealer</Button>
      </div>
    </form>
  );
};

export default DealerFormDialog;
