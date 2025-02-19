import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";

export const registerUser = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.execute(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, [name, email, hashedPassword, role]);
    return { message: "User registered successfully!" };
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const [rows]: any = await pool.execute(`SELECT * FROM users WHERE email = ?`, [email]);

    if (rows.length === 0) throw new Error("Invalid email or password");

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return { token, role: user.role };
  } catch (error) {
    throw error;
  }
};
