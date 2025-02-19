import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { User } from "../models/User";

export const register = async (name: string, email: string, password: string, role: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.execute(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, [name, email, hashedPassword, role]);
};

export const login = async (email: string, password: string) => {
  const [rows]: any = await pool.execute(`SELECT * FROM users WHERE email=?`, [email]);

  if (rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user: User = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });

  return { token, role: user.role };
};
