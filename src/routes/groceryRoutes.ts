import { Router, Request, Response, NextFunction } from "express";
import { authenticateJWT, authorizeRole } from "../middleware/authMiddleware";
import { addGroceryItem, getGroceries, updateGroceryItem, deleteGroceryItem } from "../controllers/groceryController";

const router = Router();

router.post("/", authenticateJWT, authorizeRole("admin"), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await addGroceryItem(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/", authenticateJWT, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getGroceries(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authenticateJWT, authorizeRole("admin"), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await updateGroceryItem(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authenticateJWT, authorizeRole("admin"), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteGroceryItem(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
