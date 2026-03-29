import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { createLot } from '../api/lotsApi';
import { getUserId } from '../../../utils/auth';
import toast from 'react-hot-toast';

import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';

const schema = z.object({
  cropName: z.string().min(2, 'Crop name required'),
  quantity: z.coerce.number().min(1, 'Quantity must be > 0'),
  unit: z.string().min(1, 'Unit required'),
  pricePerUnit: z.coerce.number().min(0, 'Price must be >= 0'),
  qualityGrade: z.enum(['A', 'B', 'C']),
});

const CROP_SUGGESTIONS = ['Tomato', 'Rice', 'Wheat', 'Apple', 'Banana', 'Onion', 'Potato', 'Sugarcane', 'Cotton'];

const LotFormDialog = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const farmerId = getUserId();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      qualityGrade: 'A'
    }
  });

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const mutation = useMutation({
    mutationFn: (data) => createLot(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lots']);
      queryClient.invalidateQueries(['dashboardStats']);
      toast.success(t('common.success'));
      onClose();
    },
    onError: () => {
      toast.error(t('common.error'));
    }
  });

  const onSubmit = async (data) => {
    if (!farmerId) return;
    
    let photoUrl = null;
    if (file) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('photo', file);
        const res = await apiClient.post('/lots/upload-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photoUrl = res.data?.photoUrl || null;
      } catch (e) {
        toast.error('Failed to upload photo, proceeding without it.');
      } finally {
        setUploadingImage(false);
      }
    }

    const payload = {
      ...data,
      farmerId,
      availableQuantity: data.quantity,
      photoUrl
    };

    mutation.mutate(payload);
  };

  const handleCropNameSelect = (crop) => {
    setValue('cropName', crop, { shouldValidate: true });
    setSearchTerm(crop);
    setShowSuggestions(false);
  };

  const filteredSuggestions = CROP_SUGGESTIONS.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {!farmerId && <p style={{color: 'var(--danger)', marginBottom: '1rem'}}>Error: Profile not linked.</p>}
      
      <div style={{ marginBottom: '1rem' }}>
        <label className="label">{t('lots.photo')}</label>
        <div 
          {...getRootProps()} 
          style={{ 
            border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '2rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragActive ? 'rgba(21, 128, 61, 0.05)' : 'var(--white)',
            transition: 'all 0.2s',
            position: 'relative'
          }}
        >
          <input {...getInputProps()} capture="environment" />
          {preview ? (
            <div>
              <img src={preview} alt="Crop preview" style={{ maxHeight: '150px', borderRadius: 'var(--radius-sm)', margin: '0 auto' }} />
              <p style={{ marginTop: '0.5rem', color: 'var(--primary)', fontSize: '0.875rem' }}>Click to change</p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>{t('lots.drag')}</p>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <InputField
          label={t('lots.cropName')}
          placeholder="e.g. Tomato, Potato..."
          {...register('cropName')}
          error={errors.cropName?.message}
          onChange={(e) => {
            setValue('cropName', e.target.value, { shouldValidate: true });
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%', left: 0, right: 0,
            background: 'var(--white)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10,
            maxHeight: '150px',
            overflowY: 'auto',
            marginTop: '-0.5rem'
          }}>
            {filteredSuggestions.map(crop => (
              <div 
                key={crop}
                onClick={() => handleCropNameSelect(crop)}
                style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
              >
                {crop}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <InputField
          label={t('lots.quantity')}
          type="number"
          step="any"
          {...register('quantity')}
          error={errors.quantity?.message}
        />
        <InputField
          label={t('lots.unit')}
          placeholder="kg, tons..."
          {...register('unit')}
          error={errors.unit?.message}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <InputField
          label={t('lots.price')}
          type="number"
          step="any"
          {...register('pricePerUnit')}
          error={errors.pricePerUnit?.message}
        />
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">{t('lots.grade')}</label>
          <select 
            {...register('qualityGrade')}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          {errors.qualityGrade && <span className="error-msg">{errors.qualityGrade.message}</span>}
        </div>
      </div>

      <div className="flex justify-between gap-4" style={{ marginTop: '1.5rem' }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={mutation.isLoading || uploadingImage} style={{ flex: 1 }} disabled={!farmerId}>
          {t('common.submit')}
        </Button>
      </div>
    </form>
  );
};

export default LotFormDialog;
