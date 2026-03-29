import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  addItem: (lot) => set((state) => {
    const existing = state.items.find(i => i.lotId === lot.lotId);
    if (existing) return state;
    return { 
      items: [...state.items, { 
        lotId: lot.lotId, 
        cropName: lot.cropName, 
        photoUrl: lot.photoUrl, 
        pricePerUnit: lot.pricePerUnit || 0,
        unit: lot.unit,
        quantity: 1, 
        maxQuantity: lot.availableQuantity,
        farmerName: lot.farmer?.name || lot.party?.name || 'Farmer',
        farmerId: lot.farmerId
      }] 
    };
  }),
  updateQuantity: (lotId, quantity) => set((state) => ({
    items: state.items.map(i => i.lotId === lotId ? { ...i, quantity } : i)
  })),
  removeItem: (lotId) => set((state) => ({
    items: state.items.filter(i => i.lotId !== lotId)
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((total, item) => total + (item.pricePerUnit * item.quantity), 0)
}));

export default useCartStore;
