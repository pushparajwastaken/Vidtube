import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck_controller.js";

const router = Router();
router
  .route("/") //THIS is the slash where we pass on the controller to the router
  .get(healthcheck);

export default router;
