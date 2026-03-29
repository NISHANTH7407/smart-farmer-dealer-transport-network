import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';
import { createFarmer, updateFarmer } from '../api/farmersApi';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  location: z.string().min(3, 'Location is required'),
});

const FarmerFormDialog = ({ isOpen, onClose, initialData }) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ name: '', phone: '', location: '' });
    }
  }, [initialData, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: isEditing ? (data) => updateFarmer({ id: initialData.id, data }) : createFarmer,
    onSuccess: () => {
      queryClient.invalidateQueries(['farmers']);
      onClose();
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputField
        label="Full Name"
        {...register('name')}
        error={errors.name?.message}
      />
      <InputField
        label="Phone Number"
        {...register('phone')}
        error={errors.phone?.message}
      />
      <InputField
        label="Farm Location"
        {...register('location')}
        error={errors.location?.message}
      />

      <div className="flex justify-between gap-4 mt-6" style={{ marginTop: '1.5rem' }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button type="submit" loading={mutation.isLoading} style={{ flex: 1 }}>
          {isEditing ? 'Update Farmer' : 'Save Farmer'}
        </Button>
      </div>
    </form>
  );
};

export default FarmerFormDialog;
