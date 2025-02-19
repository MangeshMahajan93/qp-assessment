import { Request, Response } from "express";
import pool from "../config/db";
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.user;
  const { items } = req.body;
  try {
    let total_price = 0;
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderResult]: any = await connection.execute(`INSERT INTO orders (user_id, total_price) VALUES (?, ?)`, [userId, 0]);

    const orderId = orderResult.insertId;

    for (const item of items) {
      const [groceryResult]: any = await connection.execute(`SELECT price, stock FROM groceries WHERE id=?`, [item.grocery_id]);

      if (groceryResult.length === 0 || groceryResult[0].stock < item.quantity) {
        await connection.rollback();
        res.status(400).json({ message: "Invalid grocery item or insufficient stock" });
        return;
      }

      const itemTotal = groceryResult[0].price * item.quantity;
      total_price += itemTotal;
      await connection.execute(`INSERT INTO order_items (order_id, grocery_id, quantity) VALUES (?, ?, ?)`, [orderId, item.grocery_id, item.quantity]);

      await connection.execute(`UPDATE groceries SET stock = stock - ? WHERE id=?`, [item.quantity, item.grocery_id]);
    }

    await connection.execute(`UPDATE orders SET total_price=? WHERE id=?`, [total_price, orderId]);

    await connection.commit();
    connection.release();

    res.status(201).json({ message: "Order placed successfully", orderId, total_price });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error placing order", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred", error });
    }
  }
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user;

    const [orders]: any = await pool.execute(`SELECT * FROM orders WHERE user_id=?`, [userId]);

    res.status(200).json(orders);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching orders", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred", error });
    }
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const [orders]: any = await pool.execute(`SELECT * FROM orders`);

    res.status(200).json(orders);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching all orders", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred", error });
    }
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;

  try {
    const [order]: any = await pool.execute(`SELECT * FROM orders WHERE id = ?`, [orderId]);

    if (order.length === 0) {
      res.status(404).json({ message: `Order with ID ${orderId} not found` });
      return;
    }

    res.status(200).json(order[0]);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching order by ID", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred", error });
    }
  }
};
