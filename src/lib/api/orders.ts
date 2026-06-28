/**
 * Orders API — order history, order detail, create order.
 */

import { IS_MOCK, api } from "./client";

export interface OrderItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  variantLabel?: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "processing" | "packed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: Order["shippingAddress"];
  shippingMethod: string;
  payment: {
    cardNumber: string;
    expiry: string;
    cvc: string;
  };
  promoCode?: string;
  giftWrap?: boolean;
  orderNotes?: string;
  email: string;
}

export interface CreateOrderResponse {
  order: Order;
  orderNumber: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    orderNumber: "AURA-483032",
    date: "2026-03-22",
    status: "shipped",
    items: [{ key: "k1", productId: "mirror-arched-floor", slug: "arched-floor-mirror", name: "Aperture Arched Floor Mirror", image: "https://images.unsplash.com/photo-1618220179428-22790b4680a9?w=900&h=1125&fit=crop&q=80", price: 395, variantLabel: "Natural Oak", quantity: 1 }],
    subtotal: 395,
    shipping: 45,
    tax: 32.59,
    total: 472.59,
    shippingAddress: { firstName: "Anna", lastName: "Reeves", street: "123 Gulberg III", apartment: "House 45", city: "Lahore", state: "Punjab", zip: "54660", country: "Pakistan", phone: "+92 300 1234567" },
    trackingNumber: "1Z999AA10123456791",
    carrier: "White Glove",
    estimatedDelivery: "2026-03-29",
  },
  {
    id: "o2",
    orderNumber: "AURA-482917",
    date: "2026-03-12",
    status: "delivered",
    items: [
      { key: "k2", productId: "lamp-ceramic-table", slug: "ceramic-table-lamp", name: "Halo Ceramic Table Lamp", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&h=1125&fit=crop&q=80", price: 189, quantity: 1 },
      { key: "k3", productId: "planter-terracotta-ribbed", slug: "terracotta-ribbed-planter", name: "Ribbed Terracotta Planter", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&h=1125&fit=crop&q=80", price: 48, quantity: 2 },
    ],
    subtotal: 285,
    shipping: 0,
    tax: 22.8,
    total: 307.8,
    shippingAddress: { firstName: "Anna", lastName: "Reeves", street: "123 Gulberg III", apartment: "House 45", city: "Lahore", state: "Punjab", zip: "54660", country: "Pakistan", phone: "+92 300 1234567" },
    trackingNumber: "1Z999AA10123456780",
    carrier: "UPS Ground",
    estimatedDelivery: "2026-03-17",
  },
];

/** Get order history for current user. */
export async function getOrders(): Promise<Order[]> {
  if (IS_MOCK) return MOCK_ORDERS;
  return api.get<Order[]>("/orders");
}

/** Get a single order by ID. */
export async function getOrder(id: string): Promise<Order> {
  if (IS_MOCK) return MOCK_ORDERS.find((o) => o.id === id) ?? MOCK_ORDERS[0];
  return api.get<Order>(`/orders/${id}`);
}

/** Create a new order (checkout). */
export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1300));
    const orderNumber = `AURA-${Math.random().toString(36).slice(-8).toUpperCase()}`;
    return { orderNumber, order: MOCK_ORDERS[0] };
  }
  return api.post<CreateOrderResponse>("/orders", data);
}
