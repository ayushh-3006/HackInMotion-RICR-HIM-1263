import { Router } from "express";
import multer from "multer";
import { ATSController } from "../controllers/ATSController.js";
import { clerkAuth } from "../middlewares/clerkAuth.js";

import { clerkAuth } from "../middlewares/clerkAuth.js";

// SRP: Only sets up routes and middleware
export class ATSRouter {
  public router: Router;
  private upload = multer({ storage: multer.memoryStorage() });

  constructor(private controller: ATSController) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/calculate", clerkAuth, this.controller.calculateFromText);
    this.router.post(
      "/calculate-file",
      clerkAuth,
      this.upload.single("resumeFile"),
      this.controller.calculateFromFile,
    );
    this.router.get("/history", clerkAuth, this.controller.getHistory);
  }
}
