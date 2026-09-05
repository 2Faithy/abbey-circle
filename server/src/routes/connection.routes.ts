import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  sendRequest,
  acceptRequest,
  declineRequest,
  listConnections,
} from "../controllers/connection.controller";

const router = Router();

router.post("/request/:userId", requireAuth, sendRequest);
router.post("/:id/accept", requireAuth, acceptRequest);
router.post("/:id/decline", requireAuth, declineRequest);
router.get("/", requireAuth, listConnections);

export default router;