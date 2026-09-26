import { Order } from '../types/order';

/** Sample orders for the admin dashboard overview (mock). */
export const orders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-20231015-A1B2',
    userId: 1,
    customer: 'John Doe',
    address: 'Jl. Merdeka No. 1, Jakarta',
    email: 'john@example.com',
    items: [
      {
        productId: 1,
        productName: 'Pro Mechanical Keyboard X1',
        qty: 1,
        price: 1299000,
        variantNames: ['Linear', 'Black']
      }
    ],
    totalAmount: 1299000,
    paymentMethod: 'cod',
    status: 'completed',
    createdAt: '2023-10-15T10:30:00Z',
    updatedAt: '2023-10-16T10:30:00Z'
  },
  {
    id: 2,
    orderNumber: 'ORD-20231020-C3D4',
    userId: 2,
    customer: 'Jane Smith',
    address: 'Jl. Sudirman No. 45, Bandung',
    email: 'jane@example.com',
    items: [
      {
        productId: 2,
        productName: 'UltraLight Gaming Mouse V2',
        qty: 2,
        price: 899000,
        variantNames: ['Matte Black']
      },
      {
        productId: 5,
        productName: 'Extended RGB Desk Mat',
        qty: 1,
        price: 399000
      }
    ],
    totalAmount: 2197000,
    paymentMethod: 'transfer',
    status: 'processing',
    createdAt: '2023-10-20T14:45:00Z',
    updatedAt: '2023-10-20T14:45:00Z'
  }
];
