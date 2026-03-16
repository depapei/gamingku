import { Order } from '../types/order';

export const orders: Order[] = [
  {
    id: 'ORD-001',
    userId: 'user-1',
    products: [
      {
        productId: 'prod-1',
        productName: 'Pro Mechanical Keyboard X1',
        quantity: 1,
        price: 1299000,
        variant: 'Linear, Black'
      }
    ],
    totalPrice: 1299000,
    status: 'delivered',
    createdAt: '2023-10-15T10:30:00Z'
  },
  {
    id: 'ORD-002',
    userId: 'user-2',
    products: [
      {
        productId: 'prod-2',
        productName: 'UltraLight Gaming Mouse V2',
        quantity: 2,
        price: 899000,
        variant: 'Matte Black'
      },
      {
        productId: 'prod-5',
        productName: 'Extended RGB Desk Mat',
        quantity: 1,
        price: 399000
      }
    ],
    totalPrice: 2197000,
    status: 'processing',
    createdAt: '2023-10-20T14:45:00Z'
  }
];
