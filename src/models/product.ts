import { useState } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const initialProducts: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
  { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
  { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
  { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
];

export default function useProductModel() {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (data: Omit<Product, 'id'>) => {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...data,
      },
    ]);
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    products,
    addProduct,
    deleteProduct,
  };
}
