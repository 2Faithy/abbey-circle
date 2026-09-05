import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { listUsers } from "../controllers/user.controller";

const router = Router();
router.get("/", requireAuth, listUsers);

export default router;