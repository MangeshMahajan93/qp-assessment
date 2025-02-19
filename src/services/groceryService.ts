import pool from "../config/db";
import { Grocery } from "../models/Grocery";

export const addGrocery = async (name: string, price: number, stock: number) => {
  await pool.execute(`INSERT INTO groceries (name, price, stock) VALUES (?, ?, ?)`, [name, price, stock]);
};

export const getGroceries = async (): Promise<Grocery[]> => {
  const [rows]: any = await pool.execute(`SELECT * FROM groceries`);
  return rows;
};

export const updateGrocery = async (id: number, name: string, price: number, stock: number) => {
  await pool.execute(`UPDATE groceries SET name=?, price=?, stock=? WHERE id=?`, [name, price, stock, id]);
};

export const deleteGrocery = async (id: number) => {
  await pool.execute(`DELETE FROM groceries WHERE id=?`, [id]);
};
