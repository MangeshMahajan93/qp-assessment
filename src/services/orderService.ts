import pool from "../config/db";
import { Order, OrderItem } from "../models/Order";

export const createOrder = async (userId: number, items: { grocery_id: number; quantity: number }[]) => {
  let total_price = 0;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  const [orderResult]: any = await connection.execute(`INSERT INTO orders (user_id, total_price) VALUES (?, ?)`, [userId, 0]);

  const orderId = orderResult.insertId;

  for (const item of items) {
    const [groceryResult]: any = await connection.execute(`SELECT price, stock FROM groceries WHERE id=?`, [item.grocery_id]);

    if (groceryResult.length === 0 || groceryResult[0].stock < item.quantity) {
      await connection.rollback();
      throw new Error("Invalid grocery item or insufficient stock");
    }

    const itemTotal = groceryResult[0].price * item.quantity;
    total_price += itemTotal;

    await connection.execute(`INSERT INTO order_items (order_id, grocery_id, quantity) VALUES (?, ?, ?)`, [orderId, item.grocery_id, item.quantity]);

    await connection.execute(`UPDATE groceries SET stock = stock - ? WHERE id=?`, [item.quantity, item.grocery_id]);
  }

  await connection.execute(`UPDATE orders SET total_price=? WHERE id=?`, [total_price, orderId]);
  await connection.commit();
  connection.release();

  return { orderId, total_price };
};

export const getUserOrders = async (userId: number): Promise<Order[]> => {
  const [orders]: any = await pool.execute(`SELECT * FROM orders WHERE user_id=?`, [userId]);
  return orders;
};
