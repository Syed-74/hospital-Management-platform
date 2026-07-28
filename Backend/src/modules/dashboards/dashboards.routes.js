import express from "express";
import { getDashboards } from "./dashboards.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getDashboards);

export default router;
