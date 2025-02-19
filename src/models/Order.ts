export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  created_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  grocery_id: number;
  quantity: number;
}
