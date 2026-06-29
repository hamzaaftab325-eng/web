import { api } from "./client";
export interface OrderItem { key: string; productId: string; slug: string; name: string; image: string; price: number; variantLabel?: string; quantity: number; }
export interface Order { id: string; orderNumber: string; date: string; status: "processing" | "packed" | "shipped" | "delivered" | "cancelled"; items: OrderItem[]; subtotal: number; shipping: number; tax: number; total: number; shippingAddress: { firstName: string; lastName: string; street: string; apartment?: string; city: string; state: string; zip: string; country: string; phone: string }; trackingNumber?: string; carrier?: string; estimatedDelivery?: string; }
export interface CreateOrderRequest { items: OrderItem[]; shippingAddress: { firstName: string; lastName: string; street: string; apartment?: string; city: string; state: string; zip: string; country: string; phone: string }; shippingMethod: string; promoCode?: string; orderNotes?: string; email: string; paymentMethod: string; }
export interface CreateOrderResponse { order: Order; orderNumber: string; }
export async function getOrders(): Promise<Order[]> { return api.get<Order[]>("/api/orders"); }
export async function getOrder(id: string): Promise<Order> { return api.get<Order>(`/api/orders/${id}`); }
export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> { return api.post<CreateOrderResponse>("/api/orders", data); }
