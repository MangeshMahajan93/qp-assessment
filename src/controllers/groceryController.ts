import { Request, Response } from "express";
import pool from "../config/db";

export const addGroceryItem = async (req: Request, res: Response): Promise<void> => {
  const { name, price, stock } = req.body;
  try {
    const [result] = await pool.execute(`INSERT INTO groceries (name, price, stock) VALUES (?, ?, ?)`, [name, price, stock]);
    const newItem = {
      id: (result as any).insertId,
      name,
      price,
      stock,
    };

    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding grocery item" });
  }
};

export const getGroceries = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM groceries`);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching groceries" });
  }
};
export const updateGroceryItem = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, price, stock } = req.body;

  try {
    const [rows]: any = await pool.execute(`SELECT * FROM groceries WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Grocery item not found" });
    }
    const currentItem = rows[0];
    const updatedFields: any[] = [];
    let updateQuery = "UPDATE groceries SET ";

    if (name !== undefined && name !== currentItem.name) {
      updatedFields.push(name);
      updateQuery += `name = ?, `;
    }

    if (price !== undefined && price !== currentItem.price) {
      updatedFields.push(price);
      updateQuery += `price = ?, `;
    }

    if (stock !== undefined && stock !== currentItem.stock) {
      updatedFields.push(stock);
      updateQuery += `stock = ?, `;
    }

    if (updatedFields.length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    updateQuery = updateQuery.slice(0, -2);

    updateQuery += " WHERE id = ?";
    updatedFields.push(id);

    const [result]: any = await pool.execute(updateQuery, updatedFields);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Grocery item not updated" });
    }

    return res.status(200).json({ message: "Grocery item updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating grocery item" });
  }
};

export const deleteGroceryItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const [rows]: any = await pool.execute(`SELECT * FROM groceries WHERE id = ?`, [id]);

    if (rows.length === 0) {
      res.status(404).json({ message: "Grocery item not found" });
      return;
    }

    await pool.execute(`DELETE FROM groceries WHERE id = ?`, [id]);

    res.status(200).json({ message: "Grocery item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting grocery item" });
  }
};
