import express, { Request, Response } from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router = express.Router();

const registerUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const registerResponse = await registerUser(req, res);
    res.status(201).json(registerResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error registering user", error: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred during registration" });
    }
  }
};

const loginUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginResponse = await loginUser(req, res);
    if (loginResponse) {
      res.json(loginResponse);
    } else {
      res.status(401).json({ message: "Invalid login credentials" });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Login failed", error: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred during login" });
    }
  }
};

router.post("/register", registerUserHandler);
router.post("/login", loginUserHandler);

export default router;
