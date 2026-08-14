import { Router } from "express";
import { ResumeBuilderController } from "../controllers/ResumeBuilderController.js";
import { clerkAuth } from "../middlewares/clerkAuth.js";

const router = Router();
const controller = new ResumeBuilderController();

/**
 * POST /api/resume-builder/generate
 * Generates an updated resume JSON using Groq AI
 */
router.post("/generate", clerkAuth, controller.generate);

/**
 * POST /api/resume-builder/enhance-bullet
 * Enhances a single resume bullet point
 */
router.post("/enhance-bullet", clerkAuth, controller.enhanceBullet);

/**
 * POST /api/resume-builder/export
 * Exports the resume JSON to a PDF
 */
router.post("/export", clerkAuth, controller.export);

/**
 * POST /api/resume-builder/save
 * Creates or updates a resume draft
 */
router.post("/save", clerkAuth, controller.saveDraft);

/**
 * GET /api/resume-builder/list
 * Returns all drafts for the user
 */
router.get("/list", clerkAuth, controller.getDrafts);
router.get("/:id", clerkAuth, controller.getDraftById);

/**
 * DELETE /api/resume-builder/:id
 * Deletes a draft
 */
router.delete("/:id", clerkAuth, controller.deleteDraft);

export default router;
