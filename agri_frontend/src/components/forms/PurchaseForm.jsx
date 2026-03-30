import React, { useState } from 'react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const PurchaseForm = ({ lots, dealerId, onSubmit, loading }) => {
  const [items, setItems] = useState([{ lotId: '', quantity: '', pricePerUnit: '' }]);

  const addItem = () => setItems([...items, { lotId: '', quantity: '', pricePerUnit: '' }]);

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    setItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const item of items) {
      if (!item.lotId || !item.quantity || !item.pricePerUnit) {
        toast.error('Fill all item fields');
        return;
      }
    }
    onSubmit({
      dealerId: Number(dealerId),
      items: items.map(i => ({
        lotId: Number(i.lotId),
        quantity: Number(i.quantity),
        pricePerUnit: Number(i.pricePerUnit),
      })),
    });
  };

  const inputStyle = {
    width: '100%', padding: '0.45rem 0.6rem', borderRadius: '0.4rem',
    border: '1px solid var(--border-color)', background: 'var(--white)',
    color: 'var(--text-primary)', fontSize: '0.875rem',
  };

  const total = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.pricePerUnit) || 0), 0);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LOT</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>QTY</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PRICE/UNIT (₹)</span>
        <span></span>
      </div>

      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
          <select value={item.lotId} onChange={e => updateItem(idx, 'lotId', e.target.value)} style={inputStyle}>
            <option value="">Select lot</option>
            {lots?.map(lot => (
              <option key={lot.lotId} value={lot.lotId}>
                #{lot.lotId} - {lot.cropType} ({lot.availableQuantity} {lot.unit} avail.)
              </option>
            ))}
          </select>
          <input
            type="number" step="0.01" placeholder="Qty"
            value={item.quantity}
            onChange={e => updateItem(idx, 'quantity', e.target.value)}
            style={inputStyle}
          />
          <input
            type="number" step="0.01" placeholder="Price"
            value={item.pricePerUnit}
            onChange={e => updateItem(idx, 'pricePerUnit', e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            disabled={items.length === 1}
            style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem', padding: '0 0.4rem', opacity: items.length === 1 ? 0.3 : 1 }}
          >×</button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.875rem', textAlign: 'left', padding: '0.25rem 0' }}
      >
        + Add another item
      </button>

      <div style={{ background: 'var(--bg-color)', padding: '0.75rem 1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>Estimated Total</span>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
      </div>

      <Button type="submit" loading={loading} style={{ width: '100%' }}>
        Place Purchase Order
      </Button>
    </form>
  );
};

export default PurchaseForm;
