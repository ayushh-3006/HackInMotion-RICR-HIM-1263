import { Router } from "express";
import express from "express";
import { clerkWebhookHandler } from "../controllers/user.controller.js";

const router = Router();

// Clerk webhook payload must be parsed as raw body
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhookHandler
);

export default router;
