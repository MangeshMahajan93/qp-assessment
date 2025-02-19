import express from "express";
import { authenticateJWT, authorizeRole } from "../middleware/authMiddleware";
import { createOrder, getUserOrders, getAllOrders, getOrderById } from "../controllers/orderController";
const router = express.Router();

router.post("/", authenticateJWT, createOrder);
router.get("/", authenticateJWT, getUserOrders);

router.get("/admin", authenticateJWT, authorizeRole("admin"), getAllOrders);
router.get("/admin/:id", authenticateJWT, authorizeRole("admin"), getOrderById);

export default router;
