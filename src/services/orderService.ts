interface Order {
  id: string;
  orderNumber: string;
  phone: string;
  email: string;
  shippingAddress: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  isPaid: boolean;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
  variant: string;
}

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  note: string;
  _id: string;
  id: string;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const orderService = {
  async getOrders(page = 1, limit = 10): Promise<OrdersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status'], note?: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, note }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};

export type { Order, OrderItem, StatusHistoryItem, OrdersResponse };
