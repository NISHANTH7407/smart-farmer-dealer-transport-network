import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/Button';

const schema = z.object({
  cropType: z.string().min(1, 'Crop type is required'),
  quantity: z.coerce.number().positive('Must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  harvestDate: z.string().min(1, 'Harvest date is required'),
  qualityGrade: z.string().min(1, 'Quality grade is required'),
});

const AddProduceForm = ({ onSubmit, loading }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, imageUrl: imageBase64 });
  };

  const inputStyle = {
    width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
    border: '1px solid var(--border-color)', background: 'var(--white)',
    color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem',
  };
  const labelStyle = { display: 'block', fontWeight: 500, fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-dark)' };
  const errorStyle = { color: '#ef4444', fontSize: '0.8rem', marginTop: '0.2rem' };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>Crop Type *</label>
        <input {...register('cropType')} style={inputStyle} placeholder="e.g. Wheat, Rice, Cotton" />
        {errors.cropType && <p style={errorStyle}>{errors.cropType.message}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Quantity *</label>
          <input type="number" step="0.01" {...register('quantity')} style={inputStyle} placeholder="500" />
          {errors.quantity && <p style={errorStyle}>{errors.quantity.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Unit *</label>
          <select {...register('unit')} style={inputStyle}>
            <option value="">Select unit</option>
            <option value="kg">kg</option>
            <option value="quintal">quintal</option>
            <option value="ton">ton</option>
            <option value="litre">litre</option>
          </select>
          {errors.unit && <p style={errorStyle}>{errors.unit.message}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Harvest Date *</label>
          <input type="date" {...register('harvestDate')} style={inputStyle} />
          {errors.harvestDate && <p style={errorStyle}>{errors.harvestDate.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Quality Grade *</label>
          <select {...register('qualityGrade')} style={inputStyle}>
            <option value="">Select grade</option>
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          {errors.qualityGrade && <p style={errorStyle}>{errors.qualityGrade.message}</p>}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label style={labelStyle}>Produce Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ ...inputStyle, padding: '0.4rem' }}
        />
        {imagePreview && (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Preview:</p>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
            />
          </div>
        )}
      </div>

      <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
        Add Produce Lot
      </Button>
    </form>
  );
};

export default AddProduceForm;
